'use client';
import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import BootSequence from '@/components/boot/BootSequence';
import Desktop from '@/components/desktop/Desktop';
import { DEMO_DESKTOP } from '@/lib/demoData';
import type { DesktopConfig } from '@/lib/types';

interface DesktopPageClientProps {
  config: DesktopConfig;
}

export default function DesktopPageClient({ config }: DesktopPageClientProps) {
  const [bootDone, setBootDone] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBootDone(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <AnimatePresence>
        {!bootDone && (
          <BootSequence
            key="boot"
            recipientName={config.recipientName}
            welcomeMessage={config.welcomeMessage}
            onComplete={handleBootComplete}
          />
        )}
      </AnimatePresence>

      {bootDone && <Desktop config={config} />}
    </div>
  );
}
