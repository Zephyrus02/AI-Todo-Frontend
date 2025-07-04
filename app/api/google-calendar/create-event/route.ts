import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { google } from "googleapis";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure we have the Google provider token
  if (
    !session.provider_token ||
    session.user.app_metadata.provider !== "google"
  ) {
    return NextResponse.json(
      { error: "Google account not connected or provider token is missing." },
      { status: 400 }
    );
  }

  try {
    const { title, description, deadline } = await request.json();

    if (!title || !deadline) {
      return NextResponse.json(
        { error: "Title and deadline are required." },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.provider_token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: title,
      description: description || "Task from Ergosphere Todo",
      start: {
        dateTime: new Date(deadline).toISOString(),
        timeZone: "UTC",
      },
      end: {
        // Make the event 1 hour long by default
        dateTime: new Date(
          new Date(deadline).getTime() + 60 * 60 * 1000
        ).toISOString(),
        timeZone: "UTC",
      },
    };

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return NextResponse.json({ message: "Event created successfully." });
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
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
