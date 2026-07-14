'use client';
import { useRef, useState, useEffect, ReactNode } from 'react';

interface RetroMonitorProps {
  children: ReactNode;
  /** Aspect ratio of the inner screen. Defaults to 16/9. */
  aspectRatio?: number;
  /** Width of the virtual screen canvas in pixels. Defaults to 1280. */
  virtualWidth?: number;
  /** Height of the virtual screen canvas in pixels. Defaults to 720. */
  virtualHeight?: number;
  /** Enable scanline CRT glass effect overlay. Defaults to true. */
  scanlines?: boolean;
}

export default function RetroMonitor({
  children,
  aspectRatio = 16 / 9,
  virtualWidth = 1280,
  virtualHeight = 720,
  scanlines = true,
}: RetroMonitorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [screenSize, setScreenSize] = useState({ width: 320, height: 180 });

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = width / aspectRatio;

      setScreenSize({ width, height });
      setScale(width / virtualWidth);
    };

    handleResize();

    // Use ResizeObserver for accurate sizing inside flex/grid grids
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [aspectRatio, virtualWidth]);

  return (
    <div className="flex flex-col items-center w-full max-w-[650px] mx-auto select-none">
      {/* Outer Monitor Bezel (Beige/Light Gray) */}
      <div 
        className="outer-monitor-bezel w-full p-4 rounded-xl flex flex-col"
        style={{
          backgroundColor: '#D6D6D6',
          borderWidth: '4px',
          borderStyle: 'solid',
          borderColor: '#FFFFFF #808080 #808080 #FFFFFF',
          boxShadow: 'inset 2px 2px 0px #FFFFFF, inset -2px -2px 0px #4A4A4A, 0 10px 25px rgba(0,0,0,0.3)',
        }}
      >
        {/* Inner Sunken Screen Border */}
        <div 
          ref={containerRef}
          className="inner-screen-frame relative overflow-hidden w-full"
          style={{
            height: screenSize.height,
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: '#808080 #FFFFFF #FFFFFF #808080',
            backgroundColor: '#000000',
            borderRadius: '4px',
          }}
        >
          {/* Virtual Canvas containing Scaled Content */}
          <div
            style={{
              width: virtualWidth,
              height: virtualHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {children}
          </div>

          {/* CRT Scanline Overlay */}
          {scanlines && (
            <div 
              className="crt-scanlines absolute inset-0 pointer-events-none" 
              style={{ zIndex: 9999 }}
            />
          )}

          {/* Screen glare sheen effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
              zIndex: 9998,
            }}
          />
        </div>

        {/* Monitor Chin / Branding Area */}
        <div className="flex items-center justify-between pt-2 px-2 text-xs font-mono font-bold text-gray-600">
          <div className="flex items-center gap-1.5">
            {/* Little indicator light (power status) */}
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
            <span style={{ fontSize: '9px', letterSpacing: '1px' }}>POWER</span>
          </div>
          <span style={{ fontSize: '10px', letterSpacing: '2px' }}>■ DESKTOP DEAR</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-gray-400 border border-gray-500 rounded-sm" />
            <div className="w-4 h-2 bg-gray-400 border border-gray-500 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Monitor Stand Trapezoid Neck */}
      <div 
        className="h-8 w-20 border-x-2 border-b-2"
        style={{
          background: 'linear-gradient(90deg, #808080 0%, #D6D6D6 25%, #FFF 50%, #D6D6D6 75%, #808080 100%)',
          borderColor: '#808080',
          boxShadow: 'inset 0px -4px 6px rgba(0,0,0,0.15)',
        }}
      />

      {/* Monitor Base Foot */}
      <div 
        className="h-4 w-44 rounded-t-lg"
        style={{
          backgroundColor: '#C0C0C0',
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: '#FFFFFF #808080 #808080 #FFFFFF',
          boxShadow: 'inset 1px 1px 0px #FFFFFF, inset -1px -1px 0px #4A4A4A, 0 4px 8px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
}
