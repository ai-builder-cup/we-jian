# We-Jian — Human Potential Navigator

**Navigate your future. Discover your potential. Prepare for what's next.**

We-Jian is an AI-powered career guidance platform designed to help students understand the changing job market, discover relevant skills, and prepare for a future shaped by artificial intelligence.

As AI transforms the way we work, students often struggle to understand which careers are evolving, what skills they should prioritize, and how to turn their interests into a practical career plan. Professional career coaching can also be expensive or difficult to access.

We-Jian aims to make career exploration more accessible, personalized, and actionable.

## 🎯 The Problem

Students face three major challenges when preparing for their careers:

- **Unclear career direction:** It can be difficult to understand how AI is changing different professions and what that means for future opportunities.
- **Uncertain skill priorities:** Students may not know which technical and human skills to develop to remain relevant.
- **Limited career guidance:** Personalized career coaching is not equally accessible to everyone, particularly students with limited resources.

## 💡 Our Solution

We-Jian serves as a personal career navigator that helps students connect their current abilities and interests with the skills and opportunities they may need in the future.

Rather than simply providing career information, our goal is to help students turn uncertainty into a clearer direction and actionable next steps.

### Key Objectives

- **Explore career opportunities:** Understand potential career paths in an AI-driven world.
- **Identify skill gaps:** Recognize the skills that may need further development.
- **Plan personal growth:** Turn career goals into practical learning and preparation steps.
- **Make guidance accessible:** Help more students explore their potential without depending entirely on expensive one-on-one coaching.

## ✨ What Makes We-Jian Different?

We-Jian focuses on bridging the gap between understanding the future of work and preparing for it.

Instead of leaving students with information they must interpret themselves, the platform aims to connect career exploration, skill development, and personal action into a more guided experience.

Our goal is simple: help students make more informed career decisions and feel better prepared for a changing world.

## 🛠️ Technology Stack

The project uses the following technologies and services:

| Technology | Purpose |
|---|---|
| React 18 | User interface |
| Vite 6 | Development server and production build |
| Node.js | Backend runtime |
| Google Cloud Firestore | Data storage integration |
| Google Cloud / Vertex AI | AI service configuration |
| Gemini | Configurable AI model |
| Firebase | Project configuration and deployment tooling |

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) version 22 or later
- npm
- Access to the required Google Cloud services for AI and data features

### 1. Clone the repository

```bash
git clone https://github.com/ai-builder-cup/we-jian.git
cd we-jian
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file from the provided example:

```bash
cp .env.example .env.local
```

On Windows Command Prompt, use:

```cmd
copy .env.example .env.local
```

Configure the variables in `.env.local` as needed:

```dotenv
VITE_API_BASE_URL=/api
VITE_USE_MOCK_DATA=false

GOOGLE_CLOUD_PROJECT=wejian
GOOGLE_CLOUD_LOCATION=global
GEMINI_MODEL=gemini-3.8-flash

GEMINI_API_KEY=
PORT=5173
```

**Important:** These values are examples based on the repository's environment template. Confirm that the selected AI model is available to your Google Cloud project before running the application.

For local development, configure a Gemini API key if your implementation requires one. In production, the repository's configuration indicates that Vertex AI is intended to use the Cloud Run service account.

Never commit `.env.local`, API keys, or other credentials to version control.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal to access the application.

### 5. Build for production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### 6. Run tests

```bash
npm test
```

The project uses Node.js's built-in test runner.

## 📁 Project Structure

The repository is organized into frontend, backend, and supporting configuration files.

```text
we-jian/
├── scripts/          # Supporting scripts
├── server/           # Backend application
├── src/              # Frontend application
├── .env.example      # Environment variable template
├── Dockerfile        # Container build configuration
├── firebase.json     # Firebase configuration
├── index.html        # Application entry point
├── package.json      # Dependencies and scripts
└── vite.config.js    # Vite configuration
```

## 🌱 Our Vision

We believe every student deserves the opportunity to understand their potential and prepare for the future, regardless of their background or access to professional guidance.

AI is changing the world of work, but students should not have to navigate those changes alone.

**We-Jian is built around a simple idea: make career guidance more accessible, personal, and actionable—so students can move forward with greater clarity and confidence.**

## 👥 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Submit a pull request with a clear description of your contribution.

## 📄 License

A license has not been specified in this README. Please add the appropriate license before distributing or reusing the project.

---

**Built for a future where every student can discover their potential and take the next step with confidence.**
