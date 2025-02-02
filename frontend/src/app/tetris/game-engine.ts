type PieceType = "cube" | "stick" | "L" | "J" | "S" | "Z" | "T";

export interface Piece {
  color: number,
  type: PieceType,
  current_shape: number,
  boxes: Box[]
  can_rotate: boolean,
}

export interface Box {
  x: number,
  y: number,
}

export interface GameEngine {
  current_board: number[][],
  current_piece: Piece | undefined,
  game_over: boolean,
  score: number,
}
