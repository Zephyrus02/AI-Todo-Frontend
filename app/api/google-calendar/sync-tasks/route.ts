import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Google provider
    const provider_token = session.provider_token;
    const isGoogleProvider = session.user.app_metadata?.provider === "google";

    if (!isGoogleProvider || !provider_token) {
      return NextResponse.json(
        {
          error:
            "Google Calendar access not available. Please reconnect your Google account.",
        },
        { status: 400 }
      );
    }

    const tasksResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
      }/api/tasks/`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!tasksResponse.ok) {
      throw new Error("Failed to fetch tasks from API");
    }

    const tasksData = await tasksResponse.json();
    const pendingTasks =
      tasksData.results?.filter(
        (task: any) =>
          task.status === "Pending" || task.status === "In Progress"
      ) || [];

    console.log(`Found ${pendingTasks.length} pending tasks to sync`);

    const syncResults = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sync each pending task
    for (const task of pendingTasks) {
      try {
        // Create a 1-hour event starting at the deadline time
        const deadlineDate = new Date(task.deadline);
        const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000); // 1 hour later

        const eventData = {
          summary: task.title,
          description: `${task.description}\n\nPriority: ${
            task.priority_label
          }\nStatus: ${task.status}\nCategory: ${task.category_name || "None"}`,
          start: {
            dateTime: deadlineDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          colorId:
            task.priority_label === "High"
              ? "11"
              : task.priority_label === "Medium"
              ? "5"
              : "2", // Red, Orange, Green
          source: {
            title: "Smart Todo Dashboard",
            url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          },
        };

        console.log(
          `Syncing task: ${task.title} for ${deadlineDate.toISOString()}`
        );

        const response = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${provider_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          }
        );

        if (response.ok) {
          const eventResult = await response.json();
          console.log(
            `Successfully synced task: ${task.title}, Event ID: ${eventResult.id}`
          );
          syncResults.success++;
        } else {
          const errorText = await response.text();
          console.error(`Failed to sync task ${task.title}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          syncResults.failed++;
          syncResults.errors.push(
            `Failed to sync "${task.title}": ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        console.error(`Error syncing task ${task.title}:`, error);
        syncResults.failed++;
        syncResults.errors.push(
          `Failed to sync "${task.title}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return NextResponse.json({
      message: `Sync completed: ${syncResults.success} tasks synced, ${syncResults.failed} failed`,
      results: syncResults,
      totalTasks: pendingTasks.length,
    });
  } catch (error) {
    console.error("Sync tasks error:", error);
    return NextResponse.json(
      {
        error: `Failed to sync tasks with Google Calendar: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
