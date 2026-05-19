# 🔥 How to Connect Firebase to Vocab Buddy

Follow these steps to connect your own Firebase project to the Vocab Buddy app.

## Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the instructions to create a new project.
3. (Optional) Disable Google Analytics if you don't need it.

## Step 2: Register your Web App
1. On the Firebase project overview page, click the **Web** icon `</>` to add an app.
2. Enter an app nickname (e.g., "Vocab Buddy Web").
3. Click **Register app**.

## Step 3: Get your Firebase Config
After registering, Firebase will give you a `firebaseConfig` object. It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Create `.env.local`
1. In the root directory of `vocab-buddy` (where `package.json` is located), create a new file named `.env.local`.
2. Add the following lines, replacing the values with the ones from your Firebase config:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_DATABASE_URL="your-database-url"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```
*(Note: Do not commit `.env.local` to GitHub. It is already in `.gitignore` by default.)*

## Step 5: Enable Realtime Database
1. In the Firebase console, go to **Build** -> **Realtime Database**.
2. Click **Create Database**.
3. Choose a location and start in **Test Mode** (you can update the rules later for security).

## Step 6: Enable Authentication (For Step 2)
1. Go to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Enable **Email/Password**.

You are now connected! Restart your development server (`npm run dev`) for the environment variables to take effect.
