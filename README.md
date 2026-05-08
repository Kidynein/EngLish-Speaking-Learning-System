# English Speaking Learning System

## Project Overview

The English Speaking Learning System is a comprehensive, web-based educational platform designed to enhance users' English speaking proficiency through interactive exercises and immediate, AI-driven feedback. Developed as a Software Engineering Project, this system leverages advanced machine learning models for speech recognition and pronunciation scoring, offering an immersive and gamified learning experience.

## Key System Features

### 1. AI-Powered Pronunciation Assessment

- **Real-Time Transcription**: Utilizes the Groq Cloud API (Whisper model) to transcribe user audio recordings with high accuracy.
- **Pronunciation Scoring**: Evaluates the transcribed audio against the target sentence using the Llama model to provide an objective score and actionable feedback.
- **IPA Support**: Integrates International Phonetic Alphabet (IPA) transcriptions to guide users in correct pronunciation before they speak.

### 2. Comprehensive Practice Modules

- **Hierarchical Content Structure**: Content is organized logically into Topics, Lessons, and specific Exercises.
- **Targeted Exercises**: Users are presented with specific target sentences, reference audio URLs, and instructions to practice various aspects of conversational English.
- **Practice Sessions**: Structured sessions that record attempts, assess audio submissions, and log the history of user interactions.

### 3. Gamification and Progress Tracking

- **Experience Points (XP)**: Users earn XP for completing exercises, incentivizing continuous practice.
- **Visual Analytics**: Interactive charts and graphs (powered by Recharts) display user progress over time, highlighting areas of improvement.
- **Detailed History**: Users can review their past practice attempts, listen to their previous recordings, and see how their pronunciation scores have evolved.

### 4. Advanced User Management & Authentication

- **Secure Authentication**: Robust registration and login flows using JSON Web Tokens (JWT) and bcryptjs for password hashing.
- **Password Recovery**: Integrated email service (Nodemailer/Resend) for secure password reset operations.
- **Profile Customization**: Users can update their profiles, manage avatars, and track their individual statistics.

### 5. Premium Subscription Model

- **Tiered Access**: Supports both free and premium user roles.
- **Checkout Flow**: Dedicated interfaces for users to upgrade their accounts to unlock premium exercises and advanced AI feedback features.

### 6. Administrative Dashboard

- **Content Management**: Admins can perform full CRUD operations on Topics, Lessons, and Exercises.
- **User Moderation**: Interfaces to search, filter, and manage user accounts and roles.

## Technology Stack

### Frontend Architecture

- **Framework**: React 19 optimized with Vite for fast builds and hot-module replacement.
- **Styling**: A hybrid approach using Tailwind CSS for utility-first styling and Bootstrap for standard UI components.
- **Routing**: React Router DOM for seamless Single Page Application (SPA) navigation.
- **Data Visualization**: Recharts for rendering complex progress statistics.
- **Animations**: Framer Motion for smooth UI transitions and micro-interactions.
- **HTTP Client**: Axios configured with interceptors for secure API communication.

### Backend Architecture

- **Runtime**: Node.js
- **Framework**: Express.js REST API.
- **Database**: MySQL relational database managed via the `mysql2` driver with connection pooling.
- **Authentication**: JWT-based stateless authentication.
- **File Handling**: Multer configured for secure in-memory processing of audio file uploads before dispatching to AI services.
- **External Services**: Groq SDK for AI integrations and Resend/Nodemailer for transactional emails.

## Project Structure

```text
EngLish-Speaking-Learning-System/
├── src/
│   ├── backend/
│   │   ├── config/         # Environment variables and database connection pooling
│   │   ├── controllers/    # Business logic for routes (Auth, Assessment, Users, etc.)
│   │   ├── middleware/     # Custom middlewares (JWT verification, Error handling, Multer)
│   │   ├── models/         # Database interaction layer (User, Exercise, Progress, etc.)
│   │   ├── routes/         # Express router definitions mapping to controllers
│   │   ├── services/       # Third-party integrations (Groq AI service, Email service)
│   │   ├── utils/          # Standardized response formatters and helpers
│   │   └── server.js       # Express application entry point
│   └── frontend/
│       ├── src/
│       │   ├── assets/     # Static images and media
│       │   ├── components/ # Reusable UI components (Buttons, Modals, Forms)
│       │   ├── context/    # React Context providers for global state (AuthContext)
│       │   ├── hooks/      # Custom React hooks
│       │   ├── layouts/    # Page layout wrappers (MainLayout, AdminLayout)
│       │   ├── pages/      # Route-level components (Dashboard, Practice, Login)
│       │   ├── services/   # Axios API client implementations
│       │   └── utils/      # Frontend helper functions
│       ├── index.html      # Vite HTML entry point
│       └── vite.config.js  # Vite bundler configuration
├── docs/                   # UML diagrams, system requirements, and design documents
├── pa/                     # Project assignment specifications and templates
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MySQL Database Server (Local instance or Cloud provider like Aiven)
- Groq API Key (required for speech recognition and AI scoring)
- Resend API Key or standard SMTP credentials (for email features)

### Installation Steps

#### 1. Clone the repository

```bash
git clone <repository-url>
cd EngLish-Speaking-Learning-System
```

#### 2. Backend Environment Setup

Navigate to the backend directory and install dependencies:

```bash
cd src/backend
npm install
```

Create a `.env` file in the `src/backend` directory based on this template:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=elsa_db
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# Security Configuration
JWT_SECRET=generate_a_strong_random_string

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Email Service Configuration (Resend/Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
RESEND_API_KEY=your_resend_api_key

# External AI Integrations
GROQ_API_KEY=your_groq_api_key
```

Start the backend development server:

```bash
npm run dev
```

The API will be accessible at `http://localhost:3000`.

#### 3. Frontend Environment Setup

Open a new terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd src/frontend
npm install
```

Create a `.env.local` file in the `src/frontend` directory:

```env
# Point this to your backend server URL
VITE_API_URL=http://localhost:3000/api
```

Start the frontend development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Contributors

- Group 8 – Software Engineering Project
