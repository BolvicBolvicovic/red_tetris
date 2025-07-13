type RoomStatus = "waiting" | "in_game";
type PieceType = "cube" | "stick" | "L" | "J" | "S" | "Z" | "T";

export interface Piece {
  color: number;
  type: PieceType;
  current_shape: number;
  boxes: Box[];
  can_rotate: boolean;
}

export interface Box {
  x: number;
  y: number;
}

export interface GameEngine {
  current_board: number[][];
  current_piece: Piece | undefined;
  game_over: boolean;
  score: number;
}

export interface Player {
  id: string;
  gameVue: GameEngine | undefined;
  game_over: boolean;
  currentPieceIndex: number;
  previous_score: number;
}

export interface Room {
  id: string;
  roomLeader: string;
  players: Player[];
  limit: number;
  status: RoomStatus;
  pieces: Piece[];
}
