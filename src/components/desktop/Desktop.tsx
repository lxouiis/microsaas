'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { useDesktopStore } from '@/stores/desktopStore';
import type { DesktopConfig } from '@/lib/types';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import ShutdownSequence from './ShutdownSequence';
import FloatingParticles from './FloatingParticles';
import Window from './Window';
import DesktopPet from './DesktopPet';

// App components
import MailApp from '../apps/MailApp';
import GachaApp from '../apps/GachaApp';
import MixtapeApp from '../apps/MixtapeApp';
import TicketApp from '../apps/TicketApp';
import GameApp from '../apps/GameApp';
import PhotosApp from '../apps/PhotosApp';
import CalendarApp from '../apps/CalendarApp';
import SecretApp from '../apps/SecretApp';
import type { AppType } from '@/stores/windowStore';

interface DesktopProps {
  config: DesktopConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderApp(appType: AppType, config: any, fullConfig?: DesktopConfig) {
  switch (appType) {
    case 'mail': return <MailApp config={config} />;
    case 'gacha': return <GachaApp config={config} />;
    case 'mixtape': return <MixtapeApp config={config} />;
    case 'ticket': return <TicketApp config={config} />;
    case 'game': return <GameApp config={config} secretPassword={fullConfig?.apps?.secret?.config?.password || '1234'} />;
    case 'photos': return <PhotosApp config={config} />;
    case 'calendar': return <CalendarApp config={config} />;
    case 'secret': return <SecretApp config={config} />;
    default: return null;
  }
}

export default function Desktop({ config }: DesktopProps) {
  const { windows, closeWindow, minimizeWindow, focusWindow, toggleMaximizeWindow } = useWindowStore();
  const { starEarned, notification, hideNotification } = useDesktopStore();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  const handleRestart = useCallback(() => {
    setTimeout(() => window.location.reload(), 500);
  }, []);

  const APP_ORDER: AppType[] = ['mail', 'gacha', 'mixtape', 'ticket', 'game', 'photos', 'calendar', 'secret'];

  const enabledApps = APP_ORDER.filter(
    (appType) => config.apps[appType]?.enabled !== false
  );

  const wallpaper = config.wallpaper || 'linear-gradient(135deg, #4EBFBF 0%, #3AA0A0 40%, #5BB8D4 70%, #4EBFBF 100%)';

  return (
    <div
      id="desktop-area"
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: config.wallpaperType === 'image' ? `url(${wallpaper})` : (wallpaper.startsWith('linear') || wallpaper.startsWith('radial') ? wallpaper : 'none'),
        backgroundColor: wallpaper.startsWith('linear') || wallpaper.startsWith('radial') ? 'transparent' : wallpaper,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
      onClick={() => startMenuOpen && setStartMenuOpen(false)}
    >
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          zIndex: 500,
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Desktop area (above taskbar) */}
      <div className="absolute inset-0" style={{ bottom: 40, overflow: 'hidden' }}>
        {/* Desktop icons grouped in side-by-side columns */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 12,
            display: 'flex',
            gap: 12,
          }}
        >
          {/* Column 1: Mail, Gacha, Mixtape, Ticket, Game, Photos, Recycle Bin */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enabledApps
              .filter((appType) => appType !== 'calendar' && appType !== 'secret')
              .map((appType) => (
                <DesktopIcon key={appType} appType={appType} />
              ))}

            {/* Recycle bin always visible at the bottom of the first column */}
            <motion.div
              className="desktop-icon"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              title="Recycle Bin"
              style={{ cursor: 'default' }}
            >
              <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>
                🗑️
              </div>
              <div className="desktop-icon-label">Recycle Bin</div>
            </motion.div>
          </div>

          {/* Column 2: Calendar, Secret */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enabledApps
              .filter((appType) => appType === 'calendar' || appType === 'secret')
              .map((appType) => (
                <DesktopIcon key={appType} appType={appType} />
              ))}
          </div>
        </div>

        {/* Star reward on desktop (earned by playing game) */}
        <AnimatePresence>
          {starEarned && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{
                opacity: 1,
                scale: [1, 1.05, 1],
                rotate: [0, 10, -10, 0],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'tween', repeat: Infinity, duration: 4, ease: 'easeInOut', repeatType: 'loop' }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 32,
                filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
                cursor: 'default',
              }}
              title="You earned this star! ⭐"
            >
              ⭐
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky note */}
        {config.stickyNote && (
          <motion.div
            className="sticky-note"
            drag
            dragMomentum={false}
            style={{
              position: 'absolute',
              right: 16,
              top: 60,
              width: 180,
              zIndex: 200,
              cursor: 'move',
            }}
            whileHover={{ scale: 1.02, rotate: 1 }}
            title="P.S. from your creator"
          >
            <div style={{ paddingTop: 8, lineHeight: 1.5 }}>{config.stickyNote}</div>
          </motion.div>
        )}

        {/* Windows */}
        {windows.map((win) => {
          const appConfig = config.apps[win.appType]?.config || {};
          return (
            <Window
              key={win.id}
              id={win.id}
              appType={win.appType}
              title={win.title}
              icon={win.icon}
              isMinimized={win.isMinimized}
              isMaximized={win.isMaximized}
              isFocused={win.isFocused}
              position={win.position}
              size={win.size}
              zIndex={win.zIndex}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => toggleMaximizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
            >
              {renderApp(win.appType, appConfig, config)}
            </Window>
          );
        })}
      </div>

      {/* Watermark */}
      <div className="watermark">made with Desktop Dear ♥</div>

      {/* Start Menu */}
      <StartMenu
        isOpen={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onShutdown={() => setIsShuttingDown(true)}
        recipientName={config.recipientName}
      />

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 999 }}>
        <Taskbar
          onStartClick={() => setStartMenuOpen((v) => !v)}
          isStartMenuOpen={startMenuOpen}
        />
      </div>

      {/* Shutdown */}
      <AnimatePresence>
        {isShuttingDown && (
          <ShutdownSequence
            message={config.shutdownMessage}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>

      {/* Balloon Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed',
              bottom: 50,
              right: 12,
              zIndex: 9999,
              background: '#FFFFE1',
              border: '1px solid #000000',
              borderRadius: 6,
              padding: '10px 14px',
              maxWidth: 240,
              boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: '#000',
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, borderBottom: '1px solid #CCC', paddingBottom: 2 }}>
              <span style={{ fontWeight: 800, color: '#000080' }}>💡 System Alert</span>
              <button
                onClick={hideNotification}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 900,
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>
            {/* Balloon content text */}
            <div style={{ lineHeight: 1.4, color: '#333' }}>{notification}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <DesktopPet />
    </div>
  );
}
