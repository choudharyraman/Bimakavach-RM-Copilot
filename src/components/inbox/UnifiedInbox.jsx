import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { conversations, clients, deals } from '../../data/mockData';
import { formatRelativeTime, getInitials, stringToColor, truncateText, sortByDate } from '../../utils/helpers';
import { Search, MessageSquare, Mail, Phone, Filter } from 'lucide-react';
import ConversationDetail from './ConversationDetail';

const channelIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  call: Phone,
};

const channelColors = {
  whatsapp: '#25D366',
  email: '#EA4335',
  call: '#3b82f6',
};

export default function UnifiedInbox() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedConversation, inboxFilter } = state;

  // Group conversations by client, take the latest message as preview
  const clientThreads = useMemo(() => {
    const grouped = {};
    const sortedConvos = sortByDate(conversations, 'timestamp', true);

    sortedConvos.forEach((conv) => {
      if (!grouped[conv.clientId]) {
        const client = clients.find((c) => c.id === conv.clientId);
        if (!client) return;
        grouped[conv.clientId] = {
          clientId: conv.clientId,
          clientName: client.companyName,
          contactPerson: client.contactPerson,
          latestMessage: conv,
          messages: [],
          unreadCount: 0,
          channels: new Set(),
        };
      }
      grouped[conv.clientId].messages.push(conv);
      grouped[conv.clientId].channels.add(conv.channel);
      if (conv.direction === 'inbound' && conv.status !== 'read') {
        grouped[conv.clientId].unreadCount++;
      }
    });

    return Object.values(grouped)
      .filter((thread) => {
        // Channel filter
        if (inboxFilter !== 'all' && !thread.channels.has(inboxFilter)) return false;
        // Search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            thread.clientName.toLowerCase().includes(term) ||
            thread.contactPerson.toLowerCase().includes(term) ||
            thread.latestMessage.content.toLowerCase().includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp));
  }, [inboxFilter, searchTerm]);

  const selectedThread = selectedConversation
    ? clientThreads.find((t) => t.clientId === selectedConversation)
    : null;

  const filterTabs = [
    { id: 'all', label: 'All', count: clientThreads.length },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      count: clientThreads.filter((t) => t.channels.has('whatsapp')).length,
    },
    {
      id: 'email',
      label: 'Email',
      count: clientThreads.filter((t) => t.channels.has('email')).length,
    },
    {
      id: 'call',
      label: 'Calls',
      count: clientThreads.filter((t) => t.channels.has('call')).length,
    },
  ];

  return (
    <div className="inbox-layout">
      {/* Conversation List */}
      <div className="inbox-list">
        <div className="inbox-list-header">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Channel filter tabs */}
        <div className="inbox-filters">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${inboxFilter === tab.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_INBOX_FILTER', payload: tab.id })}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Conversation items */}
        <div className="inbox-conversations">
          {clientThreads.map((thread) => {
            const ChannelIcon = channelIcons[thread.latestMessage.channel];
            const channelColor = channelColors[thread.latestMessage.channel];
            const isActive = selectedConversation === thread.clientId;

            return (
              <div
                key={thread.clientId}
                className={`conversation-item ${isActive ? 'active' : ''} ${thread.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() =>
                  dispatch({
                    type: 'SET_SELECTED_CONVERSATION',
                    payload: thread.clientId,
                  })
                }
              >
                <div className="conversation-avatar">
                  <div
                    className="avatar avatar-md"
                    style={{ background: stringToColor(thread.clientName) }}
                  >
                    {getInitials(thread.contactPerson)}
                  </div>
                  <div
                    className="conversation-channel-icon"
                    style={{ background: channelColor }}
                  >
                    <ChannelIcon size={10} color="white" />
                  </div>
                </div>

                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">
                      {thread.clientName}
                    </span>
                    <span className="conversation-time">
                      {formatRelativeTime(thread.latestMessage.timestamp)}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    {thread.latestMessage.channel === 'call'
                      ? '📞 ' + (thread.latestMessage.callSummary
                          ? truncateText(thread.latestMessage.callSummary, 60)
                          : 'Call ' + formatRelativeTime(thread.latestMessage.timestamp))
                      : truncateText(thread.latestMessage.content, 70)}
                  </div>
                  <div className="conversation-meta">
                    <span className="text-xs text-muted">
                      {thread.contactPerson}
                    </span>
                    {thread.channels.size > 1 && (
                      <span className="text-xs text-muted">
                        • {thread.channels.size} channels
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {clientThreads.length === 0 && (
            <div className="empty-state">
              <Filter size={32} />
              <h3>No conversations found</h3>
              <p className="text-sm text-muted">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Detail */}
      {selectedThread ? (
        <ConversationDetail thread={selectedThread} />
      ) : (
        <div className="conversation-detail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-state">
            <Inbox size={48} style={{ opacity: 0.3 }} />
            <h3>Select a conversation</h3>
            <p className="text-sm text-muted">
              Choose a client from the list to view their conversation history
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Inbox(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    </svg>
  );
}
