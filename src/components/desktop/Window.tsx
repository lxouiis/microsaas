'use client';
import { useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { useSound } from '@/hooks/useSound';

interface WindowProps {
  id: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isFocused: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}

export default function Window({
  id,
  title,
  icon,
  isMinimized,
  isFocused,
  position,
  size,
  zIndex,
  children,
  onClose,
  onMinimize,
  onFocus,
}: WindowProps) {
  const { updatePosition } = useWindowStore();
  const sounds = useSound();
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Drag logic via native mouse events for performance
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.xp-btn')) return;
    isDragging.current = true;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: position.x,
      winY: position.y,
    };
    onFocus();
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      const newX = Math.max(0, Math.min(dragStart.current.winX + dx, window.innerWidth - 120));
      const newY = Math.max(0, Math.min(dragStart.current.winY + dy, window.innerHeight - 80));
      updatePosition(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, updatePosition]);

  const handleClose = () => {
    sounds.windowClose();
    onClose();
  };

  if (isMinimized) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        className="xp-window absolute select-none"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex,
        }}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onMouseDown={onFocus}
      >
        {/* Title Bar */}
        <div
          className={`xp-titlebar ${!isFocused ? 'xp-titlebar-inactive' : ''}`}
          onMouseDown={handleTitleBarMouseDown}
        >
          <div className="xp-titlebar-text">
            <span className="text-lg">{icon}</span>
            <span>{title}</span>
          </div>
          <div className="xp-window-buttons">
            <motion.button
              className="xp-btn xp-btn-min"
              onClick={onMinimize}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Minimize"
            >
              _
            </motion.button>
            <motion.button
              className="xp-btn xp-btn-close"
              onClick={handleClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Close"
            >
              ×
            </motion.button>
          </div>
        </div>

        {/* Window Content */}
        <div
          className="overflow-hidden"
          style={{
            height: size.height - 33, // subtract titlebar height
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
