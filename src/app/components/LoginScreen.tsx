import { useState } from 'react';
import { Target, Lock, User, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-50 animate-pulse-slow" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to HuntLog
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Your intelligent job search companion
          </p>
        </div>

        {/* Login form */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
          <div className="relative bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 rounded-2xl border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 rounded-2xl border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="relative overflow-hidden p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/10 to-destructive/0 animate-shimmer" />
                    <p className="relative text-destructive text-sm text-center font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Track applications • Manage outreach • Stay organized
          </p>
        </div>
      </div>
    </div>
  );
}
