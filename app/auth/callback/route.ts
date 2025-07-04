import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    // Exchange the code for a session, which sets the auth cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect the user to the main tasks page after signing in.
  // This ensures they land on a protected page which will correctly
  // reflect their new logged-in state.
  return NextResponse.redirect(`${requestUrl.origin}`);
}
