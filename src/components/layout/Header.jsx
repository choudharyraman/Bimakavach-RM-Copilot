import { useApp } from '../../context/AppContext';
import { Search, Bell, Phone } from 'lucide-react';

const pageTitles = {
  inbox: { title: 'Inbox', subtitle: 'All conversations in one place' },
  pipeline: { title: 'Deal Pipeline', subtitle: 'Track deals across stages' },
  clients: { title: 'Clients', subtitle: 'Manage your client portfolio' },
  client_detail: { title: 'Client Details', subtitle: 'Complete client profile' },
  nudges: { title: 'Smart Nudges', subtitle: 'AI-powered recommendations' },
  renewals: { title: 'Renewals', subtitle: 'Upcoming policy renewals' },
  dashboard: { title: 'Manager Dashboard', subtitle: 'Pipeline health & analytics' },
};

export default function Header() {
  const { state, dispatch } = useApp();
  const { activeTab, notifications } = state;
  const page = pageTitles[activeTab] || pageTitles.inbox;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h2 className="header-title">{page.title}</h2>
          <p className="header-subtitle">{page.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search search-container">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search clients, deals, messages..."
            value={state.searchQuery}
            onChange={(e) =>
              dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })
            }
          />
        </div>

        {/* Simulate incoming call */}
        <button
          className="header-icon-btn"
          title="Simulate incoming call"
          onClick={() =>
            dispatch({
              type: 'SHOW_CALL_SIMULATOR',
              payload: {
                clientName: 'Rajesh Agarwal',
                company: 'Rajesh Steels Pvt Ltd',
                phone: '+91 98765 43210',
                direction: 'incoming',
              },
            })
          }
        >
          <Phone size={18} />
        </button>

        {/* Notifications */}
        <button className="header-icon-btn" style={{ position: 'relative' }}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
