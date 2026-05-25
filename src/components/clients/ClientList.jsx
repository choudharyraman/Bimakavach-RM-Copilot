import { useState, useMemo } from 'react';
import { clients, policies, deals, conversations } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getInitials,
  stringToColor,
  getDaysSince,
  getDaysUntil,
} from '../../utils/helpers';
import {
  Search,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Phone,
  Mail,
  AlertTriangle,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function ClientList() {
  const { dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (filterIndustry !== 'all' && c.industry !== filterIndustry) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          c.companyName.toLowerCase().includes(term) ||
          c.contactPerson.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [searchTerm, filterIndustry, filterStatus]);

  const industries = [...new Set(clients.map((c) => c.industry))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Clients</h2>
          <p className="page-description">
            {filteredClients.length} clients in portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select"
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind.charAt(0).toUpperCase() + ind.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="churned">Churned</option>
          </select>
        </div>
      </div>

      <div className="search-container" style={{ marginBottom: 'var(--space-4)', maxWidth: '400px' }}>
        <Search size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
        {filteredClients.map((client) => {
          const clientPolicies = policies.filter((p) => p.clientId === client.id);
          const activePolicies = clientPolicies.filter((p) => p.status === 'active');
          const clientDeals = deals.filter((d) => d.clientId === client.id);
          const activeDeals = clientDeals.filter((d) => d.stage !== 'policy_issued');
          const daysSinceContact = getDaysSince(client.lastContactedAt);
          const isStale = daysSinceContact > 7;

          const totalPremium = activePolicies.reduce((sum, p) => sum + p.premium, 0);

          const upcomingRenewals = clientPolicies.filter((p) => {
            const days = getDaysUntil(p.expiryDate);
            return days > 0 && days <= 90;
          });

          return (
            <div
              key={client.id}
              className="surface-card"
              style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
              onClick={() => {
                dispatch({ type: 'SET_SELECTED_CLIENT', payload: client.id });
                dispatch({ type: 'SET_ACTIVE_TAB', payload: 'client_detail' });
              }}
            >
              <div className="flex items-start gap-3" style={{ marginBottom: 'var(--space-3)' }}>
                <div
                  className="avatar avatar-lg"
                  style={{ background: stringToColor(client.companyName) }}
                >
                  {getInitials(client.companyName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <h3
                      className="truncate"
                      style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {client.companyName}
                    </h3>
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
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {client.contactPerson} • {client.contactTitle}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  <Building2 size={12} />
                  {client.industry}
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  <MapPin size={12} />
                  {client.city}, {client.state}
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  <Users size={12} />
                  {client.employeeCount} employees
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  <TrendingUp size={12} />
                  {formatCurrency(client.annualRevenue)}
                </div>
              </div>

              <div className="divider" style={{ margin: 'var(--space-2) 0' }} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary-light)' }}>
                      {activePolicies.length}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Policies</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--success)' }}>
                      {formatCurrency(totalPremium)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Premium</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--warning)' }}>
                      {activeDeals.length}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Deals</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isStale && (
                    <span className="badge badge-danger" style={{ fontSize: '9px' }}>
                      <AlertTriangle size={10} /> {daysSinceContact}d silent
                    </span>
                  )}
                  {upcomingRenewals.length > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '9px' }}>
                      {upcomingRenewals.length} renewal{upcomingRenewals.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
