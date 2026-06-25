import { useEffect, useState } from 'react';

export default function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = setInterval(update, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
