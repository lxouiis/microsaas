'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MailConfig } from '@/lib/types';

interface MailAppProps {
  config: MailConfig;
}

export default function MailApp({ config }: MailAppProps) {
  const [view, setView] = useState<'list' | 'reading'>('list');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTypewriter = () => {
    if (isTyping || typingDone) return;
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < config.body.length) {
        setDisplayedText(config.body.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalRef.current!);
        setIsTyping(false);
        setTypingDone(true);
      }
    }, 18);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex h-full" style={{ fontFamily: 'var(--font-nunito)' }}>
      {/* Folder tree */}
      <div className="mail-folder-tree" style={{ minWidth: 130 }}>
        <div className="mail-folder-item" style={{ fontWeight: 700, fontSize: 11, color: '#444', padding: '8px 8px 4px' }}>
          📬 Local Folders
        </div>
        {[
          { label: '📥 Inbox (1)', active: true },
          { label: '📤 Sent', active: false },
          { label: '📁 Drafts', active: false },
          { label: '🗑️ Deleted', active: false },
        ].map((f) => (
          <div key={f.label} className={`mail-folder-item ${f.active ? 'active' : ''}`}>
            {f.label}
          </div>
        ))}
      </div>

      {/* Email list */}
      <div className="mail-list" style={{ width: 200 }}>
        <div style={{ background: '#DDD8C8', padding: '3px 8px', fontSize: 10, color: '#555', borderBottom: '1px solid #C0B8A8', fontWeight: 600 }}>
          From / Subject / Date
        </div>
        <div
          className={`mail-item unread ${view === 'reading' ? 'selected' : ''}`}
          onClick={() => {
            setView('reading');
            setTimeout(startTypewriter, 300);
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700 }}>{config.fromName}</div>
          <div style={{ fontSize: 11 }}>{config.subject}</div>
          <div style={{ fontSize: 9, color: view === 'reading' ? 'rgba(255,255,255,0.7)' : '#AAA' }}>Just now</div>
        </div>
      </div>

      {/* Reading pane */}
      <div className="mail-preview flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
              style={{ color: '#888', fontSize: 13 }}
            >
              <div className="text-4xl mb-3">📧</div>
              <div>Click a message to read it</div>
              <div style={{ fontSize: 11, marginTop: 4, color: '#AAA' }}>You have 1 unread message</div>
            </motion.div>
          ) : (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Email header */}
              <div style={{ borderBottom: '1px solid #DDD', paddingBottom: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 6 }}>
                  {config.subject}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', fontSize: 11, color: '#666' }}>
                  <span style={{ fontWeight: 600 }}>From:</span>
                  <span>{config.fromName}</span>
                  <span style={{ fontWeight: 600 }}>To:</span>
                  <span>You 💌</span>
                  <span style={{ fontWeight: 600 }}>Date:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Email body with typewriter */}
              <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#1A1A1A' }}>
                {displayedText}
                {isTyping && <span className="typewriter-cursor" />}
              </div>

              {/* Photo if present */}
              {config.photoUrl && typingDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ marginTop: 16 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.photoUrl}
                    alt="Attached photo"
                    style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '2px 2px 8px rgba(0,0,0,0.15)' }}
                  />
                </motion.div>
              )}

              {/* Signature */}
              {typingDone && config.signature && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    marginTop: 24,
                    paddingTop: 12,
                    borderTop: '1px solid #EEE',
                    fontFamily: 'var(--font-hand)',
                    fontSize: 15,
                    color: '#888',
                  }}
                >
                  {config.signature}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
