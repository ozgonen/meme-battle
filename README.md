# Meme Battle

A dynamic web application that allows users to create, participate in, and vote on meme battles. Built with Next.js 14, Supabase, and Tailwind CSS.

![Meme Battle Logo](https://via.placeholder.com/800x400?text=Meme+Battle)

## Features

- **Google Authentication**: Secure login system using Google OAuth
- **Role-Based Access Control**: Admin users can create and manage battles
- **Real-time Meme Battles**: Create battles, submit memes, and vote on submissions
- **Battle Lifecycle Management**: Battles transition through collecting, voting, and completed phases
- **Responsive Design**: Beautiful UI that works on all devices
- **User Profiles**: Display user information from Google profiles

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **Styling**: Tailwind CSS with custom animations and components
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- A Supabase account and project

### Installation

1. Clone this repository
   ```bash
   git clone https://your-repository-url.git
   cd meme-battle
   ```

2. Navigate to the application directory
   ```bash
   cd with-supabase-app
   ```

3. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

4. Set up your environment variables by creating a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

5. Set up the database schema and policies
   ```bash
   # Option 1: Run the migration script (requires service role key)
   node run-migration.js
   
   # Option 2: Manually execute SQL commands from schema.sql in Supabase SQL Editor
   ```

6. Configure Google OAuth in Supabase dashboard:
   - Navigate to Authentication → Providers → Google
   - Enable Google provider and configure with your Google OAuth credentials

7. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Role-Based Access Control (RBAC)

The application uses a simple RBAC system:

1. By default, the email `ozownz@gmail.com` has admin privileges
2. Admins can:
   - Create new meme battles
   - Control battle status (collecting → voting → completed)
   - View all battles and submissions

To add additional admins, follow the instructions in `RBAC-MANUAL-SETUP.md`.

## Project Structure

```
with-supabase-app/
├── app/                   # Next.js 14 App Router
│   ├── (auth-pages)/      # Authentication pages
│   ├── battles/           # Battle-related pages
│   │   ├── [id]/          # Individual battle page
│   │   └── create/        # Battle creation page
│   └── protected/         # Protected profile page
├── components/            # Reusable UI components
├── utils/                 # Utility functions
│   └── supabase/          # Supabase client configuration
├── schema.sql             # Database schema definition
└── RBAC-MANUAL-SETUP.md   # Instructions for RBAC setup
```

## Battle Lifecycle

1. **Collecting Phase**: Admin creates a battle, users can submit memes
2. **Voting Phase**: Admin transitions the battle to voting, users vote on submissions
3. **Completed Phase**: Admin ends the battle, results are displayed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built using Next.js and Supabase
- UI components inspired by shadcn/ui
