import { Component, HostListener, inject } from '@angular/core';
import { TetrisService } from '../tetris/tetris.service';
import { CommonModule } from '@angular/common';
import { Multiplayer } from './multiplayer';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { GameEngine, Piece } from '../tetris/game-engine';

@Component({
  selector: 'app-multiplayer',
  imports: [CommonModule],
  templateUrl: './multiplayer.component.html',
  styleUrl: './multiplayer.component.css'
})
export class MultiplayerComponent {

  readonly tetrisService: TetrisService = inject(TetrisService);
  readonly multiplayer: Multiplayer = {
    my_game: this.tetrisService.newGameEngine(),
    opp_game: undefined,
    game_over: false,
    status: "lookForAGame",
    lookingForAGame: "looking for a game",
    roomId: "",
    roomLimit: 0,
    boardId: -1,
    previous_score: 0,
    game_over_message: "",
    intervalId: null,
  };
  readonly blueMask: number = 0x0000ff;
  readonly timePerTurn: number = 500;
  readonly socket: Socket = io("http://192.168.0.19:8080");
  readonly gameStateSlice = createSlice({
    name: 'gameState',
    initialState: this.multiplayer,
    reducers: {
      set_intervalId: (state, action: PayloadAction<ReturnType<typeof setInterval>>) => {
        state.intervalId = action.payload;
      },
      update_status: (state, action: PayloadAction<string>) => {
          state.status = action.payload;
          if (state.status === "gameOver") {
            if (state.intervalId !== null) clearInterval(state.intervalId);
            state.my_game!.game_over
              ? state.game_over_message = "you lost"
              : state.game_over_message = "you won"
            state.my_game = this.tetrisService.newGameEngine();
            state.boardId = -1;
            state.opp_game = undefined;
            state.roomId = "";
            state.roomLimit = 0;
            state.previous_score = 0;

            setTimeout(() => this.store.dispatch(this.gameStateSlice.actions.update_status("lookForAGame")), 3000);
          }
      },
      update_lookingForAGame: state => {
        state.lookingForAGame.length < 21
          ? state.lookingForAGame += "."
          : state.lookingForAGame = state.lookingForAGame.slice(0, state.lookingForAGame.length - 3)
      },
      update_room_id: (state, action: PayloadAction<string>) => {
        state.roomId = action.payload;
      },
      update_room: (state, action: PayloadAction<{ id: string, players: GameEngine[] | undefined, limit: number, status: string}>) => {
        if (state.boardId === -1 && action.payload.players !== undefined)
          state.boardId = action.payload.players.length - 1;
        if (action.payload.status === "in_game")
          state.status = "gameStart";
        else
          state.status = "gameRoom"
        state.opp_game = action.payload.players?.filter((_, i) => i !== state.boardId);
        state.roomLimit = action.payload.limit;
      },
      translate_piece_down: state => {
        if (state.my_game === undefined || state.my_game.current_piece === undefined) return;
        state.my_game = this.tetrisService.translate_piece_down(state.my_game);
        if (!this.tetrisService.can_exist(this.tetrisService.addRandomPiece(state.my_game))) {
          state.my_game.game_over = true;
          this.socket.emit("updateGameEngine", state.roomId, state.my_game);
          return;
        }
        if (state.my_game.current_piece === undefined) this.socket.emit("updateGameEngine", state.roomId, state.my_game);
      },
      rotate_piece: state => {
        if (state.my_game === undefined || state.my_game.current_piece === undefined) return;
        state.my_game = this.tetrisService.rotate_piece(state.my_game!);
      },
      translate_piece_side: (state, action: PayloadAction<number>) => {
        if (state.my_game === undefined || state.my_game.current_piece === undefined) return;
        state.my_game = this.tetrisService.translate_piece_side(state.my_game!, action.payload);
      },
      add_undestructable_line: (state, action: PayloadAction<number>) => {
        if (state.my_game === undefined || state.my_game.current_piece === undefined) return;
        state.my_game = this.tetrisService.add_undestructable_line(state.my_game, action.payload);
        if (!this.tetrisService.can_exist(this.tetrisService.add_current_piece_to_board(state.my_game))) {
          state.my_game.game_over = true;
          this.socket.emit("updateGameEngine", state.roomId, state.my_game);
        }
      },
      newPiece: (state, action: PayloadAction<Piece>) => {
        state.my_game!.current_piece = action.payload;
        if (!this.tetrisService.can_exist(this.tetrisService.add_current_piece_to_board(state.my_game!))) {
          state.my_game!.game_over = true;
          this.socket.emit("updateGameEngine", state.roomId, state.my_game);
        }
      },
    }
  });
  readonly store = configureStore({
    reducer: {
      gameState: this.gameStateSlice.reducer
    }
  })

  getCellColor(num: number, mask: number = 0xffffff): string {
    return num !== 0
      ? num === this.tetrisService.undestructable_line_color
        ? '#' + (num).toString(16).padStart(6, "0")
        : (num & mask) === 0
          ? '#0000b0'
          : '#' + (num & mask).toString(16).padStart(6, "0")
      : '#000000';
  }

  joinARoom(id: string) {
    this.socket.emit("joinRoom", id);
    this.store.dispatch(this.gameStateSlice.actions.update_room_id(id));
  }

  createARoom(id: string) {
    this.socket.emit("createRoom", id);
    this.store.dispatch(this.gameStateSlice.actions.update_room_id(id));
  }

  startGame() {
    const currentState = this.store.getState().gameState;
    if (currentState.opp_game !== undefined && currentState.opp_game.length > 0)
      this.socket.emit("startGame", { roomId: currentState.roomId, my_game: currentState.my_game });
  }

  lookForAGame() {
    const actions = this.gameStateSlice.actions;
    this.store.dispatch(actions.update_status("lookingForAGame"));
    let interval = setInterval(() => {
      this.store.dispatch(actions.update_lookingForAGame());
    }, 500);

    //setTimeout(() => {
    //  clearInterval(interval);
    //  this.multiplayer.my_game = this.tetrisService.newGameEngine();
    //  this.multiplayer.opp_game = this.tetrisService.newGameEngine();
    //  this.state = "game";
    //  this.start_loop();
    //}, 1000);
  }
  start_loop() {
    const actions = this.gameStateSlice.actions;
    const game_loop = () => {
      const currentState = this.store.getState().gameState;
      if (currentState.my_game?.current_piece === undefined || currentState.my_game!.game_over) {
        return;
      }
      this.store.dispatch(actions.translate_piece_down());
    }
    this.store.dispatch(actions.set_intervalId(setInterval(game_loop, this.timePerTurn)));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {

    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    const currentState = this.store.getState();
    const actions = this.gameStateSlice.actions;
    if (currentState.gameState.my_game !== undefined || (currentState.gameState.status != "play" && !currentState.gameState.my_game!.game_over))
      switch (event.key) {
        case 'ArrowDown':
          this.store.dispatch(actions.translate_piece_down());
          break;
        case 'ArrowUp':
          this.store.dispatch(actions.rotate_piece());
          break;
        case 'ArrowLeft':
          this.store.dispatch(actions.translate_piece_side(-1));
          break;
        case 'ArrowRight':
          this.store.dispatch(actions.translate_piece_side(1));
          break;
      }
  }

  constructor() {
    const actions = this.gameStateSlice.actions;
    this.socket.on("add_undestructable_line", (nb: number) => this.store.dispatch(actions.add_undestructable_line(nb)));
    this.socket.on("unknownRoomId", (msg: string) => alert(msg));
    this.socket.on("fullRoom", (msg: string) => alert(msg));
    this.socket.on("existingRoom", (msg: string) => alert(msg));
    this.socket.on("gameOver", () => this.store.dispatch(actions.update_status("gameOver")));
    this.socket.on("roomUpdate", ({
      id,
	    players,
	    limit,
      status,
    }) => {
      if (this.store.getState().gameState.status === "gameOver") return;
      if (status === "gameStart") {
        this.store.dispatch(actions.update_room({id, players, limit, status: "in_game"}));
        this.start_loop();
      }
      else {
        this.store.dispatch(actions.update_room({id, players, limit, status}));
      }
    });
    this.socket.on("newPiece", (piece: Piece) => {
      console.log(`newPiece: ${JSON.stringify(piece)}`);
      if (this.store.getState().gameState.my_game?.current_piece === undefined)
        this.store.dispatch(actions.newPiece(piece));
    });
  }

}
