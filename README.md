# HealthTrack Pro

A modern, full-stack health tracking application built with Next.js, PostgreSQL, and Prisma.

## Features
- **Secure Authentication**: User registration and login.
- **Health Logging**: Track Blood Pressure, Blood Sugar, and Weight.
- **Data Visualization**: Interactive charts showing trends over time.
- **Responsive Design**: Mobile-friendly interface.

## Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Setup & Installation

### 1. Database Setup
Ensure PostgreSQL is installed and running. Create a database and user:
```sql
CREATE DATABASE healthapp;
CREATE USER healthuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE healthapp TO healthuser;
\c healthapp
ALTER SCHEMA public OWNER TO healthuser;
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://healthuser:your_password@localhost:5432/healthapp?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```
*Note: If your password contains special characters like `#`, URL-encode them (e.g., `#` becomes `%23`).*

### 3. Docker Setup (Alternative)
If you prefer running the entire stack (App + Database) using Docker:

**Build and start all services:**
```bash
docker compose up -d --build
```

**View logs:**
```bash
docker compose logs -f
```

**Stop all services:**
```bash
docker compose down
```

**Update Database Schema (First time or after changes):**
```bash
docker compose exec app npx prisma db push
```

### 4. Install Dependencies (Local Development)
If running the app locally (not via Docker):
```bash
npm install
```

### 5. Initialize Database
If running via Docker (Recommended):
```bash
docker compose exec app npx prisma db push
```

If running locally:
```bash
npx prisma@6 db push
```

### 6. Run the Application
If running locally:
```bash
npm run dev
```

## Remote Access (SSH Tunneling)
To access the application running on the server `desild@spark-5458` from your local browser, run this command **on your local machine**:

```bash
ssh -L 3000:localhost:3000 desild@spark-5458
```

Once the tunnel is established, visit [http://localhost:3000](http://localhost:3000) in your web browser.

## Development
To generate the Prisma client after schema changes:
```bash
npx prisma generate
```
