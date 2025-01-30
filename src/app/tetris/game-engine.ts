export interface Piece {
  color: number,
  type: string,
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
  current_piece: Piece
  game_over: boolean,
}
