"use client";

import TicTacToe from "@/components/TicTacToe";
import {
  AVAILABLE_MODELS,
  findModelByString,
  getRandomModel,
} from "@/lib/game";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function PlayContent() {
  const searchParams = useSearchParams();
  const modelXParam = searchParams.get("modelX");
  const modelOParam = searchParams.get("modelO");

  // Find models by model string or fallback to random
  const { initialModelX, initialModelO } = useMemo(() => {
    const modelX = findModelByString(modelXParam) || getRandomModel();
    const modelO = findModelByString(modelOParam) || getRandomModel();

    // Ensure models are different if both were provided
    const finalModelO =
      modelXParam && modelOParam && modelX.model === modelO.model
        ? AVAILABLE_MODELS.find((m) => m.model !== modelX.model) || modelO
        : modelO;

    return { initialModelX: modelX, initialModelO: finalModelO };
  }, [modelXParam, modelOParam]);

  return (
    <TicTacToe initialModelX={initialModelX} initialModelO={initialModelO} />
  );
}

export default function Play() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh bg-[#050505] flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
