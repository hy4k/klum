# KLUMSI-LAND Chat Application

A private, invite-only chat application where only one user can talk to KLUM at a time.

## Features

- **Exclusive One-on-One Chat**: Only one user can chat with KLUM at a time
- **Invite System**: KLUM (admin) can generate and share unique chat links
- **Secret Code Access**: Users need a secret code to enter the chat
- **Time Travel Feature**: "Slip into Secrets" mode allows users to role-play in historical eras
- **AI Story Generation**: Transform conversations into historical narratives

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Firebase (Firestore, Realtime Database, Authentication, Storage)
- **AI Integration**: OpenAI API for story generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/klumsiland.git
   cd klumsiland
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url

   # Firebase Admin SDK (Server-side)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_DATABASE_URL=your_firebase_database_url

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Admin Access

1. Navigate to `/admin` and enter the admin secret code
2. Generate a new secret code for a user
3. Share the code with the user

### User Access

1. Navigate to the main page
2. Click "Enter KLUMSI-CHAT"
3. Enter your name and the secret code provided by KLUM
4. Start chatting with KLUM

### Time Travel Feature

1. KLUM can activate "Slip into Secrets" mode
2. Both users select an era and characters
3. Chat in character
4. Click "Make It Happen" to generate an AI story based on the conversation

## Deployment

This application is configured for deployment on Firebase Hosting:

```
npm run build
firebase deploy
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
