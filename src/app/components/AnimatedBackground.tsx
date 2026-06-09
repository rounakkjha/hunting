export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full animate-grid-flow" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
          </defs>
          <rect width="200%" height="200%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] bg-accent/10 rounded-full animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-2/3 right-1/3 w-[300px] h-[300px] bg-primary/10 rounded-full animate-glow-pulse" style={{ animationDelay: '3s' }} />

      {/* Animated wire paths */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 0 200 Q 200 100 400 200 T 800 200 T 1200 200 T 1600 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="8 12"
          className="text-primary animate-wire-move"
        />
        <path
          d="M 0 400 Q 300 300 600 400 T 1200 400 T 1800 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 14"
          className="text-accent animate-wire-move"
          style={{ animationDelay: '2s' }}
        />
        <path
          d="M 0 600 Q 250 500 500 600 T 1000 600 T 1500 600 T 2000 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="10 10"
          className="text-primary animate-wire-move"
          style={{ animationDelay: '4s' }}
        />
        <path
          d="M 200 0 Q 300 200 200 400 T 200 800"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="5 15"
          className="text-accent animate-wire-move"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M 800 0 Q 700 300 800 600 T 800 1000"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="8 12"
          className="text-primary animate-wire-move"
          style={{ animationDelay: '3s' }}
        />
      </svg>

      {/* Pulsing connection dots at intersections */}
      <div className="absolute top-[200px] left-[400px] w-2 h-2 bg-primary/40 rounded-full animate-dot-pulse" />
      <div className="absolute top-[400px] left-[600px] w-1.5 h-1.5 bg-accent/50 rounded-full animate-dot-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[300px] right-[300px] w-2 h-2 bg-primary/30 rounded-full animate-dot-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[200px] left-[200px] w-1.5 h-1.5 bg-primary/40 rounded-full animate-dot-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[500px] right-[500px] w-2 h-2 bg-accent/30 rounded-full animate-dot-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[150px] left-[800px] w-1.5 h-1.5 bg-primary/50 rounded-full animate-dot-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Orbiting particle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-orbit">
          <div className="w-1.5 h-1.5 bg-primary/50 rounded-full shadow-lg shadow-primary/20" />
        </div>
      </div>
      <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-orbit" style={{ animationDuration: '40s', animationDirection: 'reverse' }}>
          <div className="w-1 h-1 bg-accent/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
