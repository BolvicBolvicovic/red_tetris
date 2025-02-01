import { GameEngine } from "../tetris/game-engine";

export interface Multiplayer {
  my_game: GameEngine,
  opp_game: GameEngine,
  game_over: boolean,
}
