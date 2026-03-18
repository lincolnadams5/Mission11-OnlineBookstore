# Mission11-OnlineBookstore

IS413 Assignment to create a web app for an online bookstore.

## Project Structure

```
Mission11-OnlineBookstore/
├── backend/    # ASP.NET Core Web API
├── frontend/   # React + TypeScript (Vite)
├── .gitignore
└── README.md
```

## Getting Started

### Backend (ASP.NET Core API)

Requires [.NET SDK](https://dotnet.microsoft.com/download) (version 10 or later).

```bash
cd backend
dotnet restore
dotnet run
```

The API will be available at `https://localhost:7xxx` / `http://localhost:5xxx`.  
OpenAPI docs (Swagger UI) are available at `/openapi` in development mode.

### Frontend (React + TypeScript + Vite)

Requires [Node.js](https://nodejs.org/) (version 18 or later).

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
