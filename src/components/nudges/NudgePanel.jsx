import { useState, useMemo } from 'react';
import { nudges, clients } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime, getInitials, stringToColor } from '../../utils/helpers';
import {
  Lightbulb,
  TrendingUp,
  RefreshCcw,
  AlertTriangle,
  Shield,
  Sparkles,
  Check,
  X,
  ChevronRight,
  Filter,
  MessageSquare,
  Zap,
} from 'lucide-react';

const nudgeTypeConfig = {
  cross_sell: { icon: TrendingUp, color: '#3b82f6', label: 'Cross-Sell', badgeClass: 'badge-primary' },
  upsell: { icon: Zap, color: '#8b5cf6', label: 'Upsell', badgeClass: 'badge-purple' },
  renewal: { icon: RefreshCcw, color: '#f59e0b', label: 'Renewal', badgeClass: 'badge-warning' },
  risk_alert: { icon: AlertTriangle, color: '#ef4444', label: 'Risk Alert', badgeClass: 'badge-danger' },
  portfolio_gap: { icon: Shield, color: '#06b6d4', label: 'Portfolio Gap', badgeClass: 'badge-info' },
};

export default function NudgePanel() {
  const { dispatch, showToast } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const filteredNudges = useMemo(() => {
    return nudges.filter((n) => {
      if (dismissedIds.has(n.id)) return false;
      if (n.status === 'dismissed') return false;
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
      return true;
    });
  }, [filterType, filterPriority, dismissedIds]);

  const nudgeCounts = {
    total: nudges.filter((n) => n.status === 'active' && !dismissedIds.has(n.id)).length,
    cross_sell: nudges.filter((n) => n.type === 'cross_sell' && n.status === 'active').length,
    renewal: nudges.filter((n) => n.type === 'renewal' && n.status === 'active').length,
    risk_alert: nudges.filter((n) => n.type === 'risk_alert' && n.status === 'active').length,
    portfolio_gap: nudges.filter((n) => n.type === 'portfolio_gap' && n.status === 'active').length,
  };

  const handleDismiss = (id) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    showToast('Nudge dismissed', 'info');
  };

  const handleAction = (nudge) => {
    const client = clients.find((c) => c.id === nudge.clientId);
    if (client) {
      dispatch({ type: 'SET_SELECTED_CLIENT', payload: client.id });
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'client_detail' });
    }
    showToast(`Opening ${client?.companyName || 'client'} profile`, 'success');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Sparkles
              size={24}
              style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
              color="var(--brand-primary-light)"
            />
            Smart Nudges
          </h2>
          <p className="page-description">
            AI-powered recommendations • {filteredNudges.length} active nudges
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-4)' }}>
        {[
          { label: 'Cross-Sell', count: nudgeCounts.cross_sell, icon: TrendingUp, color: '#3b82f6' },
          { label: 'Renewals', count: nudgeCounts.renewal, icon: RefreshCcw, color: '#f59e0b' },
          { label: 'Risk Alerts', count: nudgeCounts.risk_alert, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Portfolio Gaps', count: nudgeCounts.portfolio_gap, icon: Shield, color: '#06b6d4' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="metric-card animate-fade-in-up"
              style={{ cursor: 'pointer' }}
              onClick={() => setFilterType(item.label === 'Cross-Sell' ? 'cross_sell' : item.label === 'Renewals' ? 'renewal' : item.label === 'Risk Alerts' ? 'risk_alert' : 'portfolio_gap')}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    background: `${item.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={item.color} />
                </div>
                <div>
                  <div className="metric-value" style={{ fontSize: 'var(--text-2xl)' }}>
                    {item.count}
                  </div>
                  <div className="metric-label">{item.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="tabs">
          {['all', 'cross_sell', 'renewal', 'risk_alert', 'portfolio_gap'].map((type) => (
            <button
              key={type}
              className={`tab ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : nudgeTypeConfig[type]?.label || type}
            </button>
          ))}
        </div>

        <select
          className="select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Nudge list */}
      <div className="nudge-list">
        {filteredNudges.map((nudge, idx) => {
          const config = nudgeTypeConfig[nudge.type] || nudgeTypeConfig.cross_sell;
          const Icon = config.icon;
          const client = clients.find((c) => c.id === nudge.clientId);

          return (
            <div
              key={nudge.id}
              className={`nudge-card ${nudge.priority}-priority animate-fade-in-up`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="nudge-header">
                <div className="nudge-type">
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      background: `${config.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={config.color} />
                  </div>
                  <span className={`badge ${config.badgeClass}`}>{config.label}</span>
                  <span
                    className={`badge ${
                      nudge.priority === 'high'
                        ? 'badge-danger'
                        : nudge.priority === 'medium'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }`}
                    style={{ fontSize: '9px' }}
                  >
                    {nudge.priority}
                  </span>
                </div>

                {client && (
                  <div className="flex items-center gap-2">
                    <div
                      className="avatar avatar-sm"
                      style={{ background: stringToColor(client.companyName) }}
                    >
                      {getInitials(client.companyName)}
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {client.companyName}
                    </span>
                  </div>
                )}
              </div>

              <h4 className="nudge-title">{nudge.title}</h4>
              <p className="nudge-description">{nudge.description}</p>

              {nudge.triggerDetail && (
                <div className="nudge-trigger">
                  <Sparkles size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  <strong>Trigger:</strong> {nudge.triggerDetail}
                </div>
              )}

              <div className="nudge-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleAction(nudge)}>
                  <Check size={14} /> {nudge.suggestedAction || 'Take Action'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDismiss(nudge.id)}>
                  <X size={14} /> Dismiss
                </button>
              </div>
            </div>
          );
        })}

        {filteredNudges.length === 0 && (
          <div className="empty-state">
            <Lightbulb size={32} />
            <h3>No nudges to show</h3>
            <p className="text-sm text-muted">
              All caught up! Check back later for new recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
