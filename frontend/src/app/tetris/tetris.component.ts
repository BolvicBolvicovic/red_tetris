import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TetrisService } from './tetris.service';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit';

@Component({
  selector: 'app-tetris',
  imports: [CommonModule],
  templateUrl: './tetris.component.html',
  styleUrl: './tetris.component.css'
})
export class TetrisComponent implements OnInit {
  readonly tetrisService: TetrisService = inject(TetrisService);
  readonly initialGameState = {
    gameEngine: this.tetrisService.newGameEngine(true),
    timePerTurn: 500,
    scoreLimit: 500,
    status: "play",
  }
  readonly gameStateSlice = createSlice({
    name: 'gameState',
    initialState: this.initialGameState,
    reducers: {
      switch_status: (state, action: PayloadAction<string>) => {
        if (action.payload !== "over" && state.status !== "over")
          state.status = state.status !== "play" ? "play" : "pause";
        else
          state.status = "over";
      },
      translate_piece_down: state => {
        state.gameEngine = this.tetrisService.translate_piece_down(state.gameEngine);
      },
      rotate_piece: state => {
        state.gameEngine = this.tetrisService.rotate_piece(state.gameEngine);
      },
      translate_piece_side: (state, action: PayloadAction<number>) => {
        state.gameEngine = this.tetrisService.translate_piece_side(state.gameEngine, action.payload);
      },
      next_turn: state => {
        state.gameEngine = this.tetrisService.addRandomPiece(this.tetrisService.translate_piece_down(state.gameEngine));
      },
      update_scoreLimit: state => {
        state.scoreLimit *= 1.8;
      },
      update_timePerTurn: state => {
        state.timePerTurn *= 0.8;
      }
    }
  });
  readonly store = configureStore({
    reducer: {
      gameState: this.gameStateSlice.reducer
    }
  })

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const currentState = this.store.getState();
    const actions = this.gameStateSlice.actions;
    if (currentState.gameState.status != "play" && !currentState.gameState.gameEngine.game_over)
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


  getCellColor(num: number): string {
    return num !== 0 ? '#' + num.toString(16).padStart(6, "0") : '#000000';
  }

  switch_status() {
    this.store.dispatch(this.gameStateSlice.actions.switch_status(""));
  }

  ngOnInit() {
    const game_loop = () => {
      const currentState = this.store.getState().gameState;
      const gameEngine = currentState.gameEngine;
      const actions = this.gameStateSlice.actions;
      if (gameEngine.game_over) {
        this.store.dispatch(actions.switch_status("over"));
        return;
      }
      if (gameEngine.score >= currentState.scoreLimit) {
        this.store.dispatch(actions.update_scoreLimit());
        update_game_loop();
        return;
      }
      if (currentState.status === "pause")
        this.store.dispatch(actions.next_turn());
    }

    let interval = setInterval(game_loop, this.store.getState().gameState.timePerTurn);

    let update_game_loop = () => {
      this.store.dispatch(this.gameStateSlice.actions.update_scoreLimit());
      clearInterval(interval);
      interval = setInterval(game_loop, this.store.getState().gameState.timePerTurn);
    }
  }
}
