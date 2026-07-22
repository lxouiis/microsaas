'use client';
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BootSequence from '@/components/boot/BootSequence';
import Desktop from '@/components/desktop/Desktop';
import MobileDesktop from '@/components/mobile/MobileDesktop';
import type { DesktopConfig } from '@/lib/types';

interface DesktopPageClientProps {
  config: DesktopConfig;
}

export default function DesktopPageClient({ config }: DesktopPageClientProps) {
  const [bootDone, setBootDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<DesktopConfig>(config);

  // Load customised config from localStorage (saved by /create after publish)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const localData =
      localStorage.getItem(`desktop_${config.slug}`) ||
      localStorage.getItem('desktop_latest');
    if (localData) {
      try { setCurrentConfig(JSON.parse(localData)); } catch { /* ignore */ }
    }
  }, [config.slug]);

  // Detect mobile once on client (avoids SSR mismatch)
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || window.innerHeight > window.innerWidth);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleBootComplete = useCallback(() => setBootDone(true), []);

  // --- Mobile: fully custom native UI ---
  if (isMobile) {
    return <MobileDesktop config={currentConfig} />;
  }

  // --- Desktop: original Windows-XP style desktop ---
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#121212] flex items-center justify-center">
      <div className="w-full h-full relative">
        <AnimatePresence>
          {!bootDone && (
            <BootSequence
              key="boot"
              recipientName={currentConfig.recipientName}
              welcomeMessage={currentConfig.welcomeMessage}
              onComplete={handleBootComplete}
            />
          )}
        </AnimatePresence>
        {bootDone && <Desktop config={currentConfig} />}
      </div>
    </div>
  );
}
