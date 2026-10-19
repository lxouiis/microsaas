import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Desktop Dear — A tiny computer filled with memories.',
  description: 'Create a magical interactive virtual desktop filled with memories, messages, and surprises. Share one unique link. Let them discover your little world.',
};

export default function HomePage() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center p-10 relative overflow-hidden font-nunito"
      style={{
        background: 'var(--landing-bg-gradient)',
      }}
    >
      {/* CRT scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--landing-scanline) 2px, var(--landing-scanline) 4px)',
        }}
      />

      {/* Floating decorations */}
      {['💌', '✨', '🌸', '⭐', '💗', '🎵', '🎰', '📸'].map((emoji, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-0 select-none"
          style={{
            left: `${10 + i * 12}%`,
            top: `${5 + (i % 3) * 20}%`,
            fontSize: '24px',
            opacity: `var(--landing-decoration-opacity)`,
            animation: `float-particle ${8 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Hero monitor */}
      <div
        className="bg-[#DDD8C8] border-4 border-[#A09888] rounded-t-3xl rounded-b-sm p-2 shadow-2xl relative z-20 mb-10"
        style={{
          width: '340px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 2px #888',
        }}
      >
        {/* Monitor screen */}
        <div
          className="bg-[#4EBFBF] rounded p-3 relative border-2 border-[#666]"
          style={{
            height: '220px',
            overflow: 'hidden',
          }}
        >
          {/* Mini desktop preview */}
          <div className="flex gap-1.5 h-full">
            {/* Icons */}
            <div className="flex flex-col gap-2">
              {['📧', '🎰', '🎵', '🎟', '⭐'].map((ic) => (
                <div key={ic} className="text-center" style={{ width: '40px' }}>
                  <div className="text-xl bg-white bg-opacity-15 rounded p-1">
                    {ic}
                  </div>
                  <div className="text-[7px] text-white text-shadow mt-0.5" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                    App
                  </div>
                </div>
              ))}
            </div>
            {/* Mini windows */}
            <div className="flex-1 relative">
              {/* Mail window preview */}
              <div className="bg-[#ECE9D8] border border-[#808080] rounded-t text-[7px] absolute top-0 left-2.5 shadow-md" style={{ width: '120px' }}>
                <div className="bg-gradient-to-b from-[#0A5DB5] to-[#0C3FA3] p-0.5 rounded-t flex items-center gap-0.5">
                  <span className="text-white font-bold">📧 Inbox</span>
                  <div className="ml-auto flex gap-0.5">
                    {['#FFD700', '#4CAF50', '#FF6B6B'].map((c) => (
                      <div key={c} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className="p-1 text-[#333]">
                  <div className="font-bold">💌 You have mail!</div>
                  <div className="text-[#888] mt-0.5 leading-tight">Someone made this for you...</div>
                </div>
              </div>
              {/* Sticky note preview */}
              <div className="bg-[#FFFF99] border border-[#D4C020] p-1 absolute bottom-5 right-0 text-[7px] text-[#3A3000] shadow-sm" style={{ width: '80px', lineHeight: '1.4', fontFamily: 'var(--font-hand)' }}>
                Made just for you! 🌸
              </div>
            </div>
          </div>
          {/* Mini taskbar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[#3285C8] to-[#1A5097] flex items-center px-1 gap-1" style={{ height: '18px' }}>
            <div className="bg-gradient-to-b from-[#62B85E] to-[#2E6E2A] rounded-l-sm px-1.5 text-[7px] text-white font-bold" style={{ borderRadius: '6px 2px 2px 6px' }}>
              🖥️ start
            </div>
            <div className="ml-auto text-[7px] text-white opacity-80">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
        {/* Monitor chin */}
        <div className="text-center py-1 text-[9px] text-[#888]" style={{ letterSpacing: '0.125em', fontFamily: 'var(--font-pixel)' }}>
          DESKTOP DEAR
        </div>
      </div>
      {/* Monitor stand */}
      <div className="relative z-20 flex flex-col items-center -mt-10 mb-6">
        <div className="w-15 h-5 bg-[#BBB] rounded-b border-2 border-[#999]" />
        <div className="w-30 h-2 bg-[#AAA] rounded border border-[#888]" />
      </div>

      {/* Hero text */}
      <div className="text-center max-w-[500px] relative z-20">
        <h1
          className="text-5xl font-black text-white mb-2 leading-tight"
          style={{
            textShadow: '2px 2px 8px var(--landing-hero-text-shadow)',
          }}
        >
          Desktop Dear 💌
        </h1>
        <p
          className="text-2xl mb-8"
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-hand)',
          }}
        >
          &ldquo;A tiny computer filled with memories.&rdquo;
        </p>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Create a magical interactive virtual desktop for someone special.<br />
          Share one link. Let them explore a world made just for them.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/d/demo">
            <button
              className="rounded-lg px-7 py-3.5 text-sm font-black shadow-md hover:shadow-lg transition-shadow"
              style={{
                background: 'var(--landing-button-primary-bg)',
                color: 'var(--landing-button-primary-text)',
              }}
            >
              🖥️ See the Demo
            </button>
          </Link>
          <Link href="/create">
            <button
              className="rounded-lg px-7 py-3.5 text-sm font-black border-2 backdrop-blur hover:opacity-90 transition-opacity"
              style={{
                background: 'var(--landing-button-secondary-bg)',
                borderColor: 'var(--landing-button-secondary-border)',
                color: 'var(--landing-button-secondary-text)',
              }}
            >
              ✨ Create Yours Free
            </button>
          </Link>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center mt-10 max-w-[600px] relative z-20">
        {['📧 Letters', '🎰 Gacha Machine', '🎵 Mixtape', '🎟 Invitations', '⭐ Mini Games', '📸 Photo Album', '📅 Calendar', '🔒 Secrets'].map((feat) => (
          <div
            key={feat}
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur border"
            style={{
              background: 'var(--landing-pill-bg)',
              borderColor: 'var(--landing-pill-border)',
              color: 'var(--landing-pill-text)',
            }}
          >
            {feat}
          </div>
        ))}
      </div>
    </div>
  );
}
