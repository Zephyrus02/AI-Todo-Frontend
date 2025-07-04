# Smart Todo Dashboard with Supabase Authentication

A modern, intelligent todo list application built with Next.js and Supabase authentication.

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Supabase Setup

1. Go to [Supabase](https://app.supabase.com/) and create a new project
2. Once your project is ready, go to the project dashboard
3. Navigate to **Settings** > **API**
4. Copy your Project URL and anon/public key

### Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run the development server:

   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Features

- **User Registration**: Sign up with email and password
- **User Login**: Sign in with existing credentials
- **Protected Routes**: All main app routes require authentication
- **Auto-redirect**: Unauthenticated users are redirected to login
- **User Session Management**: Persistent login state
- **Logout Functionality**: Sign out from the user dropdown menu

## Routes

- `/login` - User login page
- `/signup` - User registration page
- `/` - Main dashboard (protected)
- `/tasks` - Tasks page (protected)
- `/add-task` - Add new task (protected)
- `/context` - Context input (protected)
- `/settings` - Settings page (protected)

## Supabase Configuration

The app uses Supabase's built-in authentication system. No additional database setup is required for basic authentication, as Supabase automatically handles user management.

### Email Confirmation

By default, Supabase requires email confirmation for new users. You can:

1. **Disable email confirmation** (for development):

   - Go to Authentication > Settings in your Supabase dashboard
   - Turn off "Enable email confirmations"

2. **Keep email confirmation enabled** (recommended for production):
   - Users will receive a confirmation email after signup
   - They must click the confirmation link before they can sign in

## Development

The app uses:

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components via shadcn/ui
- **Supabase** for authentication
- **React Context** for auth state management

## Project Structure

```
app/
├── login/page.tsx          # Login page
├── signup/page.tsx         # Signup page
├── page.tsx                # Main dashboard (protected)
├── add-task/page.tsx       # Add task page (protected)
├── tasks/page.tsx          # Tasks page (protected)
├── context/page.tsx        # Context page (protected)
├── settings/page.tsx       # Settings page (protected)
└── layout.tsx              # Root layout with AuthProvider

components/
├── protected-route.tsx     # Route protection wrapper
├── header.tsx              # Header with auth dropdown
└── ...                     # Other UI components

contexts/
└── auth-context.tsx        # Authentication context and hooks

utils/
└── supabaseClient.ts       # Supabase client configuration
```
