import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TetrisService } from './tetris.service';
import { GameEngine } from './game-engine';

@Component({
  selector: 'app-tetris',
  imports: [CommonModule],
  templateUrl: './tetris.component.html',
  styleUrl: './tetris.component.css'
})
export class TetrisComponent implements OnInit {
  tetrisService: TetrisService = inject(TetrisService);
  state: string = "play";
  timePerTurn: number = 500;
  scoreLimit: number = 500;
  gameEngine: GameEngine = this.tetrisService.newGameEngine();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.state != "play" && !this.gameEngine.game_over)
      switch (event.key) {
        case 'ArrowDown':
          this.gameEngine = this.tetrisService.translate_piece_down(this.gameEngine);
          break;
        case 'ArrowUp':
          this.gameEngine = this.tetrisService.rotate_piece(this.gameEngine);
          break;
        case 'ArrowLeft':
          this.gameEngine = this.tetrisService.translate_piece_side(this.gameEngine, -1);
          break;
        case 'ArrowRight':
          this.gameEngine = this.tetrisService.translate_piece_side(this.gameEngine, 1);
          break;
      }
  }

  switch_state() {
    if (this.state != "over")
      this.state = this.state != "play" ? "play" : "pause";
  }

  getCellColor(num: number): string {
    return num !== 0 ? '#' + num.toString(16).padStart(6, "0") : '#000000';
  }

  ngOnInit() {
    const game_loop = () => {
      if (this.gameEngine.game_over)
        this.state = "over";
      if (this.gameEngine.score >= this.scoreLimit) {
        this.scoreLimit *= 1.2;
        update_game_loop();
        return;
      }
      if (this.state != "play" && !this.gameEngine.game_over)
        this.gameEngine = this.tetrisService.translate_piece_down(this.gameEngine);
    }

    let interval = setInterval(game_loop, this.timePerTurn);

    let update_game_loop = () => {
      this.timePerTurn *= 0.8;
      clearInterval(interval);
      interval = setInterval(game_loop, this.timePerTurn);
    }
  }
}
