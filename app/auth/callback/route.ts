import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const errorCode = requestUrl.searchParams.get("error_code");

  console.log("Auth callback params:", {
    code: code ? "present" : "missing",
    error,
    errorDescription,
    errorCode,
  });

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", { error, errorDescription, errorCode });
    let userFriendlyMessage = "Authentication failed. Please try again.";

    if (
      error === "server_error" &&
      errorDescription?.includes("Unable to exchange external code")
    ) {
      userFriendlyMessage =
        "Google authentication failed. Please check your Google account settings and try again.";
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(
        userFriendlyMessage
      )}`
    );
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      console.log("Attempting to exchange code for session...");

      // Exchange the code for a session
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Session exchange error:", exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(
            "Failed to complete Google sign-in. Please try again."
          )}`
        );
      }

      console.log("Successfully exchanged code for session");
    } catch (err) {
      console.error("Unexpected error during session exchange:", err);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(
          "An unexpected error occurred during sign-in."
        )}`
      );
    }
  }

  // Redirect to home page on successful authentication
  console.log("Redirecting to home page");
  return NextResponse.redirect(`${requestUrl.origin}`);
}
