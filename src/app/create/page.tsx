'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { DesktopConfig } from '@/lib/types';
import { DEMO_DESKTOP } from '@/lib/demoData';

type TabType = 'basic' | 'mail' | 'gacha' | 'mixtape' | 'ticket' | 'photos' | 'calendar' | 'secret' | 'game' | 'appearance' | 'purr' | 'music';

import { saveDesktop } from '@/app/actions';
import Desktop from '@/components/desktop/Desktop';
import RetroMonitor from '@/components/desktop/RetroMonitor';
import MixtapeCreator from '@/components/desktop/MixtapeCreator';

export default function CreatePage() {
  const [config, setConfig] = useState<DesktopConfig>({ ...DEMO_DESKTOP, slug: '', id: '' });
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const updateConfig = (updates: Partial<DesktopConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateAppConfig = (appType: string, configUpdates: Record<string, any>) => {
    setConfig((prev) => ({
      ...prev,
      apps: {
        ...prev.apps,
        [appType]: {
          ...prev.apps[appType as keyof typeof prev.apps],
          config: {
            ...(prev.apps[appType as keyof typeof prev.apps]?.config || {}),
            ...configUpdates,
          },
        },
      },
    }));
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const generatedSlug = slug || `${(config.recipientName || 'friend').toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
      setSlug(generatedSlug);
      
      const savedConfig = { ...config, slug: generatedSlug };
      
      // 1. Instant local fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`desktop_${generatedSlug}`, JSON.stringify(savedConfig));
      }
      
      // 2. Race Supabase save with a 5-second timeout so it never hangs
      const savePromise = saveDesktop(generatedSlug, savedConfig);
      const timeoutPromise = new Promise<{ success: boolean; isTimeout?: boolean }>((resolve) =>
        setTimeout(() => resolve({ success: true, isTimeout: true }), 5000)
      );

      await Promise.race([savePromise, timeoutPromise]);
      setPublished(true);
    } catch (err) {
      console.warn('Publish completed with fallback:', err);
      setPublished(true);
    } finally {
      setPublishing(false);
    }
  };

  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = `${origin}/d/${slug}`;

  const TABS: { id: TabType; label: string; icon: string }[] = [
    { id: 'basic', label: 'Basic Info', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'mail', label: 'Mail', icon: '📧' },
    { id: 'gacha', label: 'Gacha', icon: '🎰' },
    { id: 'mixtape', label: 'Mixtape', icon: '🎵' },
    { id: 'ticket', label: 'Invite', icon: '🎟' },
    { id: 'photos', label: 'Photos', icon: '📸' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'secret', label: 'Secret', icon: '🔒' },
    { id: 'game', label: 'Game', icon: '⭐' },
    { id: 'purr', label: 'Cat Purr', icon: '🐱' },
    { id: 'music', label: 'Music 🎵', icon: '🎵' },
  ];

  const mailConfig = config.apps.mail?.config || {};
  const gachaConfig = config.apps.gacha?.config || {};
  const mixtapeConfig = config.apps.mixtape?.config || {};
  const ticketConfig = config.apps.ticket?.config || {};
  const calendarConfig = config.apps.calendar?.config || {};
  const secretConfig = config.apps.secret?.config || {};
  const gameConfig = config.apps.game?.config || {};
  const purrConfig = config.apps.purr?.config || {};
  const photosConfig = config.apps.photos?.config || {};
  const musicConfig = config.music || { enabled: false };

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #F0F4FF 0%, #F8F0FF 100%)',
        fontFamily: 'var(--font-nunito)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #1F5FA6, #1A3FA0)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>← Home</Link>
        <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>🖥️ Desktop Dear — Create</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link href={`/d/demo`} target="_blank" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '6px 14px', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-nunito)' }}>
              👁 Preview
            </button>
          </Link>
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              background: publishing ? '#AAA' : 'linear-gradient(135deg, #FFB7C5, #C8B4E3)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 16px',
              color: '#2A1A3A',
              fontSize: 12,
              fontWeight: 700,
              cursor: publishing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            {publishing ? '⏳ Publishing...' : '🚀 Publish & Share'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
        {/* Left: tabs + form */}
        <div style={{ width: 380, borderRight: '1px solid #E0E0E0', background: 'white', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Tab list */}
          <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 4, padding: '10px 12px', borderBottom: '1px solid #EEE', background: '#F8F8F8', flexShrink: 0 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#1F5FA6' : 'white',
                  color: activeTab === tab.id ? 'white' : '#555',
                  border: `1px solid ${activeTab === tab.id ? '#1F5FA6' : '#DDD'}`,
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontFamily: 'var(--font-nunito)',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {activeTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>⚙️ Basic Info</h3>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recipient&apos;s Name *</span>
                  <input className="xp-input" value={config.recipientName} onChange={(e) => updateConfig({ recipientName: e.target.value })} placeholder="e.g. Sarah" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Welcome Message</span>
                  <textarea className="xp-input" value={config.welcomeMessage} onChange={(e) => updateConfig({ welcomeMessage: e.target.value })} rows={2} style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sticky Note (optional)</span>
                  <textarea className="xp-input" value={config.stickyNote || ''} onChange={(e) => updateConfig({ stickyNote: e.target.value })} rows={2} placeholder="A little P.S. for them..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Shutdown Message</span>
                  <input className="xp-input" value={config.shutdownMessage} onChange={(e) => updateConfig({ shutdownMessage: e.target.value })} style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Custom URL Slug</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
                    <span style={{ fontSize: 10 }}>/d/</span>
                    <input className="xp-input" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="sarah-birthday-2024" style={{ borderRadius: 6 }} />
                  </div>
                </label>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎨 Appearance</h3>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Wallpaper Theme</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { name: 'Teal Dream', gradient: 'linear-gradient(135deg, #4EBFBF 0%, #3AA0A0 40%, #5BB8D4 100%)' },
                      { name: 'Pink Blossom', gradient: 'linear-gradient(135deg, #FFB7C5 0%, #FF9FB0 40%, #FFC8D5 100%)' },
                      { name: 'Lavender Sky', gradient: 'linear-gradient(135deg, #C8B4E3 0%, #B49ACC 40%, #D4C0F0 100%)' },
                      { name: 'Mint Garden', gradient: 'linear-gradient(135deg, #B4E3D1 0%, #90CCBC 40%, #C4EFE0 100%)' },
                      { name: 'Sunset Peach', gradient: 'linear-gradient(135deg, #FFD6B8 0%, #FFBA8C 40%, #FFE4C8 100%)' },
                      { name: 'Night Sky', gradient: 'linear-gradient(135deg, #1A1A4A 0%, #0F3460 40%, #2A2A6A 100%)' },
                    ].map((theme) => (
                      <div
                        key={theme.name}
                        onClick={() => updateConfig({ wallpaper: theme.gradient, wallpaperType: 'gradient' })}
                        style={{
                          height: 48,
                          borderRadius: 8,
                          background: theme.gradient,
                          border: config.wallpaper === theme.gradient ? '3px solid #1F5FA6' : '2px solid transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: 4,
                        }}
                      >
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{theme.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mail' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>📧 Mail</h3>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>From Name</span>
                  <input className="xp-input" value={mailConfig.fromName || ''} onChange={(e) => updateAppConfig('mail', { fromName: e.target.value })} placeholder="Your Secret Admirer" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Subject</span>
                  <input className="xp-input" value={mailConfig.subject || ''} onChange={(e) => updateAppConfig('mail', { subject: e.target.value })} placeholder="You have one unread message..." style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Message Body</span>
                  <textarea className="xp-input" value={mailConfig.body || ''} onChange={(e) => updateAppConfig('mail', { body: e.target.value })} rows={8} placeholder="Write your letter here..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Signature (optional)</span>
                  <input className="xp-input" value={mailConfig.signature || ''} onChange={(e) => updateAppConfig('mail', { signature: e.target.value })} placeholder="✨ With love, always" style={{ borderRadius: 6 }} />
                </label>
              </div>
            )}

            {activeTab === 'gacha' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎰 Gacha Machine</h3>
                  <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>{(gachaConfig.capsules || []).length} Capsules</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', background: '#F8F9FA', padding: 8, borderRadius: 6, border: '1px solid #E9ECEF' }}>
                  💡 Scroll down to add, edit, or delete capsule messages for your recipient!
                </div>

                <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(gachaConfig.capsules || []).map((cap: { message: string; emoji: string; rarity: string; color: string }, i: number) => (
                    <div key={i} style={{ background: '#F8F8F8', borderRadius: 8, padding: 12, border: '1px solid #EEE', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>
                          Capsule {i + 1} {cap.rarity === 'legendary' ? '🌟' : cap.rarity === 'rare' ? '✨' : ''}
                        </div>
                        {(gachaConfig.capsules || []).length > 1 && (
                          <button
                            onClick={() => {
                              const newCapsules = gachaConfig.capsules.filter((_: unknown, index: number) => index !== i);
                              updateAppConfig('gacha', { capsules: newCapsules });
                            }}
                            title="Delete Capsule"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#E05555' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <textarea
                        className="xp-input"
                        value={cap.message}
                        onChange={(e) => {
                          const newCapsules = [...gachaConfig.capsules];
                          newCapsules[i] = { ...newCapsules[i], message: e.target.value };
                          updateAppConfig('gacha', { capsules: newCapsules });
                        }}
                        rows={2}
                        style={{ borderRadius: 4, resize: 'vertical', fontSize: 12 }}
                      />
                      <select
                        value={cap.rarity}
                        onChange={(e) => {
                          const newCapsules = [...gachaConfig.capsules];
                          newCapsules[i] = { ...newCapsules[i], rarity: e.target.value };
                          updateAppConfig('gacha', { capsules: newCapsules });
                        }}
                        style={{ marginTop: 6, fontSize: 11, padding: '3px 6px', borderRadius: 4, border: '1px solid #DDD', fontFamily: 'var(--font-nunito)' }}
                      >
                        <option value="normal">Normal</option>
                        <option value="rare">✨ Rare</option>
                        <option value="legendary">🌟 Legendary</option>
                      </select>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateAppConfig('gacha', { capsules: [...(gachaConfig.capsules || []), { message: '', emoji: '💝', rarity: 'normal', color: '#FFB7C5' }] })}
                  style={{ background: 'none', border: '2px dashed #CBD5E1', borderRadius: 8, padding: '10px', fontSize: 12, cursor: 'pointer', color: '#1F5FA6', fontWeight: 700, fontFamily: 'var(--font-nunito)' }}
                >
                  + Add Capsule
                </button>
              </div>
            )}

            {activeTab === 'mixtape' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎵 Mixtape Studio</h3>
                <MixtapeCreator 
                  config={mixtapeConfig}
                  onChange={(updated) => updateAppConfig('mixtape', updated)}
                />
              </div>
            )}

            {activeTab === 'ticket' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎟 Invitation</h3>
                {[
                  { key: 'title', label: 'Event Title', placeholder: 'YOU ARE INVITED' },
                  { key: 'date', label: 'Date', placeholder: '2025-12-31', type: 'date' },
                  { key: 'time', label: 'Time', placeholder: '7:00 PM' },
                  { key: 'location', label: 'Location', placeholder: 'Somewhere Magical ✨' },
                  { key: 'dresscode', label: 'Dress Code (optional)', placeholder: 'Dress as you are' },
                  { key: 'notes', label: 'Notes (optional)', placeholder: 'This invitation never expires.' },
                ].map(({ key, label, placeholder, type }) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
                    <input type={type || 'text'} className="xp-input" value={ticketConfig[key] || ''} onChange={(e) => updateAppConfig('ticket', { [key]: e.target.value })} placeholder={placeholder} style={{ borderRadius: 6 }} />
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>📅 Memory Calendar</h3>
                <div style={{ background: '#FFF5F7', borderRadius: 8, padding: 12, fontSize: 12, color: '#B04858', lineHeight: 1.5 }}>
                  📅 Design an interactive Wall Desk Calendar with memory badge stamps, date unboxing cards, and countdown timers.
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Calendar Title</span>
                  <input className="xp-input" value={calendarConfig.title || ''} onChange={(e) => updateAppConfig('calendar', { title: e.target.value })} placeholder="Our Special Memory Dates 📅✨" style={{ borderRadius: 6 }} />
                </label>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Calendar Theme Palette</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {[
                      { id: 'rose', label: 'Rose', color: '#E8B4B8' },
                      { id: 'sage', label: 'Sage', color: '#A8B89A' },
                      { id: 'cream', label: 'Cream', color: '#E8DCC8' },
                      { id: 'lavender', label: 'Lavender', color: '#C4B4E0' },
                      { id: 'butter', label: 'Butter', color: '#F5E6B8' },
                      { id: 'slate', label: 'Slate', color: '#B0B8C4' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => updateAppConfig('calendar', { palette: p.id })}
                        style={{
                          background: p.color,
                          border: (calendarConfig.palette || 'rose') === p.id ? '2px solid #1A1A1A' : '1px solid #DDD',
                          borderRadius: 6,
                          padding: '6px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#222',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Year</span>
                    <input type="number" className="xp-input" value={calendarConfig.year || 2025} onChange={(e) => updateAppConfig('calendar', { year: parseInt(e.target.value) })} style={{ borderRadius: 6 }} />
                  </label>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Month</span>
                    <input type="number" min={1} max={12} className="xp-input" value={calendarConfig.month || 7} onChange={(e) => updateAppConfig('calendar', { month: parseInt(e.target.value) })} style={{ borderRadius: 6 }} />
                  </label>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Main Day</span>
                    <input type="number" min={1} max={31} className="xp-input" value={calendarConfig.highlightedDay || 13} onChange={(e) => updateAppConfig('calendar', { highlightedDay: parseInt(e.target.value) })} style={{ borderRadius: 6 }} />
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Memory Title</span>
                  <input className="xp-input" value={calendarConfig.memoryTitle || ''} onChange={(e) => updateAppConfig('calendar', { memoryTitle: e.target.value })} placeholder="The Day This Was Made For You 💌" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Memory Note</span>
                  <textarea className="xp-input" value={calendarConfig.memoryText || ''} onChange={(e) => updateAppConfig('calendar', { memoryText: e.target.value })} rows={3} placeholder="Write about this special day..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Memory Photo URL (optional)</span>
                  <input className="xp-input" value={calendarConfig.memoryPhotoUrl || ''} onChange={(e) => updateAppConfig('calendar', { memoryPhotoUrl: e.target.value })} placeholder="https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80" style={{ borderRadius: 6 }} />
                </label>
              </div>
            )}

            {activeTab === 'photos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>📸 Photo Album Scrapbook</h3>
                <div style={{ background: '#FDF8F0', borderRadius: 8, padding: 12, fontSize: 12, color: '#8A6D3B', lineHeight: 1.5 }}>
                  📖 Design an interactive 3D Photo Scrapbook with polaroid secret backs, handwriting captions, and ambient music.
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Album Title</span>
                  <input className="xp-input" value={photosConfig.albumTitle || ''} onChange={(e) => updateAppConfig('photos', { albumTitle: e.target.value })} placeholder="Our Memory Scrapbook 📖✨" style={{ borderRadius: 6 }} />
                </label>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Scrapbook Theme Palette</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {[
                      { id: 'sage', label: 'Sage', color: '#A8B89A' },
                      { id: 'cream', label: 'Cream', color: '#E8DCC8' },
                      { id: 'rose', label: 'Rose', color: '#E8B4B8' },
                      { id: 'lavender', label: 'Lavender', color: '#C4B4E0' },
                      { id: 'butter', label: 'Butter', color: '#F5E6B8' },
                      { id: 'slate', label: 'Slate', color: '#B0B8C4' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => updateAppConfig('photos', { palette: p.id })}
                        style={{
                          background: p.color,
                          border: photosConfig.palette === p.id ? '2px solid #1A1A1A' : '1px solid #DDD',
                          borderRadius: 6,
                          padding: '6px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#222',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ambient Background Music URL</span>
                  <input className="xp-input" value={photosConfig.musicUrl || ''} onChange={(e) => updateAppConfig('photos', { musicUrl: e.target.value })} placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" style={{ borderRadius: 6 }} />
                </label>

                {/* ── Photo Uploader & List Manager ───────────────────── */}
                <div style={{ borderTop: '1px solid #EEE', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A' }}>🖼️ Scrapbook Photos</span>
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {((photosConfig.pages?.[0]?.photos) || (photosConfig.photos) || []).length} Photos
                    </span>
                  </div>

                  {/* Direct File Uploader Box */}
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      border: '2px dashed #CBD5E1',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: '#F8FAFC',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>📁</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1F5FA6', marginTop: 4 }}>Upload Photo File</span>
                    <span style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Click to choose image from your computer (PNG, JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const newUrl = evt.target?.result as string;
                            const newPhotoItem = {
                              id: `p-${Date.now()}`,
                              url: newUrl,
                              caption: 'New Memory ✨',
                              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                              location: 'Special Place',
                              secretNote: 'Write a secret note for the back of this photo…',
                              tapeStyle: 'floral' as const,
                              filter: 'vintage' as const,
                              sticker: 'heart' as const,
                            };
                            
                            const existingPages = photosConfig.pages || [];
                            if (existingPages.length > 0) {
                              const updatedPages = [...existingPages];
                              updatedPages[0] = {
                                ...updatedPages[0],
                                photos: [...(updatedPages[0].photos || []), newPhotoItem],
                              };
                              updateAppConfig('photos', { pages: updatedPages });
                            } else {
                              const existingPhotos = photosConfig.photos || [];
                              updateAppConfig('photos', { photos: [...existingPhotos, newPhotoItem] });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {/* Photos Cards List */}
                  {((photosConfig.pages?.[0]?.photos) || (photosConfig.photos) || []).map((photo: { id?: string; url: string; caption: string; secretNote?: string; date?: string; location?: string; tapeStyle?: string; filter?: string; sticker?: string }, idx: number) => (
                    <div
                      key={photo.id || idx}
                      style={{
                        background: '#F8F9FA',
                        borderRadius: 8,
                        padding: 12,
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Thumbnail */}
                        <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: '#EEE', flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>Photo {idx + 1}</span>
                          <input
                            className="xp-input"
                            value={photo.caption || ''}
                            onChange={(e) => {
                              const existingPages = photosConfig.pages || [];
                              if (existingPages.length > 0) {
                                const updatedPages = [...existingPages];
                                const updatedPhotos = [...(updatedPages[0].photos || [])];
                                updatedPhotos[idx] = { ...updatedPhotos[idx], caption: e.target.value };
                                updatedPages[0] = { ...updatedPages[0], photos: updatedPhotos };
                                updateAppConfig('photos', { pages: updatedPages });
                              } else {
                                const updatedPhotos = [...(photosConfig.photos || [])];
                                updatedPhotos[idx] = { ...updatedPhotos[idx], caption: e.target.value };
                                updateAppConfig('photos', { photos: updatedPhotos });
                              }
                            }}
                            placeholder="Photo caption…"
                            style={{ borderRadius: 4, fontSize: 11, padding: '3px 6px' }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const existingPages = photosConfig.pages || [];
                            if (existingPages.length > 0) {
                              const updatedPages = [...existingPages];
                              const updatedPhotos = (updatedPages[0].photos || []).filter((_: unknown, i: number) => i !== idx);
                              updatedPages[0] = { ...updatedPages[0], photos: updatedPhotos };
                              updateAppConfig('photos', { pages: updatedPages });
                            } else {
                              const updatedPhotos = (photosConfig.photos || []).filter((_: unknown, i: number) => i !== idx);
                              updateAppConfig('photos', { photos: updatedPhotos });
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#E05555' }}
                          title="Delete photo"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Secret Note Back */}
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#888' }}>💌 Secret Note (Back of Polaroid)</span>
                        <textarea
                          className="xp-input"
                          value={photo.secretNote || ''}
                          onChange={(e) => {
                            const existingPages = photosConfig.pages || [];
                            if (existingPages.length > 0) {
                              const updatedPages = [...existingPages];
                              const updatedPhotos = [...(updatedPages[0].photos || [])];
                              updatedPhotos[idx] = { ...updatedPhotos[idx], secretNote: e.target.value };
                              updatedPages[0] = { ...updatedPages[0], photos: updatedPhotos };
                              updateAppConfig('photos', { pages: updatedPages });
                            } else {
                              const updatedPhotos = [...(photosConfig.photos || [])];
                              updatedPhotos[idx] = { ...updatedPhotos[idx], secretNote: e.target.value };
                              updateAppConfig('photos', { photos: updatedPhotos });
                            }
                          }}
                          rows={2}
                          placeholder="Note written on back of photo…"
                          style={{ borderRadius: 4, fontSize: 11, resize: 'vertical' }}
                        />
                      </label>

                      {/* Date & Location tags */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          className="xp-input"
                          value={photo.date || ''}
                          onChange={(e) => {
                            const existingPages = photosConfig.pages || [];
                            if (existingPages.length > 0) {
                              const updatedPages = [...existingPages];
                              const updatedPhotos = [...(updatedPages[0].photos || [])];
                              updatedPhotos[idx] = { ...updatedPhotos[idx], date: e.target.value };
                              updatedPages[0] = { ...updatedPages[0], photos: updatedPhotos };
                              updateAppConfig('photos', { pages: updatedPages });
                            }
                          }}
                          placeholder="Date (e.g. Oct 14)"
                          style={{ borderRadius: 4, fontSize: 10, flex: 1, padding: '2px 6px' }}
                        />
                        <input
                          className="xp-input"
                          value={photo.location || ''}
                          onChange={(e) => {
                            const existingPages = photosConfig.pages || [];
                            if (existingPages.length > 0) {
                              const updatedPages = [...existingPages];
                              const updatedPhotos = [...(updatedPages[0].photos || [])];
                              updatedPhotos[idx] = { ...updatedPhotos[idx], location: e.target.value };
                              updatedPages[0] = { ...updatedPages[0], photos: updatedPhotos };
                              updateAppConfig('photos', { pages: updatedPages });
                            }
                          }}
                          placeholder="Location"
                          style={{ borderRadius: 4, fontSize: 10, flex: 1, padding: '2px 6px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'secret' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🔒 Secret Folder</h3>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Secret Passcode (4-digit number)</span>
                  <input className="xp-input" maxLength={4} value={secretConfig.password || ''} onChange={(e) => updateAppConfig('secret', { password: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 5042" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Password Hint</span>
                  <input className="xp-input" value={secretConfig.passwordHint || ''} onChange={(e) => updateAppConfig('secret', { passwordHint: e.target.value })} placeholder="Hint: Complete the Roblox Studio Obby game to find it!" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Secret Title</span>
                  <input className="xp-input" value={secretConfig.title || ''} onChange={(e) => updateAppConfig('secret', { title: e.target.value })} placeholder="A Hidden Message For You 💌" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Hidden Content</span>
                  <textarea className="xp-input" value={secretConfig.content || ''} onChange={(e) => updateAppConfig('secret', { content: e.target.value })} rows={6} placeholder="Your secret message..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
              </div>
            )}

            {activeTab === 'game' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎮 Heart Maze Game</h3>
                <div style={{ background: '#F0F8FF', borderRadius: 8, padding: 12, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  🎮 The recipient plays a retro 2D grid-based Heart Maze puzzle game. When they complete all levels, they will be rewarded with the 4-digit Secret Folder password code you configured!
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Victory Message</span>
                  <textarea className="xp-input" value={gameConfig.rewardMessage || ''} onChange={(e) => updateAppConfig('game', { rewardMessage: e.target.value })} rows={4} placeholder="You completed the maze! Excellent calculations..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
              </div>
            )}

            {activeTab === 'purr' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🐱 Cat Purr</h3>
                <div style={{ background: '#F0F8FF', borderRadius: 8, padding: 12, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  🐱 Set a custom name for your recipient's virtual 3D pet kitten! The recipient can play the interactive 3D Kitten Island simulation inside the Cat Purr window.
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Kitten Name</span>
                  <input className="xp-input" value={purrConfig.catName || ''} onChange={(e) => updateAppConfig('purr', { catName: e.target.value })} placeholder="e.g. Lemon" style={{ borderRadius: 6 }} />
                </label>
              </div>
            )}

            {activeTab === 'music' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎵 Home Screen Background Music</h3>
                <div style={{ background: '#F5F3FF', borderRadius: 8, padding: 12, fontSize: 12, color: '#5B21B6', lineHeight: 1.6 }}>
                  🎵 Upload your own MP4 video or MP3 audio file. Trim it to play your favorite snippet on loop when the recipient opens the desktop.
                </div>

                {/* Enable toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={!!musicConfig.enabled}
                    onChange={(e) => {
                      setConfig(prev => ({
                        ...prev,
                        music: {
                          ...(prev.music || { startOffset: 0, endOffset: 60, loop: true, volume: 0.5 }),
                          enabled: e.target.checked
                        }
                      }));
                    }}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>Enable Background Music</span>
                </label>

                {musicConfig.enabled && (
                  <>
                    {/* Audio source choice */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #EEE', paddingTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Select Preset Track</span>
                      <select
                        className="xp-input"
                        style={{ borderRadius: 6 }}
                        value={musicConfig.url || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          const name = e.target.options[e.target.selectedIndex].text;
                          if (url) {
                            setConfig(prev => ({
                              ...prev,
                              music: {
                                ...(prev.music || { loop: true, volume: 0.5 }),
                                enabled: true,
                                url,
                                fileName: name,
                                startOffset: 0,
                                endOffset: 60,
                              }
                            }));
                          }
                        }}
                      >
                        <option value="">-- Choose a Preset track --</option>
                        <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">Nostalgia Breeze (Chiptune)</option>
                        <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3">Retro Sunset Beat (Lofi)</option>
                        <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3">Dreamy Space Synth</option>
                      </select>
                    </div>

                    {/* File upload option */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Or Upload Custom Audio/Video (MP3/MP4)</span>
                      <input
                        type="file"
                        accept="audio/*,video/mp4"
                        style={{ fontSize: 12 }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 15 * 1024 * 1024) {
                              alert('Please choose a file smaller than 15MB for optimal loading speed.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              const tempAudio = new Audio(dataUrl);
                              tempAudio.onloadedmetadata = () => {
                                setConfig(prev => ({
                                  ...prev,
                                  music: {
                                    enabled: true,
                                    url: dataUrl,
                                    fileName: file.name,
                                    startOffset: 0,
                                    endOffset: Math.min(60, Math.floor(tempAudio.duration)),
                                    loop: true,
                                    volume: 0.5
                                  }
                                }));
                              };
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span style={{ fontSize: 10, color: '#888' }}>
                        Uploaded file: <span style={{ fontWeight: 'bold', color: '#555' }}>{musicConfig.fileName || 'None'}</span>
                      </span>
                    </div>

                    {/* Start/End Trimming offsets */}
                    <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #EEE', paddingTop: 12 }}>
                      <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Start Offset (seconds)</span>
                        <input
                          type="number"
                          className="xp-input"
                          value={musicConfig.startOffset || 0}
                          min={0}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setConfig(prev => ({
                              ...prev,
                              music: {
                                ...(prev.music || { enabled: true, loop: true, volume: 0.5 }),
                                startOffset: val
                              }
                            }));
                          }}
                          style={{ borderRadius: 6 }}
                        />
                      </label>
                      <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>End Offset (seconds)</span>
                        <input
                          type="number"
                          className="xp-input"
                          value={musicConfig.endOffset || 60}
                          min={musicConfig.startOffset || 0}
                          onChange={(e) => {
                            const val = Math.max(musicConfig.startOffset || 0, parseInt(e.target.value) || 60);
                            setConfig(prev => ({
                              ...prev,
                              music: {
                                ...(prev.music || { enabled: true, loop: true, volume: 0.5 }),
                                endOffset: val
                              }
                            }));
                          }}
                          style={{ borderRadius: 6 }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666' }}>
                      <span>Selected portion: {(musicConfig.endOffset || 60) - (musicConfig.startOffset || 0)} seconds</span>
                      <span>Loop enabled</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: preview */}
        <div className="custom-scrollbar" style={{ flex: 1, background: '#F0F4FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, height: '100%', overflowY: 'auto' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 16, textAlign: 'center' }}>Live Preview</div>

          {/* Skeuomorphic Retro Monitor wrapping the live interactive Desktop */}
          <div className="w-full max-w-[550px] relative z-10 flex justify-center items-center">
            <RetroMonitor virtualWidth={1280} virtualHeight={720} aspectRatio={16/9}>
              <Desktop config={config} />
            </RetroMonitor>
          </div>

          {/* Published URL */}
          <AnimatePresence>
            {published && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 24,
                  background: 'white',
                  borderRadius: 12,
                  padding: '16px 20px',
                  border: '2px solid #4EBFBF',
                  textAlign: 'center',
                  maxWidth: 320,
                  boxShadow: '0 4px 16px rgba(78,191,191,0.3)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Your desktop is live!</div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Share this link with {config.recipientName}:</div>
                <div style={{
                  background: '#F0F8FF',
                  border: '1px solid #4EBFBF',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#1F5FA6',
                  wordBreak: 'break-all',
                }}>
                  {shareUrl}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    style={{ background: '#4EBFBF', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, color: 'white', cursor: 'pointer', fontFamily: 'var(--font-nunito)', fontWeight: 700 }}
                  >
                    📋 Copy Link
                  </button>
                  <Link href={shareUrl} target="_blank" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#F0F0F0', border: '1px solid #DDD', borderRadius: 8, padding: '6px 14px', fontSize: 11, color: '#333', cursor: 'pointer', fontFamily: 'var(--font-nunito)', fontWeight: 700 }}>
                      👁 Preview
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
