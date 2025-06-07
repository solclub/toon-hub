import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  isSuccess: boolean;
  onHide: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, isSuccess, onHide }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onHide();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onHide]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute right-4 top-4 rounded-lg bg-gray-800 bg-opacity-90 px-4 py-2 text-2xl font-bold transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className={isSuccess ? "text-green-400" : "text-red-400"}>{message}</span>
    </div>
  );
};

export default Notification;
