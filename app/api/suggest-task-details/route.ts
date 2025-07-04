import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { api } from "@/lib/api";

const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";

async function fetchServerSideData(endpoint: string, accessToken: string) {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${endpoint}`);
  }
  return response.json();
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const [tasksResponse, contextsResponse] = await Promise.all([
      fetchServerSideData(api.endpoints.tasks, session.access_token),
      fetchServerSideData(api.endpoints.contextEntries, session.access_token),
    ]);

    const existingTasks = tasksResponse.results
      .slice(0, 20)
      .map(
        (t: any) =>
          `- ${t.title} (Priority: ${t.priority_label}, Due: ${t.deadline})`
      )
      .join("\n");

    const recentContexts = contextsResponse.results
      .slice(0, 10)
      .map((c: any) => `- ${c.content}`)
      .join("\n");

    const availableCategories = [
      "Work",
      "Personal",
      "Development",
      "Management",
      "Health",
      "Learning",
      "Finance",
      "Home",
    ];

    const instructions = `You are an intelligent task scheduling assistant. Your goal is to suggest a category, priority, and deadline for a new task based on the user's current workload and recent context.

Analyze the following information:
1. The new task's title and description.
2. The user's list of existing tasks.
3. The user's recent context entries (from notes, emails, etc.).
4. A list of available categories.

Based on your analysis, provide the most logical suggestions. The deadline should be in YYYY-MM-DD format.

IMPORTANT: You must respond with only a valid JSON object and nothing else. The JSON object must have three keys: "category", "priority", and "deadline".
Example: {"category": "Work", "priority": "High", "deadline": "2025-07-12"}`;

    const userData = `
# New Task
- Title: "${title}"
- Description: "${description}"

# Existing Tasks
${existingTasks || "No existing tasks."}

# Recent Contexts
${recentContexts || "No recent contexts."}

# Available Categories
[${availableCategories.join(", ")}]
`;

    // Combine instructions and user data into a single prompt for the 'user' role
    const combinedPrompt = `${instructions}\n\n---\n\n${userData}`;

    const body = {
      model: "local-model",
      messages: [
        // The entire prompt is now under the 'user' role
        { role: "user", content: combinedPrompt },
      ],
      temperature: 0.5,
      stream: false,
    };

    const lmResponse = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!lmResponse.ok) {
      const errorText = await lmResponse.text();
      console.error("LM Studio API Error:", errorText);
      throw new Error("Failed to get suggestions from the local model.");
    }

    const data = await lmResponse.json();
    let content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Received an empty response from the model.");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    const parsedContent = JSON.parse(content);
    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error in suggest-task-details route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An internal server error occurred.",
      },
      { status: 500 }
    );
  }
}
