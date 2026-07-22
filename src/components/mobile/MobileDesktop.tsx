'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DesktopConfig, AppType } from '@/lib/types';
import MailApp from '@/components/apps/MailApp';
import GachaApp from '@/components/apps/GachaApp';
import MixtapeApp from '@/components/apps/MixtapeApp';
import TicketApp from '@/components/apps/TicketApp';
import PhotosApp from '@/components/apps/PhotosApp';
import CalendarApp from '@/components/apps/CalendarApp';
import SecretApp from '@/components/apps/SecretApp';
import KittenCanvas from '@/components/apps/KittenCanvas';

interface MobileDesktopProps {
  config: DesktopConfig;
}

const APP_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  mail:     { icon: '💌', label: 'Letter',   color: '#FF6B8A', bg: '#FFF0F3' },
  gacha:    { icon: '🎰', label: 'Gacha',    color: '#9B59B6', bg: '#F5F0FF' },
  mixtape:  { icon: '🎵', label: 'Mixtape',  color: '#3B82F6', bg: '#EFF6FF' },
  ticket:   { icon: '🎟', label: 'Invite',   color: '#F59E0B', bg: '#FFFBEB' },
  photos:   { icon: '📸', label: 'Photos',   color: '#10B981', bg: '#ECFDF5' },
  calendar: { icon: '📅', label: 'Calendar', color: '#EF4444', bg: '#FEF2F2' },
  secret:   { icon: '🔒', label: 'Secret',   color: '#64748B', bg: '#F8FAFC' },
  purr:     { icon: '🐱', label: 'Cat Purr', color: '#F97316', bg: '#FFF7ED' },
};

function renderApp(appType: AppType, config: DesktopConfig) {
  const cfg = config.apps[appType]?.config || {};
  switch (appType) {
    case 'mail':     return <MailApp config={cfg as any} />;
    case 'gacha':    return <GachaApp config={cfg as any} />;
    case 'mixtape':  return <MixtapeApp config={cfg as any} />;
    case 'ticket':   return <TicketApp config={cfg as any} />;
    case 'photos':   return <PhotosApp config={cfg as any} />;
    case 'calendar': return <CalendarApp config={cfg as any} />;
    case 'secret':   return <SecretApp config={cfg as any} />;
    case 'purr':     return <KittenCanvas config={cfg as any} />;
    default: return null;
  }
}

// Floating particles on home screen
function Particle({ delay, x, emoji }: { delay: number; x: number; emoji: string }) {
  return (
    <motion.div
      initial={{ y: '110vh', opacity: 0.7 }}
      animate={{ y: '-10vh', opacity: [0.7, 1, 0.7, 0] }}
      transition={{ duration: 6 + Math.random() * 4, delay, repeat: Infinity, ease: 'linear' }}
      style={{ position: 'absolute', left: `${x}%`, fontSize: 18, pointerEvents: 'none', zIndex: 0 }}
    >
      {emoji}
    </motion.div>
  );
}

export default function MobileDesktop({ config }: MobileDesktopProps) {
  const [openApp, setOpenApp] = useState<AppType | null>(null);
  const [booted, setBooted] = useState(false);
  const [bootLine, setBootLine] = useState(0);

  const enabledApps = (Object.keys(config.apps) as AppType[]).filter(k => config.apps[k]?.enabled);

  // Simple 3-step boot
  useEffect(() => {
    const steps = [800, 1600, 2400, 3000];
    const timers = steps.map((ms, i) =>
      setTimeout(() => {
        if (i < 3) setBootLine(i + 1);
        else setBooted(true);
      }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const particles = ['✨','🌸','💫','⭐','🎀','🌟','💖'];

  return (
    <div style={{ width: '100%', minHeight: '100dvh', overflowX: 'hidden', background: '#F0EBF8', fontFamily: 'var(--font-nunito, system-ui)' }}>

      {/* ══════════ BOOT SCREEN ══════════ */}
      <AnimatePresence>
        {!booted && (
          <motion.div
            key="boot"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'linear-gradient(160deg,#1A0B2E 0%,#2D1459 60%,#1A0B2E 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Cute computer illustration */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{ marginBottom: 28 }}
            >
              <div style={{
                width: 100, height: 80,
                background: 'linear-gradient(135deg,#C084FC,#A855F7)',
                borderRadius: 14,
                border: '3px solid #7C3AED',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(168,85,247,0.5), inset 0 2px 6px rgba(255,255,255,0.2)',
                position: 'relative',
              }}>
                <div style={{ fontSize: 36 }}>💻</div>
                {/* power light */}
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  style={{ position: 'absolute', bottom: 6, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }}
                />
              </div>
              {/* stand */}
              <div style={{ width: 30, height: 10, background: '#7C3AED', borderRadius: '0 0 4px 4px', margin: '0 auto' }} />
              <div style={{ width: 50, height: 5, background: '#6D28D9', borderRadius: 4, margin: '0 auto' }} />
            </motion.div>

            {/* Boot text */}
            <div style={{ color: '#E9D5FF', fontSize: 20, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>
              DESKTOP DEAR
            </div>
            <div style={{ color: '#A78BFA', fontSize: 13, marginBottom: 24, height: 20 }}>
              {bootLine === 1 && '⏳ Loading your memories…'}
              {bootLine === 2 && `💌 A surprise for ${config.recipientName}…`}
              {bootLine >= 3 && '✨ Ready! Opening desktop…'}
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[0,1,2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: bootLine > i ? 1.3 : 1, background: bootLine > i ? '#C084FC' : '#4C1D95' }}
                  style={{ width: 10, height: 10, borderRadius: '50%', background: '#4C1D95' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ HOME SCREEN ══════════ */}
      <AnimatePresence>
        {booted && !openApp && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ minHeight: '100dvh', position: 'relative', overflowX: 'hidden' }}
          >
            {/* Floating particles */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
              {particles.map((e, i) => (
                <Particle key={i} emoji={e} x={10 + i * 12} delay={i * 0.8} />
              ))}
            </div>

            {/* ── CUTE COMPUTER CASING ── */}
            <div style={{ position: 'relative', zIndex: 1, padding: '24px 16px 0' }}>

              {/* Outer casing body */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  background: 'linear-gradient(160deg,#EDE9FE 0%,#DDD6FE 50%,#C4B5FD 100%)',
                  borderRadius: 28,
                  border: '3px solid #A78BFA',
                  boxShadow: '0 8px 0 #7C3AED, 0 12px 30px rgba(124,58,237,0.25), inset 0 2px 6px rgba(255,255,255,0.6)',
                  padding: '12px 12px 16px',
                  position: 'relative',
                }}
              >
                {/* Top bezel row with screws */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 } as any}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(124,58,237,0.4)', border: '1.5px solid rgba(124,58,237,0.3)' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(124,58,237,0.4)', border: '1.5px solid rgba(124,58,237,0.3)' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 800, letterSpacing: 2 }}>✦ DESKTOP DEAR ✦</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(124,58,237,0.4)', border: '1.5px solid rgba(124,58,237,0.3)' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(124,58,237,0.4)', border: '1.5px solid rgba(124,58,237,0.3)' }} />
                  </div>
                </div>

                {/* ── SCREEN ── */}
                <div style={{
                  background: config.wallpaper || 'linear-gradient(135deg,#FFB7C5,#C8B4E3)',
                  borderRadius: 18,
                  border: '3px solid #7C3AED',
                  boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: 180,
                }}>
                  {/* CRT scanlines overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
                  }} />

                  {/* Screen content */}
                  <div style={{ padding: '20px 20px 24px', position: 'relative', zIndex: 1 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
                        ✉️ you've got a little computer!
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)', marginBottom: 6 }}>
                        Hi {config.recipientName}! 🌸
                      </div>
                      {config.welcomeMessage && (
                        <div style={{
                          fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5,
                          background: 'rgba(0,0,0,0.12)', borderRadius: 10, padding: '8px 12px',
                          backdropFilter: 'blur(4px)',
                        }}>
                          {config.welcomeMessage}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Screen glare */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                    borderRadius: '18px 18px 0 0', pointerEvents: 'none', zIndex: 3,
                  }} />
                </div>

                {/* Bottom casing bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingLeft: 8, paddingRight: 8 }}>
                  {/* Power button */}
                  <motion.div whileTap={{ scale: 0.9 }} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#A78BFA,#7C3AED)',
                    border: '2px solid #6D28D9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(124,58,237,0.4)',
                    cursor: 'pointer',
                  }}>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }}
                    />
                  </motion.div>

                  {/* Floppy disk slot decoration */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(124,58,237,0.3)' }} />
                    ))}
                  </div>

                  {/* Speaker grill */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ width: 3, height: 20, borderRadius: 2, background: 'rgba(124,58,237,0.35)' }} />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Sticky note */}
              {config.stickyNote && (
                <motion.div
                  initial={{ opacity: 0, rotate: -2 }}
                  animate={{ opacity: 1, rotate: -2 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    background: '#FFF9C4',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: '#5A4A00',
                    fontFamily: 'var(--font-hand, cursive)',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                    margin: '10px 8px 0',
                    lineHeight: 1.6,
                  }}
                >
                  📝 {config.stickyNote}
                </motion.div>
              )}
            </div>

            {/* ── APP ICONS ── */}
            <div style={{ position: 'relative', zIndex: 1, padding: '20px 16px 32px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 }}>
                📁 Applications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {enabledApps.map((appType, i) => {
                  const meta = APP_META[appType] || { icon: '📦', label: appType, color: '#888', bg: '#F0F0F0' };
                  return (
                    <motion.button
                      key={appType}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.05, type: 'spring', stiffness: 300 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setOpenApp(appType)}
                      style={{
                        border: '2px solid rgba(167,139,250,0.3)',
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(12px)',
                        padding: '16px 8px 12px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(124,58,237,0.1)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: meta.bg,
                        border: `2px solid ${meta.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26,
                        boxShadow: `0 4px 12px ${meta.color}25`,
                      }}>
                        {meta.icon}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#374151', textAlign: 'center' }}>
                        {meta.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', paddingBottom: 40, color: '#A78BFA', fontSize: 11, fontWeight: 600 }}>
              ✦ made with 💖 on Desktop Dear ✦
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ OPEN APP ══════════ */}
      <AnimatePresence>
        {booted && openApp && (
          <motion.div
            key={openApp}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', flexDirection: 'column',
              background: APP_META[openApp]?.bg || '#F8F9FF',
            }}
          >
            {/* App chrome — styled like a computer window title bar */}
            <div style={{
              flexShrink: 0,
              background: `linear-gradient(135deg, ${APP_META[openApp]?.color || '#888'}CC, ${APP_META[openApp]?.color || '#888'})`,
              padding: '48px 16px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}>
              {/* Window dots */}
              <button
                onClick={() => setOpenApp(null)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: 'pointer', color: '#fff', flexShrink: 0,
                }}
              >
                ←
              </button>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {APP_META[openApp]?.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                  {APP_META[openApp]?.label}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                  Desktop Dear App
                </div>
              </div>
            </div>

            {/* App content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {renderApp(openApp, config)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
