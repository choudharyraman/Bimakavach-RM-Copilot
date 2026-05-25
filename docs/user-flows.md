# User Journeys & Flows: BimaKavach RM Copilot

This document outlines the primary workflows for Relationship Managers (RMs) using the BimaKavach RM Copilot.

## 1. The Unified Communication Flow

**Goal:** The RM handles all client communication (WhatsApp, Email, Calls) from a single interface without context switching.

```mermaid
sequenceDiagram
    actor RM
    participant Inbox as Unified Inbox
    participant Chat as Conversation Detail
    participant AI as AI Engine
    participant Client

    Client->>Inbox: Sends WhatsApp Message (e.g., "Need quotes")
    Inbox-->>RM: Displays unread message in unified list
    RM->>Chat: Clicks conversation
    Chat->>RM: Shows complete history (Emails + WA + Calls)
    RM->>Chat: Types reply and hits Send
    Chat->>Client: Delivers message
    AI->>Chat: Analyzes conversation context
    AI-->>RM: Suggests Deal Stage Update ("Quote Requested")
    RM->>Chat: Clicks "Confirm Update"
```

## 2. AI-Assisted CRM Update Flow

**Goal:** Reduce manual data entry by automatically detecting stage changes and generating deal notes from natural conversations.

```mermaid
stateDiagram-v2
    [*] --> DetectIntent
    
    state DetectIntent {
        MessageReceived --> NLP_Analysis
        NLP_Analysis --> KeywordMatch
    }
    
    DetectIntent --> StageSuggestion: Trigger found (e.g., "approved")
    
    state StageSuggestion {
        ShowBanner --> UserDecision
        UserDecision --> Confirm: RM Clicks Confirm
        UserDecision --> Dismiss: RM Clicks Dismiss
    }
    
    Confirm --> UpdatePipeline
    UpdatePipeline --> GenerateNote
    
    state GenerateNote {
        SummarizeContext --> ShowNoteBanner
        ShowNoteBanner --> SaveToCRM
    }
    
    SaveToCRM --> [*]
    Dismiss --> [*]
```

## 3. The Nudge Engine & Renewal Flow

**Goal:** Proactively surface revenue opportunities (cross-sells, upsells) and prevent churn (renewals).

```mermaid
graph TD
    A[Data Sources] --> B{Nudge Engine}
    
    A1(Client Conversations) --> A
    A2(Policy Expiry Dates) --> A
    A3(Coverage Matrix Rules) --> A
    A4(External Triggers e.g., News) --> A
    
    B -->|Type: Renewal| C[Renewal Pipeline]
    B -->|Type: Cross-Sell| D[Smart Nudges Panel]
    B -->|Type: Portfolio Gap| D
    
    C --> E[RM Views Urgency]
    E --> F[1-Click WA/Email Reminder]
    
    D --> G[RM Views Nudge Card]
    G --> H[Click 'Take Action']
    H --> I[Open Client Profile]
    I --> J[Pitch New Product]
```

## 4. Manager Dashboard & Analytics Flow

**Goal:** Provide sales leaders with real-time visibility into pipeline health and RM performance without requiring manual status reports.

```mermaid
graph LR
    RM1[RM: Vikram] -->|Updates Deals & Chats| State(Global App State)
    RM2[RM: Priya] -->|Updates Deals & Chats| State
    RM3[RM: Arjun] -->|Updates Deals & Chats| State
    
    State -->|Aggregates Data| DB[Manager Dashboard]
    
    DB --> M1[Pipeline by Stage]
    DB --> M2[RM Performance Table]
    DB --> M3[Stale Client Alerts]
    DB --> M4[Channel Activity]
    
    Manager((Manager)) -->|Reviews| DB
    Manager -->|Intervenes| M3
```
