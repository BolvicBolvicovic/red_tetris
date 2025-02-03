import { Component, HostListener, inject } from '@angular/core';
import { TetrisService } from '../tetris/tetris.service';
import { CommonModule } from '@angular/common';
import { Multiplayer } from './multiplayer';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit';

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
    opp_game: this.tetrisService.newGameEngine(),
    game_over: false,
    status: "lookForAGame",
    lookingForAGame: "looking for a game",
    previous_score: 0,
    game_over_message: "",
  };
  readonly blueMask: number = 0x0000ff;
  readonly timePerTurn: number = 500;

  readonly gameStateSlice = createSlice({
    name: 'gameState',
    initialState: this.multiplayer,
    reducers: {
      update_status: (state, action: PayloadAction<string>) => {
          state.status = action.payload;
      },
      update_lookingForAGame: state => {
        state.lookingForAGame.length < 21
          ? state.lookingForAGame += "."
          : state.lookingForAGame = state.lookingForAGame.slice(0, state.lookingForAGame.length - 3)
      },
      update_game_over_message: state => {
        state.my_game.game_over
          ? state.game_over_message = "you lost"
          : state.game_over_message = "you won"
      },
      translate_piece_down: state => {
        state.my_game = this.tetrisService.translate_piece_down(state.my_game);
      },
      rotate_piece: state => {
        state.my_game = this.tetrisService.rotate_piece(state.my_game);
      },
      translate_piece_side: (state, action: PayloadAction<number>) => {
        state.my_game = this.tetrisService.translate_piece_side(state.my_game, action.payload);
      },
      next_turn: state => {
        state.opp_game = this.tetrisService.add_undestructable_line(state.opp_game, (state.my_game.score - 10 - state.previous_score) / 100);
        state.previous_score = state.my_game.score;
        state.my_game = this.tetrisService.translate_piece_down(state.my_game);
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
        : '#' + (num & mask).toString(16).padStart(6, "0")
      : '#000000';
  }

  joinARoom(id: string) {
    const actions = this.gameStateSlice.actions;
    this.store.dispatch(actions.update_status(id));
  }

  createARoom(id: string) {
    const actions = this.gameStateSlice.actions;
    this.store.dispatch(actions.update_status(id));
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
      if (currentState.opp_game.game_over || currentState.my_game.game_over) {
        this.store.dispatch(actions.update_status("gameOver"));
        end_game_loop();
        return;
      }
      this.store.dispatch(actions.next_turn());
    }

    let interval = setInterval(game_loop, this.timePerTurn);

    let end_game_loop = () => {
      clearInterval(interval);
      this.store.dispatch(actions.update_game_over_message());
      setTimeout(() => this.store.dispatch(actions.update_status("lookingForAGame")), 3000);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const currentState = this.store.getState();
    const actions = this.gameStateSlice.actions;
    if (currentState.gameState.status != "play" && !currentState.gameState.my_game.game_over)
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

}
