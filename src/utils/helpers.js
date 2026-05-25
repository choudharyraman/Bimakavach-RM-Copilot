/* Helper utilities for BimaKavach RM Copilot */

/**
 * Format amount in Indian Rupee notation (₹1,23,456)
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    return '₹' + (num / 10000000).toFixed(2) + ' Cr';
  }
  if (num >= 100000) {
    return '₹' + (num / 100000).toFixed(2) + ' L';
  }
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * Format full currency without abbreviation
 */
export function formatCurrencyFull(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/**
 * Format date as DD MMM YYYY
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format time as hh:mm AM/PM
 */
export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format relative time (just now, 5m ago, 2h ago, yesterday, DD MMM)
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds) {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

/**
 * Format call timer display (MM:SS)
 */
export function formatCallTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get number of days until a date
 */
export function getDaysUntil(date) {
  if (!date) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Get number of days since a date
 */
export function getDaysSince(date) {
  if (!date) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.floor((now - target) / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text to max length
 */
export function truncateText(text, maxLen = 50) {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '…';
}

/**
 * Group array items by a key
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const val = typeof key === 'function' ? key(item) : item[key];
    (groups[val] = groups[val] || []).push(item);
    return groups;
  }, {});
}

/**
 * Sort array by date key
 */
export function sortByDate(array, key, descending = true) {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return descending ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Generate a consistent color from a string (for avatars)
 */
export function stringToColor(str) {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#e11d48', '#84cc16',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get urgency level and color based on days until expiry
 */
export function getRenewalUrgency(daysUntil) {
  if (daysUntil <= 0) return { level: 'overdue', color: '#ef4444', label: 'Overdue' };
  if (daysUntil <= 7) return { level: 'critical', color: '#ef4444', label: 'Critical' };
  if (daysUntil <= 15) return { level: 'high', color: '#f59e0b', label: 'High' };
  if (daysUntil <= 30) return { level: 'medium', color: '#06b6d4', label: 'Medium' };
  if (daysUntil <= 60) return { level: 'low', color: '#10b981', label: 'Low' };
  return { level: 'normal', color: '#64748b', label: 'Normal' };
}

/**
 * Get stage probability
 */
export function getStageProbability(stage) {
  const probs = {
    lead: 10,
    needs_assessment: 20,
    quote_requested: 30,
    quote_sent: 45,
    negotiation: 60,
    verbal_confirmation: 80,
    documents_submitted: 90,
    underwriting: 95,
    policy_issued: 100,
  };
  return probs[stage] || 0;
}

/**
 * Create a date relative to today
 */
export function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Create a date relative to today (in the past)
 */
export function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Create a date with specific hours from today
 */
export function hoursAgo(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

/**
 * Create a date with specific minutes from today
 */
export function minutesAgo(minutes) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d;
}
