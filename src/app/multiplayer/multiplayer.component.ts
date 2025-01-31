import { Component, inject } from '@angular/core';
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
  };
  state: string = "lookForAGame"
  lookingForAGame: string = "looking for a game";

  lookForAGame() {
    this.state = "lookingForAGame"
    let interval = setInterval(() => {
      this.lookingForAGame.length < 21
        ? this.lookingForAGame += "."
        : this.lookingForAGame = this.lookingForAGame.slice(0, this.lookingForAGame.length - 3)
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
    this.state = "game";
  }

}
