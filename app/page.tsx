"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AVAILABLE_MODELS, ModelConfig, getRandomModel } from "@/lib/game";
import ModelSelector from "@/components/ModelSelector";

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

export default function Home() {
  const router = useRouter();
  const [modelX, setModelX] = useState<ModelConfig>(AVAILABLE_MODELS[0]);
  const [modelO, setModelO] = useState<ModelConfig>(AVAILABLE_MODELS[3]);

  const handleRandomizeX = () => {
    let randomModel = getRandomModel();
    // Ensure it's different from current O
    while (randomModel.model === modelO.model && AVAILABLE_MODELS.length > 1) {
      randomModel = getRandomModel();
    }
    setModelX(randomModel);
  };

  const handleRandomizeO = () => {
    let randomModel = getRandomModel();
    // Ensure it's different from current X
    while (randomModel.model === modelX.model && AVAILABLE_MODELS.length > 1) {
      randomModel = getRandomModel();
    }
    setModelO(randomModel);
  };

  const handleStartBattle = () => {
    router.push(`/play?modelX=${modelX.model}&modelO=${modelO.model}`);
  };

  return (
    <div className="h-dvh bg-[#050505] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col overflow-hidden">
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col min-h-0">
        <div className="w-full h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto mt-12 pb-48">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
                Choose Your Fighters
              </h1>
              <p className="text-zinc-400 text-lg">
                Select the AI models that will compete against each other.
              </p>
              <div className="mt-6">
                <Link
                  href="/tournament"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-yellow-500"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                  Enter Tournament Mode
                </Link>
              </div>
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
                      onRandomize={handleRandomizeX}
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
                      onRandomize={handleRandomizeO}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-center rounded-b-2xl">
                <button
                  onClick={handleStartBattle}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-zinc-900 transition-all duration-200 bg-white font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 hover:bg-zinc-200"
                >
                  <span className="mr-2">Start Battle</span>
                  <SparklesIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
