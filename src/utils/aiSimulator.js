// ─── BimaKavach RM Copilot — AI Simulator ────────────────────────────────────
// Lightweight, deterministic "AI" functions that use keyword / template matching
// to simulate intelligent behaviour without any external API calls.

// ─── Stage-transition keyword map ────────────────────────────────────────────
const STAGE_SIGNALS = [
  {
    stage: 'needs_assessment',
    keywords: ['what coverage', 'what insurance', 'risk assessment', 'need analysis', 'current policies', 'what are your requirements', 'tell me about your business', 'how many employees', 'annual turnover'],
    reason: 'Client is discussing their insurance needs and requirements.',
  },
  {
    stage: 'quote_requested',
    keywords: ['send me a quote', 'get a quote', 'need quotation', 'please quote', 'can you quote', 'share quote', 'want a quote', 'requesting quote', 'pricing for'],
    reason: 'Client has explicitly requested a quote.',
  },
  {
    stage: 'quote_sent',
    keywords: ['sent you the quote', 'attached quote', 'three options', 'two options', 'here is the quote', 'please find the quote', 'premium options', 'quotation attached', 'sharing the quote', 'premium comparison'],
    reason: 'A quote or premium comparison has been shared with the client.',
  },
  {
    stage: 'negotiation',
    keywords: ['can you reduce', 'too expensive', 'better rate', 'lower premium', 'negotiate', 'discount', 'competing quote', 'other insurer offered', 'match the price', 'final price'],
    reason: 'Client is negotiating on premium or terms.',
  },
  {
    stage: 'verbal_confirmation',
    keywords: ['going ahead', 'confirmed', 'let\'s proceed', 'we accept', 'go with this', 'finalize this', 'approved internally', 'management approved', 'proceed with', 'agreed'],
    reason: 'Client has given verbal confirmation to proceed.',
  },
  {
    stage: 'documents_submitted',
    keywords: ['documents attached', 'sharing documents', 'kyc attached', 'proposal form', 'signed proposal', 'submitted documents', 'find attached the documents', 'sending the filled form'],
    reason: 'Required documents have been submitted for processing.',
  },
  {
    stage: 'underwriting',
    keywords: ['underwriting', 'risk inspection', 'survey scheduled', 'underwriter review', 'pending approval from insurer', 'insurer is reviewing'],
    reason: 'The proposal is under insurer underwriting review.',
  },
  {
    stage: 'policy_issued',
    keywords: ['policy issued', 'policy number', 'cover note', 'certificate of insurance', 'policy document attached', 'policy is active', 'congratulations on your new policy'],
    reason: 'The policy has been issued and is active.',
  },
];

// Ordered stages for forward-only transition validation
const STAGE_ORDER = [
  'lead',
  'needs_assessment',
  'quote_requested',
  'quote_sent',
  'negotiation',
  'verbal_confirmation',
  'documents_submitted',
  'underwriting',
  'policy_issued',
];

/**
 * Analyse conversation text and suggest the next CRM deal stage.
 *
 * @param {string} conversationText — the latest message or aggregated text
 * @param {string} currentStage     — the deal's current pipeline stage
 * @returns {{ suggestedStage: string, confidence: number, reason: string, triggerSnippet: string } | null}
 */
export function detectStageTransition(conversationText, currentStage) {
  if (!conversationText || !currentStage) return null;

  const text = conversationText.toLowerCase();
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  // Walk from the highest stage downward so we match the most-advanced signal first
  let bestMatch = null;

  for (let i = STAGE_SIGNALS.length - 1; i >= 0; i--) {
    const signal = STAGE_SIGNALS[i];
    const signalIdx = STAGE_ORDER.indexOf(signal.stage);

    // Only suggest forward transitions
    if (signalIdx <= currentIdx) continue;

    for (const keyword of signal.keywords) {
      const pos = text.indexOf(keyword);
      if (pos !== -1) {
        // Extract a snippet around the match
        const start = Math.max(0, pos - 20);
        const end = Math.min(text.length, pos + keyword.length + 20);
        const snippet = conversationText.slice(start, end).trim();

        // Confidence is higher for bigger stage jumps and exact keyword hits
        const stageGap = signalIdx - currentIdx;
        const confidence = Math.min(95, 60 + stageGap * 5 + keyword.length);

        if (!bestMatch || signalIdx > STAGE_ORDER.indexOf(bestMatch.suggestedStage)) {
          bestMatch = {
            suggestedStage: signal.stage,
            confidence,
            reason: signal.reason,
            triggerSnippet: `"…${snippet}…"`,
          };
        }
        break; // found a keyword for this signal, move on
      }
    }
  }

  return bestMatch;
}

// ─── Deal Note Generator ─────────────────────────────────────────────────────

const NOTE_TEMPLATES = [
  'Engaged with {client} via {channels}. {summary} Next step: {nextStep}.',
  '{summary} Communication has been through {channels}. Follow-up required on {nextStep}.',
  'Recent interactions with {client} ({channels}): {summary} Action item — {nextStep}.',
];

const NEXT_STEPS = [
  'send revised quote with updated terms',
  'follow up on pending documents',
  'schedule a call to discuss coverage options',
  'share the policy comparison sheet',
  'arrange risk inspection with the insurer',
  'confirm the renewal terms with the client',
  'collect KYC and proposal form',
  'coordinate with underwriting team for approval',
];

/**
 * Generate a short deal-note summary from an array of conversations.
 *
 * @param {Array<{ channel: string, content: string, direction: string, from: string }>} conversations
 * @returns {string}
 */
export function generateDealNote(conversations) {
  if (!conversations || conversations.length === 0) {
    return 'No recent conversations to summarise.';
  }

  const channels = [...new Set(conversations.map((c) => c.channel))];
  const channelStr = channels.join(' and ');

  // Determine the client name from inbound messages
  const inbound = conversations.find((c) => c.direction === 'inbound');
  const clientName = inbound ? inbound.from : 'the client';

  // Build a short summary from message content
  const topicSnippets = [];
  for (const conv of conversations.slice(0, 5)) {
    if (conv.content) {
      const short = conv.content.length > 80 ? conv.content.slice(0, 80) + '…' : conv.content;
      topicSnippets.push(short);
    }
  }

  const summaryParts = [];
  if (topicSnippets.length > 0) {
    summaryParts.push(`Key topics discussed include: "${topicSnippets[0]}"`);
  }
  if (topicSnippets.length > 1) {
    summaryParts.push(`Also covered: "${topicSnippets[1]}"`);
  }
  summaryParts.push(
    `Total of ${conversations.length} message(s) exchanged in this period.`
  );

  const summary = summaryParts.join(' ');
  const nextStep = NEXT_STEPS[Math.floor(Math.random() * NEXT_STEPS.length)];

  const template = NOTE_TEMPLATES[Math.floor(Math.random() * NOTE_TEMPLATES.length)];
  return template
    .replace('{client}', clientName)
    .replace('{channels}', channelStr)
    .replace('{summary}', summary)
    .replace('{nextStep}', nextStep);
}

// ─── Nudge / Cross-sell Trigger Detector ─────────────────────────────────────

const TRIGGER_RULES = [
  {
    keywords: ['new office', 'new branch', 'opening a new location', 'new premises'],
    type: 'cross_sell',
    recommendation: 'Fire & Perils policy for the new premises',
    product: 'Fire & Perils',
  },
  {
    keywords: ['hiring more employees', 'expanding team', 'new hires', 'recruiting', 'onboarding new staff'],
    type: 'cross_sell',
    recommendation: 'Group Health Insurance or Workmen Compensation for new employees',
    product: 'Group Health',
  },
  {
    keywords: ['expanding to new city', 'new warehouse', 'warehouse', 'godown', 'storage facility'],
    type: 'cross_sell',
    recommendation: 'Marine Cargo and Burglary coverage for the new warehouse / storage',
    product: 'Marine Cargo',
  },
  {
    keywords: ['cyber attack', 'data breach', 'ransomware', 'phishing', 'hacking', 'cyber attack news'],
    type: 'cross_sell',
    recommendation: 'Cyber Insurance to protect against growing digital threats',
    product: 'Cyber Insurance',
  },
  {
    keywords: ['ipo', 'going public', 'board of directors', 'new directors appointed'],
    type: 'cross_sell',
    recommendation: 'Directors & Officers (D&O) Liability cover',
    product: 'Directors & Officers (D&O)',
  },
  {
    keywords: ['vehicle', 'fleet', 'new trucks', 'delivery van', 'commercial vehicle'],
    type: 'cross_sell',
    recommendation: 'Commercial Vehicle Insurance for new fleet additions',
    product: 'Commercial Vehicle',
  },
  {
    keywords: ['construction project', 'building project', 'new plant', 'factory construction'],
    type: 'cross_sell',
    recommendation: 'Engineering (CAR/EAR) Insurance for the construction project',
    product: 'Engineering (CAR/EAR)',
  },
  {
    keywords: ['export', 'importing', 'international shipment', 'shipping overseas'],
    type: 'cross_sell',
    recommendation: 'Marine Cargo Insurance for international trade shipments',
    product: 'Marine Cargo',
  },
  {
    keywords: ['sum insured is low', 'underinsured', 'increase cover', 'raise the limit'],
    type: 'upsell',
    recommendation: 'Increase the sum insured to match current asset valuation',
    product: null,
  },
  {
    keywords: ['claim', 'claim filed', 'claim experience', 'loss happened', 'damage reported'],
    type: 'risk_alert',
    recommendation: 'Review current coverage adequacy after recent claim experience',
    product: null,
  },
];

/**
 * Detect cross-sell and upsell triggers from conversation text.
 *
 * @param {string} conversationText
 * @param {{ companyName?: string, industry?: string }} clientProfile
 * @returns {Array<{ type: string, trigger: string, recommendation: string, confidence: number, product: string|null }>}
 */
export function detectNudgeTriggers(conversationText, clientProfile) {
  if (!conversationText) return [];

  const text = conversationText.toLowerCase();
  const results = [];

  for (const rule of TRIGGER_RULES) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        results.push({
          type: rule.type,
          trigger: keyword,
          recommendation: rule.recommendation,
          confidence: 70 + Math.floor(Math.random() * 20), // 70-89
          product: rule.product,
        });
        break; // one match per rule is enough
      }
    }
  }

  return results;
}

// ─── AI Typing Delay ─────────────────────────────────────────────────────────

/**
 * Simulate an AI processing / typing delay.
 *
 * @param {number} [minMs=800]
 * @param {number} [maxMs=2000]
 * @returns {Promise<void>}
 */
export function simulateAiDelay(minMs = 800, maxMs = 2000) {
  const duration = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// ─── Client Response Generator ───────────────────────────────────────────────

const RESPONSE_TEMPLATES = {
  quote: [
    'Thanks {name}, received the quote. Let me review it with my finance team and get back to you by {day}.',
    'Hi, got the quote. The premium seems a bit high compared to last year. Can you check if there\'s a better rate?',
    'Thank you for the options. We are inclined towards Option B. Could you share the detailed terms?',
  ],
  renewal: [
    'Hi {name}, yes we would like to renew. Please go ahead with the same insurer.',
    'We want to renew but could you also get a competitive quote from another insurer?',
    'Thanks for the reminder. Our management wants to review the coverage before renewing. Can we schedule a call?',
  ],
  claim: [
    'We had a minor fire incident at our Pune warehouse yesterday. Need to file a claim urgently.',
    'One of our delivery trucks was involved in an accident. How do I start the claim process?',
    'Hi {name}, the claim documents have been submitted to the TPA. Waiting for their response.',
  ],
  general: [
    'Sure {name}, let me check internally and revert.',
    'Thanks for the update. Will discuss with the team.',
    'Hi, can you call me tomorrow around 11 AM? Need to discuss something important.',
    'Ok noted. Please proceed.',
    'Thanks {name}. Appreciate the quick response!',
  ],
  greeting: [
    'Good morning {name}! How are you?',
    'Hi {name}, hope you are doing well.',
    'Hello {name}, long time no talk!',
  ],
};

/**
 * Determine message context from the last outbound message.
 */
function detectContext(lastMessage) {
  if (!lastMessage) return 'general';
  const text = lastMessage.toLowerCase();
  if (text.includes('quote') || text.includes('premium') || text.includes('option')) return 'quote';
  if (text.includes('renew') || text.includes('expir')) return 'renewal';
  if (text.includes('claim') || text.includes('incident') || text.includes('damage')) return 'claim';
  if (text.includes('hi') || text.includes('hello') || text.includes('good morning')) return 'greeting';
  return 'general';
}

/**
 * Generate a realistic simulated client WhatsApp response.
 *
 * @param {string} lastMessage — the last outbound message sent to the client
 * @param {string} clientName — contact person name
 * @returns {string}
 */
export function generateClientResponse(lastMessage, clientName) {
  const context = detectContext(lastMessage);
  const templates = RESPONSE_TEMPLATES[context] || RESPONSE_TEMPLATES.general;
  const template = templates[Math.floor(Math.random() * templates.length)];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const day = days[Math.floor(Math.random() * days.length)];

  const firstName = (clientName || 'Sir').split(' ')[0];

  return template.replace(/\{name\}/g, firstName).replace(/\{day\}/g, day);
}
