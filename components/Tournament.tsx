"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ModelConfig,
  AVAILABLE_MODELS,
  PROVIDER_LOGOS,
  Board,
  Player,
  createEmptyBoard,
  checkWinner,
  checkDraw,
  getNextPlayer,
} from "@/lib/game";

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

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

type MatchStatus = "pending" | "active" | "completed";

interface Match {
  id: string;
  round: number;
  player1: ModelConfig | null;
  player2: ModelConfig | null;
  winner: ModelConfig | null;
  status: MatchStatus;
  nextMatchId?: string;
}

const BracketConnector = ({
  type,
  height,
}: {
  type: "top" | "bottom";
  height: string;
}) => (
  <div
    className={`absolute -right-4 w-4 border-zinc-700 ${
      type === "top"
        ? "border-r-2 border-t-2 rounded-tr-xl top-1/2"
        : "border-r-2 border-b-2 rounded-br-xl bottom-1/2"
    }`}
    style={{ height }}
  />
);

const InputConnector = () => (
  <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-zinc-700" />
);

const MatchCard = ({
  match,
  isActive,
}: {
  match: Match;
  isActive: boolean;
}) => {
  const p1 = match.player1;
  const p2 = match.player2;

  return (
    <div
      className={`
      flex flex-col h-[72px] border rounded-lg overflow-hidden text-xs md:text-sm transition-all relative z-10
      ${
        isActive
          ? "border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
          : "border-zinc-800 bg-zinc-900/50"
      }
    `}
    >
      <div
        className={`
        h-9 flex items-center gap-2 px-3 border-b border-zinc-800/50 w-full
        ${match.winner?.model === p1?.model ? "bg-green-900/20" : ""}
        ${!p1 ? "opacity-30" : ""}
      `}
      >
        <div className="w-4 h-4 relative shrink-0">
          {p1 && (
            <Image
              src={PROVIDER_LOGOS[p1.provider] || PROVIDER_LOGOS.other}
              alt={p1.provider}
              fill
              className="object-contain"
            />
          )}
        </div>
        <span
          className={`truncate font-medium ${
            match.winner?.model === p1?.model
              ? "text-green-400"
              : "text-zinc-300"
          }`}
        >
          {p1?.name || "TBD"}
        </span>
      </div>

      <div
        className={`
        h-9 flex items-center gap-2 px-3 w-full
        ${match.winner?.model === p2?.model ? "bg-green-900/20" : ""}
        ${!p2 ? "opacity-30" : ""}
      `}
      >
        <div className="w-4 h-4 relative shrink-0">
          {p2 && (
            <Image
              src={PROVIDER_LOGOS[p2.provider] || PROVIDER_LOGOS.other}
              alt={p2.provider}
              fill
              className="object-contain"
            />
          )}
        </div>
        <span
          className={`truncate font-medium ${
            match.winner?.model === p2?.model
              ? "text-green-400"
              : "text-zinc-300"
          }`}
        >
          {p2?.name || "TBD"}
        </span>
      </div>
    </div>
  );
};

const TournamentGame = ({
  p1,
  p2,
  onGameEnd,
}: {
  p1: ModelConfig;
  p2: ModelConfig;
  onGameEnd: (winner: ModelConfig) => void;
}) => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const makeMove = async () => {
      if (isThinking) return;

      const winner = checkWinner(board);
      if (winner) {
        setTimeout(() => onGameEnd(winner === "X" ? p1 : p2), 1000);
        return;
      }
      if (checkDraw(board)) {
        // Draw - rematch until winner
        setTimeout(() => {
          setBoard(createEmptyBoard());
          setCurrentPlayer("X");
        }, 2000);
        return;
      }

      setIsThinking(true);
      const currentModel = currentPlayer === "X" ? p1 : p2;

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
          const newBoard = [...board];
          newBoard[data.position] = currentPlayer;
          setBoard(newBoard);
          setCurrentPlayer(getNextPlayer(currentPlayer));
        }
      } catch (error) {
        console.error("Tournament move error:", error);
      } finally {
        setIsThinking(false);
      }
    };

    const timer = setTimeout(makeMove, 800);
    return () => clearTimeout(timer);
  }, [board, currentPlayer, isThinking, p1, p2, onGameEnd]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
      <div className="flex flex-col w-full mb-6 gap-3">
        <div
          className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
            currentPlayer === "X"
              ? "bg-indigo-900/20 border-indigo-800 shadow-md scale-[1.02]"
              : "bg-zinc-800/30 border-zinc-800/50 opacity-70"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src={PROVIDER_LOGOS[p1.provider] || PROVIDER_LOGOS.other}
                alt={p1.provider}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <div className="font-bold text-indigo-400 text-sm">{p1.name}</div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Player X
                </div>
                {currentPlayer === "X" && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                )}
              </div>
            </div>
          </div>
          <XIcon
            className={`w-5 h-5 ${
              currentPlayer === "X" ? "text-indigo-400" : "text-indigo-400/20"
            }`}
          />
        </div>

        <div className="text-center text-zinc-700 font-mono text-xs py-1">
          VS
        </div>

        <div
          className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
            currentPlayer === "O"
              ? "bg-rose-900/20 border-rose-800 shadow-md scale-[1.02]"
              : "bg-zinc-800/30 border-zinc-800/50 opacity-70"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src={PROVIDER_LOGOS[p2.provider] || PROVIDER_LOGOS.other}
                alt={p2.provider}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <div className="font-bold text-rose-400 text-sm">{p2.name}</div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Player O
                </div>
                {currentPlayer === "O" && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </div>
            </div>
          </div>
          <OIcon
            className={`w-5 h-5 ${
              currentPlayer === "O" ? "text-rose-400" : "text-rose-400/20"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[250px] aspect-square">
        {board.map((cell, idx) => (
          <div
            key={idx}
            className={`
              rounded-lg flex items-center justify-center text-3xl aspect-square
              ${
                cell === null
                  ? "bg-zinc-800"
                  : "bg-zinc-800 ring-1 ring-zinc-700"
              }
            `}
          >
            {cell === "X" && <XIcon className="w-10 h-10 text-indigo-400" />}
            {cell === "O" && <OIcon className="w-10 h-10 text-rose-400" />}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-zinc-400 animate-pulse">
        {checkWinner(board)
          ? "Winner found!"
          : checkDraw(board)
          ? "Draw! Rematching..."
          : isThinking
          ? "AI is thinking..."
          : "Next move..."}
      </div>
    </div>
  );
};

export default function Tournament() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(
    null,
  );
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [champion, setChampion] = useState<ModelConfig | null>(null);

  const startTournament = () => {
    const shuffled = [...AVAILABLE_MODELS].sort(() => Math.random() - 0.5);

    const newMatches: Match[] = [];

    for (let i = 0; i < 8; i++) {
      newMatches.push({
        id: `r1-m${i}`,
        round: 1,
        player1: shuffled[i * 2],
        player2: shuffled[i * 2 + 1],
        winner: null,
        status: "pending",
        nextMatchId: `r2-m${Math.floor(i / 2)}`,
      });
    }

    for (let i = 0; i < 4; i++) {
      newMatches.push({
        id: `r2-m${i}`,
        round: 2,
        player1: null,
        player2: null,
        winner: null,
        status: "pending",
        nextMatchId: `r3-m${Math.floor(i / 2)}`,
      });
    }

    for (let i = 0; i < 2; i++) {
      newMatches.push({
        id: `r3-m${i}`,
        round: 3,
        player1: null,
        player2: null,
        winner: null,
        status: "pending",
        nextMatchId: `r4-m0`,
      });
    }

    newMatches.push({
      id: `r4-m0`,
      round: 4,
      player1: null,
      player2: null,
      winner: null,
      status: "pending",
    });

    setMatches(newMatches);
    setTournamentStarted(true);
    setCurrentMatchIndex(0);
  };

  const handleMatchEnd = (winner: ModelConfig) => {
    if (currentMatchIndex === null) return;

    const completedMatch = matches[currentMatchIndex];
    const nextMatches = [...matches];

    nextMatches[currentMatchIndex] = {
      ...completedMatch,
      winner,
      status: "completed",
    };

    if (completedMatch.nextMatchId) {
      const nextMatchIdx = nextMatches.findIndex(
        (m) => m.id === completedMatch.nextMatchId,
      );
      if (nextMatchIdx !== -1) {
        const nextMatch = nextMatches[nextMatchIdx];

        const isPlayer1Slot = !nextMatch.player1;

        nextMatches[nextMatchIdx] = {
          ...nextMatch,
          player1: isPlayer1Slot ? winner : nextMatch.player1,
          player2: isPlayer1Slot ? nextMatch.player2 : winner,
        };
      }
    } else {
      setChampion(winner);
    }

    setMatches(nextMatches);

    const nextIndex = currentMatchIndex + 1;
    if (nextIndex < matches.length) {
      setCurrentMatchIndex(nextIndex);
    } else {
      setCurrentMatchIndex(null);
    }
  };

  const activeMatch =
    currentMatchIndex !== null ? matches[currentMatchIndex] : null;
  const isMatchReady =
    activeMatch && activeMatch.player1 && activeMatch.player2;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-zinc-500 flex items-center gap-2 uppercase tracking-wider">
            <TrophyIcon className="w-4 h-4" />
            Tournament
          </span>
        </div>
        {!tournamentStarted && (
          <button
            onClick={startTournament}
            className="px-4 py-1.5 bg-zinc-100 text-black text-xs font-bold uppercase tracking-wide rounded hover:bg-zinc-300 transition-colors"
          >
            Start
          </button>
        )}
      </div>

      <main className="flex-1 p-8 overflow-x-auto flex justify-center">
        <div className="min-w-max scale-90 origin-top">
          <div className="grid grid-cols-[repeat(4,180px)_320px] gap-8">
            <div className="space-y-4 pt-8">
              <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider mb-4 text-center">
                Round of 16
              </h3>
              {matches.slice(0, 8).map((match, idx) => (
                <div key={match.id} className="relative">
                  <MatchCard
                    match={match}
                    isActive={match.id === activeMatch?.id}
                  />
                  <BracketConnector
                    type={idx % 2 === 0 ? "top" : "bottom"}
                    height="44px"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-[104px] pt-[76px]">
              <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider mb-4 text-center">
                Quarter Finals
              </h3>
              <div className="space-y-[104px]">
                {matches.slice(8, 12).map((match, idx) => (
                  <div key={match.id} className="relative">
                    <InputConnector />
                    <MatchCard
                      match={match}
                      isActive={match.id === activeMatch?.id}
                    />
                    <BracketConnector
                      type={idx % 2 === 0 ? "top" : "bottom"}
                      height="88px"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-[280px] pt-[164px]">
              <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider mb-4 text-center">
                Semi Finals
              </h3>
              <div className="space-y-[280px]">
                {matches.slice(12, 14).map((match, idx) => (
                  <div key={match.id} className="relative">
                    <InputConnector />
                    <MatchCard
                      match={match}
                      isActive={match.id === activeMatch?.id}
                    />
                    <BracketConnector
                      type={idx % 2 === 0 ? "top" : "bottom"}
                      height="176px"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-[340px]">
              <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider mb-4 text-center">
                Final
              </h3>
              {matches.slice(14, 15).map((match) => (
                <div key={match.id} className="relative">
                  <InputConnector />
                  <MatchCard
                    match={match}
                    isActive={match.id === activeMatch?.id}
                  />
                </div>
              ))}
            </div>

            <div className="pt-8 sticky right-0">
              <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider mb-4 text-center">
                Arena
              </h3>

              {champion ? (
                <div className="flex flex-col items-center justify-center p-8 bg-linear-to-b from-yellow-900/20 to-zinc-900 rounded-2xl border border-yellow-500/30 text-center">
                  <TrophyIcon className="w-16 h-16 text-yellow-500 mb-4" />
                  <div className="text-sm text-yellow-500 font-bold uppercase tracking-wider mb-2">
                    Champion
                  </div>
                  <div className="text-3xl font-black text-white mb-4">
                    {champion.name}
                  </div>
                  <div className="relative w-24 h-24 mb-6">
                    <Image
                      src={
                        PROVIDER_LOGOS[champion.provider] ||
                        PROVIDER_LOGOS.other
                      }
                      alt={champion.provider}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
                  >
                    New Tournament
                  </button>
                </div>
              ) : activeMatch && isMatchReady ? (
                <div className="sticky top-24">
                  <TournamentGame
                    key={activeMatch.id}
                    p1={activeMatch.player1!}
                    p2={activeMatch.player2!}
                    onGameEnd={handleMatchEnd}
                  />
                  <div className="mt-4 text-center">
                    <div className="text-sm text-zinc-400">Playing Match</div>
                    <div className="font-mono text-xs text-zinc-600 mt-1">
                      {activeMatch.id}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border border-zinc-800 border-dashed rounded-2xl text-zinc-600">
                  {tournamentStarted
                    ? "Preparing next match..."
                    : "Waiting to start..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
