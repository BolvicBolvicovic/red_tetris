import { GameEngine } from "../tetris/game-engine";

export interface Multiplayer {
  my_game: GameEngine,
  opp_game: GameEngine,
  game_over: boolean,
  status: string,
  lookingForAGame: string,
  previous_score: number,
  game_over_message: string,
}
