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

    const { title, description, deadline } = await request.json();

    // Check if user has Google provider token
    const provider_token = session.provider_token;
    const isGoogleProvider = session.user.app_metadata?.provider === "google";

    if (!isGoogleProvider || !provider_token) {
      // Don't fail the task creation, just skip calendar sync
      return NextResponse.json({
        success: false,
        message: "Google Calendar not connected",
      });
    }

    try {
      const deadlineDate = new Date(deadline);
      const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000); // 1 hour later

      const eventData = {
        summary: title,
        description: description,
        start: {
          dateTime: deadlineDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        source: {
          title: "Smart Todo Dashboard",
          url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        },
      };

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
        return NextResponse.json({
          success: true,
          eventId: eventResult.id,
          message: "Event created in Google Calendar",
        });
      } else {
        const errorText = await response.text();
        console.error("Failed to create calendar event:", errorText);
        return NextResponse.json({
          success: false,
          message: "Failed to create calendar event",
        });
      }
    } catch (error) {
      console.error("Error creating calendar event:", error);
      return NextResponse.json({
        success: false,
        message: "Error creating calendar event",
      });
    }
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
