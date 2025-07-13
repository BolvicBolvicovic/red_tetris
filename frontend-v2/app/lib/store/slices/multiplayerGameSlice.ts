import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { gameEngine } from "~/lib/game-engine";
import type { GameEngine, Piece, Player } from "~/lib/game-engine/types";

export const multiplayerGameSlice = createSlice({
  name: "multiplayerGame",
  initialState: {
    my_game: gameEngine.newGameEngine(),
    opp_game: undefined as GameEngine[] | undefined,
    game_over: false,
    status: "lookForAGame",
    lookingForAGame: "looking for a game",
    roomId: "",
    roomLimit: 0,
    boardId: -1,
    previous_score: 0,
    game_over_message: "",
    intervalId: null as ReturnType<typeof setInterval> | null,
  },
  reducers: {
    set_intervalId: (
      state,
      action: PayloadAction<ReturnType<typeof setInterval>>
    ) => {
      state.intervalId = action.payload;
    },
    clear_intervalId: (state) => {
      if (state.intervalId !== null) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    },
    update_status: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
      if (state.status === "gameOver") {
        if (state.intervalId !== null) {
          clearInterval(state.intervalId);
          state.intervalId = null;
        }
        state.game_over_message = state.my_game!.game_over
          ? "you lost"
          : "you won";
        state.my_game = gameEngine.newGameEngine();
        state.boardId = -1;
        state.opp_game = undefined;
        state.roomId = "";
        state.roomLimit = 0;
        state.previous_score = 0;
      } else if (state.status === "lookForAGame") {
        if (state.intervalId !== null) {
          clearInterval(state.intervalId);
          state.intervalId = null;
        }
        state.my_game = gameEngine.newGameEngine();
        state.boardId = -1;
        state.opp_game = undefined;
        state.roomId = "";
        state.roomLimit = 0;
        state.previous_score = 0;
        state.game_over_message = "";
      }
    },
    update_lookingForAGame: (state) => {
      state.lookingForAGame.length < 21
        ? (state.lookingForAGame += ".")
        : (state.lookingForAGame = state.lookingForAGame.slice(
            0,
            state.lookingForAGame.length - 3
          ));
    },
    update_room_id: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    update_room: (
      state,
      action: PayloadAction<{
        id: string;
        players: GameEngine[] | undefined;
        limit: number;
        status: string;
      }>
    ) => {
      if (state.boardId === -1 && action.payload.players !== undefined) {
        state.boardId = action.payload.players.length - 1;
      }

      if (action.payload.status === "in_game") {
        state.status = "gameStart";
      } else {
        state.status = "gameRoom";
      }

      state.opp_game = action.payload.players?.filter(
        (_, i) => i !== state.boardId
      );
      state.roomLimit = action.payload.limit;
    },
    translate_piece_down: (state) => {
      if (
        state.my_game === undefined ||
        state.my_game.current_piece === undefined
      )
        return;

      state.my_game = gameEngine.translate_piece_down(state.my_game);

      if (!gameEngine.can_exist(gameEngine.addRandomPiece(state.my_game))) {
        state.my_game.game_over = true;
        // Signal that we need to emit updateGameEngine
        state.my_game = { ...state.my_game, _needsUpdate: true } as any;
        return;
      }

      // If current piece is undefined, the piece was placed - signal update needed
      if (state.my_game.current_piece === undefined) {
        state.my_game = { ...state.my_game, _needsUpdate: true } as any;
      }
    },
    rotate_piece: (state) => {
      state.my_game = gameEngine.rotate_piece(state.my_game!);
    },
    translate_piece_side: (state, action: PayloadAction<number>) => {
      if (
        state.my_game === undefined ||
        state.my_game.current_piece === undefined
      )
        return;
      state.my_game = gameEngine.translate_piece_side(
        state.my_game!,
        action.payload
      );
    },
    add_undestructable_line: (state, action: PayloadAction<number>) => {
      if (
        state.my_game === undefined ||
        state.my_game.current_piece === undefined
      )
        return;
      state.my_game = gameEngine.add_undestructable_line(
        state.my_game,
        action.payload
      );
    },
    newPiece: (state, action: PayloadAction<Piece>) => {
      if (!state.my_game) {
        return;
      }

      if (state.my_game.current_piece !== undefined) {
        return;
      }

      state.my_game.current_piece = action.payload;

      if (
        !gameEngine.can_exist(
          gameEngine.add_current_piece_to_board(state.my_game)
        )
      ) {
        state.my_game.game_over = true;
      }
    },
    setGameOver: (state) => {
      state.my_game!.game_over = true;
    },
  },
});
