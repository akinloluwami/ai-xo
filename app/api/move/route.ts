import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { board, player, model } = await req.json();

    const prompt = `You are playing tic-tac-toe. You are player "${player}".
The current board state is (0-8, where 0 is top-left, 8 is bottom-right):
${board
  .map((cell: string | null, i: number) => `${i}: ${cell || "empty"}`)
  .join("\n")}

Board visualization:
${board[0] || "_"} | ${board[1] || "_"} | ${board[2] || "_"}
${board[3] || "_"} | ${board[4] || "_"} | ${board[5] || "_"}
${board[6] || "_"} | ${board[7] || "_"} | ${board[8] || "_"}

Respond with ONLY a single number (0-8) indicating which empty position you want to play. Choose the best strategic move.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

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
    return Response.json({ error: "Failed to get AI move" }, { status: 500 });
  }
}
