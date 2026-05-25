import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCallTimer, getInitials, stringToColor } from '../../utils/helpers';
import { Phone, PhoneOff, Mic, MicOff, Sparkles } from 'lucide-react';

export default function CallSimulator() {
  const { state, dispatch, showToast } = useApp();
  const { showCallSimulator, callSimulatorData } = state;
  const [callState, setCallState] = useState('ringing'); // ringing, active, ended
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    if (!showCallSimulator) {
      setCallState('ringing');
      setTimer(0);
      setIsMuted(false);
      setAiSummary(null);
      return;
    }

    // Auto-ring sound simulation
    let interval;
    if (callState === 'active') {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [showCallSimulator, callState]);

  if (!showCallSimulator || !callSimulatorData) return null;

  const handleAccept = () => {
    setCallState('active');
    setTimer(0);
  };

  const handleDecline = () => {
    dispatch({ type: 'HIDE_CALL_SIMULATOR' });
  };

  const handleEnd = () => {
    setCallState('ended');
    // Generate AI summary
    setTimeout(() => {
      setAiSummary(
        `${callSimulatorData.clientName} discussed renewal of their existing Fire & Perils policy. Client expressed interest in reviewing the premium for the upcoming term. They also mentioned expanding operations to a new warehouse in Pune and asked about coverage for the new location. Follow-up needed: Send revised quote with multi-location coverage by Thursday.`
      );
    }, 1500);
  };

  const handleSaveSummary = () => {
    showToast('Call summary saved to deal record', 'success');
    dispatch({ type: 'HIDE_CALL_SIMULATOR' });
  };

  return (
    <div className="call-simulator-overlay">
      <div className="call-simulator">
        {/* Avatar */}
        <div
          className="call-simulator-avatar"
          style={{
            background: stringToColor(callSimulatorData.clientName),
            animation: callState === 'ringing' ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {getInitials(callSimulatorData.clientName)}
        </div>

        {/* Name */}
        <div className="call-simulator-name">{callSimulatorData.clientName}</div>
        <div className="call-simulator-status">
          {callSimulatorData.company}
        </div>

        {/* Status text */}
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: callState === 'ringing' ? 'var(--success)' : callState === 'ended' ? 'var(--text-muted)' : 'var(--text-secondary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {callState === 'ringing' && (
            <span className="animate-pulse">
              {callSimulatorData.direction === 'incoming' ? '📞 Incoming Call...' : '📞 Calling...'}
            </span>
          )}
          {callState === 'active' && 'Connected'}
          {callState === 'ended' && 'Call Ended'}
        </div>

        {/* Timer */}
        {callState !== 'ringing' && (
          <div className="call-simulator-timer">
            {formatCallTimer(timer)}
          </div>
        )}

        {/* AI Summary (after call ends) */}
        {callState === 'ended' && aiSummary && (
          <div
            style={{
              textAlign: 'left',
              padding: 'var(--space-3)',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--brand-primary)',
              marginBottom: 'var(--space-6)',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--brand-primary-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-1)',
              }}
            >
              <Sparkles size={10} style={{ display: 'inline', marginRight: '4px' }} />
              AI Call Summary
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {aiSummary}
            </p>
          </div>
        )}

        {callState === 'ended' && !aiSummary && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div className="typing-indicator" style={{ justifyContent: 'center' }}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              Generating AI summary...
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="call-simulator-actions">
          {callState === 'ringing' && (
            <>
              <button className="call-action-btn decline" onClick={handleDecline}>
                <PhoneOff size={24} />
              </button>
              <button className="call-action-btn accept" onClick={handleAccept}>
                <Phone size={24} />
              </button>
            </>
          )}

          {callState === 'active' && (
            <>
              <button
                className={`call-action-btn mute`}
                onClick={() => setIsMuted(!isMuted)}
                style={{ background: isMuted ? 'var(--danger-faint)' : 'var(--bg-overlay)' }}
              >
                {isMuted ? <MicOff size={20} color="var(--danger)" /> : <Mic size={20} />}
              </button>
              <button className="call-action-btn decline" onClick={handleEnd}>
                <PhoneOff size={24} />
              </button>
            </>
          )}

          {callState === 'ended' && aiSummary && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveSummary}>
                Save Summary
              </button>
              <button className="btn btn-ghost" onClick={handleDecline}>
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
