'use client';
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BootSequence from '@/components/boot/BootSequence';
import Desktop from '@/components/desktop/Desktop';
import type { DesktopConfig } from '@/lib/types';

interface DesktopPageClientProps {
  config: DesktopConfig;
}

export default function DesktopPageClient({ config }: DesktopPageClientProps) {
  const [bootDone, setBootDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [currentConfig, setCurrentConfig] = useState<DesktopConfig>(config);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(`desktop_${config.slug}`) || localStorage.getItem('desktop_latest');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setCurrentConfig(parsed);
        } catch (e) {
          console.error('Failed to parse local config', e);
        }
      }
    }
  }, [config.slug]);

  const handleBootComplete = useCallback(() => {
    setBootDone(true);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine if the screen is a mobile layout (narrow width or portrait aspect)
      const needsScaling = width < 1024 || height > width;
      setIsMobile(needsScaling);

      if (needsScaling) {
        // Fit a 1280x720 canvas into the viewport with padding
        const scaleX = (width * 0.95) / 1280;
        const scaleY = (height * 0.95) / 720;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(`desktop_${config.slug}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setCurrentConfig(parsed);
        } catch (e) {
          console.error('Failed to parse local config', e);
        }
      }
    }
  }, [config]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#121212] flex items-center justify-center">
      {isMobile ? (
        // Auto-scaled mobile container (fit to viewport)
        <div 
          style={{
            width: 1280,
            height: 720,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            border: '4px solid #2D2D2D',
            borderRadius: '12px',
            backgroundColor: '#000',
            overflow: 'hidden',
          }}
        >
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
      ) : (
        // Fullscreen view on standard desktop screens
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
      )}
    </div>
  );
}
