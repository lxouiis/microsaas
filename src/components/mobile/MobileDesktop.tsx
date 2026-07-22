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

const APP_META: Record<string, { icon: string; label: string; gradient: string }> = {
  mail:     { icon: '💌', label: 'Letter',   gradient: 'linear-gradient(135deg,#FFB7C5,#FF8FAB)' },
  gacha:    { icon: '🎰', label: 'Gacha',    gradient: 'linear-gradient(135deg,#C8B4E3,#A78BCA)' },
  mixtape:  { icon: '🎵', label: 'Mixtape',  gradient: 'linear-gradient(135deg,#93C5FD,#60A5FA)' },
  ticket:   { icon: '🎟', label: 'Invite',   gradient: 'linear-gradient(135deg,#FCD34D,#F59E0B)' },
  photos:   { icon: '📸', label: 'Photos',   gradient: 'linear-gradient(135deg,#6EE7B7,#34D399)' },
  calendar: { icon: '📅', label: 'Calendar', gradient: 'linear-gradient(135deg,#FCA5A5,#F87171)' },
  secret:   { icon: '🔒', label: 'Secret',   gradient: 'linear-gradient(135deg,#94A3B8,#64748B)' },
  purr:     { icon: '🐱', label: 'Cat Purr', gradient: 'linear-gradient(135deg,#FDBA74,#FB923C)' },
};

function renderApp(appType: AppType, config: DesktopConfig) {
  const appConfig = config.apps[appType]?.config || {};
  switch (appType) {
    case 'mail':     return <MailApp config={appConfig as any} />;
    case 'gacha':    return <GachaApp config={appConfig as any} />;
    case 'mixtape':  return <MixtapeApp config={appConfig as any} />;
    case 'ticket':   return <TicketApp config={appConfig as any} />;
    case 'photos':   return <PhotosApp config={appConfig as any} />;
    case 'calendar': return <CalendarApp config={appConfig as any} />;
    case 'secret':   return <SecretApp config={appConfig as any} />;
    case 'purr':     return <KittenCanvas config={appConfig as any} />;
    default:         return null;
  }
}

export default function MobileDesktop({ config }: MobileDesktopProps) {
  const [openApp, setOpenApp] = useState<AppType | null>(null);
  const [showBoot, setShowBoot] = useState(true);
  const [bootStep, setBootStep] = useState(0);

  // Get list of enabled apps
  const enabledApps = (Object.keys(config.apps) as AppType[]).filter(
    (k) => config.apps[k]?.enabled
  );

  // Boot sequence
  useEffect(() => {
    const t1 = setTimeout(() => setBootStep(1), 600);
    const t2 = setTimeout(() => setBootStep(2), 1400);
    const t3 = setTimeout(() => setBootStep(3), 2200);
    const t4 = setTimeout(() => setShowBoot(false), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Parse wallpaper for background
  const bg = config.wallpaper || 'linear-gradient(135deg,#FFB7C5,#C8B4E3)';

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ fontFamily: 'var(--font-nunito, system-ui)' }}
    >
      {/* Boot screen */}
      <AnimatePresence>
        {showBoot && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'linear-gradient(160deg,#0F0F1A 0%,#1A1A2E 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: 56 }}
            >
              💻
            </motion.div>
            <div style={{ color: '#E2E8F0', fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
              Desktop Dear
            </div>
            <div style={{ color: '#94A3B8', fontSize: 14 }}>
              {bootStep === 0 && 'Starting up…'}
              {bootStep === 1 && 'Loading memories…'}
              {bootStep === 2 && `Hello, ${config.recipientName} 💖`}
              {bootStep >= 3 && 'Ready!'}
            </div>
            {/* Progress bar */}
            <div style={{ width: 160, height: 4, borderRadius: 4, background: '#2D2D4E', overflow: 'hidden', marginTop: 8 }}>
              <motion.div
                animate={{ width: `${(bootStep / 3) * 100}%` }}
                style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#FFB7C5,#C8B4E3)' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main home screen */}
      <AnimatePresence>
        {!showBoot && !openApp && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed', inset: 0,
              background: bg,
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '52px 24px 24px',
              background: 'rgba(0,0,0,0.15)',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 4 }}>
                ✉️ A gift just for you
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                Hi, {config.recipientName}! 🌸
              </h1>
              {config.welcomeMessage && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {config.welcomeMessage}
                </p>
              )}
            </div>

            {/* Sticky note if present */}
            {config.stickyNote && (
              <motion.div
                initial={{ rotate: -1 }}
                animate={{ rotate: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                style={{
                  margin: '16px 24px 0',
                  background: '#FFF9C4',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 13,
                  color: '#5A4A00',
                  fontFamily: 'var(--font-hand, cursive)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  lineHeight: 1.6,
                }}
              >
                📝 {config.stickyNote}
              </motion.div>
            )}

            {/* App grid */}
            <div style={{
              padding: '24px 20px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              {enabledApps.map((appType, i) => {
                const meta = APP_META[appType] || { icon: '📦', label: appType, gradient: 'linear-gradient(135deg,#ccc,#aaa)' };
                return (
                  <motion.button
                    key={appType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setOpenApp(appType)}
                    style={{
                      border: 'none',
                      borderRadius: 20,
                      background: 'rgba(255,255,255,0.22)',
                      backdropFilter: 'blur(12px)',
                      padding: '18px 8px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* Icon bubble */}
                    <div style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: meta.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                      {meta.icon}
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      letterSpacing: 0.3,
                    }}>
                      {meta.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', paddingBottom: 32, color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              made with 💖 on Desktop Dear
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App full-screen view */}
      <AnimatePresence>
        {!showBoot && openApp && (
          <motion.div
            key={openApp}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: '#F8F9FF',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* App top bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '52px 20px 14px',
              background: APP_META[openApp]?.gradient || 'linear-gradient(135deg,#ccc,#aaa)',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setOpenApp(null)}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  borderRadius: 10,
                  width: 36, height: 36,
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                ←
              </button>
              <div style={{ fontSize: 22 }}>{APP_META[openApp]?.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                {APP_META[openApp]?.label}
              </div>
            </div>

            {/* App content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' } as any}>
              {renderApp(openApp, config)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
