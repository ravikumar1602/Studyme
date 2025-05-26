# Firebase Setup Guide

This guide will help you set up Firebase for your Study Portal application.

## Prerequisites

1. A Firebase account (sign up at [https://firebase.google.com/](https://firebase.google.com/))
2. Node.js and npm installed on your development machine

## Setup Steps

### 1. Create a new Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project"
3. Enter a project name (e.g., "Study Portal") and click "Continue"
4. Disable Google Analytics (unless you need it) and click "Create project"

### 2. Set up Firestore Database

1. In the Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode" and click "Next"
4. Choose a location close to your users and click "Enable"

### 3. Configure Authentication (Optional)

If you want to add user authentication:

1. Go to "Authentication" in the left sidebar
2. Click "Get started"
3. Enable "Email/Password" and/or other sign-in methods as needed

### 4. Get Firebase Configuration

1. In the Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section and click the "</>" icon for web
4. Register your app with a nickname (e.g., "Study Portal Web")
5. Copy the Firebase configuration object

### 5. Update Firebase Configuration

1. Open `js/firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6. Set Up Security Rules (Important!)

1. Go to "Firestore Database" > "Rules"
2. Update the rules to secure your data. Here's a basic example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /videos/{video} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 7. Test Your Setup

1. Open the admin panel in your browser
2. Try adding, editing, and deleting videos
3. Check the browser's console for any errors

## Troubleshooting

- If you get permission errors, double-check your Firestore security rules
- Make sure your Firebase config values are correct
- Check the browser's console for detailed error messages

## Next Steps

- Set up Firebase Hosting to deploy your app
- Add user authentication
- Implement file uploads using Firebase Storage

## Support

For more information, refer to the [Firebase Documentation](https://firebase.google.com/docs/).
