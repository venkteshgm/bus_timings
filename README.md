# NextBus 47 Tracker 🚌

A secure, serverless Single Page Application (SPA) designed to track real-time TriMet bus arrivals. Specifically tailored for commuting on Bus 47 between the Orenco MAX Station and Intel's Ronler Acres (RA-1 and RA-3) campuses.
Locked down using Firebase Authentication (Google Sign-in). Only explicitly allowlisted emails can fetch data.

## Tech Stack
- **Frontend:** Vanilla HTML, CSS, and JavaScript.
- **Backend:** Node.js Serverless Functions (`/api/bus-times.js`).
- **Infrastructure:** Vercel (Routing & Deployment).
- **Authentication:** Firebase Client SDK & Firebase Admin SDK.

## Local Setup & Development

Because this repository is fully self-sufficient, all Vercel infrastructure is handled locally via `npm`.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the project with the following secrets:
   ```env
   # TriMet 
   TRIMET_API_KEY="your_trimet_app_id"
   
   # Firebase Admin
   FIREBASE_PROJECT_ID="your_project_id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-..."
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **Start the Local Server**
   ```bash
   npm run dev
   ```
   *This boots up the local Vercel emulated environment. Access the app at `http://localhost:3000`.*

## Deployment
To deploy this application to production on Vercel's cloud infrastructure, simply run:
```bash
npm run deploy
```
*Note: Make sure to add your environment variables to the Vercel dashboard prior to deployment!*
