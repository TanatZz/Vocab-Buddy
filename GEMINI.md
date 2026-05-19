# Vocab Buddy - Project Context

Vocab Buddy is a mobile-first Progressive Web Application (PWA) designed to help language learners manage vocabulary decks and practice words using a Spaced Repetition System (SRS).

## Project Overview

- **Purpose:** Vocabulary management and practice via spaced repetition.
- **Main Technologies:**
    - **Frontend:** React 19, Vite
    - **Styling:** Tailwind CSS, Lucide React (Icons)
    - **Backend:** Firebase (Authentication & Realtime Database)
    - **Data Visualization:** Recharts
    - **PWA:** Service Workers for offline support and manifest for home screen installation.

## Architecture

The project follows a standard React structure with a clear separation of concerns:

- `src/components/`: UI components and screen-level components (e.g., `DeckListScreen`, `QuizScreen`).
- `src/context/`: Global state management using React Context API (e.g., `AuthContext`).
- `src/hooks/`: Custom React hooks for business logic and data fetching (e.g., `useDeckManagement`, `useWordManagement`, `useQuiz`).
- `src/services/`: Service layer for external API interactions (Firebase, Auth, Export/Import).
- `src/utils/`: Utility functions for core logic (e.g., `spacedRepetition.js`, `statsCalculator.js`).
- `src/assets/`: Static assets like images and icons.

## Building and Running

Key commands for development and production:

- **Development:** `npm run dev` (Starts the Vite development server)
- **Build:** `npm run build` (Builds the production-ready application)
- **Linting:** `npm run lint` (Runs ESLint for code quality checks)
- **Preview:** `npm run preview` (Previews the local production build)

## Development Conventions

- **State-based Routing:** The application uses a custom state-based routing system in `AppContent` within `App.jsx` instead of a traditional router library like `react-router-dom`.
- **Mobile-First Design:** The UI is optimized for mobile screens with a maximum width constraint (`max-w-md mx-auto md:max-w-2xl`) and shadow effects to simulate a mobile app container.
- **Spaced Repetition Logic:** Practice sessions use a weighted random algorithm located in `src/utils/spacedRepetition.js`. Words marked as "hard" have a higher probability of appearing in quizzes.
- **Firebase Integration:** Realtime Database is used for data persistence. User data is partitioned by `userId`.
- **Offline Capability:** The app includes a service worker (`sw.js`) and uses `LocalStorage` as a fallback when Firebase is unreachable (implemented in hooks like `useDecksForUser`).
- **PWA Prompts:** A custom `PWAInstallPrompt` component is used to encourage users to install the app.

## Key Files

- `src/App.jsx`: Main routing and application structure.
- `src/context/AuthContext.jsx`: Handles user authentication state.
- `src/utils/spacedRepetition.js`: Core SRS logic.
- `src/services/firebase-config.js`: Firebase initialization.
- `public/sw.js`: Service worker for PWA features.
