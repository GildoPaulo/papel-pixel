import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  endDate: string;
}

export function Countdown({ endDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endDate]);

  if (expired) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-red-400">
      <Clock className="h-4 w-4 text-red-300" />
      <span className="text-red-100">Termina em:</span>
      <div className="flex gap-2">
        <span className="bg-red-600/30 px-2 py-1 rounded">{timeLeft.days}d</span>
        <span className="bg-red-600/30 px-2 py-1 rounded">{timeLeft.hours}h</span>
        <span className="bg-red-600/30 px-2 py-1 rounded">{timeLeft.minutes}m</span>
        <span className="bg-red-600/30 px-2 py-1 rounded">{timeLeft.seconds}s</span>
      </div>
    </div>
  );
}



