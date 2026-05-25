import { useState, useMemo } from 'react';
import { deals, clients, stageLabels, stageColors } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  getDaysSince,
  getInitials,
  stringToColor,
  groupBy,
} from '../../utils/helpers';
import { Clock, TrendingUp, ArrowRight, Filter } from 'lucide-react';

const stageOrder = [
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

export default function DealPipeline() {
  const { dispatch, showToast } = useApp();
  const [filterRM, setFilterRM] = useState('all');

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (filterRM !== 'all' && d.assignedRmId !== filterRM) return false;
      return true;
    });
  }, [filterRM]);

  const dealsByStage = groupBy(filteredDeals, 'stage');

  const totalPipelineValue = filteredDeals.reduce(
    (sum, d) => sum + (d.estimatedPremium || 0),
    0
  );

  const weightedValue = filteredDeals.reduce(
    (sum, d) => sum + (d.estimatedPremium || 0) * ((d.probability || 0) / 100),
    0
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Pipeline header */}
      <div className="page-header" style={{ padding: '0 0 var(--space-4) 0' }}>
        <div>
          <h2 className="page-title">Deal Pipeline</h2>
          <p className="page-description">
            {filteredDeals.length} deals •{' '}
            <span style={{ color: 'var(--brand-primary-light)' }}>
              {formatCurrency(totalPipelineValue)}
            </span>{' '}
            total •{' '}
            <span style={{ color: 'var(--success)' }}>
              {formatCurrency(weightedValue)}
            </span>{' '}
            weighted
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select"
            value={filterRM}
            onChange={(e) => setFilterRM(e.target.value)}
          >
            <option value="all">All RMs</option>
            <option value="rm1">Vikram Mehta</option>
            <option value="rm2">Priya Nair</option>
            <option value="rm3">Arjun Desai</option>
            <option value="rm4">Sneha Kulkarni</option>
          </select>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="pipeline-container">
        {stageOrder.map((stage) => {
          const stageDeals = dealsByStage[stage] || [];
          const stageValue = stageDeals.reduce(
            (sum, d) => sum + (d.estimatedPremium || 0),
            0
          );

          return (
            <div key={stage} className="pipeline-column animate-fade-in-up">
              <div className="pipeline-column-header">
                <div className="pipeline-column-title">
                  <span
                    className="pipeline-column-dot"
                    style={{ background: stageColors[stage] }}
                  />
                  {stageLabels[stage]}
                </div>
                <span className="pipeline-column-count">
                  {stageDeals.length}
                </span>
              </div>

              <div className="pipeline-column-body">
                {/* Stage value */}
                {stageDeals.length > 0 && (
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      padding: 'var(--space-1) 0',
                    }}
                  >
                    {formatCurrency(stageValue)}
                  </div>
                )}

                {stageDeals.map((deal) => {
                  const client = clients.find((c) => c.id === deal.clientId);
                  const daysInStage = getDaysSince(deal.updatedAt);
                  const isStale = daysInStage > 7;
                  const isCritical = daysInStage > 14;

                  return (
                    <div
                      key={deal.id}
                      className="pipeline-card"
                      onClick={() => {
                        dispatch({ type: 'SET_SELECTED_CLIENT', payload: deal.clientId });
                        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'client_detail' });
                      }}
                    >
                      <div className="pipeline-card-header">
                        <span className="pipeline-card-client">
                          {client?.companyName || 'Unknown'}
                        </span>
                        <div
                          className="avatar avatar-sm"
                          style={{
                            background: stringToColor(client?.contactPerson || ''),
                            fontSize: '9px',
                          }}
                        >
                          {getInitials(client?.contactPerson || '')}
                        </div>
                      </div>

                      <div className="pipeline-card-product">
                        {deal.productType}
                      </div>

                      <div className="pipeline-card-footer">
                        <span className="pipeline-card-premium">
                          {formatCurrency(deal.estimatedPremium)}
                        </span>
                        <span
                          className="pipeline-card-days"
                          style={{
                            color: isCritical
                              ? 'var(--danger)'
                              : isStale
                              ? 'var(--warning)'
                              : 'var(--text-muted)',
                          }}
                        >
                          <Clock size={11} />
                          {daysInStage}d
                        </span>
                      </div>

                      {/* Source badge */}
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <span
                          className="badge badge-neutral"
                          style={{ fontSize: '9px' }}
                        >
                          {deal.source}
                        </span>
                        <span
                          className="badge"
                          style={{
                            marginLeft: '4px',
                            fontSize: '9px',
                            background: 'rgba(59,130,246,0.1)',
                            color: 'var(--brand-primary-light)',
                            border: '1px solid rgba(59,130,246,0.2)',
                          }}
                        >
                          {deal.probability}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {stageDeals.length === 0 && (
                  <div
                    style={{
                      padding: 'var(--space-6) var(--space-4)',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    No deals
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
