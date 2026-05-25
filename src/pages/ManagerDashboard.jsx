import { useMemo } from 'react';
import { deals, clients, policies, conversations, rms, stageLabels, stageColors } from '../data/mockData';
import {
  formatCurrency,
  getDaysSince,
  getDaysUntil,
  getRenewalUrgency,
  getInitials,
  stringToColor,
  groupBy,
} from '../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  RefreshCcw,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 11 },
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1a2035',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'Inter', weight: '600' },
      bodyFont: { family: 'Inter' },
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
  },
};

export default function ManagerDashboard() {
  // Pipeline metrics
  const totalDeals = deals.length;
  const totalPipeline = deals.reduce((s, d) => s + (d.estimatedPremium || 0), 0);
  const weightedPipeline = deals.reduce((s, d) => s + (d.estimatedPremium || 0) * ((d.probability || 0) / 100), 0);
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const activePolicies = policies.filter((p) => p.status === 'active').length;
  const upcomingRenewals = policies.filter((p) => getDaysUntil(p.expiryDate) <= 90 && getDaysUntil(p.expiryDate) > 0).length;

  // Pipeline by stage chart
  const stageOrder = ['lead', 'needs_assessment', 'quote_requested', 'quote_sent', 'negotiation', 'verbal_confirmation', 'documents_submitted', 'underwriting', 'policy_issued'];
  const dealsByStage = groupBy(deals, 'stage');

  const pipelineChartData = {
    labels: stageOrder.map((s) => stageLabels[s] || s),
    datasets: [
      {
        label: 'Deals',
        data: stageOrder.map((s) => (dealsByStage[s] || []).length),
        backgroundColor: stageOrder.map((s) => stageColors[s] + '80'),
        borderColor: stageOrder.map((s) => stageColors[s]),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Deals by RM chart
  const dealsByRM = groupBy(deals, 'assignedRmId');
  const rmNames = rms.map((rm) => rm.name);
  const rmDealCounts = rms.map((rm) => (dealsByRM[rm.id] || []).length);
  const rmColors = rms.map((rm) => stringToColor(rm.name));

  const rmChartData = {
    labels: rmNames,
    datasets: [
      {
        data: rmDealCounts,
        backgroundColor: rmColors.map((c) => c + '80'),
        borderColor: rmColors,
        borderWidth: 2,
      },
    ],
  };

  // Pipeline value by RM
  const rmPipelineData = {
    labels: rms.map((rm) => rm.name.split(' ')[0]),
    datasets: [
      {
        label: 'Pipeline Value (₹)',
        data: rms.map((rm) =>
          (dealsByRM[rm.id] || []).reduce((s, d) => s + (d.estimatedPremium || 0), 0)
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  // Stale clients (no contact > 7 days)
  const staleClients = clients
    .filter((c) => {
      const days = getDaysSince(c.lastContactedAt);
      return days > 7 && c.status === 'active';
    })
    .sort((a, b) => getDaysSince(b.lastContactedAt) - getDaysSince(a.lastContactedAt));

  // Conversation activity by channel
  const convByChannel = groupBy(conversations, 'channel');
  const activityData = {
    labels: ['WhatsApp', 'Email', 'Calls'],
    datasets: [
      {
        data: [
          (convByChannel.whatsapp || []).length,
          (convByChannel.email || []).length,
          (convByChannel.call || []).length,
        ],
        backgroundColor: ['#25D36680', '#EA433580', '#3b82f680'],
        borderColor: ['#25D366', '#EA4335', '#3b82f6'],
        borderWidth: 2,
      },
    ],
  };

  // Renewal urgency data
  const renewalPolicies = policies.filter((p) => {
    const d = getDaysUntil(p.expiryDate);
    return d <= 90 && d > 0 && p.status !== 'cancelled';
  });
  const renewalByUrgency = {
    critical: renewalPolicies.filter((p) => getDaysUntil(p.expiryDate) <= 7).length,
    high: renewalPolicies.filter((p) => getDaysUntil(p.expiryDate) > 7 && getDaysUntil(p.expiryDate) <= 15).length,
    medium: renewalPolicies.filter((p) => getDaysUntil(p.expiryDate) > 15 && getDaysUntil(p.expiryDate) <= 30).length,
    low: renewalPolicies.filter((p) => getDaysUntil(p.expiryDate) > 30).length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <BarChart3
              size={24}
              style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
              color="var(--brand-primary-light)"
            />
            Manager Dashboard
          </h2>
          <p className="page-description">
            Real-time pipeline health & team analytics
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="dashboard-grid animate-fade-in-up">
        <div className="metric-card">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
            <TrendingUp size={18} color="var(--brand-primary-light)" />
            <span className="metric-label" style={{ marginTop: 0 }}>Total Pipeline</span>
          </div>
          <div className="metric-value">{formatCurrency(totalPipeline)}</div>
          <div className="metric-change positive">
            <TrendingUp size={12} /> Weighted: {formatCurrency(weightedPipeline)}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
            <Shield size={18} color="var(--success)" />
            <span className="metric-label" style={{ marginTop: 0 }}>Active Policies</span>
          </div>
          <div className="metric-value" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text' }}>
            {activePolicies}
          </div>
          <div className="metric-change positive">
            <Users size={12} /> {activeClients} active clients
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
            <BarChart3 size={18} color="var(--info)" />
            <span className="metric-label" style={{ marginTop: 0 }}>Open Deals</span>
          </div>
          <div className="metric-value" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', WebkitBackgroundClip: 'text' }}>
            {deals.filter((d) => d.stage !== 'policy_issued').length}
          </div>
          <div className="metric-change positive">
            <Clock size={12} /> {totalDeals} total deals
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
            <RefreshCcw size={18} color="var(--warning)" />
            <span className="metric-label" style={{ marginTop: 0 }}>Renewals (90d)</span>
          </div>
          <div className="metric-value" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text' }}>
            {upcomingRenewals}
          </div>
          <div className="metric-change negative">
            <AlertTriangle size={12} /> {renewalByUrgency.critical} critical
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="dashboard-grid-2">
        <div className="chart-card animate-fade-in-up stagger-2">
          <div className="chart-card-title">
            <BarChart3 size={16} color="var(--brand-primary-light)" />
            Pipeline by Stage
          </div>
          <div className="chart-container">
            <Bar data={pipelineChartData} options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } },
              scales: {
                ...chartOptions.scales,
                x: {
                  ...chartOptions.scales.x,
                  ticks: { ...chartOptions.scales.x.ticks, maxRotation: 45 },
                },
              },
            }} />
          </div>
        </div>

        <div className="chart-card animate-fade-in-up stagger-3">
          <div className="chart-card-title">
            <TrendingUp size={16} color="var(--brand-primary-light)" />
            Pipeline Value by RM
          </div>
          <div className="chart-container">
            <Line data={rmPipelineData} options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } },
            }} />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="dashboard-grid-3">
        <div className="chart-card animate-fade-in-up stagger-4">
          <div className="chart-card-title">
            <Users size={16} color="var(--brand-primary-light)" />
            Deals by RM
          </div>
          <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '220px', height: '220px' }}>
              <Doughnut data={rmChartData} options={{
                ...chartOptions,
                scales: {},
                cutout: '65%',
              }} />
            </div>
          </div>
        </div>

        <div className="chart-card animate-fade-in-up stagger-5">
          <div className="chart-card-title">
            <MessageSquare size={16} color="var(--brand-primary-light)" />
            Channel Activity
          </div>
          <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '220px', height: '220px' }}>
              <Doughnut data={activityData} options={{
                ...chartOptions,
                scales: {},
                cutout: '65%',
              }} />
            </div>
          </div>
        </div>

        <div className="chart-card animate-fade-in-up stagger-6">
          <div className="chart-card-title">
            <AlertTriangle size={16} color="var(--warning)" />
            Stale Clients ({staleClients.length})
          </div>
          <div style={{ maxHeight: '250px', overflow: 'auto' }}>
            <div className="alert-list">
              {staleClients.slice(0, 8).map((c) => {
                const days = getDaysSince(c.lastContactedAt);
                return (
                  <div
                    key={c.id}
                    className={`alert-item ${days > 14 ? 'urgent' : 'warning'}`}
                  >
                    <div
                      className="avatar avatar-sm"
                      style={{ background: stringToColor(c.companyName) }}
                    >
                      {getInitials(c.companyName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--weight-medium)',
                          color: 'var(--text-primary)',
                        }}
                        className="truncate"
                      >
                        {c.companyName}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Last contact: {days}d ago
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--weight-bold)',
                        color: days > 14 ? 'var(--danger)' : 'var(--warning)',
                      }}
                    >
                      {days}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RM Performance Table */}
      <div className="chart-card animate-fade-in-up stagger-7">
        <div className="chart-card-title">
          <Users size={16} color="var(--brand-primary-light)" />
          RM Performance Overview
        </div>
        <table className="renewal-table">
          <thead>
            <tr>
              <th>RM</th>
              <th>Active Deals</th>
              <th>Pipeline Value</th>
              <th>Clients</th>
              <th>Conversations (7d)</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {rms.map((rm) => {
              const rmDeals = deals.filter((d) => d.assignedRmId === rm.id);
              const rmClients = clients.filter((c) => c.assignedRmId === rm.id);
              const rmConvos = conversations.filter((c) => {
                const daysSince = getDaysSince(c.timestamp);
                return daysSince <= 7;
              });
              const pipelineVal = rmDeals.reduce((s, d) => s + (d.estimatedPremium || 0), 0);
              const convRate = rm.conversionRate || Math.floor(Math.random() * 30 + 20);

              return (
                <tr key={rm.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="avatar avatar-sm"
                        style={{ background: stringToColor(rm.name) }}
                      >
                        {getInitials(rm.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                          {rm.name}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {rm.territory}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>{rmDeals.filter((d) => d.stage !== 'policy_issued').length}</td>
                  <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--brand-primary-light)' }}>
                    {formatCurrency(pipelineVal)}
                  </td>
                  <td>{rmClients.length}</td>
                  <td>{Math.floor(rmConvos.length / rms.length)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar" style={{ width: '60px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${convRate}%`,
                            background: convRate >= 40
                              ? 'var(--success)'
                              : convRate >= 25
                              ? 'var(--warning)'
                              : 'var(--danger)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' }}>
                        {convRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
