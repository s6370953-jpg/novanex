# Learnova Tutor

AI-powered interactive learning platform where students learn through educational videos with an AI tutor that answers questions using timestamp-verified content.

## Current workspace and phase scope

This workspace already has a React/Vite/TypeScript frontend in `frontend/` and an Express/TypeScript API in `backend/`; these serve the same client/server roles without creating duplicate folders. The API already includes `/api/health`, PostgreSQL-backed student registration and login, httpOnly JWT cookies, protected `/api/auth/me`, logout, and student/admin role checks. The current phase updates the responsive landing and dashboard experience while preserving that existing functionality. The dashboard's course and progress cards are sample content. AI assistance, RAG, video processing, and document uploads are not implemented.

## Prerequisites

- Node.js 22.12 or newer (Vite 8 requirement)
- npm (comes with Node.js)
- PostgreSQL (supported current release) and its command-line tools (`psql` and `createdb`)
- Git (optional, for version control)

## Windows Setup Instructions

Run these commands in PowerShell. Replace the project directory with the actual location on your computer.

```powershell
cd "C:\Users\ps984\OneDrive\Attachments\Desktop\Learnova Tutor"
```

### 1. Create the PostgreSQL database

Start the PostgreSQL service if needed (the service name can vary by installed PostgreSQL version):

```powershell
Get-Service *postgres*
Start-Service -Name postgresql-x64-17
```

Use the service name shown by `Get-Service` if your installed major version differs.
If the PostgreSQL command-line tools are not on `PATH`, add the installed `bin` folder for this PowerShell window (adjust the version if needed):

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"
```

Create the database using your PostgreSQL administrator account. You will be prompted for its password if required:

```powershell
createdb -U postgres learnova
```

Alternatively, use `psql`:

```powershell
psql -U postgres -c "CREATE DATABASE learnova;"
```

If the database already exists, do not create it again. Set `DB_USER` and `DB_PASSWORD` to a PostgreSQL account that can connect to and create tables in `learnova`.

### 2. Configure environment variables

Copy the example to `.env`, then replace the PostgreSQL password and JWT secret. `.env` is gitignored. `JWT_SECRET` must contain at least 32 characters; generate one instead of using the placeholder in production.

```powershell
copy .env.example .env
# Example: generate a random local JWT secret and copy the output into .env
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The API and Vite read this root `.env`. The default frontend origin is `http://localhost:3000`; if you change it, set the same exact origin in `FRONTEND_URL`.

### 3. Install dependencies and apply migrations

```powershell
cd "C:\Users\ps984\OneDrive\Attachments\Desktop\Learnova Tutor\backend"
npm install
npm run db:migrate
cd ..\frontend
npm install
```

`npm run db:migrate` compiles the backend and applies numbered SQL migrations in order. Applied migration names are tracked in `schema_migrations`. It is safe to rerun.

### 4. Start the applications

Open a PowerShell window for the backend:

```powershell
cd "C:\Users\ps984\OneDrive\Attachments\Desktop\Learnova Tutor\backend"
npm run dev
```

Open another PowerShell window for the frontend:

```powershell
cd "C:\Users\ps984\OneDrive\Attachments\Desktop\Learnova Tutor\frontend"
npm run dev
```

The backend is at `http://localhost:5000`; Vite serves the frontend at `http://localhost:3000`.

## Verify setup and test authentication

Check the API and database health:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

`status: ok` and `database: connected` indicate a successful database connection. `status: degraded` means the API is running but PostgreSQL is unreachable; registration/login will not work until the database is available.

For end-to-end tests, create a separate, disposable PostgreSQL test database and configure `TEST_DATABASE_URL` in the current PowerShell session. Do not point it at a production database; tests create and delete uniquely named test users.

```powershell
createdb -U postgres learnova_test
$env:TEST_DATABASE_URL = "postgresql://postgres:URL_ENCODED_PASSWORD@localhost:5432/learnova_test"
cd "C:\Users\ps984\OneDrive\Attachments\Desktop\Learnova Tutor\backend"
npm run db:migrate
npm test
```

Replace `URL_ENCODED_PASSWORD` with the password encoded for a PostgreSQL connection URL. If the test database uses the same credentials and name configured in `.env`, set its URL to that database only if it is disposable.

Build and type-check commands:

```powershell
cd "C:\Users\ps984\OneDrive\Attachments\Desktop\Learnova Tutor\backend"
npm run type-check
npm test
cd ..\frontend
npm run build
```

If `TEST_DATABASE_URL` is not set, database integration tests are reported as skipped. Pure middleware role restriction tests still run.

## Available Scripts

### Frontend (in `frontend/` directory)

- `npm run dev` - Start development server (Vite)
- `npm run typecheck` - Check frontend TypeScript
- `npm run build` - Build for production
- `npm run lint` - Lint frontend source
- `npm test` - Test video playback, transcript timing, and lesson validation
- `npm run preview` - Preview production build

### Backend (in `backend/` directory)

- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm run db:migrate` - Compile backend and apply database migrations
- `npm test` - Build and run auth integration tests (requires `TEST_DATABASE_URL`)

## Project Structure

```
learnova-tutor/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI and learning workspace components
│   │   ├── features/learning/ # Lesson models and playback state helpers
│   │   ├── pages/           # Landing, dashboard, and learning workspace
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── database/                 # Database schema and migrations
│   └── migrations/          # SQL migration files
│
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Lucide React** - Icon library

## Video learning workspace

The authenticated workspace is available at `/learn/:lessonId`. The demo workspace can be opened from the dashboard's **Open demo workspace** action or directly at `http://localhost:3000/learn/demo-video-workspace`.

Lessons passed to the workspace use the `Lesson` and `TranscriptSegment` types in `frontend/src/features/learning/lesson.ts`. Navigate to `/learn/<lesson-id>` with the lesson in React Router state:

```tsx
<Link to={`/learn/${lesson.id}`} state={{ lesson }}>Open lesson</Link>
```

Supply a direct HTTP(S) video file supported by the browser (MP4, WebM, or Ogg are preferred); YouTube/Vimeo watch-page URLs are not HTML5 video sources. Demo transcript text is explicitly marked as demo content and is not extracted from the sample video. Students can add timestamped transcript segments in the workspace; additions are local to the current page.

The AI Tutor client boundary posts only `lessonId`, `currentTimestamp` (seconds), and `question` to `/api/ai/tutor`. That endpoint is not implemented in the current backend, so the workspace reports that the service is unavailable rather than generating an answer. Transcript text is never sent with the question. Timestamp restrictions must be enforced by the backend when lesson retrieval is implemented; client-side behavior is not a security boundary.

Run workspace helper tests with `cd frontend; npm test` in PowerShell. The HTML5 player uses the supplied lesson URL; actual playback depends on a reachable, browser-compatible media source.

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL (`pg`)** - Primary database and parameterized SQL access
- **bcryptjs and jsonwebtoken** - Password hashing and signed authentication cookies
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **express-rate-limit** - Authentication endpoint rate limiting

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

**Backend (port 5000):**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Frontend (port 3000):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process
taskkill /PID <PID> /F
```

### Module Not Found Errors

If you encounter module not found errors:

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
npm install

cd ..\backend
Remove-Item -Recurse -Force node_modules
npm install
```

### PostgreSQL connection errors

Confirm PostgreSQL is running, the `learnova` database exists, and `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env` are correct. You can verify access with:

```powershell
psql -h localhost -p 5432 -U postgres -d learnova -c "SELECT 1;"
```

The health response deliberately exposes only `connected` or `disconnected`, never connection credentials.

## Security Notes

- Never commit `.env` files to version control
- The `.env.example` file shows required variables without sensitive values
- In production, use a secret management solution (e.g., AWS Secrets Manager)
- API keys and secrets should be environment-specific

## License

ISC

## Author

Learnova Tutor Development Team
