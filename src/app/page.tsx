import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Desktop Dear — A tiny computer filled with memories.',
  description: 'Create a magical interactive virtual desktop filled with memories, messages, and surprises. Share one unique link. Let them discover your little world.',
};

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4EBFBF 0%, #3AA0A0 30%, #5BB8D4 60%, #4EBFBF 100%)',
        fontFamily: 'var(--font-nunito)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* CRT scanlines */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Floating decorations */}
      {['💌', '✨', '🌸', '⭐', '💗', '🎵', '🎰', '📸'].map((emoji, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            left: `${10 + i * 12}%`,
            top: `${5 + (i % 3) * 20}%`,
            fontSize: '24px',
            opacity: 0.25,
            pointerEvents: 'none',
            zIndex: 0,
            animation: `float-particle ${8 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Hero monitor */}
      <div
        style={{
          background: '#DDD8C8',
          border: '4px solid #A09888',
          borderRadius: '12px 12px 4px 4px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 2px #888',
          width: '340px',
          position: 'relative',
          zIndex: 2,
          marginBottom: 40,
        }}
      >
        {/* Monitor screen */}
        <div
          style={{
            background: '#4EBFBF',
            borderRadius: 4,
            padding: '12px',
            height: '220px',
            overflow: 'hidden',
            position: 'relative',
            border: '2px inset #666',
          }}
        >
          {/* Mini desktop preview */}
          <div style={{ display: 'flex', gap: 6, height: '100%' }}>
            {/* Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['📧', '🎰', '🎵', '🎟', '⭐'].map((ic) => (
                <div key={ic} style={{ textAlign: 'center', width: 40 }}>
                  <div style={{ fontSize: 20, background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: 4 }}>{ic}</div>
                  <div style={{ fontSize: 7, color: 'white', textShadow: '0 0 3px rgba(0,0,0,0.8)', marginTop: 1 }}>App</div>
                </div>
              ))}
            </div>
            {/* Mini windows */}
            <div style={{ flex: 1, position: 'relative' }}>
              {/* Mail window preview */}
              <div style={{
                background: '#ECE9D8',
                border: '1px solid #808080',
                borderRadius: '4px 4px 2px 2px',
                width: '120px',
                position: 'absolute',
                top: 0,
                left: 10,
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}>
                <div style={{
                  background: 'linear-gradient(180deg, #0A5DB5, #0C3FA3)',
                  padding: '2px 4px',
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <span style={{ fontSize: 7, color: 'white', fontWeight: 700 }}>📧 Inbox</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                    {['#FFD700', '#4CAF50', '#FF6B6B'].map((c) => (
                      <div key={c} style={{ width: 7, height: 7, background: c, borderRadius: '50%' }} />
                    ))}
                  </div>
                </div>
                <div style={{ padding: '4px 6px', fontSize: 7, color: '#333' }}>
                  <div style={{ fontWeight: 700 }}>💌 You have mail!</div>
                  <div style={{ color: '#888', marginTop: 2, lineHeight: 1.3 }}>Someone made this for you...</div>
                </div>
              </div>
              {/* Sticky note preview */}
              <div style={{
                background: '#FFFF99',
                border: '1px solid #D4C020',
                padding: '4px 6px',
                width: 80,
                position: 'absolute',
                bottom: 20,
                right: 0,
                boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}>
                <div style={{ fontSize: 7, fontFamily: 'var(--font-caveat)', color: '#3A3000', lineHeight: 1.4 }}>
                  Made just for you! 🌸
                </div>
              </div>
            </div>
          </div>
          {/* Mini taskbar */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 18,
            background: 'linear-gradient(180deg, #3285C8, #1A5097)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px',
            gap: 4,
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #62B85E, #2E6E2A)',
              borderRadius: '6px 2px 2px 6px',
              padding: '1px 6px',
              fontSize: 7,
              color: 'white',
              fontWeight: 700,
            }}>
              🖥️ start
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 7, color: 'white', opacity: 0.8 }}>
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
        {/* Monitor chin */}
        <div style={{ textAlign: 'center', padding: '6px 0 2px', fontSize: 9, color: '#888', letterSpacing: 2, fontFamily: 'var(--font-pixel)' }}>
          DESKTOP DEAR
        </div>
      </div>
      {/* Monitor stand */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: -40,
        marginBottom: 24,
      }}>
        <div style={{ width: 60, height: 20, background: '#BBB', borderRadius: '0 0 4px 4px', border: '2px solid #999' }} />
        <div style={{ width: 120, height: 8, background: '#AAA', borderRadius: 4, border: '1px solid #888' }} />
      </div>

      {/* Hero text */}
      <div style={{ textAlign: 'center', maxWidth: 500, position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 900,
          color: 'white',
          textShadow: '2px 2px 8px rgba(0,0,0,0.2)',
          marginBottom: 8,
          lineHeight: 1.1,
        }}>
          Desktop Dear 💌
        </h1>
        <p style={{
          fontSize: '22px',
          color: 'rgba(255,255,255,0.85)',
          marginBottom: 32,
          fontFamily: 'var(--font-caveat)',
        }}>
          &ldquo;A tiny computer filled with memories.&rdquo;
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.7 }}>
          Create a magical interactive virtual desktop for someone special.<br/>
          Share one link. Let them explore a world made just for them.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/d/demo" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 800,
              color: '#3AA0A0',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              fontFamily: 'var(--font-nunito)',
            }}>
              🖥️ See the Demo
            </button>
          </Link>
          <Link href="/create" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 800,
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-nunito)',
            }}>
              ✨ Create Yours Free
            </button>
          </Link>
        </div>
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginTop: 40,
        maxWidth: 600,
        position: 'relative',
        zIndex: 2,
      }}>
        {['📧 Love Letters', '🎰 Gacha Machine', '🎵 Mixtape', '🎟 Invitations', '⭐ Mini Games', '📸 Photo Album', '📅 Calendar', '🔒 Secrets'].map((feat) => (
          <div key={feat} style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            color: 'white',
            fontWeight: 600,
          }}>
            {feat}
          </div>
        ))}
      </div>
    </div>
  );
}
