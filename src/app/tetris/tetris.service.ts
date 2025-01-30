import { Injectable } from '@angular/core';
import { Box, GameEngine, Piece } from './game-engine';

@Injectable({
  providedIn: 'root'
})

export class TetrisService {

  readonly board_height: number = 20;
  gameEngine: GameEngine;

  constructor() {
    this.gameEngine = {
      current_board: this.new_board(),
      current_piece: this.generate_random_piece(),
      game_over: false,
    };
  }

  generate_random_piece(): Piece {
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
        boxes: [ { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 4, y: 2 } ],
        can_rotate: true,
      },
      {
        color: 0xCD5C5C,
        type: "S",
        current_shape: 1,
        boxes: [ { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 } ],
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

  new_board(): number[][] {
    return Array.from({ length: this.board_height }, () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  rotate_piece(gameEngine: GameEngine): GameEngine {
    if (!gameEngine.current_piece.can_rotate) return gameEngine;
    const current_boxes: Box[] = gameEngine.current_piece.boxes;
    const match = {
      "cube":  () => gameEngine.current_piece,
      "stick": () => {
        switch (gameEngine.current_piece.current_shape) {
          case 1:
            const flat_stick: Box[] = [
              { x: current_boxes[0].x - 1, y: current_boxes[0].y + 2 },
              { x: current_boxes[1].x,     y: current_boxes[1].y + 1 },
              { x: current_boxes[2].x + 1, y: current_boxes[2].y     },
              { x: current_boxes[3].x + 2, y: current_boxes[3].y - 1 },
            ];
            return {
              color: gameEngine.current_piece.color,
              type: gameEngine.current_piece.type,
              current_shape: 2,
              boxes: flat_stick,
              can_rotate: true,
            }
          case 2:
            const up_stick: Box[] = [
              { x: current_boxes[0].x + 1, y: current_boxes[0].y - 2 },
              { x: current_boxes[1].x,     y: current_boxes[1].y - 1 },
              { x: current_boxes[2].x - 1, y: current_boxes[2].y     },
              { x: current_boxes[3].x - 2, y: current_boxes[3].y + 1 },
            ];
            return {
              color: gameEngine.current_piece.color,
              type: gameEngine.current_piece.type,
              current_shape: 1,
              boxes: up_stick,
              can_rotate: true,
            }
          default:
            return gameEngine.current_piece;
        }
      },
      "L":     () => {
        switch (gameEngine.current_piece.current_shape) {
          case 1:
            const L_right: Box[] = [
              { x: current_boxes[0].x - 1, y: current_boxes[0].y + 2 },
              { x: current_boxes[1].x - 1, y: current_boxes[1].y + 1 },
              { x: current_boxes[2].x    , y: current_boxes[2].y - 1 },
              { x: current_boxes[3].x    , y: current_boxes[3].y - 1 },
            ];
            return {
              color: gameEngine.current_piece.color,
              type: gameEngine.current_piece.type,
              current_shape: 2,
              boxes: L_right,
              can_rotate: true,
            }
          case 2:
            const L_upsidedown: Box[] = [
              { x: current_boxes[0].x    , y: current_boxes[0].y - 2 },
              { x: current_boxes[1].x + 1, y: current_boxes[1].y - 1 },
              { x: current_boxes[2].x    , y: current_boxes[2].y     },
              { x: current_boxes[3].x + 1, y: current_boxes[3].y - 1 },
            ];
            return {
              color: gameEngine.current_piece.color,
              type: gameEngine.current_piece.type,
              current_shape: 3,
              boxes: L_upsidedown,
              can_rotate: true,
            }
          case 3:
            const L_left: Box[] = [
              { x: current_boxes[0].x    , y: current_boxes[0].y + 1 },
              { x: current_boxes[1].x    , y: current_boxes[1].y + 1 },
              { x: current_boxes[2].x + 1, y: current_boxes[2].y     },
              { x: current_boxes[3].x + 1, y: current_boxes[3].y - 2 },
            ];
            return {
              color: gameEngine.current_piece.color,
              type: gameEngine.current_piece.type,
              current_shape: 3,
              boxes: L_left,
              can_rotate: true,
            }
          case 3:
            const L: Box[] = [
              { x: current_boxes[0].x + 1, y: current_boxes[0].y - 1 },
              { x: current_boxes[1].x    , y: current_boxes[1].y     },
              { x: current_boxes[2].x - 1, y: current_boxes[2].y + 1 },
              { x: current_boxes[3].x    , y: current_boxes[3].y + 2 },
            ];
            return {
              color: gameEngine.current_piece.color,
              type: gameEngine.current_piece.type,
              current_shape: 3,
              boxes: L,
              can_rotate: true,
            }
          default:
            return gameEngine.current_piece;
        }
      },
      // Write next rotation
      "J":     () => ,
      "S":     () => ,
      "Z":     () => ,
      "T":     () => ,
    };
    const rotated_piece: Piece = match[gameEngine.current_piece.type] || gameEngine.current_piece;
    return {
      current_board: gameEngine.current_board,
      current_piece: rotated_piece,
      game_over: false,
    }
  }

  translate_piece_down(gameEngine: GameEngine): GameEngine {
    for (const {x, y} of gameEngine.current_piece.boxes) {
      if (y + 1 === this.board_height || gameEngine.current_board[y][x] !== 0)
        return this.add_current_piece_to_board(gameEngine);
    }
    let next_pos_piece = {
      color: gameEngine.current_piece.color,
      type: gameEngine.current_piece.type,
      current_shape: gameEngine.current_piece.current_shape,
      boxes: gameEngine.current_piece.boxes.map(({x, y}) => ({x, y: y + 1})),
      can_rotate: true,
    }
    return {
      current_board: gameEngine.current_board,
      current_piece: next_pos_piece,
      game_over: false,
    }
  }

  add_current_piece_to_board(gameEngine: GameEngine): GameEngine {
    let new_board: number[][] = gameEngine.current_board.map(row => [...row]);
    for (const {x, y} of gameEngine.current_piece.boxes) {
      new_board[y][x] = gameEngine.current_piece.color;
    }
    return {
      current_board: new_board,
      current_piece: this.generate_random_piece(),
      game_over: false,
    }
  }

  next_board_state(gameEngine: GameEngine): GameEngine {
    const no_full_row_board: number[][] = gameEngine.current_board.filter((row) => row.includes(0));
    const add_x_rows: number = gameEngine.current_board.length - no_full_row_board.length;
    const missing_rows: number[][] = Array.from({ length: add_x_rows }, () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    return {
      current_board: missing_rows.concat(no_full_row_board),
      current_piece: gameEngine.current_piece,
      game_over: false,
    };
  }
}
