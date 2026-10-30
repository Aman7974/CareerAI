# CareerAI Engine 🚀
> **Executive-Grade AI Resume Optimizer, ATS Readiness Scorecard & Real-Time Multi-Portal Job Matcher**

CareerAI Engine is an end-to-end career acceleration platform designed to bridge the gap between job candidates and applicant tracking systems (ATS). The application analyzes resumes in real-time, extracts authentic candidate achievements without data collapse, provides contextual sentence-level rewrites with quantified impact metrics, and aggregates live, nearby job vacancies across **LinkedIn**, **Naukri.com**, **Unstop**, **DRDO Careers**, **Rozgaar Govt (NCS)**, and **Adzuna**.

---

## 🌟 Key Features

### 1. Resume-First In-Line Improvement UX
- **No Clunky Duplicate Blocks:** The candidate's formatted resume is displayed as the central, hero document.
- **Precise In-Line Indicators:** Statements lacking measurable metrics or active verbs are highlighted directly within the resume.
- **Contextual Alternative Suggestions:** Tailored, quantified rewrites (latency, scale, speed, revenue, team velocity) are presented directly beneath each statement.
- **1-Click In-Place Application:** Clicking **`✨ Make This Change`** updates the statement instantly in the active document, increments the ATS readiness score, marks the bullet as `✓ Changed (ATS Optimized)`, and persists changes to Firebase Firestore.
- **`✨ Make All Changes` Shortcut:** One-click automation to accept all suggested optimizations at once.

### 2. High-Precision ATS Scoring & Keyword Analysis
- **4-Vector Scoring Engine:**
  - **Impact & Quantification (35%):** Benchmarks measurable metrics ($ saved, % speedup, throughput, scale).
  - **Keyword Density (25%):** Matches role-specific skills against industry-standard recruiter taxonomies.
  - **Readability & Formatting (20%):** Validates clean structural hierarchy, bullet length, and typographic balance.
  - **Executive Tone (20%):** Eliminates passive phrasing (`assisted with`, `responsible for`) in favor of active technical leadership verbs (`architected`, `engineered`, `spearheaded`).
- **Dynamic Role Taxonomies:** Keyword intelligence tailored for Full Stack, Backend, Frontend, Cloud/DevOps, AI/ML, and Engineering Leadership roles.

### 3. Location-Aware & Nearby Job Matching (Google Maps Platform)
- **1-Click GPS Location Detection:** Uses browser geolocation combined with Google Maps reverse geocoding to lock coordinates to the candidate's exact area (e.g. Bhopal, Bengaluru, Delhi NCR, etc.).
- **Interactive Map Explorer (`@vis.gl/react-google-maps`):** Visualizes job openings as pins colored by portal with radius boundary circles. Clicking any pin displays distance, salary, and direct application links.
- **Multi-Portal Aggregator:**
  - 💼 **LinkedIn Jobs:** Direct Easy Apply links for verified corporate roles.
  - ⚡ **Naukri.com:** Immediate joiner openings with fast-forward recruiter access.
  - 🏆 **Unstop:** Hackathon tracks and technical hiring challenges.
  - 🛡️ **DRDO Careers (RAC):** Scientist 'B' computing and systems defense vacancies.
  - 🏛️ **Rozgaar Govt (NCS):** Central & State public sector digital transformation roles.
  - 🏢 **Direct Career Pages:** Verified employer career portals (TCS, Microsoft, Google).
  - 🌐 **Adzuna Live Feed:** Real-time continuous international feed filtered by country.
- **Nearby Distance Filtering:** Radius filters (`10 km`, `25 km`, `50 km`, `100 km`, `All/Remote`) with distance badges on every job card.

### 4. Smart Onboarding & Authentication
- **Format & Account Verification:** Validates email format and detects Google accounts during sign up.
- **Saved-User Auto-Login:** Returning users bypass the upload prompt and directly load their saved profile and resume.
- **New-User Guided Onboarding:** Directs first-time users through the resume upload screen.

### 5. Persistent Real-Time Database (Firebase Firestore)
- Stores user profiles, parsed resumes, ATS audit trails, and saved jobs.
- Includes a live **🔥 Firebase DB Inspector** modal to audit real-time Firestore database streams and document writes.

---

## 🏗️ Architecture & Project Structure

```
├── .env.example                     # Environment variable blueprint
├── firebase-applet-config.json       # Firebase SDK configuration
├── firestore.rules                  # Production Firestore security rules
├── metadata.json                    # AI Studio manifest & permissions
├── package.json                     # Project scripts and dependencies
├── index.html                       # HTML entry point with Plus Jakarta Sans fonts
├── src/
│   ├── main.tsx                     # React application bootstrap
│   ├── App.tsx                      # Root state, auth routing & modal management
│   ├── firebase.ts                  # Firebase SDK init & Firestore collections sync
│   ├── types.ts                     # Core TypeScript interfaces (ResumeData, JobMatch, etc.)
│   ├── components/
│   │   ├── AuthScreen.tsx           # Sign-up & Sign-in with email validation
│   │   ├── ResumeUploadPromptScreen.tsx # Guided upload flow for new candidates
│   │   ├── SimpleResumeAnalysisView.tsx # Resume-first view with inline improvement suggestions
│   │   ├── DiagnosticView.tsx       # Deep ATS technical audit & co-pilot panel
│   │   ├── JobMatchesView.tsx       # Multi-portal job matching & radius filter
│   │   ├── NearbyJobsMapView.tsx    # Interactive Google Maps jobs explorer
│   │   ├── ResumeTailorerView.tsx   # Customizes resume for specific job postings
│   │   ├── FirebaseLiveInspector.tsx # Real-time Firestore document viewer
│   │   ├── Header.tsx               # Top app bar with credits, search, and DB viewer
│   │   ├── Sidebar.tsx              # Persistent left navigation
│   │   ├── PrintableResume.tsx      # High-fidelity printable ATS layout
│   │   ├── PrintPdfModal.tsx        # PDF print preview & browser print trigger
│   │   ├── EditBulletModal.tsx      # Modal for custom manual statement editing
│   │   └── UploadResumeModal.tsx    # Document upload modal with drag-and-drop
│   └── utils/
│       ├── pdfExtractor.ts          # PDF.js text extractor with binary stream fallback
│       ├── resumeParser.ts          # Section segmenter, sentence parser & rewrite generator
│       ├── nearbyJobsService.ts     # Multi-portal job aggregator & Haversine distance calculator
│       ├── adzunaService.ts         # Adzuna API integration & live vacancies query
│       ├── adzunaCountries.ts       # Country flags, currencies, and city profiles
│       └── jobMatching.ts           # Semantic ATS overlap & skill compatibility engine
```

---

## 💻 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 19 (Functional Components, Hooks) |
| **Language & Typings** | TypeScript 7 (Strict Typing) |
| **Build Tool & Dev Server** | Vite 8 |
| **Styling & Design System** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Maps & Spatial Computing** | Google Maps Platform (`@vis.gl/react-google-maps`) |
| **Database & Auth** | Firebase Firestore v13 & Firebase Security Rules |
| **Document Processing** | PDF.js (`pdfjs-dist`) with binary text stream fallback |
| **Job Indexing APIs** | Adzuna REST API + Multi-Portal Aggregator |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
# Google Maps Platform API Key (Required for interactive maps, markers & geocoding)
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# Gemini AI API Key (Auto-injected in AI Studio build runtime)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="https://your-domain.com"
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your `VITE_GOOGLE_MAPS_API_KEY`. (For testing, a standard Google Maps API key with Maps JavaScript API enabled is required).

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Verify Code Quality & Type Safety
```bash
npm run lint
```

---

## 🚢 Production Deployment Process

### 1. Build the Static Assets
Run Vite production build:
```bash
npm run build
```
This generates the optimized production bundle in the `dist/` directory with code splitting and minification.

### 2. Pre-Deployment Verification Checklist
Before deploying, ensure:
1. `npm run lint` passes without any TypeScript compiler errors (`tsc --noEmit`).
2. `npm run build` generates clean assets in `dist/`.
3. Firebase Firestore rules are deployed and verified.

### 3. Deploying to Hosting Platforms

#### Option A: Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login and initialize Firebase:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Public directory: `dist`
   - Configure as single-page app: `Yes`
   - Set up automatic builds with GitHub: Optional
3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```
4. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

#### Option B: Google Cloud Run (Containerized)
1. Build container with Docker:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 8080
   CMD ["nginx", "-g", "daemon off;"]
   ```
2. Build and push to Google Artifact Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/career-ai-engine
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy career-ai-engine \
     --image gcr.io/YOUR_PROJECT_ID/career-ai-engine \
     --platform managed \
     --region asia-east1 \
     --allow-unauthenticated \
     --port 8080
   ```

#### Option C: Vercel / Netlify
1. Connect the GitHub repository to Vercel or Netlify.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Configure Environment Variables in the project dashboard (`VITE_GOOGLE_MAPS_API_KEY`, etc.).
5. Add single-page routing rewrite:
   - For Vercel: `vercel.json` with rewrite to `/index.html`.
   - For Netlify: `_redirects` file containing `/* /index.html 200`.

---

## 🔒 Security & Firestore Rules

The database security rules (`firestore.rules`) enforce:
- **Strict ID Validation:** IDs must be strings up to 128 characters matching `^[a-zA-Z0-9_\-\.:@]+$`.
- **Schema Validation:** Enforces payload structure and size limits for user profiles, resumes, saved jobs, and audit entries.
- **Default Deny:** Unknown collections are locked by default.

To deploy updated rules directly to Firebase:
```bash
firebase deploy --only firestore:rules
```

---

## 📄 License
Apache-2.0
