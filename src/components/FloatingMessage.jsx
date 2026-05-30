import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const FloatingMessage = ({ message, icon, duration = 1500, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) setTimeout(onComplete, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return createPortal(
    <div className="fixed left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-float-up-fast pointer-events-none">
      <div className="flex flex-col items-center gap-1 bg-black/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-yellow-400/40 shadow-2xl">
        {icon && <span className="text-3xl">{icon}</span>}
        <span className="font-black text-white text-lg whitespace-nowrap">{message}</span>
      </div>
    </div>,
    document.body
  );
};

export default FloatingMessage;