import { NextResponse } from "next/server";

// This is the default endpoint for LM Studio's local server.
const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required to enhance the description." },
        { status: 400 }
      );
    }

    // Instructions for the model
    const instructions = `You are a productivity assistant. Your task is to enhance a user's task description to make it more detailed, actionable, and clear. The user will provide a title and an optional existing description.
IMPORTANT: You must respond with only a valid JSON object and nothing else. The JSON object must have a single key: "enhanced_description". Do not include any other text, markdown formatting, or code blocks. For example: {"enhanced_description": "A detailed new description."}`;

    // The user's actual data
    const userData = `Task Title: "${title}"
Original Description: "${description || "No description provided."}"`;

    // Combine instructions and user data into a single prompt for the 'user' role
    const combinedPrompt = `${instructions}\n\n---\n\n${userData}`;

    const body = {
      model: "local-model", // This is a placeholder, LM Studio ignores it
      messages: [
        // The entire prompt is now under the 'user' role
        { role: "user", content: combinedPrompt },
      ],
      temperature: 0.7,
      stream: false,
    };

    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LM Studio API Error:", errorText);
      return NextResponse.json(
        {
          error: `Failed to connect to the local model. Status: ${response.status}. Check server logs for details.`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Received an empty response from the model." },
        { status: 500 }
      );
    }

    // Clean the response to extract the JSON object if it's wrapped in markdown or other text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    } else {
      // If no JSON object is found, return an error.
      return NextResponse.json(
        { error: "The model did not return a valid JSON object." },
        { status: 500 }
      );
    }

    // The model should return a JSON string, so we parse it.
    const parsedContent = JSON.parse(content);

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error in enhance route:", error);
    return NextResponse.json(
      {
        error:
          "An internal server error occurred. Make sure your LM Studio server is running and the model is loaded.",
      },
      { status: 500 }
    );
  }
}
