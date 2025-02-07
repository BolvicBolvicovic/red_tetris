type RoomStatus = "waiting" | "in_game";
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

export interface Player {
	id: string,
	gameVue: GameEngine | undefined,
	game_over: boolean,
	currentPieceIndex: number,
	previous_score: number,
}

export interface Room {
	id: string,
	roomLeader: string,
	players: Player[],
	limit: number,
	status: RoomStatus,
	pieces: Piece[],
}

export function generate_random_piece(): Piece {
  const pieces: Piece[] = [
    {
      color: 0xFF0000,
      type: "cube",
      current_shape: 1,
      boxes: [ { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 } ],
      can_rotate: true,
    },
    {
      color: 0x8B0000,
      type: "stick",
      current_shape: 1,
      boxes: [ { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 } ],
      can_rotate: true,
    },
    {
      color: 0xDC143C,
      type: "L",
      current_shape: 1,
      boxes: [ { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 5, y: 2 } ],
      can_rotate: true,
    },
    {
      color: 0xB22222,
      type: "J",
      current_shape: 1,
      boxes: [ { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 1 }, { x: 5, y: 0 } ],
      can_rotate: true,
    },
    {
      color: 0xCD5C5C,
      type: "S",
      current_shape: 1,
      boxes: [ { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 0 } ],
      can_rotate: true,
    },
    {
      color: 0xFF6347,
      type: "Z",
      current_shape: 1,
      boxes: [ { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 } ],
      can_rotate: true,
    },
    {
      color: 0xFA8072,
      type: "T",
      current_shape: 1,
      boxes: [ { x: 4, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 } ],
      can_rotate: true,
    },
  ];
  return pieces[Math.floor(Math.random() * pieces.length)];
}
