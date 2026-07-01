import { useState, useEffect, useRef } from 'react';
import { Lock, User, Loader2, TrendingUp, Target, CheckCircle, Zap, ArrowRight, HelpCircle, ExternalLink, ArrowLeft, X, Mail, Bell } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onCheckUser: (username: string) => Promise<boolean>;
  onTrial: () => void;
}

type Step = 'username' | 'password' | 'not_found';

export default function Login({ onLogin, onCheckUser, onTrial }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('username');
  const [currentFeature, setCurrentFeature] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showForgotPopup, setShowForgotPopup] = useState(false);

  const features = [
    { icon: Target,      title: 'Track Applications',   desc: 'Never miss an opportunity',    color: 'from-violet-500 to-indigo-500' },
    { icon: TrendingUp,  title: 'Analytics Dashboard',  desc: 'Visualize your progress',      color: 'from-indigo-500 to-blue-500'  },
    { icon: Bell,        title: 'Follow-up Reminders',  desc: 'Stay on top of deadlines',     color: 'from-blue-500 to-cyan-500'    },
    { icon: Zap,         title: 'Quick Actions',        desc: 'Add entries in seconds',       color: 'from-purple-500 to-violet-500'},
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 'password' && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [step]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    setIsLoading(true);
    setError('');
    const exists = await onCheckUser(username.trim());
    if (exists) {
      setStep('password');
    } else {
      setStep('not_found');
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setIsLoading(true);
    setError('');
    const success = await onLogin(username.trim(), password);
    if (!success) {
      setError('Incorrect password. Please try again.');
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    setStep('username');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1040] to-[#24243e] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[480px] h-[480px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[480px] h-[480px] bg-indigo-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[160px]" />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 === 0 ? 'rgba(139,92,246,0.4)' : 'rgba(99,102,241,0.35)',
              left: `${(i * 6.25) % 100}%`,
              top: `${(i * 13 + 7) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">

        {/* ─── Left Side — Branding ─── */}
        <div className="hidden lg:flex flex-col gap-10">

          {/* Logo + wordmark */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-xl opacity-60" />
              <div className="relative w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/40">
                <Target className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent leading-none">
                HuntLog
              </h1>
              <p className="text-sm text-white/50 mt-1 font-medium">Your Job Search Companion</p>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Everything you need to<br />
              <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">land your dream job</span>
            </h2>
            <p className="mt-3 text-white/40 text-sm leading-relaxed max-w-xs">
              Track every application, follow up at the right time, and never let an opportunity slip through the cracks.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map((feature, index) => {
              const isActive = index === currentFeature;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-500 ${
                    isActive
                      ? 'bg-white/8 border-white/15 shadow-lg shadow-black/20 scale-[1.02]'
                      : 'bg-white/3 border-white/6 opacity-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.color} shrink-0 shadow-md ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <feature.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm transition-all ${isActive ? 'text-white' : 'text-white/60'}`}>
                      {feature.title}
                    </p>
                    <p className="text-xs text-white/40">{feature.desc}</p>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFeature(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentFeature ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── Right Side — Login Card ─── */}
        <div className="w-full max-w-sm mx-auto">
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-xl" />

            <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

              <div className="p-7 sm:p-8">

                {/* Mobile logo */}
                <div className="lg:hidden flex flex-col items-center mb-7">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-lg opacity-50" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">HuntLog</h1>
                  <p className="text-[11px] text-gray-400 mt-0.5">Your Job Search Companion</p>
                </div>

                {/* ── Step: Username ── */}
                {step === 'username' && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                      <p className="text-sm text-gray-500 mt-1">Enter your username to get started</p>
                    </div>

                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Username</label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm"
                            placeholder="Enter your username"
                            autoComplete="username"
                            autoFocus
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium animate-shake">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group text-sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Trial option */}
                    <div className="mt-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <button
                        type="button"
                        onClick={onTrial}
                        className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all flex items-center justify-center gap-2 text-sm group"
                      >
                        <Zap className="w-4 h-4 text-amber-500 group-hover:text-violet-500 transition-colors" strokeWidth={2.5} />
                        Try HuntLog — no sign up needed
                      </button>
                    </div>

                    {/* Mobile feature ticker */}
                    <div className="lg:hidden mt-5 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-2.5 animate-fade-in">
                        {(() => {
                          const Feature = features[currentFeature];
                          return (
                            <>
                              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${Feature.color}`}>
                                <Feature.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                              </div>
                              <span className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{Feature.title}</span> — {Feature.desc}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <p className="mt-5 text-center text-[11px] text-gray-400">
                      Track your job hunt journey with confidence
                    </p>
                  </>
                )}

                {/* ── Step: Password ── */}
                {step === 'password' && (
                  <>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 mb-3">
                        <User className="w-6 h-6 text-violet-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Signing in as <span className="font-semibold text-gray-700">{username}</span>
                      </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                          <input
                            ref={passwordRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium animate-shake">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group text-sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Different username
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForgotPopup(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          Forgot password?
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* ── Step: User not found ── */}
                {step === 'not_found' && (
                  <>
                    <div className="text-center mb-5">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200 mb-3">
                        <User className="w-7 h-7 text-amber-500" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Username not found</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-semibold text-gray-700">"{username}"</span> isn't registered on HuntLog.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 space-y-3 mb-4">
                      <p className="text-xs text-gray-600 text-center">
                        HuntLog is currently in early access. Visit our website to request an invite.
                      </p>
                      <a
                        href="https://rounakjha.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:from-violet-500 hover:to-indigo-500 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 group text-sm"
                      >
                        Get Early Access
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Try a different username
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForgotPopup(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForgotPopup(false)}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100">
                <Mail className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Forgot your password?</h3>
              <p className="text-sm text-gray-500">
                Send a password reset request to:
              </p>
              <p className="text-violet-600 font-semibold text-sm">rounakjha5@gmail.com</p>
              <p className="text-xs text-gray-400">
                Include your username in the email and we'll get back to you shortly.
              </p>
            </div>
            <button
              onClick={() => setShowForgotPopup(false)}
              className="w-full mt-5 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(8px); opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float ease-in-out infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}
