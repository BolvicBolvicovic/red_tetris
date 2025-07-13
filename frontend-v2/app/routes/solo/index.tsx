import { useEffect, useCallback } from "react";
import { gameEngine } from "~/lib/game-engine";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "~/lib/store";
import { soloGameSlice } from "~/lib/store";

export default function Solo() {
  const dispatch = useDispatch<AppDispatch>();
  const gameState = useSelector((state: RootState) => state.soloGame);

  const getCellColor = (num: number): string => {
    return num !== 0 ? "#" + num.toString(16).padStart(6, "0") : "#000000";
  };

  const switch_status = () => {
    dispatch(soloGameSlice.actions.switch_status(""));
  };

  const reset_game = () => {
    dispatch(soloGameSlice.actions.reset_game());
  };

  // Game loop logic
  const game_loop = useCallback(() => {
    const currentState = gameState;
    const currentGameEngine = currentState.gameEngine;
    const actions = soloGameSlice.actions;

    if (currentGameEngine.game_over) {
      dispatch(actions.switch_status("over"));
      return;
    }

    if (currentGameEngine.score >= currentState.scoreLimit) {
      dispatch(actions.update_scoreLimit());
      dispatch(actions.update_timePerTurn());
      return;
    }

    if (currentState.status === "play") {
      dispatch(actions.next_turn());
    }
  }, [dispatch]);

  // Handle game loop interval
  useEffect(() => {
    if (gameState.status === "play" && !gameState.gameEngine.game_over) {
      const interval = setInterval(game_loop, gameState.timePerTurn);
      dispatch(soloGameSlice.actions.set_intervalId(interval));

      return () => {
        clearInterval(interval);
        dispatch(soloGameSlice.actions.set_intervalId(null));
      };
    } else if (gameState.intervalId) {
      clearInterval(gameState.intervalId);
      dispatch(soloGameSlice.actions.set_intervalId(null));
    }
  }, [
    gameState.status,
    gameState.timePerTurn,
    gameState.gameEngine.game_over,
    game_loop,
    dispatch,
  ]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.status === "play" && !gameState.gameEngine.game_over) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault(); // Prevent page scrolling
            dispatch(soloGameSlice.actions.translate_piece_down());
            break;
          case "ArrowUp":
            event.preventDefault(); // Prevent page scrolling
            dispatch(soloGameSlice.actions.rotate_piece());
            break;
          case "ArrowLeft":
            event.preventDefault(); // Prevent page scrolling
            dispatch(soloGameSlice.actions.translate_piece_side(-1));
            break;
          case "ArrowRight":
            event.preventDefault(); // Prevent page scrolling
            dispatch(soloGameSlice.actions.translate_piece_side(1));
            break;
          case " ": // Spacebar for pause/play
            event.preventDefault();
            switch_status();
            break;
        }
      } else if (gameState.status === "pause") {
        if (event.key === " ") {
          event.preventDefault();
          switch_status();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, gameState.status, gameState.gameEngine.game_over]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <section className="flex flex-row justify-between gap-x-6 h-full max-h-full items-center">
        <div className="flex items-center justify-center">
          <div
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${gameState.gameEngine.current_board[0].length}, 1fr)`,
              gridTemplateRows: `repeat(${gameState.gameEngine.current_board.length}, 1fr)`,
              height: "min(calc(100vh - 16rem), 600px)",
              aspectRatio: `${gameState.gameEngine.current_board[0].length} / ${gameState.gameEngine.current_board.length}`,
            }}
          >
            {gameEngine
              .add_current_piece_to_board(gameState.gameEngine)
              .current_board.flat()
              .map((num: number, index: number) => (
                <div
                  key={index}
                  className="rounded-sm border border-red-900/30"
                  style={{
                    backgroundColor: getCellColor(num),
                    minWidth: "16px",
                    minHeight: "16px",
                  }}
                />
              ))}
          </div>
        </div>

        <section className="flex flex-col gap-y-2 w-40">
          <button
            onClick={switch_status}
            className="bg-red-400 rounded w-[8lvh] hover:bg-red-300 active:bg-red-500 cursor-pointer"
          >
            {gameState.status}
          </button>

          {gameState.status === "over" && (
            <button
              onClick={reset_game}
              className="bg-green-400 rounded w-[8lvh] hover:bg-green-300 active:bg-green-500 cursor-pointer"
            >
              Reset
            </button>
          )}

          <h1>Score: {gameState.gameEngine.score}</h1>
          <h2>Level: {Math.floor(gameState.gameEngine.score / 500) + 1}</h2>

          {gameState.status === "pause" && (
            <div className="text-center text-yellow-600 font-bold">PAUSED</div>
          )}

          {gameState.status === "over" && (
            <div className="text-center text-red-600 font-bold">GAME OVER</div>
          )}

          <div className="text-sm text-gray-600 mt-4">
            <p>Controls:</p>
            <p>↑ - Rotate</p>
            <p>↓ - Soft Drop</p>
            <p>← → - Move</p>
            <p>Space - Pause</p>
          </div>
        </section>
      </section>
    </div>
  );
}
