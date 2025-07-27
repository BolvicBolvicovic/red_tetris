import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { gameEngine } from "~/lib/game-engine";

export const soloGameSlice = createSlice({
  name: "soloGame",
  initialState: {
    gameEngine: gameEngine.newGameEngine(true),
    timePerTurn: 500,
    scoreLimit: 500,
    status: "play" as "play" | "pause" | "over",
    intervalId: null as ReturnType<typeof setInterval> | null,
  },
  reducers: {
    switch_status: (state, action: PayloadAction<string>) => {
      if (action.payload !== "over" && state.status !== "over")
        state.status = state.status !== "play" ? "play" : "pause";
      else state.status = "over";
    },
    translate_piece_down: (state) => {
      state.gameEngine = gameEngine.translate_piece_down(state.gameEngine);
    },
    rotate_piece: (state) => {
      state.gameEngine = gameEngine.rotate_piece(state.gameEngine);
    },
    translate_piece_side: (state, action: PayloadAction<number>) => {
      state.gameEngine = gameEngine.translate_piece_side(
        state.gameEngine,
        action.payload
      );
    },
    next_turn: (state) => {
      state.gameEngine = gameEngine.addRandomPiece(
        gameEngine.translate_piece_down(state.gameEngine)
      );
    },
    update_scoreLimit: (state) => {
      state.scoreLimit *= 1.8;
    },
    update_timePerTurn: (state) => {
      state.timePerTurn *= 0.8;
    },
    set_intervalId: (
      state,
      action: PayloadAction<ReturnType<typeof setInterval> | null>
    ) => {
      state.intervalId = action.payload;
    },
    reset_game: (state) => {
      state.gameEngine = gameEngine.newGameEngine(true);
      state.timePerTurn = 500;
      state.scoreLimit = 500;
      state.status = "play";
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    },
  },
});
