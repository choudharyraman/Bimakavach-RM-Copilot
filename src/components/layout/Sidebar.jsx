import { useApp } from '../../context/AppContext';
import {
  Inbox,
  LayoutDashboard,
  Users,
  Lightbulb,
  BarChart3,
  RefreshCcw,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { getInitials, stringToColor } from '../../utils/helpers';

const navItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 12 },
  { id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard, badge: null },
  { id: 'clients', label: 'Clients', icon: Users, badge: null },
  { id: 'nudges', label: 'Nudges', icon: Lightbulb, badge: 5 },
  { id: 'renewals', label: 'Renewals', icon: RefreshCcw, badge: 8 },
];

const managerItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { activeTab, isManagerView, currentUser } = state;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={20} />
        </div>
        <div className="sidebar-logo-text">
          <h1>BimaKavach</h1>
          <span>RM Copilot</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Workspace</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="sidebar-item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {isManagerView && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Management</div>
            {managerItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                  <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Role toggle for demo */}
        <div className="role-toggle">
          <span className="role-toggle-label">
            {isManagerView ? 'Manager View' : 'RM View'}
          </span>
          <button
            className={`role-toggle-switch ${isManagerView ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_MANAGER_VIEW' })}
            title="Toggle between RM and Manager view"
          />
        </div>

        {/* User profile */}
        <div className="sidebar-user">
          <div
            className="avatar avatar-md"
            style={{ background: stringToColor(currentUser.name) }}
          >
            {getInitials(currentUser.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser.name}</div>
            <div className="sidebar-user-role">
              {isManagerView ? 'Manager' : 'Relationship Manager'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
