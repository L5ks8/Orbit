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
  const [user, setUser] = useState(null);
  
  const [punishmentType, setPunishmentType] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load appeal info
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
      .catch(() => setError("Failed to connect to the server."))
      .finally(() => setLoading(false));
  }, [customUrl]);

  // Load current Discord user session if authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/user', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => (res.ok ? res.json() : null))
      .then(u => {
        if (u && !u.error) setUser(u);
      })
      .catch(() => {});
  }, []);

  const handleLogin = () => {
    const loginUrl = `/auth/login?next=${encodeURIComponent(window.location.pathname)}&popup=1`;
    const w = 500;
    const h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(loginUrl, 'orbitlogin', `width=${w},height=${h},left=${left},top=${top},popup=yes`);
    if (popup) {
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          const token = localStorage.getItem('token');
          fetch('/api/user', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })
            .then(res => (res.ok ? res.json() : null))
            .then(u => {
              if (u && !u.error) {
                setUser(u);
                toast.success?.("Logged in successfully!") || toast("Logged in successfully!", "success");
              }
            });
        }
      }, 500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      return toast.error?.("Please log in with Discord first.") || toast("Please log in with Discord first.", "error");
    }

    setSubmitting(true);
    
    let reasonText = `**Punishment Type:** ${punishmentType}\n\n`;
    if (info?.questions && info.questions.length > 0) {
      info.questions.forEach((q, i) => {
        reasonText += `**${q}**\n${answers[i] || 'No answer provided.'}\n\n`;
      });
    } else {
      reasonText += `**Explanation:**\n${answers[0] || 'No answer provided.'}\n\n`;
    }

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    fetch(`/api/submit_appeal/${customUrl}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason: reasonText })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error?.(data.error) || toast(data.error, 'error');
        } else {
          setSuccess(true);
        }
      })
      .catch(() => {
        toast.error?.("An error occurred while submitting your appeal.") || toast("An error occurred while submitting your appeal.", 'error');
      })
      .finally(() => setSubmitting(false));
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-400">Loading appeal portal...</p>
        </div>
      </div>
    );
  }

  // Not Found / Error Screen
  if (error || !info) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-rose-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="w-full max-w-md p-8 rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-500/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Appeal Not Found</h2>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            {error || "We couldn't find an appeal portal with this URL. Please verify the link and try again."}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full h-11 px-5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 hover:text-white transition-all active:scale-[0.98]"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="w-full max-w-md p-8 rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Appeal Submitted!</h2>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            Your appeal has been successfully delivered to the <strong className="text-white">{info.guild_name}</strong> staff team. If accepted, you will receive an automatic notification and invite back on Discord.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full h-11 px-5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 hover:text-white transition-all active:scale-[0.98]"
          >
            Return to Orbit
          </button>
        </div>
      </div>
    );
  }

  // Main Appeal Form
  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glows & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Header / Brand Bar */}
      <header className="max-w-2xl mx-auto w-full pt-8 pb-4 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-neutral-400 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-neutral-700 transition-colors shadow-sm">
            <img
              src="/img/logo.png"
              alt="Orbit"
              className="w-5 h-5 rounded-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Orbit</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-medium text-neutral-400 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Official Appeal Portal
        </div>
      </header>

      {/* Main Content Card */}
      <main className="max-w-xl mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-center">
        {/* Server Header */}
        <div className="text-center mb-6">
          <div className="inline-block relative mb-3.5">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-md opacity-75" />
            {info.guild_icon ? (
              <img
                src={info.guild_icon}
                alt={info.guild_name}
                className="relative w-20 h-20 rounded-2xl ring-2 ring-neutral-700/80 shadow-2xl object-cover bg-neutral-900"
              />
            ) : (
              <div className="relative w-20 h-20 rounded-2xl ring-2 ring-neutral-700/80 bg-neutral-800 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                {info.guild_name?.charAt(0) || "S"}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Appeal to {info.guild_name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Please fill out this form honestly. The moderation team will review your case directly.
          </p>
        </div>

        {/* Appeal Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-7 space-y-5"
        >
          {/* Punishment Type */}
          {info.allowed_punishments && info.allowed_punishments.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                What type of punishment are you appealing? <span className="text-rose-400">*</span>
              </label>
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

          {/* Form Questions */}
          {info.questions && info.questions.length > 0 ? (
            info.questions.map((q, i) => (
              <div key={i} className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  <span className="text-neutral-500 mr-1.5">#{i + 1}</span>
                  {q} <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={answers[i] || ''}
                  onChange={e => setAnswers({ ...answers, [i]: e.target.value })}
                  required
                  placeholder="Your answer..."
                  rows={3}
                  className="w-full bg-neutral-800/60 hover:bg-neutral-800/80 focus:bg-neutral-800 border border-neutral-700/80 focus:border-neutral-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/40 transition-all resize-y min-h-[85px] leading-relaxed"
                />
              </div>
            ))
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Why should your punishment be revoked? <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={answers[0] || ''}
                onChange={e => setAnswers({ 0: e.target.value })}
                required
                placeholder="Explain what happened and why you believe your case should be reconsidered..."
                rows={4}
                className="w-full bg-neutral-800/60 hover:bg-neutral-800/80 focus:bg-neutral-800 border border-neutral-700/80 focus:border-neutral-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/40 transition-all resize-y min-h-[95px] leading-relaxed"
              />
            </div>
          )}

          {/* Discord Authentication Status */}
          <div className="pt-2">
            {user ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                      alt=""
                      className="w-8 h-8 rounded-full ring-1 ring-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                      {user.username?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.global_name || user.username}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      Authenticated as @{user.username}
                    </p>
                  </div>
                </div>
                <span className="flex-shrink-0 text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  Verified
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-800/30 border border-neutral-800 text-center space-y-3">
                <p className="text-xs text-neutral-400">
                  Please authenticate with Discord so the moderation team knows which user is submitting this appeal.
                </p>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Login with Discord to Appeal
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !user}
              className="w-full h-11 px-5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting Appeal...
                </>
              ) : (
                "Submit Appeal"
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-neutral-500">
        Powered by <span className="font-semibold text-neutral-400">Orbit</span> · Safe & Verified Appeals
      </footer>
    </div>
  );
}
