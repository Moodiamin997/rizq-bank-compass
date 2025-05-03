
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerDisplayProps {
  startTime: number;
  maxHours?: number;
}

const TimerDisplay = ({ startTime, maxHours = 24 }: TimerDisplayProps) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isUnderOneHour, setIsUnderOneHour] = useState<boolean>(false);

  useEffect(() => {
    const maxTime = maxHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const oneHour = 60 * 60 * 1000; // One hour in milliseconds
    
    // Calculate initial elapsed time (in case the component is mounted after the timer started)
    const initialElapsed = Math.min(Date.now() - startTime, maxTime);
    setElapsed(initialElapsed);
    setIsExpired(initialElapsed >= maxTime);
    setIsUnderOneHour(maxTime - initialElapsed < oneHour);
    
    // Update timer every second
    const interval = setInterval(() => {
      const newElapsed = Date.now() - startTime;
      const remainingTime = maxTime - newElapsed;
      
      if (newElapsed >= maxTime) {
        setElapsed(maxTime);
        setIsExpired(true);
        setIsUnderOneHour(false);
        clearInterval(interval);
      } else {
        setElapsed(newElapsed);
        setIsUnderOneHour(remainingTime < oneHour);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, maxHours]);

  // Format elapsed time into hours:minutes:seconds
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-500' : isUnderOneHour ? 'text-red-500' : 'text-gray-400'}`}>
      <Clock size={12} />
      <span>{formatTime(elapsed)}</span>
      {isExpired && <span className="font-bold">(Expired)</span>}
    </div>
  );
};

export default TimerDisplay;
