import { useState, useMemo } from 'react';
import { policies, clients } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  getDaysUntil,
  getRenewalUrgency,
  getInitials,
  stringToColor,
} from '../../utils/helpers';
import {
  RefreshCcw,
  Clock,
  AlertTriangle,
  MessageSquare,
  Mail,
  Send,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export default function RenewalPipeline() {
  const { dispatch, showToast } = useApp();
  const [filterUrgency, setFilterUrgency] = useState('all');

  const renewalPolicies = useMemo(() => {
    return policies
      .filter((p) => {
        const days = getDaysUntil(p.expiryDate);
        return days <= 90 && p.status !== 'cancelled';
      })
      .map((p) => {
        const days = getDaysUntil(p.expiryDate);
        const urgency = getRenewalUrgency(days);
        const client = clients.find((c) => c.id === p.clientId);
        return { ...p, daysUntil: days, urgency, client };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, []);

  const filteredPolicies = useMemo(() => {
    if (filterUrgency === 'all') return renewalPolicies;
    return renewalPolicies.filter((p) => p.urgency.level === filterUrgency);
  }, [filterUrgency, renewalPolicies]);

  const urgencyCounts = {
    overdue: renewalPolicies.filter((p) => p.urgency.level === 'overdue').length,
    critical: renewalPolicies.filter((p) => p.urgency.level === 'critical').length,
    high: renewalPolicies.filter((p) => p.urgency.level === 'high').length,
    medium: renewalPolicies.filter((p) => p.urgency.level === 'medium').length,
    low: renewalPolicies.filter((p) => p.urgency.level === 'low').length,
  };

  const totalRenewalPremium = renewalPolicies.reduce((sum, p) => sum + p.premium, 0);

  const handleSendReminder = (policy, channel) => {
    showToast(
      `${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} reminder sent to ${policy.client?.contactPerson || 'client'}`,
      'success'
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <RefreshCcw
              size={24}
              style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
              color="var(--warning)"
            />
            Renewal Pipeline
          </h2>
          <p className="page-description">
            {renewalPolicies.length} policies due in next 90 days • {formatCurrency(totalRenewalPremium)} at stake
          </p>
        </div>
      </div>

      {/* Urgency summary */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'overdue', label: 'Overdue', color: '#ef4444', count: urgencyCounts.overdue },
          { key: 'critical', label: '≤ 7 Days', color: '#ef4444', count: urgencyCounts.critical },
          { key: 'high', label: '≤ 15 Days', color: '#f59e0b', count: urgencyCounts.high },
          { key: 'medium', label: '≤ 30 Days', color: '#06b6d4', count: urgencyCounts.medium },
          { key: 'low', label: '≤ 60 Days', color: '#10b981', count: urgencyCounts.low },
        ].map((item) => (
          <div
            key={item.key}
            className="metric-card animate-fade-in-up"
            style={{ cursor: 'pointer', borderLeft: `3px solid ${item.color}` }}
            onClick={() => setFilterUrgency(filterUrgency === item.key ? 'all' : item.key)}
          >
            <div className="metric-value" style={{ fontSize: 'var(--text-2xl)', background: 'none', WebkitTextFillColor: item.color, color: item.color }}>
              {item.count}
            </div>
            <div className="metric-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Renewal table */}
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        <table className="renewal-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Product</th>
              <th>Insurer</th>
              <th>Premium</th>
              <th>Expiry Date</th>
              <th>Days Left</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.map((policy, idx) => (
              <tr
                key={policy.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <div
                      className="avatar avatar-sm"
                      style={{ background: stringToColor(policy.client?.companyName || '') }}
                    >
                      {getInitials(policy.client?.companyName || '')}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 'var(--weight-medium)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          dispatch({ type: 'SET_SELECTED_CLIENT', payload: policy.clientId });
                          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'client_detail' });
                        }}
                      >
                        {policy.client?.companyName || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {policy.policyNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{policy.productType}</td>
                <td>{policy.insurer}</td>
                <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                  {formatCurrency(policy.premium)}
                </td>
                <td>{formatDate(policy.expiryDate)}</td>
                <td>
                  <span
                    style={{
                      color: policy.urgency.color,
                      fontWeight: 'var(--weight-bold)',
                    }}
                  >
                    {policy.daysUntil <= 0
                      ? `${Math.abs(policy.daysUntil)}d overdue`
                      : `${policy.daysUntil}d`}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      policy.renewalStatus === 'renewed'
                        ? 'badge-success'
                        : policy.renewalStatus === 'quote_sent'
                        ? 'badge-primary'
                        : policy.renewalStatus === 'contacted'
                        ? 'badge-info'
                        : 'badge-neutral'
                    }`}
                  >
                    {(policy.renewalStatus || 'not_started').replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px' }}
                      title="Send WhatsApp reminder"
                      onClick={() => handleSendReminder(policy, 'whatsapp')}
                    >
                      <MessageSquare size={14} color="var(--whatsapp)" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px' }}
                      title="Send email reminder"
                      onClick={() => handleSendReminder(policy, 'email')}
                    >
                      <Mail size={14} color="var(--email-color)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPolicies.length === 0 && (
          <div className="empty-state">
            <Calendar size={32} />
            <h3>No renewals in this category</h3>
          </div>
        )}
      </div>
    </div>
  );
}
