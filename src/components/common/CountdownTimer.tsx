import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeRemaining, setTimeRemaining] = useState("loading...");

  // Lógica para calcular el tiempo restante
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining("¡Tiempo expirado!");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div>
      <p>{timeRemaining}</p>
    </div>
  );
};

export default CountdownTimer;
