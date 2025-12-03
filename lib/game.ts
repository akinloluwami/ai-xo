export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  isGameOver: boolean;
}

export interface ModelConfig {
  model: string;
  name: string;
  provider:
    | "openai"
    | "anthropic"
    | "google"
    | "xai"
    | "deepseek"
    | "meta"
    | "mistral"
    | "other";
}

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

export function checkWinner(board: Board): Player | null {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }
  return null;
}

export function getWinningCombination(board: Board): number[] | null {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return null;
}

export function checkDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && !checkWinner(board);
}

export function createEmptyBoard(): Board {
  return Array(9).fill(null);
}

export function getNextPlayer(currentPlayer: Player): Player {
  return currentPlayer === "X" ? "O" : "X";
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI
  { model: "openai/gpt-5", name: "GPT-5", provider: "openai" },
  { model: "openai/gpt-5-mini", name: "GPT-5 Mini", provider: "openai" },
  { model: "openai/gpt-4o", name: "GPT-4o", provider: "openai" },
  { model: "openai/o4-mini", name: "o4 Mini", provider: "openai" },

  // Anthropic
  {
    model: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
  },
  {
    model: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
  },
  {
    model: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
  },
  {
    model: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
  },

  // Google
  {
    model: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
  },
  {
    model: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
  },

  // xAI
  { model: "xai/grok-code-fast-1", name: "Grok Code Fast 1", provider: "xai" },
  { model: "xai/grok-2", name: "Grok 2", provider: "xai" },

  // DeepSeek
  { model: "deepseek/deepseek-v3", name: "DeepSeek V3", provider: "deepseek" },
  {
    model: "deepseek/deepseek-v3.2-exp",
    name: "DeepSeek V3.2 Exp",
    provider: "deepseek",
  },

  // Meta
  {
    model: "meta/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "meta",
  },

  // Mistral
  { model: "mistral/ministral-3b", name: "Ministral 3B", provider: "mistral" },
];

export const PROVIDER_LOGOS: Record<string, string> = {
  openai: "/model-logos/openai_dark.svg",
  anthropic: "/model-logos/claude-ai-icon.svg",
  google: "/model-logos/gemini.svg",
  xai: "/model-logos/grok-dark.svg",
  deepseek: "/model-logos/deepseek.svg",
  meta: "/model-logos/meta.svg",
  mistral: "/model-logos/mistral-ai_logo.svg",
  other: "/model-logos/openai_dark.svg",
};

export function getRandomModel(): ModelConfig {
  return AVAILABLE_MODELS[Math.floor(Math.random() * AVAILABLE_MODELS.length)];
}

export function findModelByString(
  modelString: string | null,
): ModelConfig | null {
  if (!modelString) return null;
  return AVAILABLE_MODELS.find((m) => m.model === modelString) || null;
}
