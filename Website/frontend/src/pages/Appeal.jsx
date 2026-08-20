import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomSelect from '../components/ui/CustomSelect';
import { useToast } from '../components/ui/Toast';

export default function Appeal() {
  const { customUrl } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  
  const [punishmentType, setPunishmentType] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/appeal_info/${customUrl}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setInfo(data);
          if (data.allowed_punishments && data.allowed_punishments.length > 0) {
            setPunishmentType(data.allowed_punishments[0].value || data.allowed_punishments[0]);
          }
        }
      })
      .catch(err => setError("Failed to connect to the server."))
      .finally(() => setLoading(false));
  }, [customUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Format answers into a single reason string
    let reasonText = `**Punishment Type:** ${punishmentType}\n\n`;
    info.questions.forEach((q, i) => {
      reasonText += `**${q}**\n${answers[i] || 'No answer provided.'}\n\n`;
    });

    fetch(`/api/submit_appeal/${customUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reasonText })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast(data.error, 'error');
        } else {
          setSuccess(true);
        }
      })
      .catch(err => toast("An error occurred while submitting your appeal.", 'error'))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#fff' }}>
        <p>Loading appeal information...</p>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#fff' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--status-danger)' }}>Not Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error || "We couldn't find an appeal page with this URL. Please check the link and try again."}</p>
          <button onClick={() => navigate('/')} className="dash-btn secondary" style={{ marginTop: '24px', width: '100%' }}>Return Home</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#fff' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Appeal Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Your appeal has been successfully sent to the <strong>{info.guild_name}</strong> moderation team. You will be notified via Discord if your appeal is accepted.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: '#fff', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {info.guild_icon ? (
            <img src={info.guild_icon} alt={info.guild_name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', border: '2px solid rgba(255,255,255,0.1)' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-elevated)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {info.guild_name.charAt(0)}
            </div>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Appeal to {info.guild_name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Please fill out the form below honestly. The moderation team will review your case as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-elevated)', padding: '32px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          {info.allowed_punishments && info.allowed_punishments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>What type of punishment are you appealing? <span style={{color: 'var(--status-danger)'}}>*</span></label>
              <CustomSelect 
                options={info.allowed_punishments.map(pt => ({
                  value: pt.value || pt,
                  label: pt.label || pt.value || pt
                }))}
                value={punishmentType} 
                onChange={setPunishmentType} 
                placeholder="Select punishment type..."
              />
            </div>
          )}

          {info.questions && info.questions.length > 0 ? (
            info.questions.map((q, i) => (
              <div key={i} style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>{q} <span style={{color: 'var(--status-danger)'}}>*</span></label>
                <textarea 
                  value={answers[i] || ''}
                  onChange={e => setAnswers({...answers, [i]: e.target.value})}
                  required
                  placeholder="Your answer..."
                  rows={4}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: 'rgba(0,0,0,0.2)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '6px', 
                    color: '#fff',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            ))
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Why should your punishment be revoked? <span style={{color: 'var(--status-danger)'}}>*</span></label>
              <textarea 
                value={answers[0] || ''}
                onChange={e => setAnswers({0: e.target.value})}
                required
                placeholder="Explain what happened..."
                rows={6}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', outline: 'none', resize: 'vertical' }}
              />
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <button 
              type="submit" 
              disabled={submitting}
              className="dash-btn primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '600' }}
            >
              {submitting ? 'Submitting Appeal...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
