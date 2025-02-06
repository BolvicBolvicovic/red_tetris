import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { GameEngine, generate_random_piece, Room } from "./tetris";

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: { origin: "*" },
});
const rooms: Record<string, Room> = {};

io.on("connection", (socket: Socket) => {
	const defaultRoomLimit: number = 4;
	const bufferSizePieces: number = 100;
	console.log(`User connected: ${socket.id}`);

	socket.on("joinRoom", (roomId: string) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
			console.log(`id: ${socket.id} -> tried to join room, room id does not exist`);
			return;
		}
		if (rooms[roomId].players === undefined) {
			rooms[roomId].players = [{ id: socket.id, gameVue: undefined, game_over: true, currentPieceIndex: 0 }];
			socket.join(roomId);
			io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
			console.log(`id: ${socket.id} -> tried to join room, room was empty but still joined`);
		}
		else if (rooms[roomId].players.length < rooms[roomId].limit) {
			rooms[roomId].players.push( { id: socket.id, gameVue: undefined, game_over: true, currentPieceIndex: 0 });
			socket.join(roomId);
			io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
			console.log(`id: ${socket.id} -> tried to join room, room joined`);
		} else {
			socket.emit("fullRoom", "Room is alrady full!");
			console.log(`id: ${socket.id} -> tried to join room, room full`);
		}
	});
	
	socket.on("createRoom", (roomId: string) => {
		if (!rooms[roomId]) {
			rooms[roomId] = { 
				id: roomId, 
				roomLeader: socket.id, 
				players: [ { id: socket.id, gameVue: undefined, game_over: true, currentPieceIndex: 0 } ], 
				status : "waiting", 
				limit: defaultRoomLimit, 
				pieces: [],
			}
			socket.join(roomId);
			io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
			console.log(`id: ${socket.id} -> create room`);
		} else {
			socket.emit("existingRoom", "Room id already exist!");
			console.log(`id: ${socket.id} -> tried to create room, room id already exists`);
		}
	});

	socket.on("startGame", ({roomId, my_game}) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
			console.log(`id: ${socket.id} -> tried to start game, room id "${roomId}" does not exist`);
			return;
		}
		rooms[roomId].status = "in_game";
		rooms[roomId].players = rooms[roomId].players.map(player => {
			player.game_over = false;
			player.currentPieceIndex = 0;
			player.gameVue = my_game;
			return player;
		});
		rooms[roomId].pieces = Array.from({ length: bufferSizePieces }, () => generate_random_piece());
		io.to(roomId).emit("newPiece", rooms[roomId].pieces[0]);
		io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: "gameStart" });
		console.log(`id: ${socket.id} -> start game`);
	});

	socket.on("updateGameEngine", (roomId: string, newGameVue: GameEngine) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
			console.log(`id: ${socket.id} -> tried to update engine, room id "${roomId}" does not exist`);
			return;
		}
		if (rooms[roomId].status === "waiting") {
			socket.emit("gameOver");
			console.log(`id: ${socket.id} -> tried to update engine, game over`);
		}
		rooms[roomId].players = rooms[roomId].players.map(player => { 
			if (player.id === socket.id) { 
				player.gameVue = newGameVue; 
				player.currentPieceIndex += 1;
				if (player.gameVue.game_over) player.game_over = true;
				if (player.currentPieceIndex === rooms[roomId].pieces.length) {
					rooms[roomId].pieces = rooms[roomId].pieces.concat(Array.from({ length: bufferSizePieces }, () => generate_random_piece()));
				}
				socket.emit("newPiece", rooms[roomId].pieces[player.currentPieceIndex]);
			}
			return player;
		});
		const players = rooms[roomId].players.filter((player) => !player.game_over);
		if (players.length === 1) io.to(players[0].id).emit("gameOver") && (rooms[roomId].status = "waiting");
		else if (rooms[roomId].players.every((player) => player.game_over)) rooms[roomId].status = "waiting";
		io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
		console.log(`id: ${socket.id} -> engine updated`);
	});

	socket.on("leaveRoom", (roomId: string) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
			return;
		}
		rooms[roomId].players = rooms[roomId].players.filter((player) => player.id !== socket.id);
		socket.leave(roomId);
		io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
		if (rooms[roomId].players.length === 0) delete rooms[roomId];
		console.log(`id: ${socket.id} -> leaves room`);
	});

	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
		for (const roomId in rooms) {
			rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
			io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
			if (rooms[roomId].players.length === 0) {
				delete rooms[roomId];
			}
		}
	});
});

server.listen(8080, "192.168.0.19");
