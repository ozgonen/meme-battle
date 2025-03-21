# Meme Battle App - Development Instructions

## Project Overview

Meme Battle is a web application inspired by Drawful, but for memes. The core concept:

1. An admin creates a "battle" with a title
2. The admin shares a link with friends
3. Friends join the battle and submit memes
4. When submission period ends, users vote on the memes
5. After voting completes, results are displayed showing winners

## Technology Stack

- **Frontend**: React + Next.js
- **Backend**: Next.js API routes
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (Google OAuth only)
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Database Schema

### Tables

1. **battles**
   - id (UUID, primary key)
   - title (text)
   - status (text: 'collecting', 'voting', 'completed')
   - created_by (UUID, references auth.users)
   - created_at (timestamp)

2. **participants**
   - id (UUID, primary key)
   - battle_id (UUID, references battles)
   - user_id (UUID, references auth.users)
   - joined_at (timestamp)
   - UNIQUE(battle_id, user_id)

3. **submissions**
   - id (UUID, primary key)
   - battle_id (UUID, references battles)
   - participant_id (UUID, references participants)
   - image_url (text)
   - submitted_at (timestamp)

4. **votes**
   - id (UUID, primary key)
   - battle_id (UUID, references battles)
   - submission_id (UUID, references submissions)
   - voter_id (UUID, references participants)
   - vote_type (text: 'like', 'dislike')
   - created_at (timestamp)
   - UNIQUE(submission_id, voter_id)

## Core Functionality

### Admin Features
- Create battle with title
- Share battle links
- Manage battle status (open/close submissions, start/end voting)
- View results

### User Features
- Join battles via shared links
- Submit meme images for battles
- Vote on other users' submissions
- View battle results

## Development Principles

1. Implement features incrementally, focusing on core functionality first
2. Create modular components with clear responsibilities
3. Use TypeScript for type safety
4. Follow Next.js and React best practices
5. Ensure responsive design for mobile and desktop
