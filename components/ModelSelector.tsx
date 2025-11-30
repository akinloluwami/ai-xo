"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ModelConfig, AVAILABLE_MODELS, PROVIDER_LOGOS } from "@/lib/game";

interface ModelSelectorProps {
  selectedModel: ModelConfig;
  onSelect: (model: ModelConfig) => void;
  label: string;
}

export default function ModelSelector({
  selectedModel,
  onSelect,
  label,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${isOpen ? "z-50" : ""}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-zinc-400 mb-2">
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-between hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 relative shrink-0">
            <Image
              src={
                PROVIDER_LOGOS[selectedModel.provider] || PROVIDER_LOGOS.other
              }
              alt={selectedModel.provider}
              fill
              className="object-contain"
            />
          </div>
          <span className="font-medium text-zinc-100">
            {selectedModel.name}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {AVAILABLE_MODELS.map((model) => (
            <button
              key={model.model}
              onClick={() => {
                onSelect(model);
                setIsOpen(false);
              }}
              className={`w-full p-3 flex items-center gap-3 hover:bg-zinc-700 transition-colors ${
                selectedModel.model === model.model ? "bg-indigo-900/20" : ""
              }`}
            >
              <div className="w-6 h-6 relative shrink-0">
                <Image
                  src={PROVIDER_LOGOS[model.provider] || PROVIDER_LOGOS.other}
                  alt={model.provider}
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className={`font-medium ${
                  selectedModel.model === model.model
                    ? "text-indigo-400"
                    : "text-zinc-300"
                }`}
              >
                {model.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
