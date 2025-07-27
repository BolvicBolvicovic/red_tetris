import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { gameEngine } from "~/lib/game-engine";
import { io, type Socket } from "socket.io-client";
import type { GameEngine } from "~/lib/game-engine/types";
import type { AppDispatch, RootState } from "~/lib/store";
import { multiplayerGameSlice } from "~/lib/store";

export default function Multiplayer() {
  const dispatch = useDispatch<AppDispatch>();
  const gameState = useSelector((state: RootState) => state.multiplayerGame);
  const [socket] = useState<Socket>(() =>
    io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8080")
  );
  const [idInput, setIdInput] = useState("");

  const blueMask: number = 0x0000ff;
  const timePerTurn: number = 500;

  // Handle side effects when certain actions are dispatched
  useEffect(() => {
    if (gameState.status === "gameOver") {
      const timeoutId = setTimeout(() => {
        dispatch(multiplayerGameSlice.actions.update_status("lookForAGame"));
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.status, dispatch]);

  // Handle game engine side effects - emit updates to backend
  useEffect(() => {
    if (
      gameState.my_game &&
      gameState.roomId &&
      (gameState.my_game as any)._needsUpdate
    ) {
      const cleanGame = { ...gameState.my_game };
      delete (cleanGame as any)._needsUpdate;
      socket.emit("updateGameEngine", gameState.roomId, cleanGame);
    }
  }, [gameState.my_game, gameState.roomId, socket]);

  // Socket event listeners
  useEffect(() => {
    const handleRoomUpdate = (roomData: {
      id: string;
      players: GameEngine[] | undefined;
      limit: number;
      status: string;
    }) => {
      if (gameState.status === "gameOver") return;

      if (roomData.status === "gameStart") {
        dispatch(
          multiplayerGameSlice.actions.update_room({
            id: roomData.id,
            players: roomData.players,
            limit: roomData.limit,
            status: "in_game",
          })
        );
        start_loop();
      } else {
        dispatch(multiplayerGameSlice.actions.update_room(roomData));
      }
    };

    const handleUnknownRoomId = (message: string) => {
      console.error("Unknown room ID:", message);
      // Reset to initial state
      dispatch(multiplayerGameSlice.actions.update_status("lookForAGame"));
    };

    const handleExistingRoom = (message: string) => {
      console.error("Room already exists:", message);
      // Could show a message to user or auto-join
    };

    const handleFullRoom = (message: string) => {
      console.error("Room is full:", message);
      dispatch(multiplayerGameSlice.actions.update_status("lookForAGame"));
    };

    const handleNewPiece = (piece: any) => {
      if (gameState.my_game?.current_piece === undefined) {
        dispatch(multiplayerGameSlice.actions.newPiece(piece));
      }
    };

    const handleGameOver = () => {
      dispatch(multiplayerGameSlice.actions.update_status("gameOver"));
    };

    const handleAddUndestructableLine = (lineCount: number) => {
      dispatch(multiplayerGameSlice.actions.add_undestructable_line(lineCount));
    };

    // Register event listeners
    socket.on("roomUpdate", handleRoomUpdate);
    socket.on("unknownRoomId", handleUnknownRoomId);
    socket.on("existingRoom", handleExistingRoom);
    socket.on("fullRoom", handleFullRoom);
    socket.on("newPiece", handleNewPiece);
    socket.on("gameOver", handleGameOver);
    socket.on("add_undestructable_line", handleAddUndestructableLine);

    // Cleanup event listeners on unmount
    return () => {
      socket.off("roomUpdate", handleRoomUpdate);
      socket.off("unknownRoomId", handleUnknownRoomId);
      socket.off("existingRoom", handleExistingRoom);
      socket.off("fullRoom", handleFullRoom);
      socket.off("newPiece", handleNewPiece);
      socket.off("gameOver", handleGameOver);
      socket.off("add_undestructable_line", handleAddUndestructableLine);
    };
  }, [socket, dispatch, gameState.status, gameState.my_game?.current_piece]);

  // Auto-start game loop when game begins and we have a piece
  useEffect(() => {
    if (gameState.status === "gameStart" && gameState.my_game?.current_piece) {
      console.log(
        "Starting game loop - status:",
        gameState.status,
        "has piece:",
        !!gameState.my_game?.current_piece
      );
      start_loop();
    } else if (
      gameState.status !== "gameStart" &&
      gameState.intervalId !== null
    ) {
      console.log("Stopping game loop - status:", gameState.status);
      dispatch(multiplayerGameSlice.actions.clear_intervalId());
    }
  }, [gameState.status, gameState.my_game?.current_piece, dispatch]);

  const getCellColor = (num: number, mask: number = 0xffffff): string => {
    return num !== 0
      ? num === gameEngine.undestructable_line_color
        ? "#" + num.toString(16).padStart(6, "0")
        : (num & mask) === 0
        ? "#0000b0"
        : "#" + (num & mask).toString(16).padStart(6, "0")
      : "#000000";
  };

  const joinARoom = (id: string) => {
    console.log("Joining room with ID:", id);
    socket.emit("joinRoom", id);
    dispatch(multiplayerGameSlice.actions.update_room_id(id));
  };

  const createARoom = (id: string) => {
    console.log("Creating room with ID:", id);
    socket.emit("createRoom", id);
    dispatch(multiplayerGameSlice.actions.update_room_id(id));
  };

  const startGame = () => {
    if (gameState.opp_game !== undefined && gameState.opp_game.length > 0) {
      socket.emit("startGame", {
        roomId: gameState.roomId,
        my_game: gameState.my_game,
      });
    }
  };

  const leaveRoom = () => {
    if (gameState.roomId) {
      socket.emit("leaveRoom", gameState.roomId);
      dispatch(multiplayerGameSlice.actions.update_status("lookForAGame"));
      dispatch(multiplayerGameSlice.actions.update_room_id(""));
    }
  };

  const lookForAGame = () => {
    dispatch(multiplayerGameSlice.actions.update_status("lookingForAGame"));
    const interval = setInterval(() => {
      dispatch(multiplayerGameSlice.actions.update_lookingForAGame());
    }, 500);
    dispatch(multiplayerGameSlice.actions.set_intervalId(interval));
  };

  const start_loop = () => {
    // Clear any existing interval first
    if (gameState.intervalId !== null) {
      clearInterval(gameState.intervalId);
    }

    const game_loop = () => {
      if (
        gameState.my_game?.current_piece === undefined ||
        gameState.my_game!.game_over
      ) {
        return;
      }
      dispatch(multiplayerGameSlice.actions.translate_piece_down());
    };
    const intervalId = setInterval(game_loop, timePerTurn);
    dispatch(multiplayerGameSlice.actions.set_intervalId(intervalId));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (
        gameState.my_game !== undefined &&
        gameState.status === "gameStart" &&
        !gameState.my_game.game_over
      ) {
        switch (event.key) {
          case "ArrowDown":
            dispatch(multiplayerGameSlice.actions.translate_piece_down());
            break;
          case "ArrowUp":
            dispatch(multiplayerGameSlice.actions.rotate_piece());
            break;
          case "ArrowLeft":
            dispatch(multiplayerGameSlice.actions.translate_piece_side(-1));
            break;
          case "ArrowRight":
            dispatch(multiplayerGameSlice.actions.translate_piece_side(1));
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, gameState.my_game, gameState.status]);

  return (
    <section className="flex flex-col justify-center items-center w-[70lvh] h-[50lvh] text-center">
      <div className="flex flex-row justify-center items-center w-full h-full">
        {gameState.status === "lookForAGame" && (
          <section className="flex flex-row gap-x-8">
            <button
              onClick={lookForAGame}
              className="w-[20lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100 cursor-pointer"
            >
              look for a game
            </button>
            <button
              onClick={() =>
                dispatch(
                  multiplayerGameSlice.actions.update_status("joinARoom")
                )
              }
              className="w-[20lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100 cursor-pointer"
            >
              join/create a room
            </button>
          </section>
        )}

        {gameState.status === "joinARoom" && (
          <div className="flex flex-col justify-center items-center gap-y-4">
            <input
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-center border border-red-300 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent hover:placeholder:text-sky-200 shadow-sm hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              placeholder="enter room id"
            />
            <div className="flex flex-row gap-x-4">
              <button
                onClick={() => joinARoom(idInput)}
                disabled={!idInput.trim()}
                className="w-[10lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                join
              </button>
              <button
                onClick={() => createARoom(idInput)}
                disabled={!idInput.trim()}
                className="w-[10lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                create
              </button>
              <button
                onClick={() =>
                  dispatch(
                    multiplayerGameSlice.actions.update_status("lookForAGame")
                  )
                }
                className="w-[10lvh] flex flex-col hover:text-red-400 hover:scale-110 transition-transform duration-100 cursor-pointer"
              >
                back
              </button>
            </div>
          </div>
        )}

        {gameState.status === "lookingForAGame" && (
          <h1 className="w-[32lvh] flex flex-col hover:text-sky-200 cursor-progress">
            {gameState.lookingForAGame}
          </h1>
        )}

        {gameState.status === "gameRoom" && (
          <section className="flex flex-col items-center justify-center gap-y-4">
            <h1 className="w-[32lvh] flex flex-col hover:text-sky-200 text-center">
              currently in game room with{" "}
              {(gameState.opp_game?.length || 0) + 1} total players (
              {gameState.opp_game?.length || 0} opponents)
            </h1>
            <div className="flex flex-row gap-x-4">
              <button
                onClick={startGame}
                disabled={
                  !gameState.opp_game || gameState.opp_game.length === 0
                }
                className="w-[20lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                start game
              </button>
              <button
                onClick={leaveRoom}
                className="w-[20lvh] flex flex-col hover:text-red-400 hover:scale-110 transition-transform duration-100 cursor-pointer"
              >
                leave room
              </button>
            </div>
          </section>
        )}

        {gameState.status === "gameStart" && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <section className="flex flex-row justify-between gap-x-6 h-full max-h-full items-center">
              <div className="flex flex-col gap-y-2 items-center">
                <h1 className="text-lg font-bold text-red-200">You</h1>
                <div className="flex items-center justify-center">
                  <div
                    className="grid gap-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${
                        gameState.my_game!.current_board[0].length
                      }, 1fr)`,
                      gridTemplateRows: `repeat(${
                        gameState.my_game!.current_board.length
                      }, 1fr)`,
                      height: "min(calc(100vh - 20rem), 500px)",
                      aspectRatio: `${
                        gameState.my_game!.current_board[0].length
                      } / ${gameState.my_game!.current_board.length}`,
                    }}
                  >
                    {gameEngine
                      .add_current_piece_to_board(gameState.my_game!)
                      .current_board.flat()
                      .map((num, index) => (
                        <div
                          key={index}
                          className="rounded-sm border border-red-900/30"
                          style={{
                            backgroundColor: getCellColor(num),
                            minWidth: "12px",
                            minHeight: "12px",
                          }}
                        />
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-y-4 items-center max-h-full overflow-y-auto">
                <h1 className="text-lg font-bold text-blue-200">Opponents</h1>
                {gameState.opp_game?.map(
                  (opp: GameEngine, oppIndex: number) => (
                    <div
                      key={oppIndex}
                      className="flex flex-col items-center gap-y-2"
                    >
                      <span className="text-sm text-gray-400">
                        Player {oppIndex + 2}
                      </span>
                      <div
                        className="grid gap-0.5"
                        style={{
                          gridTemplateColumns: `repeat(${opp.current_board[0].length}, 1fr)`,
                          gridTemplateRows: `repeat(${opp.current_board.length}, 1fr)`,
                          height: "min(200px, 25vh)",
                          aspectRatio: `${opp.current_board[0].length} / ${opp.current_board.length}`,
                        }}
                      >
                        {opp.current_board
                          .flat()
                          .map((num: number, cellIndex: number) => (
                            <div
                              key={cellIndex}
                              className="rounded-sm"
                              style={{
                                backgroundColor: getCellColor(num, blueMask),
                                minWidth: "4px",
                                minHeight: "4px",
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        )}

        {gameState.status === "gameOver" && (
          <h1 className="w-[32lvh] flex flex-col hover:text-sky-200 cursor-progress">
            {gameState.game_over_message}
          </h1>
        )}
      </div>
    </section>
  );
}
