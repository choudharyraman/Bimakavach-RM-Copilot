import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { clients, deals } from '../../data/mockData';
import {
  formatTime,
  formatDate,
  formatDuration,
  getInitials,
  stringToColor,
  sortByDate,
} from '../../utils/helpers';
import { detectStageTransition, generateDealNote, generateClientResponse, simulateAiDelay } from '../../utils/aiSimulator';
import {
  MessageSquare,
  Mail,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Sparkles,
  Clock,
  User,
  Building2,
  ChevronDown,
} from 'lucide-react';

const channelOptions = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: '#25D366' },
  { id: 'email', label: 'Email', icon: Mail, color: '#EA4335' },
];

export default function ConversationDetail({ thread }) {
  const { state, dispatch, showToast } = useApp();
  const [messageInput, setMessageInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [showAiBanner, setShowAiBanner] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showDealNote, setShowDealNote] = useState(false);
  const [dealNoteText, setDealNoteText] = useState('');
  const messagesEndRef = useRef(null);

  const client = clients.find((c) => c.id === thread.clientId);
  const clientDeals = deals.filter((d) => d.clientId === thread.clientId);

  const allMessages = sortByDate(
    [...thread.messages, ...localMessages.filter((m) => m.clientId === thread.clientId)],
    'timestamp',
    false
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length, typingIndicator]);

  // Check for AI stage suggestion when messages change
  useEffect(() => {
    if (allMessages.length > 0 && clientDeals.length > 0) {
      const latestMessages = allMessages.slice(-5).map((m) => m.content).join(' ');
      const currentDeal = clientDeals[0];
      const suggestion = detectStageTransition(latestMessages, currentDeal.stage);
      if (suggestion) {
        setAiSuggestion(suggestion);
        setShowAiBanner(true);
      }
    }
  }, [thread.clientId]);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: `local_${Date.now()}`,
      clientId: thread.clientId,
      dealId: clientDeals[0]?.id || null,
      channel: selectedChannel,
      direction: 'outbound',
      from: 'Vikram Mehta',
      to: client.contactPerson,
      timestamp: new Date().toISOString(),
      content: messageInput,
      status: 'sent',
      isAiGenerated: false,
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    const sentText = messageInput;
    setMessageInput('');

    // Simulate message delivery
    setTimeout(() => {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        )
      );
    }, 800);

    // Simulate read receipt
    setTimeout(() => {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: 'read' } : m
        )
      );
    }, 2000);

    // Simulate client reply for WhatsApp
    if (selectedChannel === 'whatsapp') {
      setTypingIndicator(true);
      await simulateAiDelay(2000, 4000);
      setTypingIndicator(false);

      const reply = generateClientResponse(sentText, client.contactPerson);
      const replyMessage = {
        id: `reply_${Date.now()}`,
        clientId: thread.clientId,
        dealId: clientDeals[0]?.id || null,
        channel: 'whatsapp',
        direction: 'inbound',
        from: client.contactPerson,
        to: 'Vikram Mehta',
        timestamp: new Date().toISOString(),
        content: reply,
        status: 'read',
        isAiGenerated: true,
      };
      setLocalMessages((prev) => [...prev, replyMessage]);

      // After reply, show deal note suggestion
      await simulateAiDelay(1500, 2500);
      const note = generateDealNote([newMessage, replyMessage]);
      if (note) {
        setDealNoteText(note);
        setShowDealNote(true);
      }
    }
  }, [messageInput, selectedChannel, thread.clientId, client]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAcceptStageUpdate = () => {
    showToast(`Deal stage updated to "${aiSuggestion.suggestedStageLabel}"`, 'success');
    setShowAiBanner(false);
  };

  const handleAcceptDealNote = () => {
    showToast('Deal note saved successfully', 'success');
    setShowDealNote(false);
  };

  // Group messages by date
  const messagesByDate = {};
  allMessages.forEach((msg) => {
    const dateKey = formatDate(msg.timestamp);
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(msg);
  });

  return (
    <div className="conversation-detail">
      {/* Header */}
      <div className="conversation-detail-header">
        <div className="conversation-detail-info">
          <div
            className="avatar avatar-md"
            style={{ background: stringToColor(client.companyName) }}
          >
            {getInitials(client.contactPerson)}
          </div>
          <div>
            <div className="conversation-detail-name">
              {client.contactPerson}
            </div>
            <div className="conversation-detail-company">
              {client.companyName} • {client.industry}
            </div>
          </div>
        </div>

        <div className="conversation-detail-actions">
          {clientDeals[0] && (
            <span className="badge badge-primary">
              {clientDeals[0].stage.replace(/_/g, ' ')}
            </span>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              dispatch({ type: 'SET_SELECTED_CLIENT', payload: client.id });
              dispatch({ type: 'SET_ACTIVE_TAB', payload: 'client_detail' });
            }}
          >
            <User size={14} /> Profile
          </button>
        </div>
      </div>

      {/* AI Stage Update Banner */}
      {showAiBanner && aiSuggestion && (
        <div className="ai-banner animate-fade-in-down">
          <div className="ai-banner-icon">
            <Sparkles size={18} />
          </div>
          <div className="ai-banner-content">
            <div className="ai-banner-title">
              Stage update detected
            </div>
            <div className="ai-banner-description">
              This deal looks like it moved to <strong>{aiSuggestion.suggestedStageLabel}</strong> — {aiSuggestion.reason}
            </div>
          </div>
          <div className="ai-banner-actions">
            <button className="btn btn-success btn-sm" onClick={handleAcceptStageUpdate}>
              <Check size={14} /> Confirm
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAiBanner(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Deal Note Suggestion */}
      {showDealNote && (
        <div className="ai-banner animate-fade-in-down" style={{ borderColor: 'rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.08)' }}>
          <div className="ai-banner-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
            <Sparkles size={18} />
          </div>
          <div className="ai-banner-content">
            <div className="ai-banner-title">AI-Generated Deal Note</div>
            <div className="ai-banner-description">{dealNoteText}</div>
          </div>
          <div className="ai-banner-actions">
            <button className="btn btn-primary btn-sm" onClick={handleAcceptDealNote}>
              <Check size={14} /> Save Note
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDealNote(false)}>
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="conversation-messages">
        {Object.entries(messagesByDate).map(([date, msgs]) => (
          <div key={date}>
            <div className="message-date-divider">
              <span>{date}</span>
            </div>
            {msgs.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        ))}

        {typingIndicator && (
          <div className="message-bubble incoming animate-fade-in" style={{ maxWidth: '80px' }}>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Compose Area */}
      <div className="compose-area">
        <div className="compose-container">
          {/* Channel selector */}
          <div style={{ position: 'relative' }}>
            <button
              className="compose-channel-selector"
              onClick={() => setShowChannelDropdown(!showChannelDropdown)}
            >
              {selectedChannel === 'whatsapp' ? (
                <MessageSquare size={12} color="#25D366" />
              ) : (
                <Mail size={12} color="#EA4335" />
              )}
              <span>{selectedChannel === 'whatsapp' ? 'WA' : 'Email'}</span>
              <ChevronDown size={10} />
            </button>

            {showChannelDropdown && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '4px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  zIndex: 100,
                  minWidth: '140px',
                }}
              >
                {channelOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      className="sidebar-item"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setSelectedChannel(opt.id);
                        setShowChannelDropdown(false);
                      }}
                    >
                      <Icon size={14} color={opt.color} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <input
            className="compose-input"
            placeholder={`Type a ${selectedChannel === 'whatsapp' ? 'message' : 'email'}...`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="compose-send-btn"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isOutgoing = message.direction === 'outbound';

  // Call log style
  if (message.channel === 'call') {
    return (
      <div className="message-bubble call-bubble animate-fade-in-up">
        <div className="call-log-icon">
          {message.direction === 'inbound' ? (
            <PhoneIncoming size={18} />
          ) : (
            <PhoneOutgoing size={18} />
          )}
        </div>
        <div className="call-log-label">
          {message.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call
        </div>
        <div className="call-log-duration">
          {formatDuration(message.duration)} • {formatTime(message.timestamp)}
        </div>
        {message.callSummary && (
          <div className="call-log-summary">
            <div className="call-log-summary-label">
              <Sparkles size={10} style={{ display: 'inline', marginRight: '4px' }} />
              AI Summary
            </div>
            {message.callSummary}
          </div>
        )}
      </div>
    );
  }

  // Email style
  if (message.channel === 'email') {
    return (
      <div className={`message-bubble email-bubble ${isOutgoing ? '' : ''} animate-fade-in-up`}>
        <div className="email-header">
          <Mail size={16} color="var(--email-color)" />
          <div style={{ flex: 1 }}>
            <div className="email-subject">
              {message.subject || 'Re: Insurance Inquiry'}
            </div>
            <div className="email-meta">
              {message.from} → {message.to} • {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
        <div className="email-body">{message.content}</div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="email-attachments">
            {message.attachments.map((att, i) => (
              <div key={i} className="email-attachment">
                <Paperclip size={12} />
                {att.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // WhatsApp style
  return (
    <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div>{message.content}</div>
      <div className="message-time">
        <span>{formatTime(message.timestamp)}</span>
        {isOutgoing && (
          <span className="message-ticks">
            {message.status === 'sent' && <Check size={14} />}
            {message.status === 'delivered' && <CheckCheck size={14} style={{ opacity: 0.6 }} />}
            {message.status === 'read' && <CheckCheck size={14} />}
          </span>
        )}
      </div>
    </div>
  );
}
