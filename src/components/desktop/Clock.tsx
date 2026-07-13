'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="taskbar-clock flex flex-col items-center"
      whileHover={{ scale: 1.02 }}
      title={date}
      style={{ lineHeight: 1.2, padding: '2px 8px', fontSize: '11px', minWidth: '70px' }}
    >
      <span>{time}</span>
      <span style={{ fontSize: '9px', opacity: 0.8 }}>{date}</span>
    </motion.div>
  );
}
