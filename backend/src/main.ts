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
		}
		if (rooms[roomId].players === undefined) {
			rooms[roomId].players = [{ id: socket.id, gameVue: undefined, game_over: true, currentPieceIndex: 0 }];
			socket.join(roomId);
			io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
		}
		else if (rooms[roomId].players.length < rooms[roomId].limit) {
			rooms[roomId].players.push( { id: socket.id, gameVue: undefined, game_over: true, currentPieceIndex: 0 });
			socket.join(roomId);
			io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
		} else {
			socket.emit("fullRoom", "Room is alrady full!");
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
		} else {
			socket.emit("existingRoom", "Room id already exist!");
		}
	});

	socket.on("startGame", (roomId: string) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
		}
		rooms[roomId].status = "in_game";
		rooms[roomId].players = rooms[roomId].players.map(player => {
			player.game_over = false;
			player.currentPieceIndex = 0;
			return player;
		});
		rooms[roomId].pieces = Array.from({ length: bufferSizePieces }, () => generate_random_piece());
		io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
	});

	socket.on("updateGameEngine", (roomId: string, newGameVue: GameEngine) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
		}
		if (rooms[roomId].status === "waiting") {
			socket.emit("gameOver");
		}
		rooms[roomId].players = rooms[roomId].players.map(player => { 
			if (player.id === socket.id) { 
				player.gameVue = newGameVue; 
				player.currentPieceIndex += 1;
				if (player.gameVue.game_over) player.game_over = true;
				if (player.currentPieceIndex === rooms[roomId].pieces.length) {
					rooms[roomId].pieces = rooms[roomId].pieces.concat(Array.from({ length: bufferSizePieces }, () => generate_random_piece()));
				}
			}
			return player;
		});
		const players = rooms[roomId].players.filter((player) => !player.game_over);
		if (players.length === 1) io.to(players[0].id).emit("gameOver") && (rooms[roomId].status = "waiting");
		else if (rooms[roomId].players.every((player) => player.game_over)) rooms[roomId].status = "waiting";
		io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
	});

	socket.on("leaveRoom", (roomId: string) => {
		if (!rooms[roomId]) {
			socket.emit("unknownRoomId", "Room id does not exist!");
		}
		rooms[roomId].players = rooms[roomId].players.filter((player) => player.id !== socket.id);
		socket.leave(roomId);
		io.to(roomId).emit("roomUpdate", { id: rooms[roomId].id, players: rooms[roomId].players.map(player => player.gameVue), limit: rooms[roomId].limit, status: rooms[roomId].status } );
		if (rooms[roomId].players.length === 0) delete rooms[roomId];
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
