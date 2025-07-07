import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session debug:", {
      hasUser: !!session.user,
      provider: session.user.app_metadata?.provider,
      hasProviderToken: !!session.provider_token,
      hasProviderRefreshToken: !!session.provider_refresh_token,
    });

    const provider_token = session.provider_token;
    const provider_refresh_token = session.provider_refresh_token;
    const isGoogleProvider = session.user.app_metadata?.provider === "google";

    if (!isGoogleProvider) {
      return NextResponse.json({
        connected: false,
        canSync: false,
        message: "Please sign in with Google to enable calendar sync",
      });
    }

    if (!provider_token) {
      return NextResponse.json({
        connected: false,
        canSync: false,
        message:
          "Google access token not available. Please reconnect your Google account.",
      });
    }

    // Test the token by making a simple API call
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary",
        {
          headers: {
            Authorization: `Bearer ${provider_token}`,
          },
        }
      );

      if (response.ok) {
        return NextResponse.json({
          connected: true,
          canSync: true,
          message: "Google Calendar access available",
        });
      } else if (response.status === 401) {
        // Token expired, try to refresh if we have a refresh token
        if (provider_refresh_token) {
          return NextResponse.json({
            connected: true,
            canSync: false,
            message:
              "Google Calendar access expired. Please reconnect your account.",
          });
        } else {
          return NextResponse.json({
            connected: false,
            canSync: false,
            message:
              "Google Calendar access expired. Please reconnect your account.",
          });
        }
      } else {
        return NextResponse.json({
          connected: true,
          canSync: false,
          message:
            "Unable to access Google Calendar. Please check permissions.",
        });
      }
    } catch (error) {
      console.error("Google Calendar API test failed:", error);
      return NextResponse.json({
        connected: true,
        canSync: false,
        message: "Unable to verify Google Calendar access",
      });
    }
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check sync status" },
      { status: 500 }
    );
  }
}
