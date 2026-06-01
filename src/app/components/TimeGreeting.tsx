import { useEffect, useState } from 'react';
import { Coffee, Moon, Sun, Sunrise, Sunset, Clock } from 'lucide-react';

export default function TimeGreeting() {
  const [greeting, setGreeting] = useState({ message: '', submessage: '', icon: Clock });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      setCurrentTime(now);
      const hour = now.getHours();

      if (hour >= 0 && hour < 4) {
        setGreeting({
          message: "Burning the midnight oil?",
          submessage: "Even job hunting needs beauty sleep 💤",
          icon: Moon,
        });
      } else if (hour >= 4 && hour < 6) {
        setGreeting({
          message: "The early bird gets the worm!",
          submessage: "Your dedication is impressive 🌟",
          icon: Sunrise,
        });
      } else if (hour >= 6 && hour < 12) {
        setGreeting({
          message: "Good morning!",
          submessage: "Time to hunt for those opportunities ☕",
          icon: Coffee,
        });
      } else if (hour >= 12 && hour < 17) {
        setGreeting({
          message: "Good afternoon!",
          submessage: "Keep that momentum going 🚀",
          icon: Sun,
        });
      } else if (hour >= 17 && hour < 21) {
        setGreeting({
          message: "Good evening!",
          submessage: "Wrapping up the day strong 💪",
          icon: Sunset,
        });
      } else {
        setGreeting({
          message: "Late night hustle?",
          submessage: "Remember to take breaks too 🌙",
          icon: Moon,
        });
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const Icon = greeting.icon;

  return (
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/20">
        <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-2xl font-bold">{greeting.message}</h2>
        <p className="text-sm text-muted-foreground mt-1">{greeting.submessage}</p>
      </div>
    </div>
  );
}
