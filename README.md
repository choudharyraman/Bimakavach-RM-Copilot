# BimaKavach RM Copilot

BimaKavach RM Copilot is a unified communication, intelligence, and workflow automation layer built for insurance broking Relationship Managers (RMs).

It serves as the connective tissue between the channels where RMs work (WhatsApp, Email, Telephony) and the CRM where records are kept. The application is designed with a premium, dark-mode-first aesthetic and emphasizes saving time through AI-assisted workflows.

## Features

1. **Unified Communication Inbox**: Manage WhatsApp, Email, and Call logs from a single timeline view.
2. **AI-Assisted CRM**: Automatically detect deal stage transitions and generate meeting/deal notes based on natural conversation context.
3. **Smart Nudge Engine**: Proactively identify cross-sell, upsell, and renewal opportunities based on portfolio gaps and conversation triggers.
4. **Manager Dashboard**: Real-time pipeline analytics, RM performance tracking, and stale client alerts.

## Documentation

Explore the detailed documentation to understand the system design and workflows:

- [System Architecture](docs/system-architecture.md)
- [User Journeys & Flows](docs/user-flows.md)

## Tech Stack

- **Frontend**: React, Vite
- **Styling**: Vanilla CSS with CSS Variables (Custom Design System)
- **Icons**: Lucide React
- **Charts**: Chart.js / react-chartjs-2
- **Routing**: State-based Context (ready for React Router integration)
- **Deployment**: Vercel Ready

## Getting Started

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

*Note: The current version uses simulated mock data (`src/data/mockData.js`) and an in-browser AI simulator (`src/utils/aiSimulator.js`) for demonstration purposes without requiring actual vendor API keys.*
