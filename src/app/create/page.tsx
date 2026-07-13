'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { DesktopConfig } from '@/lib/types';
import { DEMO_DESKTOP } from '@/lib/demoData';

type TabType = 'basic' | 'mail' | 'gacha' | 'mixtape' | 'ticket' | 'photos' | 'calendar' | 'secret' | 'game' | 'appearance';

import { saveDesktop } from '@/app/actions';

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
    const generatedSlug = slug || `${config.recipientName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    setSlug(generatedSlug);
    
    const savedConfig = { ...config, slug: generatedSlug };
    const result = await saveDesktop(generatedSlug, savedConfig);
    
    if (result.success) {
      setPublished(true);
    } else {
      alert(`Error publishing desktop: ${result.error}`);
    }
    setPublishing(false);
  };

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/d/${slug}`;

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
  ];

  const mailConfig = config.apps.mail?.config || {};
  const gachaConfig = config.apps.gacha?.config || {};
  const mixtapeConfig = config.apps.mixtape?.config || {};
  const ticketConfig = config.apps.ticket?.config || {};
  const calendarConfig = config.apps.calendar?.config || {};
  const secretConfig = config.apps.secret?.config || {};
  const gameConfig = config.apps.game?.config || {};

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0F4FF 0%, #F8F0FF 100%)',
        fontFamily: 'var(--font-nunito)',
      }}
    >
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

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)' }}>
        {/* Left: tabs + form */}
        <div style={{ width: 380, borderRight: '1px solid #E0E0E0', background: 'white', display: 'flex', flexDirection: 'column' }}>
          {/* Tab list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '12px', borderBottom: '1px solid #EEE', background: '#F8F8F8' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#1F5FA6' : 'white',
                  color: activeTab === tab.id ? 'white' : '#555',
                  border: `1px solid ${activeTab === tab.id ? '#1F5FA6' : '#DDD'}`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'var(--font-nunito)',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
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
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎰 Gacha Machine</h3>
                <div style={{ fontSize: 12, color: '#888' }}>Add 3–10 capsule messages for your recipient to discover!</div>
                {(gachaConfig.capsules || []).map((cap: { message: string; emoji: string; rarity: string; color: string }, i: number) => (
                  <div key={i} style={{ background: '#F8F8F8', borderRadius: 8, padding: 12, border: '1px solid #EEE' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 6 }}>Capsule {i + 1} {cap.rarity === 'legendary' ? '🌟' : cap.rarity === 'rare' ? '✨' : ''}</div>
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
                      style={{ marginTop: 6, fontSize: 11, padding: '2px 4px', borderRadius: 4, border: '1px solid #DDD', fontFamily: 'var(--font-nunito)' }}
                    >
                      <option value="normal">Normal</option>
                      <option value="rare">✨ Rare</option>
                      <option value="legendary">🌟 Legendary</option>
                    </select>
                  </div>
                ))}
                <button
                  onClick={() => updateAppConfig('gacha', { capsules: [...(gachaConfig.capsules || []), { message: '', emoji: '💝', rarity: 'normal', color: '#FFB7C5' }] })}
                  style={{ background: 'none', border: '2px dashed #DDD', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer', color: '#888', fontFamily: 'var(--font-nunito)' }}
                >
                  + Add Capsule
                </button>
              </div>
            )}

            {activeTab === 'mixtape' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🎵 Mixtape</h3>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mixtape Title</span>
                  <input className="xp-input" value={mixtapeConfig.title || ''} onChange={(e) => updateAppConfig('mixtape', { title: e.target.value })} placeholder="Songs That Remind Me Of You" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Personal Note</span>
                  <textarea className="xp-input" value={mixtapeConfig.personalNote || ''} onChange={(e) => updateAppConfig('mixtape', { personalNote: e.target.value })} rows={4} placeholder="Every time I hear these songs..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Spotify Playlist URL</span>
                  <input className="xp-input" value={mixtapeConfig.spotifyUrl || ''} onChange={(e) => updateAppConfig('mixtape', { spotifyUrl: e.target.value })} placeholder="https://open.spotify.com/playlist/..." style={{ borderRadius: 6 }} />
                </label>
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
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>📅 Calendar</h3>
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
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Day</span>
                    <input type="number" min={1} max={31} className="xp-input" value={calendarConfig.highlightedDay || 1} onChange={(e) => updateAppConfig('calendar', { highlightedDay: parseInt(e.target.value) })} style={{ borderRadius: 6 }} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Memory Title</span>
                  <input className="xp-input" value={calendarConfig.memoryTitle || ''} onChange={(e) => updateAppConfig('calendar', { memoryTitle: e.target.value })} placeholder="Our First Coffee ☕" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Memory Text</span>
                  <textarea className="xp-input" value={calendarConfig.memoryText || ''} onChange={(e) => updateAppConfig('calendar', { memoryText: e.target.value })} rows={4} placeholder="Write about this special day..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
              </div>
            )}

            {activeTab === 'secret' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>🔒 Secret Folder</h3>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</span>
                  <input className="xp-input" value={secretConfig.password || ''} onChange={(e) => updateAppConfig('secret', { password: e.target.value })} placeholder="love" style={{ borderRadius: 6 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Password Hint</span>
                  <input className="xp-input" value={secretConfig.passwordHint || ''} onChange={(e) => updateAppConfig('secret', { passwordHint: e.target.value })} placeholder="Hint: the thing I always say..." style={{ borderRadius: 6 }} />
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
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0 }}>⭐ Star Catcher Game</h3>
                <div style={{ background: '#F0F8FF', borderRadius: 8, padding: 12, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  🎮 The recipient plays Catch Stars — clicking 10 falling stars in 30 seconds to win a ⭐ that appears permanently on their desktop!
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Win Message</span>
                  <textarea className="xp-input" value={gameConfig.rewardMessage || ''} onChange={(e) => updateAppConfig('game', { rewardMessage: e.target.value })} rows={4} placeholder="You caught all the stars! Just like how you light up every room..." style={{ borderRadius: 6, resize: 'vertical' }} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ flex: 1, background: '#F0F4FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 16, textAlign: 'center' }}>Live Preview</div>

          {/* Mini desktop preview */}
          <div style={{
            background: '#DDD8C8',
            border: '3px solid #A09888',
            borderRadius: '10px 10px 3px 3px',
            padding: 6,
            boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
            width: 320,
          }}>
            <div style={{
              background: config.wallpaperType === 'gradient' ? config.wallpaper : 'linear-gradient(135deg, #4EBFBF, #3AA0A0)',
              borderRadius: 3,
              height: 200,
              padding: 8,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Icons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(['mail', 'gacha', 'mixtape', 'ticket', 'game'] as const).map((appType) => (
                  <div key={appType} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 3, padding: '2px 4px', fontSize: 14 }}>
                      {appType === 'mail' ? '📧' : appType === 'gacha' ? '🎰' : appType === 'mixtape' ? '🎵' : appType === 'ticket' ? '🎟' : '⭐'}
                    </div>
                    <span style={{ fontSize: 8, color: 'white', fontWeight: 700, textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                      {appType === 'mail' ? 'Inbox' : appType === 'gacha' ? 'Gacha' : appType === 'mixtape' ? 'Mixtape' : appType === 'ticket' ? 'Invitation' : 'Star Catcher'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sticky note */}
              {config.stickyNote && (
                <div style={{
                  position: 'absolute',
                  right: 6,
                  top: 6,
                  background: '#FFFF99',
                  padding: '4px 6px',
                  width: 80,
                  fontSize: 7,
                  fontFamily: 'var(--font-caveat)',
                  color: '#3A3000',
                  boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                }}>
                  {config.stickyNote.slice(0, 40)}{config.stickyNote.length > 40 ? '...' : ''}
                </div>
              )}

              {/* Taskbar */}
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
                <div style={{ background: 'linear-gradient(180deg, #62B85E, #2E6E2A)', borderRadius: '5px 2px 2px 5px', padding: '1px 5px', fontSize: 6, color: 'white', fontWeight: 700 }}>
                  🖥️ start
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 6, color: 'white', opacity: 0.8 }}>
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 8, color: '#888', padding: '4px 0 1px', fontFamily: 'var(--font-pixel)', letterSpacing: 1 }}>
              DESKTOP DEAR · {config.recipientName || 'Your Name'}
            </div>
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
