import { useState, useMemo } from 'react';
import { clients, policies, deals, conversations } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatCurrencyFull,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatDuration,
  getInitials,
  stringToColor,
  getDaysSince,
  getDaysUntil,
  getRenewalUrgency,
  sortByDate,
} from '../../utils/helpers';
import { getPortfolioGaps, getCoverageScore } from '../../data/coverageMatrix';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  Shield,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  PhoneIncoming,
  PhoneOutgoing,
  ExternalLink,
} from 'lucide-react';

export default function ClientDetail() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('timeline');

  const client = clients.find((c) => c.id === state.selectedClient);
  if (!client) {
    return (
      <div className="empty-state">
        <h3>Client not found</h3>
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'clients' })}
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const clientPolicies = policies.filter((p) => p.clientId === client.id);
  const clientDeals = deals.filter((d) => d.clientId === client.id);
  const clientConversations = sortByDate(
    conversations.filter((c) => c.clientId === client.id),
    'timestamp',
    true
  );

  const activePolicies = clientPolicies.filter((p) => p.status === 'active');
  const totalPremium = activePolicies.reduce((sum, p) => sum + p.premium, 0);
  const portfolioGaps = getPortfolioGaps(client.industry, clientPolicies.map((p) => p.productType));
  const coverageScore = getCoverageScore(client.industry, clientPolicies.map((p) => p.productType));

  return (
    <div>
      {/* Back button */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'clients' })}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {/* Client header */}
      <div className="client-header animate-fade-in">
        <div
          className="avatar avatar-xl"
          style={{ background: stringToColor(client.companyName) }}
        >
          {getInitials(client.companyName)}
        </div>

        <div className="client-details">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-1)' }}>
            <h2 className="client-company-name">{client.companyName}</h2>
            <span
              className={`badge ${
                client.status === 'active'
                  ? 'badge-success'
                  : client.status === 'prospect'
                  ? 'badge-primary'
                  : 'badge-danger'
              }`}
            >
              {client.status}
            </span>
          </div>
          <p className="client-contact-name">
            {client.contactPerson} — {client.contactTitle}
          </p>

          <div className="client-meta-grid">
            <div className="client-meta-item">
              <span className="client-meta-label">
                <Building2 size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Industry
              </span>
              <span className="client-meta-value">
                {client.industry.charAt(0).toUpperCase() + client.industry.slice(1)}
              </span>
            </div>
            <div className="client-meta-item">
              <span className="client-meta-label">
                <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Location
              </span>
              <span className="client-meta-value">
                {client.city}, {client.state}
              </span>
            </div>
            <div className="client-meta-item">
              <span className="client-meta-label">
                <TrendingUp size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Annual Revenue
              </span>
              <span className="client-meta-value">
                {formatCurrency(client.annualRevenue)}
              </span>
            </div>
            <div className="client-meta-item">
              <span className="client-meta-label">
                <Users size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Employees
              </span>
              <span className="client-meta-value">{client.employeeCount}</span>
            </div>
            <div className="client-meta-item">
              <span className="client-meta-label">
                <Shield size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Active Policies
              </span>
              <span className="client-meta-value">{activePolicies.length}</span>
            </div>
            <div className="client-meta-item">
              <span className="client-meta-label">
                <Calendar size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Last Contact
              </span>
              <span className="client-meta-value">
                {formatRelativeTime(client.lastContactedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flexShrink: 0 }}>
          <div className="metric-card" style={{ padding: 'var(--space-3)' }}>
            <div className="metric-value" style={{ fontSize: 'var(--text-xl)' }}>
              {formatCurrency(totalPremium)}
            </div>
            <div className="metric-label">Total Premium</div>
          </div>
          <div className="metric-card" style={{ padding: 'var(--space-3)' }}>
            <div
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-extrabold)',
                color: coverageScore >= 70 ? 'var(--success)' : coverageScore >= 40 ? 'var(--warning)' : 'var(--danger)',
              }}
            >
              {coverageScore}%
            </div>
            <div className="metric-label">Coverage Score</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="client-tabs">
        {[
          { id: 'timeline', label: 'Timeline' },
          { id: 'policies', label: `Policies (${clientPolicies.length})` },
          { id: 'deals', label: `Deals (${clientDeals.length})` },
          { id: 'gaps', label: 'Coverage Gaps' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`client-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'timeline' && (
        <div className="timeline">
          {clientConversations.slice(0, 20).map((conv, idx) => (
            <div key={conv.id} className="timeline-item" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className={`timeline-dot ${conv.channel}`} />
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <div className="timeline-card-channel" style={{
                    color: conv.channel === 'whatsapp' ? 'var(--whatsapp)' : conv.channel === 'email' ? 'var(--email-color)' : 'var(--call-color)'
                  }}>
                    {conv.channel === 'whatsapp' && <MessageSquare size={12} />}
                    {conv.channel === 'email' && <Mail size={12} />}
                    {conv.channel === 'call' && <Phone size={12} />}
                    {conv.channel} • {conv.direction}
                  </div>
                  <span className="timeline-card-time">
                    {formatRelativeTime(conv.timestamp)}
                  </span>
                </div>
                <div className="timeline-card-content">
                  {conv.channel === 'call' ? (
                    <div>
                      <p>
                        {conv.direction === 'inbound' ? <PhoneIncoming size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <PhoneOutgoing size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                        {conv.direction === 'inbound' ? 'Incoming' : 'Outgoing'} call — {formatDuration(conv.duration)}
                      </p>
                      {conv.callSummary && (
                        <div className="call-log-summary" style={{ marginTop: 'var(--space-2)' }}>
                          <div className="call-log-summary-label">
                            <Sparkles size={10} style={{ display: 'inline', marginRight: '4px' }} />
                            AI Summary
                          </div>
                          {conv.callSummary}
                        </div>
                      )}
                    </div>
                  ) : conv.channel === 'email' ? (
                    <div>
                      {conv.subject && (
                        <div style={{ fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                          {conv.subject}
                        </div>
                      )}
                      <p>{conv.content}</p>
                    </div>
                  ) : (
                    <p>{conv.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="policy-grid">
          {clientPolicies.map((policy) => {
            const daysUntilExpiry = getDaysUntil(policy.expiryDate);
            const urgency = getRenewalUrgency(daysUntilExpiry);

            return (
              <div key={policy.id} className="policy-card">
                <div className="policy-card-header">
                  <span className="policy-card-type">{policy.productType}</span>
                  <span
                    className={`badge ${
                      policy.status === 'active'
                        ? 'badge-success'
                        : policy.status === 'renewal_pending'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {policy.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="policy-card-detail">
                  <span className="policy-card-label">Policy No.</span>
                  <span className="policy-card-value">{policy.policyNumber}</span>
                </div>
                <div className="policy-card-detail">
                  <span className="policy-card-label">Insurer</span>
                  <span className="policy-card-value">{policy.insurer}</span>
                </div>
                <div className="policy-card-detail">
                  <span className="policy-card-label">Premium</span>
                  <span className="policy-card-value">{formatCurrencyFull(policy.premium)}</span>
                </div>
                <div className="policy-card-detail">
                  <span className="policy-card-label">Sum Insured</span>
                  <span className="policy-card-value">{formatCurrency(policy.sumInsured)}</span>
                </div>
                <div className="policy-card-detail">
                  <span className="policy-card-label">Expiry</span>
                  <span className="policy-card-value" style={{ color: urgency.color }}>
                    {formatDate(policy.expiryDate)}
                    {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && ` (${daysUntilExpiry}d)`}
                    {daysUntilExpiry <= 0 && ' (Expired)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'deals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {clientDeals.map((deal) => (
            <div key={deal.id} className="surface-card" style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)' }}>
                  {deal.productType}
                </h4>
                <span
                  className="badge badge-primary"
                  style={{ background: `${stageColorByName(deal.stage)}20`, color: stageColorByName(deal.stage), borderColor: `${stageColorByName(deal.stage)}30` }}
                >
                  {deal.stage.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <span>Est. Premium: <strong style={{ color: 'var(--brand-primary-light)' }}>{formatCurrency(deal.estimatedPremium)}</strong></span>
                <span>Probability: {deal.probability}%</span>
                <span>Source: {deal.source}</span>
                <span>{getDaysSince(deal.createdAt)}d old</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'gaps' && (
        <div>
          <div className="surface-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <Sparkles size={20} color="var(--brand-primary-light)" />
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
                  Coverage Analysis — {client.industry.charAt(0).toUpperCase() + client.industry.slice(1)}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  Based on industry best practices for {client.industry} businesses
                </p>
              </div>
            </div>

            <div className="progress-bar" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="progress-bar-fill" style={{ width: `${coverageScore}%` }} />
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Coverage Score: {coverageScore}% — {coverageScore >= 70 ? 'Good coverage' : coverageScore >= 40 ? 'Moderate gaps' : 'Significant gaps'}
            </p>
          </div>

          {portfolioGaps.essential.length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--danger)', marginBottom: 'var(--space-3)' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Missing Essential Coverage
              </h4>
              <div className="flex flex-wrap gap-2">
                {portfolioGaps.essential.map((gap) => (
                  <span key={gap} className="badge badge-danger">{gap}</span>
                ))}
              </div>
            </div>
          )}

          {portfolioGaps.recommended.length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--warning)', marginBottom: 'var(--space-3)' }}>
                Recommended Products
              </h4>
              <div className="flex flex-wrap gap-2">
                {portfolioGaps.recommended.map((gap) => (
                  <span key={gap} className="badge badge-warning">{gap}</span>
                ))}
              </div>
            </div>
          )}

          {portfolioGaps.optional.length > 0 && (
            <div>
              <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Optional Enhancements
              </h4>
              <div className="flex flex-wrap gap-2">
                {portfolioGaps.optional.map((gap) => (
                  <span key={gap} className="badge badge-neutral">{gap}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function stageColorByName(stage) {
  const colors = {
    lead: '#6366f1',
    needs_assessment: '#8b5cf6',
    quote_requested: '#06b6d4',
    quote_sent: '#3b82f6',
    negotiation: '#f59e0b',
    verbal_confirmation: '#10b981',
    documents_submitted: '#14b8a6',
    underwriting: '#f97316',
    policy_issued: '#22c55e',
  };
  return colors[stage] || '#6366f1';
}
