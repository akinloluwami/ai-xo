"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Board,
  Player,
  ModelConfig,
  AVAILABLE_MODELS,
  PROVIDER_LOGOS,
  createEmptyBoard,
  checkWinner,
  checkDraw,
  getNextPlayer,
} from "@/lib/game";
import ModelSelector from "./ModelSelector";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const OIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const PlayCircleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const PauseCircleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="10" x2="10" y1="15" y2="9" />
    <line x1="14" x2="14" y1="15" y2="9" />
  </svg>
);

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [modelX, setModelX] = useState<ModelConfig>(AVAILABLE_MODELS[0]);
  const [modelO, setModelO] = useState<ModelConfig>(AVAILABLE_MODELS[3]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const randomX =
      AVAILABLE_MODELS[Math.floor(Math.random() * AVAILABLE_MODELS.length)];
    let randomO =
      AVAILABLE_MODELS[Math.floor(Math.random() * AVAILABLE_MODELS.length)];

    if (AVAILABLE_MODELS.length > 1) {
      while (randomO.model === randomX.model) {
        randomO =
          AVAILABLE_MODELS[Math.floor(Math.random() * AVAILABLE_MODELS.length)];
      }
    }

    setModelX(randomX);
    setModelO(randomO);
  }, []);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer("X");
    setWinner(null);
    setIsGameOver(false);
    setGameStarted(false);
    setMoveHistory([]);
  };

  const makeMove = async (position: number) => {
    if (board[position] !== null || isGameOver) return;

    const newBoard = [...board];
    newBoard[position] = currentPlayer;
    setBoard(newBoard);

    const moveText = `${currentPlayer} played position ${position}`;
    setMoveHistory((prev) => [...prev, moveText]);

    const gameWinner = checkWinner(newBoard);
    const gameDraw = checkDraw(newBoard);

    if (gameWinner) {
      setWinner(gameWinner);
      setIsGameOver(true);
    } else if (gameDraw) {
      setIsGameOver(true);
    } else {
      setCurrentPlayer(getNextPlayer(currentPlayer));
    }
  };

  const getAIMove = async () => {
    if (isGameOver || isThinking) return;

    setIsThinking(true);
    const currentModel = currentPlayer === "X" ? modelX : modelO;

    try {
      const response = await fetch("/api/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board,
          player: currentPlayer,
          model: currentModel.model,
        }),
      });

      const data = await response.json();

      if (data.position !== null && data.position !== undefined) {
        await makeMove(data.position);
      }
    } catch (error) {
      console.error("Error getting AI move:", error);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (gameStarted && !isGameOver && autoPlay && !isThinking) {
      const timer = setTimeout(() => {
        getAIMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, currentPlayer, isGameOver, autoPlay, isThinking, board]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moveHistory]);

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col overflow-hidden">
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col min-h-0">
        {!gameStarted ? (
          <div className="max-w-2xl mx-auto mt-12 overflow-y-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
                Choose Your Fighters
              </h1>
              <p className="text-zinc-400 text-lg">
                Select the AI models that will compete against each other.
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl shadow-xl border border-zinc-800">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                <div className="p-8 space-y-6 bg-zinc-900/30 rounded-t-2xl md:rounded-tr-none md:rounded-tl-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400 shadow-sm border border-zinc-700">
                      <XIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Player X</h3>
                      <p className="text-sm text-zinc-400">First Move</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ModelSelector
                      label="AI Model"
                      selectedModel={modelX}
                      onSelect={setModelX}
                    />
                  </div>
                </div>

                <div className="p-8 space-y-6 bg-zinc-900/30 md:rounded-tr-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-rose-400 shadow-sm border border-zinc-700">
                      <OIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Player O</h3>
                      <p className="text-sm text-zinc-400">Second Move</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ModelSelector
                      label="AI Model"
                      selectedModel={modelO}
                      onSelect={setModelO}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-center rounded-b-2xl">
                <button
                  onClick={startGame}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-zinc-900 transition-all duration-200 bg-white font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 hover:bg-zinc-200"
                >
                  <span className="mr-2">Start Battle</span>
                  <SparklesIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 flex-1 min-h-0">
            <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto lg:overflow-visible">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    currentPlayer === "X" && !isGameOver
                      ? "bg-indigo-900/20 border-indigo-800 shadow-md scale-[1.02]"
                      : "bg-zinc-900 border-zinc-800 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Player X
                    </span>
                    {currentPlayer === "X" && !isGameOver && (
                      <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <XIcon className="w-5 h-5 text-indigo-400" />
                    <div className="w-px h-4 bg-zinc-700"></div>
                    <div className="relative w-5 h-5 shrink-0">
                      <Image
                        src={
                          PROVIDER_LOGOS[modelX.provider] ||
                          PROVIDER_LOGOS.other
                        }
                        alt={modelX.provider}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-semibold truncate">
                      {modelX.name}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    currentPlayer === "O" && !isGameOver
                      ? "bg-rose-900/20 border-rose-800 shadow-md scale-[1.02]"
                      : "bg-zinc-900 border-zinc-800 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Player O
                    </span>
                    {currentPlayer === "O" && !isGameOver && (
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <OIcon className="w-5 h-5 text-rose-400" />
                    <div className="w-px h-4 bg-zinc-700"></div>
                    <div className="relative w-5 h-5 shrink-0">
                      <Image
                        src={
                          PROVIDER_LOGOS[modelO.provider] ||
                          PROVIDER_LOGOS.other
                        }
                        alt={modelO.provider}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-semibold truncate">
                      {modelO.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-[400px] bg-zinc-900 rounded-3xl shadow-xl border border-zinc-800 p-8 relative overflow-hidden">
                {isThinking && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 text-zinc-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10 flex items-center gap-2 animate-pulse">
                    <SparklesIcon className="w-4 h-4" />
                    AI is thinking...
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 w-full max-w-[400px] aspect-square">
                  {board.map((cell, idx) => (
                    <button
                      key={idx}
                      onClick={() => !autoPlay && makeMove(idx)}
                      disabled={
                        cell !== null || isGameOver || isThinking || autoPlay
                      }
                      className={`
                        relative rounded-xl flex items-center justify-center text-5xl transition-all duration-200 aspect-square
                        ${
                          cell === null
                            ? "bg-zinc-800 hover:bg-zinc-700"
                            : "bg-zinc-800 shadow-sm ring-1 ring-zinc-700"
                        }
                        ${
                          !cell && !isGameOver && !autoPlay && !isThinking
                            ? "cursor-pointer active:scale-95"
                            : "cursor-default"
                        }
                      `}
                    >
                      {cell === "X" && (
                        <XIcon className="w-16 h-16 text-indigo-400 drop-shadow-sm" />
                      )}
                      {cell === "O" && (
                        <OIcon className="w-16 h-16 text-rose-400 drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>

                {isGameOver && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800 text-center max-w-sm mx-4 transform transition-all scale-100">
                      <div className="mb-6">
                        {winner ? (
                          <>
                            <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">
                              Winner
                            </div>
                            <div
                              className={`text-5xl font-black mb-2 ${
                                winner === "X"
                                  ? "text-indigo-500"
                                  : "text-rose-500"
                              }`}
                            >
                              {winner === "X" ? "Player X" : "Player O"}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-zinc-400 font-medium">
                              <div className="relative w-5 h-5 shrink-0">
                                <Image
                                  src={
                                    PROVIDER_LOGOS[
                                      winner === "X"
                                        ? modelX.provider
                                        : modelO.provider
                                    ] || PROVIDER_LOGOS.other
                                  }
                                  alt={
                                    winner === "X"
                                      ? modelX.provider
                                      : modelO.provider
                                  }
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              {winner === "X" ? modelX.name : modelO.name}
                            </div>
                          </>
                        ) : (
                          <div className="text-4xl font-black text-zinc-200">
                            Draw!
                          </div>
                        )}
                      </div>
                      <button
                        onClick={resetGame}
                        className="w-full bg-white text-zinc-900 font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <RefreshCwIcon className="w-4 h-4" />
                        Play Again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all
                      ${
                        autoPlay
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }
                    `}
                  >
                    {autoPlay ? (
                      <PauseCircleIcon className="w-4 h-4" />
                    ) : (
                      <PlayCircleIcon className="w-4 h-4" />
                    )}
                    {autoPlay ? "Auto-play On" : "Auto-play Off"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!autoPlay && !isGameOver && (
                    <button
                      onClick={getAIMove}
                      disabled={isThinking}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      {isThinking ? "Thinking..." : "Trigger Move"}
                    </button>
                  )}
                  <button
                    onClick={resetGame}
                    className="p-2.5 text-zinc-500 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Reset Game"
                  >
                    <RefreshCwIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col h-full min-h-[300px] lg:min-h-0">
              <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex items-center justify-between shrink-0">
                  <h3 className="font-bold text-zinc-300">Match History</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-zinc-700 rounded-full text-zinc-400">
                    {moveHistory.length} moves
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {moveHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-3 opacity-60">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                        <PlayCircleIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">
                        Waiting for first move...
                      </p>
                    </div>
                  ) : (
                    moveHistory.map((move, idx) => {
                      const isX = move.startsWith("X");
                      return (
                        <div
                          key={idx}
                          className={`text-sm p-3 rounded-xl border flex items-start gap-3 transition-all ${
                            isX
                              ? "bg-indigo-900/10 border-indigo-900/30"
                              : "bg-rose-900/10 border-rose-900/30"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isX
                                ? "bg-indigo-900 text-indigo-300"
                                : "bg-rose-900 text-rose-300"
                            }`}
                          >
                            {isX ? "X" : "O"}
                          </div>
                          <div className="flex-1">
                            <div className="text-zinc-300">
                              {move.replace(/^(X|O) played /, "")}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1 font-medium">
                              Move #{idx + 1}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={historyEndRef} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
