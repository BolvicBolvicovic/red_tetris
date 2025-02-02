import { Component, HostListener, inject } from '@angular/core';
import { TetrisService } from '../tetris/tetris.service';
import { CommonModule } from '@angular/common';
import { Multiplayer } from './multiplayer';

@Component({
  selector: 'app-multiplayer',
  imports: [CommonModule],
  templateUrl: './multiplayer.component.html',
  styleUrl: './multiplayer.component.css'
})
export class MultiplayerComponent {

  tetrisService: TetrisService = inject(TetrisService);
  multiplayer: Multiplayer = {
    my_game: this.tetrisService.newGameEngine(),
    opp_game: this.tetrisService.newGameEngine(),
    game_over: false,
  };
  state: string = "lookForAGame"
  lookingForAGame: string = "looking for a game";
  previous_score: number = 0;
  game_over_message: string = "";
  readonly blueMask: number = 0x0000ff;
  readonly timePerTurn: number = 500;

  getCellColor(num: number, mask: number = 0xffffff): string {
    return num !== 0
      ? num === this.tetrisService.undestructable_line_color
        ? '#' + (num).toString(16).padStart(6, "0")
        : '#' + (num & mask).toString(16).padStart(6, "0")
      : '#000000';
  }

  joinARoom(id: string) {
    this.state = id;
  }

  createARoom(id: string) {
    this.state = id;
  }

  lookForAGame() {
    this.state = "lookingForAGame";
    let interval = setInterval(() => {
      this.lookingForAGame.length < 21
        ? this.lookingForAGame += "."
        : this.lookingForAGame = this.lookingForAGame.slice(0, this.lookingForAGame.length - 3)
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      this.multiplayer.my_game = this.tetrisService.newGameEngine();
      this.multiplayer.opp_game = this.tetrisService.newGameEngine();
      this.state = "game";
      this.start_loop();
    }, 1000);
  }
  start_loop() {
    const game_loop = () => {
      if (this.multiplayer.opp_game.game_over || this.multiplayer.my_game.game_over) {
        this.state = "gameOver";
        end_game_loop();
        return;
      }
      this.multiplayer.opp_game = this.tetrisService.add_undestructable_line(this.multiplayer.opp_game, (this.multiplayer.my_game.score - 10 - this.previous_score) / 100);
      this.previous_score = this.multiplayer.my_game.score;
      this.multiplayer.my_game = this.tetrisService.translate_piece_down(this.multiplayer.my_game);
    }

    let interval = setInterval(game_loop, this.timePerTurn);

    let end_game_loop = () => {
      this.multiplayer.my_game.game_over
        ? this.game_over_message = "you lost"
        : this.game_over_message = "you won"
      clearInterval(interval);
      setTimeout(() => this.state = "lookForAGame", 3000);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.multiplayer.opp_game.game_over && !this.multiplayer.my_game.game_over)
      switch (event.key) {
        case 'ArrowDown':
          this.multiplayer.my_game = this.tetrisService.translate_piece_down(this.multiplayer.my_game);
          break;
        case 'ArrowUp':
          this.multiplayer.my_game = this.tetrisService.rotate_piece(this.multiplayer.my_game);
          break;
        case 'ArrowLeft':
          this.multiplayer.my_game = this.tetrisService.translate_piece_side(this.multiplayer.my_game, -1);
          break;
        case 'ArrowRight':
          this.multiplayer.my_game = this.tetrisService.translate_piece_side(this.multiplayer.my_game, 1);
          break;
      }
  }

}
