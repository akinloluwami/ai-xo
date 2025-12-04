import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  let board: (string | null)[] | null = null;

  try {
    const body = await req.json();
    board = body.board;
    const { player, model } = body;

    if (!board) {
      throw new Error("Board is required");
    }

    const prompt = `You are player "${player}" in tic-tac-toe.
Board (0-8): ${board
      .map((cell: string | null, i: number) => `${i}:${cell || "_"}`)
      .join(" ")}

${board[0] || "_"}|${board[1] || "_"}|${board[2] || "_"}
${board[3] || "_"}|${board[4] || "_"}|${board[5] || "_"}
${board[6] || "_"}|${board[7] || "_"}|${board[8] || "_"}

Reply with ONE number (0-8) for your move.`;

    // Create a timeout promise that rejects after 12 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 12000);
    });

    // Race the AI call against the timeout
    const aiPromise = generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 5, // Limit output to just a few tokens (saves costs)
    });

    const { text } = await Promise.race([aiPromise, timeoutPromise]);

    // Extract the number from the response
    const match = text.match(/\d+/);
    const position = match ? parseInt(match[0], 10) : null;

    // Validate the move
    if (
      position === null ||
      position < 0 ||
      position > 8 ||
      board[position] !== null
    ) {
      // If invalid, find first available position
      const availablePosition = board.findIndex(
        (cell: string | null) => cell === null,
      );
      return Response.json({ position: availablePosition, rawResponse: text });
    }

    return Response.json({ position, rawResponse: text });
  } catch (error) {
    console.error("Error getting AI move:", error);

    // Fallback to random move if AI fails or times out
    if (board && Array.isArray(board)) {
      const availablePositions = board
        .map((cell, index) => (cell === null ? index : null))
        .filter((val): val is number => val !== null);

      if (availablePositions.length > 0) {
        const randomPosition =
          availablePositions[
            Math.floor(Math.random() * availablePositions.length)
          ];

        const isTimeout =
          error instanceof Error && error.message === "AI response timeout";
        const fallbackReason = isTimeout
          ? "Model Timeout (12s) - Random"
          : "Error - Random";

        return Response.json({
          position: randomPosition,
          rawResponse: fallbackReason,
        });
      }
    }

    return Response.json({ error: "Failed to get AI move" }, { status: 500 });
  }
}
