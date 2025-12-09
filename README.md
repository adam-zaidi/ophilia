# Ophilia

An anonymous messaging platform for UChicago students to connect and share encounters. Built with React, TypeScript, Supabase, and deployed on Vercel.

## Features

- **Anonymous Messaging**: Post and respond to messages anonymously
- **UChicago Authentication**: Email verification restricted to @uchicago.edu addresses via Supabase
- **Direct Messages**: Private conversations between users
- **Message Categories**: 
  - Seeking: Looking for someone
  - Missed Connexions: We crossed paths
  - General Inquiry: Open to possibilities
- **Real-time Updates**: Live updates for posts and messages
- **Vintage Design**: Beautiful parchment-inspired UI with classical typography

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Supabase** for authentication and database
- **Vercel** for deployment
- **Lucide React** for icons

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- GitHub account (for deployment)
- Vercel account (for deployment)

## Local Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd eros
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL script from `supabase-schema.sql`
3. Go to Settings > API and copy your:
   - Project URL
   - Anon/Public key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure Supabase Authentication

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add redirect URLs:
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://your-vercel-url.vercel.app/auth/callback` (for production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Schema

The application uses the following Supabase tables:

- **profiles**: User profiles with username and email
- **posts**: Public posts/messages
- **conversations**: Direct message conversations between users
- **messages**: Individual messages within conversations

See `supabase-schema.sql` for the complete schema with Row Level Security policies.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"

6. **Configure Custom Domain (ophilia.fun)**:
   - In Vercel project settings > Domains
   - Add `ophilia.fun` and follow DNS setup instructions
   - Wait for DNS propagation

7. **Update Supabase Redirect URLs**:
   - Add `https://ophilia.fun/auth/callback` to Supabase Auth settings
   - Also add your Vercel URL as backup

See `DEPLOYMENT.md` for detailed deployment instructions.

## Project Structure

```
eros/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── MessageBoard.tsx
│   │   ├── MessageCard.tsx
│   │   ├── ComposeMessage.tsx
│   │   ├── DirectMessages.tsx
│   │   └── AuthModal.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   └── useMessages.ts
│   ├── lib/                 # Utilities
│   │   └── supabase.ts
│   ├── types/               # TypeScript types
│   │   └── database.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase-schema.sql      # Database schema
├── vercel.json              # Vercel configuration
└── package.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Security Notes

- All database operations use Row Level Security (RLS) policies
- Only authenticated users can create posts and messages
- Users can only view/edit their own data
- Email verification required for @uchicago.edu addresses

## License

Private project for UChicago students.
