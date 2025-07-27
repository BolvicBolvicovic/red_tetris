import type { GameEngine, Piece, Box } from "./types";

const board_height: number = 20;
const board_lenght: number = 10;
const undestructable_line_color: number = 0xd9d9d9;
const superposed_color: number = 0xb2b2ff;
function newGameEngine(random: boolean = false): GameEngine {
  return {
    current_board: new_board(),
    current_piece: random ? generate_random_piece() : undefined,
    game_over: false,
    score: 0,
  };
}

function generate_random_piece(): Piece {
  const pieces: Piece[] = [
    {
      color: 0xff0000,
      type: "cube",
      current_shape: 1,
      boxes: [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
      ],
      can_rotate: true,
    },
    {
      color: 0x8b0000,
      type: "stick",
      current_shape: 1,
      boxes: [
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
      ],
      can_rotate: true,
    },
    {
      color: 0xdc143c,
      type: "L",
      current_shape: 1,
      boxes: [
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
      ],
      can_rotate: true,
    },
    {
      color: 0xb22222,
      type: "J",
      current_shape: 1,
      boxes: [
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 5, y: 1 },
        { x: 5, y: 0 },
      ],
      can_rotate: true,
    },
    {
      color: 0xcd5c5c,
      type: "S",
      current_shape: 1,
      boxes: [
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      can_rotate: true,
    },
    {
      color: 0xff6347,
      type: "Z",
      current_shape: 1,
      boxes: [
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
      ],
      can_rotate: true,
    },
    {
      color: 0xfa8072,
      type: "T",
      current_shape: 1,
      boxes: [
        { x: 4, y: 0 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
      ],
      can_rotate: true,
    },
  ];
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function addRandomPiece(gameEngine: GameEngine): GameEngine {
  if (gameEngine.current_piece !== undefined) return gameEngine;
  const next_state: GameEngine = {
    current_board: gameEngine.current_board,
    current_piece: generate_random_piece(),
    game_over: gameEngine.game_over,
    score: gameEngine.score,
  };
  return can_exist(next_state)
    ? next_state
    : {
        current_board: gameEngine.current_board,
        current_piece: gameEngine.current_piece,
        game_over: true,
        score: gameEngine.score,
      };
}

function new_board(): number[][] {
  return Array.from({ length: board_height }, () => [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
}

function rotate_piece(gameEngine: GameEngine): GameEngine {
  if (!gameEngine.current_piece!.can_rotate) return gameEngine;
  const current_boxes: Box[] = gameEngine.current_piece!.boxes;
  const match = {
    cube: (): Piece => ({
      color: gameEngine.current_piece!.color,
      type: gameEngine.current_piece!.type,
      current_shape: gameEngine.current_piece!.current_shape,
      boxes: gameEngine.current_piece!.boxes,
      can_rotate: false,
    }),
    stick: (): Piece => {
      switch (gameEngine.current_piece!.current_shape) {
        case 1:
          const flat_stick: Box[] = [
            { x: current_boxes[0].x - 1, y: current_boxes[0].y + 2 },
            { x: current_boxes[1].x, y: current_boxes[1].y + 1 },
            { x: current_boxes[2].x + 1, y: current_boxes[2].y },
            { x: current_boxes[3].x + 2, y: current_boxes[3].y - 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 2,
            boxes: flat_stick,
            can_rotate: true,
          };
        case 2:
          const up_stick: Box[] = [
            { x: current_boxes[0].x + 1, y: current_boxes[0].y - 2 },
            { x: current_boxes[1].x, y: current_boxes[1].y - 1 },
            { x: current_boxes[2].x - 1, y: current_boxes[2].y },
            { x: current_boxes[3].x - 2, y: current_boxes[3].y + 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 1,
            boxes: up_stick,
            can_rotate: true,
          };
        default:
          return gameEngine.current_piece!;
      }
    },
    L: (): Piece => {
      switch (gameEngine.current_piece!.current_shape) {
        case 1:
          const L_right: Box[] = [
            { x: current_boxes[0].x + 1, y: current_boxes[0].y + 1 },
            { x: current_boxes[1].x, y: current_boxes[1].y },
            { x: current_boxes[2].x - 1, y: current_boxes[2].y - 1 },
            { x: current_boxes[3].x - 2, y: current_boxes[3].y },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 2,
            boxes: L_right,
            can_rotate: true,
          };
        case 2:
          const L_upsidedown: Box[] = [
            { x: current_boxes[0].x - 1, y: current_boxes[0].y + 1 },
            { x: current_boxes[1].x, y: current_boxes[1].y },
            { x: current_boxes[2].x + 1, y: current_boxes[2].y - 1 },
            { x: current_boxes[3].x, y: current_boxes[3].y - 2 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 3,
            boxes: L_upsidedown,
            can_rotate: true,
          };
        case 3:
          const L_left: Box[] = [
            { x: current_boxes[0].x - 1, y: current_boxes[0].y - 1 },
            { x: current_boxes[1].x, y: current_boxes[1].y },
            { x: current_boxes[2].x + 1, y: current_boxes[2].y + 1 },
            { x: current_boxes[3].x + 2, y: current_boxes[3].y },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 4,
            boxes: L_left,
            can_rotate: true,
          };
        case 4:
          const L: Box[] = [
            { x: current_boxes[0].x + 1, y: current_boxes[0].y - 1 },
            { x: current_boxes[1].x, y: current_boxes[1].y },
            { x: current_boxes[2].x - 1, y: current_boxes[2].y + 1 },
            { x: current_boxes[3].x, y: current_boxes[3].y + 2 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 1,
            boxes: L,
            can_rotate: true,
          };
        default:
          return gameEngine.current_piece!;
      }
    },
    J: (): Piece => {
      switch (gameEngine.current_piece!.current_shape) {
        case 1:
          const J_right: Box[] = [
            { x: current_boxes[0].x, y: current_boxes[0].y - 2 },
            { x: current_boxes[1].x - 1, y: current_boxes[1].y - 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x + 1, y: current_boxes[3].y + 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 2,
            boxes: J_right,
            can_rotate: true,
          };
        case 2:
          const J_upsidedown: Box[] = [
            { x: current_boxes[0].x + 2, y: current_boxes[0].y },
            { x: current_boxes[1].x + 1, y: current_boxes[1].y - 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x - 1, y: current_boxes[3].y + 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 3,
            boxes: J_upsidedown,
            can_rotate: true,
          };
        case 3:
          const J_left: Box[] = [
            { x: current_boxes[0].x, y: current_boxes[0].y + 2 },
            { x: current_boxes[1].x + 1, y: current_boxes[1].y + 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x - 1, y: current_boxes[3].y - 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 4,
            boxes: J_left,
            can_rotate: true,
          };
        case 4:
          const J: Box[] = [
            { x: current_boxes[0].x - 2, y: current_boxes[0].y },
            { x: current_boxes[1].x - 1, y: current_boxes[1].y + 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x + 1, y: current_boxes[3].y - 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 1,
            boxes: J,
            can_rotate: true,
          };
        default:
          return gameEngine.current_piece!;
      }
    },
    S: (): Piece => {
      switch (gameEngine.current_piece!.current_shape) {
        case 1:
          const S_up: Box[] = [
            { x: current_boxes[0].x, y: current_boxes[0].y - 2 },
            { x: current_boxes[1].x - 1, y: current_boxes[1].y - 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x - 1, y: current_boxes[3].y + 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 2,
            boxes: S_up,
            can_rotate: true,
          };
        case 2:
          const S_flat: Box[] = [
            { x: current_boxes[0].x, y: current_boxes[0].y + 2 },
            { x: current_boxes[1].x + 1, y: current_boxes[1].y + 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x + 1, y: current_boxes[3].y - 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 1,
            boxes: S_flat,
            can_rotate: true,
          };
        default:
          return gameEngine.current_piece!;
      }
    },
    Z: (): Piece => {
      switch (gameEngine.current_piece!.current_shape) {
        case 1:
          const Z_up: Box[] = [
            { x: current_boxes[0].x + 1, y: current_boxes[0].y - 1 },
            { x: current_boxes[1].x, y: current_boxes[1].y },
            { x: current_boxes[2].x - 1, y: current_boxes[2].y - 1 },
            { x: current_boxes[3].x - 2, y: current_boxes[3].y },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 2,
            boxes: Z_up,
            can_rotate: true,
          };
        case 2:
          const Z_flat: Box[] = [
            { x: current_boxes[0].x - 1, y: current_boxes[0].y + 1 },
            { x: current_boxes[1].x, y: current_boxes[1].y },
            { x: current_boxes[2].x + 1, y: current_boxes[2].y + 1 },
            { x: current_boxes[3].x + 2, y: current_boxes[3].y },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 1,
            boxes: Z_flat,
            can_rotate: true,
          };
        default:
          return gameEngine.current_piece!;
      }
    },
    T: (): Piece => {
      switch (gameEngine.current_piece!.current_shape) {
        case 1:
          const T_left: Box[] = [
            { x: current_boxes[0].x + 1, y: current_boxes[0].y + 1 },
            { x: current_boxes[1].x + 1, y: current_boxes[1].y - 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x - 1, y: current_boxes[3].y + 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 2,
            boxes: T_left,
            can_rotate: true,
          };
        case 2:
          const T_up: Box[] = [
            { x: current_boxes[0].x - 1, y: current_boxes[0].y + 1 },
            { x: current_boxes[1].x - 1, y: current_boxes[1].y + 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x + 1, y: current_boxes[3].y - 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 3,
            boxes: T_up,
            can_rotate: true,
          };
        case 3:
          const T_right: Box[] = [
            { x: current_boxes[0].x - 1, y: current_boxes[0].y - 1 },
            { x: current_boxes[1].x + 1, y: current_boxes[1].y - 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x - 1, y: current_boxes[3].y + 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 4,
            boxes: T_right,
            can_rotate: true,
          };
        case 4:
          const T: Box[] = [
            { x: current_boxes[0].x + 1, y: current_boxes[0].y - 1 },
            { x: current_boxes[1].x - 1, y: current_boxes[1].y + 1 },
            { x: current_boxes[2].x, y: current_boxes[2].y },
            { x: current_boxes[3].x + 1, y: current_boxes[3].y - 1 },
          ];
          return {
            color: gameEngine.current_piece!.color,
            type: gameEngine.current_piece!.type,
            current_shape: 1,
            boxes: T,
            can_rotate: true,
          };
        default:
          return gameEngine.current_piece!;
      }
    },
  };
  const rotated_piece: Piece =
    match[gameEngine.current_piece!.type!]?.() || gameEngine.current_piece;
  return {
    current_board: gameEngine.current_board,
    current_piece: rotated_piece,
    game_over: false,
    score: gameEngine.score,
  };
}

function can_exist(gameEngine: GameEngine): boolean {
  if (
    gameEngine.current_board.some((arr) =>
      arr.some((num) => num === superposed_color)
    )
  )
    return false;
  if (gameEngine.current_piece === undefined) return true;
  for (const { x, y } of gameEngine.current_piece.boxes) {
    if (
      x < 0 ||
      x >= board_lenght ||
      y < 0 ||
      y >= board_height ||
      gameEngine.current_board[y][x] !== 0
    )
      return false;
  }
  return true;
}

function translate_piece_down(gameEngine: GameEngine): GameEngine {
  if (gameEngine.current_piece === undefined) return gameEngine;
  for (const { x, y } of gameEngine.current_piece!.boxes) {
    if (y + 1 === board_height || gameEngine.current_board[y + 1][x] !== 0)
      return next_board_state(add_current_piece_to_board(gameEngine));
  }
  const next_pos_piece: Piece = {
    color: gameEngine.current_piece!.color,
    type: gameEngine.current_piece!.type,
    current_shape: gameEngine.current_piece!.current_shape,
    boxes: gameEngine.current_piece!.boxes.map(({ x, y }) => ({
      x,
      y: y + 1,
    })),
    can_rotate: true,
  };
  const new_gameEngine_with_rotating_piece: GameEngine = {
    current_board: gameEngine.current_board,
    current_piece: next_pos_piece,
    game_over: gameEngine.game_over,
    score: gameEngine.score,
  };
  return can_exist(rotate_piece(new_gameEngine_with_rotating_piece))
    ? new_gameEngine_with_rotating_piece
    : {
        current_board: gameEngine.current_board,
        current_piece: {
          color: next_pos_piece.color,
          type: next_pos_piece.type,
          current_shape: next_pos_piece.current_shape,
          boxes: next_pos_piece.boxes,
          can_rotate: false,
        },
        game_over: gameEngine.game_over,
        score: gameEngine.score,
      };
}

function translate_piece_side(
  gameEngine: GameEngine,
  side: number
): GameEngine {
  if ((side != 1 && side != -1) || gameEngine.current_piece === undefined)
    return gameEngine;
  for (const { x, y } of gameEngine.current_piece!.boxes) {
    if (
      x + side === board_lenght ||
      x + side === -1 ||
      gameEngine.current_board[y][x + side] !== 0
    )
      return gameEngine;
  }
  const next_pos_piece: Piece = {
    color: gameEngine.current_piece!.color,
    type: gameEngine.current_piece!.type,
    current_shape: gameEngine.current_piece!.current_shape,
    boxes: gameEngine.current_piece!.boxes.map(({ x, y }) => ({
      x: x + side,
      y,
    })),
    can_rotate: true,
  };
  const new_gameEngine_with_rotating_piece: GameEngine = {
    current_board: gameEngine.current_board,
    current_piece: next_pos_piece,
    game_over: false,
    score: gameEngine.score,
  };
  return can_exist(rotate_piece(new_gameEngine_with_rotating_piece))
    ? new_gameEngine_with_rotating_piece
    : {
        current_board: gameEngine.current_board,
        current_piece: {
          color: next_pos_piece.color,
          type: next_pos_piece.type,
          current_shape: next_pos_piece.current_shape,
          boxes: next_pos_piece.boxes,
          can_rotate: false,
        },
        game_over: false,
        score: gameEngine.score,
      };
}

function add_undestructable_line(
  gameEngine: GameEngine,
  lines: number
): GameEngine {
  const next_board: GameEngine = {
    current_board: gameEngine.current_board
      .slice(lines)
      .concat(
        Array.from({ length: lines }, () =>
          Array.from({ length: board_lenght }, () => undestructable_line_color)
        )
      ),
    current_piece: gameEngine.current_piece,
    game_over: gameEngine.game_over,
    score: gameEngine.score,
  };
  for (const { x, y } of next_board.current_piece!.boxes) {
    if (y + 1 === board_height || gameEngine.current_board[y + 1][x] !== 0)
      return next_board_state(add_current_piece_to_board(gameEngine));
  }
  return next_board_state(next_board);
}

function add_current_piece_to_board(gameEngine: GameEngine): GameEngine {
  if (gameEngine.current_piece === undefined) return gameEngine;
  let new_board: number[][] = gameEngine.current_board.map((row) => [...row]);
  gameEngine.current_piece!.boxes.forEach(({ x, y }) => {
    if (y === -1) return;
    new_board[y][x] =
      new_board[y][x] === 0
        ? gameEngine.current_piece!.color
        : new_board[y][x] === undestructable_line_color
        ? undestructable_line_color
        : superposed_color;
  });
  return {
    current_board: new_board,
    current_piece: undefined,
    game_over: gameEngine.game_over,
    score: gameEngine.score,
  };
}

function next_board_state(gameEngine: GameEngine): GameEngine {
  const no_full_row_board: number[][] = gameEngine.current_board.filter(
    (row) => row.includes(0) || row.includes(undestructable_line_color)
  );
  const add_x_rows: number =
    gameEngine.current_board.length - no_full_row_board.length;
  const missing_rows: number[][] = Array.from({ length: add_x_rows }, () => [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  return {
    current_board: missing_rows.concat(no_full_row_board),
    current_piece: gameEngine.current_piece,
    game_over: false,
    score: gameEngine.score + 100 * add_x_rows + 10,
  };
}

export const gameEngine = {
  newGameEngine,
  generate_random_piece,
  addRandomPiece,
  rotate_piece,
  can_exist,
  translate_piece_down,
  translate_piece_side,
  add_undestructable_line,
  add_current_piece_to_board,
  next_board_state,
  new_board,
  board_height,
  board_lenght,
  undestructable_line_color,
  superposed_color,
};
