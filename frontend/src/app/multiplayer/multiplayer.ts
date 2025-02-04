import { GameEngine } from "../tetris/game-engine";

export interface Multiplayer {
  my_game: GameEngine | undefined,
  opp_game: GameEngine[] | undefined,
  game_over: boolean,
  status: string,
  lookingForAGame: string,
  roomId: string,
  roomLimit: number,
  previous_score: number,
  game_over_message: string,
}
