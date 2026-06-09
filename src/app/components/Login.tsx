import { useState, useEffect, useRef } from 'react';
import { Lock, User, Loader2, TrendingUp, Target, CheckCircle, Zap, ArrowRight, HelpCircle, ExternalLink, ArrowLeft, X } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onCheckUser: (username: string) => Promise<boolean>;
}

type Step = 'username' | 'password' | 'not_found';

export default function Login({ onLogin, onCheckUser }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('username');
  const [currentFeature, setCurrentFeature] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showForgotPopup, setShowForgotPopup] = useState(false);

  const features = [
    { icon: Target, title: 'Track Applications', desc: 'Never miss an opportunity' },
    { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Visualize your progress' },
    { icon: CheckCircle, title: 'Follow-up Reminders', desc: 'Stay on top of deadlines' },
    { icon: Zap, title: 'Quick Actions', desc: 'Add entries in seconds' },
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Floating Particles - fewer on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding (Desktop only) */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/50 animate-bounce" style={{ animationDuration: '3s' }}>
                <Target className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                  HuntLog
                </h1>
                <p className="text-lg text-white/80 mt-1">Your Job Search Companion</p>
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Everything you need to land your dream job</h2>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
                    index === currentFeature
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 scale-105'
                      : 'bg-background/5 border border-border/20 opacity-60'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-all ${
                    index === currentFeature
                      ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    <feature.icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-all ${
                      index === currentFeature ? 'text-white' : 'text-white/60'
                    }`}>{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          {/* Desktop: card with border */}
          <div className="lg:bg-background/80 lg:backdrop-blur-2xl lg:rounded-3xl lg:border lg:border-border/60 lg:shadow-2xl lg:shadow-primary/20 lg:p-8 relative overflow-hidden">
            {/* Decorative gradient - desktop only */}
            <div className="hidden lg:block absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-accent" />
            
            {/* Mobile Header: compact logo + branding */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
                <Target className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                HuntLog
              </h1>
              <p className="text-xs text-white/60 mt-1">Your Job Search Companion</p>
            </div>

            {/* Step: Username */}
            {step === 'username' && (
              <>
                <div className="text-center mb-5 sm:mb-8">
                  <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white lg:text-foreground">Sign in</h1>
                  <p className="text-sm text-white/60 lg:text-muted-foreground">Enter your username to get started</p>
                </div>

                <form onSubmit={handleUsernameSubmit} className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-white/70 lg:text-foreground/80">Username</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/40 lg:text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-white/10 lg:border-border/60 bg-white/5 lg:bg-background/50 text-white lg:text-foreground placeholder:text-white/30 lg:placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="Enter your username"
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Mobile: mini feature ticker */}
                <div className="lg:hidden mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-3 justify-center">
                    {(() => {
                      const Feature = features[currentFeature];
                      return (
                        <div className="flex items-center gap-2.5 animate-fade-in">
                          <div className="p-1.5 rounded-lg bg-primary/20">
                            <Feature.icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                          </div>
                          <span className="text-xs text-white/60">
                            <span className="text-white/80 font-medium">{Feature.title}</span> — {Feature.desc}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}

            {/* Step: Password (user exists) */}
            {step === 'password' && (
              <>
                <div className="text-center mb-5 sm:mb-8">
                  <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white lg:text-foreground">Welcome back, {username}!</h1>
                  <p className="text-sm text-white/60 lg:text-muted-foreground">Enter your password to continue</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-white/70 lg:text-foreground/80">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/40 lg:text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        ref={passwordRef}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-white/10 lg:border-border/60 bg-white/5 lg:bg-background/50 text-white lg:text-foreground placeholder:text-white/30 lg:placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0 pt-1">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/50 lg:text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Different username
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPopup(true)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/50 lg:text-muted-foreground hover:text-primary transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Forgot password?
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step: User not found */}
            {step === 'not_found' && (
              <>
                <div className="text-center mb-5 sm:mb-6">
                  <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3 sm:mb-4">
                    <User className="w-6 sm:w-8 h-6 sm:h-8 text-amber-500" />
                  </div>
                  <h1 className="text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2 text-white lg:text-foreground">Username not found</h1>
                  <p className="text-xs sm:text-sm text-white/60 lg:text-muted-foreground">
                    <span className="font-semibold text-white/80 lg:text-foreground">"{username}"</span> is not registered on HuntLog.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 lg:bg-primary/5 border border-white/10 lg:border-primary/20 space-y-3 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-white/70 lg:text-foreground/80 text-center">
                    HuntLog is currently in early access. Visit our website to request an invite.
                  </p>
                  <a
                    href="https://rounakjha.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group text-sm"
                  >
                    Get Early Access
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-white/10 lg:border-border/60 text-white/70 lg:text-foreground/80 font-medium hover:bg-white/5 lg:hover:bg-background/80 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Try a different username
                </button>
              </>
            )}

            {/* Footer - desktop only */}
            <div className="hidden lg:block mt-8 text-center text-sm text-muted-foreground">
              <p>Track your job hunt journey with confidence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Popup */}
      {showForgotPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForgotPopup(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowForgotPopup(false)}
              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-background/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center justify-center w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-primary/10 border border-primary/20">
                <HelpCircle className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">Forgot your password?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please send a password reset request to:
              </p>
              <p className="text-primary font-semibold text-sm sm:text-base">rounakjha5@gmail.com</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Include your username in the email and we'll get back to you shortly.
              </p>
            </div>
            <button
              onClick={() => setShowForgotPopup(false)}
              className="w-full mt-4 sm:mt-5 py-2.5 px-4 rounded-xl border border-border/60 text-foreground/80 font-medium hover:bg-background/80 transition-all text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
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
        .animate-float {
          animation: float ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
