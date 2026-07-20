'use client';
import { useState, useRef, useEffect } from 'react';
import { useSound } from '@/hooks/useSound';

interface StickerNode {
  id: string;
  stickerId: string;
  emoji: string;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotationDeg: number;
}

interface MixtapeCreatorProps {
  config: any;
  onChange: (updatedConfig: any) => void;
}

const STICKER_TEMPLATES = [
  { id: 'daisy', emoji: '🌸', label: 'Daisy' },
  { id: 'ribbon', emoji: '🎀', label: 'Ribbon' },
  { id: 'clover', emoji: '🍀', label: 'Clover' },
  { id: 'heart', emoji: '💖', label: 'Heart' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'sparkles', emoji: '✨', label: 'Sparkles' },
];

const PATTERN_TEMPLATES = [
  { id: 'floral', label: '🌸 Floral Pink', bg: '#FFD6B8', color: '#FFB7C5', bgStyle: 'radial-gradient(circle, #FFE4E6 20%, transparent 20%), radial-gradient(circle, #FFE4E6 20%, transparent 20%)', bgSize: '20px 20px', bgPosition: '0 0, 10px 10px' },
  { id: 'plaid', label: '🧀 Yellow Plaid', bg: '#FBBF24', color: '#FCD34D', bgStyle: 'linear-gradient(90deg, rgba(255,255,255,0.2) 50%, transparent 50%), linear-gradient(rgba(255,255,255,0.2) 50%, transparent 50%)', bgSize: '15px 15px' },
  { id: 'grid', label: '🟥 Red Grid', bg: '#FCA5A5', color: '#F87171', bgStyle: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', bgSize: '16px 16px' },
  { id: 'blue', label: '🌊 Blue Waves', bg: '#93C5FD', color: '#60A5FA', bgStyle: 'linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', bgSize: '20px 20px' },
];

const PEN_COLORS = [
  { color: '#2A2A2A', label: 'Soft Black' },
  { color: '#FF4D6D', label: 'Pink' },
  { color: '#0D7FCE', label: 'Blue' },
  { color: '#10B981', label: 'Forest Green' },
];

export default function MixtapeCreator({ config, onChange }: MixtapeCreatorProps) {
  const sounds = useSound();
  const cassetteRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [activeTab, setActiveTab] = useState<'decorate' | 'tracks'>('decorate');
  const [patternId, setPatternId] = useState(config.cassette_style?.pattern_id || 'floral');
  const [stickers, setStickers] = useState<StickerNode[]>(config.stickers || []);
  const [penColor, setPenColor] = useState('#2A2A2A');
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  // Track dragging/resizing/rotating state
  const activeAction = useRef<{
    type: 'drag' | 'rotate' | 'scale';
    stickerId: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startScale: number;
    startRotation: number;
  } | null>(null);

  const getActivePattern = () => {
    return PATTERN_TEMPLATES.find((p) => p.id === patternId) || PATTERN_TEMPLATES[0];
  };

  // Drawing canvas logic
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load initial doodle if exists
    if (config.doodle_data_url) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = config.doodle_data_url;
    }
  }, [config.doodle_data_url]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev, dataUrl]);
    updateConfig({ doodle_data_url: dataUrl });
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.click();
    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    setHistory(newHistory);

    const prevState = newHistory[newHistory.length - 1];
    if (prevState) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = prevState;
      updateConfig({ doodle_data_url: prevState });
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateConfig({ doodle_data_url: '' });
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.click();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, '']);
    updateConfig({ doodle_data_url: '' });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    lastPos.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentX, currentY);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 12;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveCanvasState();
    }
  };

  // Sticker actions
  const addSticker = (stickerId: string, emoji: string) => {
    sounds.click();
    const newSticker: StickerNode = {
      id: `${stickerId}-${Date.now()}`,
      stickerId,
      emoji,
      xPercent: 50,
      yPercent: 40,
      scale: 1,
      rotationDeg: 0,
    };
    const updated = [...stickers, newSticker];
    setStickers(updated);
    setSelectedSticker(newSticker.id);
    updateConfig({ stickers: updated });
  };

  const deleteSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.click();
    const updated = stickers.filter((s) => s.id !== id);
    setStickers(updated);
    setSelectedSticker(null);
    updateConfig({ stickers: updated });
  };

  const handleStickerMouseDown = (id: string, type: 'drag' | 'rotate' | 'scale', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSticker(id);
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker) return;

    activeAction.current = {
      type,
      stickerId: id,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: sticker.xPercent,
      startTop: sticker.yPercent,
      startScale: sticker.scale,
      startRotation: sticker.rotationDeg,
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!activeAction.current || !cassetteRef.current) return;
    const { type, stickerId, startX, startY, startLeft, startTop, startScale, startRotation } = activeAction.current;
    const stickerIndex = stickers.findIndex((s) => s.id === stickerId);
    if (stickerIndex === -1) return;

    const rect = cassetteRef.current.getBoundingClientRect();
    const updatedStickers = [...stickers];
    const sticker = { ...updatedStickers[stickerIndex] };

    if (type === 'drag') {
      const dx = ((e.clientX - startX) / rect.width) * 100;
      const dy = ((e.clientY - startY) / rect.height) * 100;
      sticker.xPercent = Math.max(0, Math.min(100, startLeft + dx));
      sticker.yPercent = Math.max(0, Math.min(100, startTop + dy));
    } else if (type === 'rotate') {
      const stickerRect = document.getElementById(stickerId)?.getBoundingClientRect();
      if (stickerRect) {
        const centerX = stickerRect.left + stickerRect.width / 2;
        const centerY = stickerRect.top + stickerRect.height / 2;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const startAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
        sticker.rotationDeg = startRotation + (currentAngle - startAngle);
      }
    } else if (type === 'scale') {
      const stickerRect = document.getElementById(stickerId)?.getBoundingClientRect();
      if (stickerRect) {
        const centerX = stickerRect.left + stickerRect.width / 2;
        const centerY = stickerRect.top + stickerRect.height / 2;
        const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const startDist = Math.hypot(startX - centerX, startY - centerY);
        sticker.scale = Math.max(0.4, Math.min(2.5, startScale * (currentDist / startDist)));
      }
    }

    updatedStickers[stickerIndex] = sticker;
    setStickers(updatedStickers);
  };

  const handleGlobalMouseUp = () => {
    if (activeAction.current) {
      updateConfig({ stickers });
      activeAction.current = null;
    }
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  const updateConfig = (updates: any) => {
    onChange({
      ...config,
      ...updates,
    });
  };

  const addSong = () => {
    sounds.click();
    const songs = [...(config.songs || []), { title: '', artist: '' }];
    updateConfig({ songs });
  };

  const removeSong = (idx: number) => {
    sounds.click();
    const songs = (config.songs || []).filter((_: any, i: number) => i !== idx);
    updateConfig({ songs });
  };

  const updateSong = (idx: number, updates: any) => {
    const songs = [...(config.songs || [])];
    songs[idx] = { ...songs[idx], ...updates };
    updateConfig({ songs });
  };

  const activePattern = getActivePattern();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Wizard Step Selector Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DDD', marginBottom: 4 }}>
        <button
          onClick={() => { sounds.click(); setActiveTab('decorate'); }}
          style={{
            flex: 1,
            padding: '8px 0',
            fontSize: 12,
            fontWeight: 800,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: activeTab === 'decorate' ? '3px solid #1F5FA6' : '3px solid transparent',
            color: activeTab === 'decorate' ? '#1F5FA6' : '#666',
            fontFamily: 'var(--font-nunito)',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          🎨 1. Decorate Cassette
        </button>
        <button
          onClick={() => { sounds.click(); setActiveTab('tracks'); }}
          style={{
            flex: 1,
            padding: '8px 0',
            fontSize: 12,
            fontWeight: 800,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: activeTab === 'tracks' ? '3px solid #1F5FA6' : '3px solid transparent',
            color: activeTab === 'tracks' ? '#1F5FA6' : '#666',
            fontFamily: 'var(--font-nunito)',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          🎵 2. Note & Tracklist
        </button>
      </div>

      {activeTab === 'decorate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cassette Workspace Preview Frame */}
          <div 
            style={{ 
              background: '#F0F4FF', 
              borderRadius: 12, 
              padding: 24, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '2px dashed #CBD5E1',
            }}
          >
            {/* The absolute cassette tape assembly */}
            <div 
              ref={cassetteRef}
              onClick={() => setSelectedSticker(null)}
              style={{
                position: 'relative',
                width: '320px',
                height: '210px',
                backgroundColor: activePattern.bg,
                backgroundImage: activePattern.bgStyle,
                backgroundSize: activePattern.bgSize,
                backgroundPosition: activePattern.bgPosition,
                borderRadius: '16px',
                border: '6px solid #2B2B2B',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                cursor: 'default',
              }}
            >
              {/* Outer classic plastic bevel frame overlay (cassette tape indentations) */}
              <div 
                style={{
                  position: 'absolute',
                  inset: '8px',
                  border: '2.5px solid rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                }}
              />

              {/* Center Paper Label Area */}
              <div
                style={{
                  position: 'absolute',
                  left: '32px',
                  top: '32px',
                  right: '32px',
                  height: '110px',
                  backgroundColor: '#FFFFFF',
                  border: '3.5px solid #2B2B2B',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                {/* Horizontal writing lines */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(#E2E8F0 1px, transparent 1px)',
                  backgroundSize: '100% 24px',
                  backgroundPosition: '0 12px',
                  opacity: 0.7,
                }} />

                {/* Text Title Input Box */}
                <input
                  type="text"
                  value={config.title || ''}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  placeholder="write mixtape name..."
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#334155',
                    textAlign: 'center',
                    outline: 'none',
                    zIndex: 10,
                  }}
                />

                {/* Recipient writing */}
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '12px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '9px',
                  color: '#64748B',
                  zIndex: 10,
                }}>
                  FOR: {config.recipient || 'YOU'}
                </div>

                {/* Drawing HTML5 canvas element */}
                <canvas
                  ref={canvasRef}
                  width={256}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: isEraser ? 'cell' : 'crosshair',
                    zIndex: 5,
                  }}
                />
              </div>

              {/* Reels visualization placeholders */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '52px',
                  right: '52px',
                  height: '38px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2B2B2B', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px dashed #94A3B8' }} />
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2B2B2B', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px dashed #94A3B8' }} />
                </div>
              </div>

              {/* Placed Stickers Workspace Tree */}
              {stickers.map((st) => {
                const isSelected = selectedSticker === st.id;
                return (
                  <div
                    key={st.id}
                    id={st.id}
                    style={{
                      position: 'absolute',
                      left: `${st.xPercent}%`,
                      top: `${st.yPercent}%`,
                      transform: `translate(-50%, -50%) rotate(${st.rotationDeg}deg) scale(${st.scale})`,
                      transformOrigin: 'center center',
                      zIndex: isSelected ? 50 : 30,
                      cursor: 'move',
                      userSelect: 'none',
                    }}
                    onMouseDown={(e) => handleStickerMouseDown(st.id, 'drag', e)}
                  >
                    {/* Sticker Content Emoji */}
                    <div style={{ fontSize: '32px', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.15))' }}>
                      {st.emoji}
                    </div>

                    {/* DDRS transform node handles */}
                    {isSelected && (
                      <div 
                        style={{
                          position: 'absolute',
                          inset: '-8px',
                          border: '1.5px dashed #3B82F6',
                          borderRadius: '4px',
                          pointerEvents: 'none',
                        }}
                      >
                        {/* Close button (delete) */}
                        <div
                          className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[9px] cursor-pointer absolute -top-2 -left-2 shadow-sm pointer-events-auto"
                          onClick={(e) => deleteSticker(st.id, e)}
                        >
                          ×
                        </div>
                        {/* Rotation handle */}
                        <div
                          className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[9px] cursor-alias absolute -top-2 -right-2 shadow-sm pointer-events-auto"
                          onMouseDown={(e) => handleStickerMouseDown(st.id, 'rotate', e)}
                        >
                          ↻
                        </div>
                        {/* Resize handle */}
                        <div
                          className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[9px] cursor-se-resize absolute -bottom-2 -right-2 shadow-sm pointer-events-auto"
                          onMouseDown={(e) => handleStickerMouseDown(st.id, 'scale', e)}
                        >
                          ⤄
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plaid and colors controls toolbar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Base Casing Pattern Selector */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cassette Tape Shell Pattern</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 4 }}>
                {PATTERN_TEMPLATES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sounds.click();
                      setPatternId(p.id);
                      updateConfig({ cassette_style: { pattern_id: p.id } });
                    }}
                    style={{
                      padding: '6px',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 6,
                      background: p.bg,
                      border: patternId === p.id ? '2.5px solid #1F5FA6' : '1px solid #CCC',
                      cursor: 'pointer',
                      color: '#2B2B2B',
                      textAlign: 'center',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doodle Ink Palette controls */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EEE', paddingTop: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Doodle Brush</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {PEN_COLORS.map((colorObj) => (
                    <button
                      key={colorObj.color}
                      onClick={() => {
                        sounds.click();
                        setPenColor(colorObj.color);
                        setIsEraser(false);
                      }}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: colorObj.color,
                        border: !isEraser && penColor === colorObj.color ? '2px solid #000' : '2px solid transparent',
                        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)',
                        cursor: 'pointer',
                      }}
                      title={colorObj.label}
                    />
                  ))}
                  <button
                    onClick={() => {
                      sounds.click();
                      setIsEraser(true);
                    }}
                    style={{
                      padding: '2px 6px',
                      fontSize: 10,
                      borderRadius: 4,
                      background: isEraser ? '#CBD5E1' : '#FFF',
                      border: '1px solid #AAA',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    🧽 Eraser
                  </button>
                </div>
              </div>

              {/* Undo / Clear operations */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: '#FFF',
                    border: '1px solid #AAA',
                    cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: history.length === 0 ? 0.5 : 1,
                    fontWeight: 700,
                  }}
                >
                  ↩ Undo
                </button>
                <button
                  onClick={handleClearCanvas}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: '#FFEBEB',
                    border: '1px solid #FAA',
                    color: '#D32F2F',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>

            {/* Sticker Drawer bin */}
            <div style={{ borderTop: '1px solid #EEE', paddingTop: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sticker Bin (Click to add)</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {STICKER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => addSticker(tmpl.id, tmpl.emoji)}
                    style={{
                      fontSize: 24,
                      padding: '4px 8px',
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    title={tmpl.label}
                  >
                    {tmpl.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Note section */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Personal Message / Liner Notes</span>
            <textarea
              className="xp-input"
              value={config.personalNote || ''}
              onChange={(e) => updateConfig({ personalNote: e.target.value })}
              rows={4}
              placeholder="Every time I hear these songs, I think of you..."
              style={{ borderRadius: 6, resize: 'vertical' }}
            />
          </label>

          {/* Spotify and YouTube fields */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Spotify Link (Track, Album, or Playlist)</span>
            <input
              className="xp-input"
              value={config.spotifyUrl || ''}
              onChange={(e) => updateConfig({ spotifyUrl: e.target.value })}
              placeholder="https://open.spotify.com/track/... or /playlist/..."
              style={{ borderRadius: 6 }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>YouTube or YouTube Music Link</span>
            <input
              className="xp-input"
              value={config.youtubeUrl || ''}
              onChange={(e) => updateConfig({ youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or music.youtube.com/..."
              style={{ borderRadius: 6 }}
            />
          </label>

          {/* Tracklist table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Liner Track Sheet</span>
              <button
                onClick={addSong}
                style={{
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 4,
                  background: '#1F5FA6',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-nunito)',
                }}
              >
                + Add Track
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(config.songs || []).map((song: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#999', fontFamily: 'var(--font-pixel)', minWidth: 16 }}>{String(i + 1).padStart(2, '0')}</span>
                  <input
                    className="xp-input"
                    value={song.title}
                    onChange={(e) => updateSong(i, { title: e.target.value })}
                    placeholder="Track Title"
                    style={{ flex: 2, borderRadius: 6, padding: '4px 8px', fontSize: 12 }}
                  />
                  <input
                    className="xp-input"
                    value={song.artist}
                    onChange={(e) => updateSong(i, { artist: e.target.value })}
                    placeholder="Artist"
                    style={{ flex: 1, borderRadius: 6, padding: '4px 8px', fontSize: 12 }}
                  />
                  <button
                    onClick={() => removeSong(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                    title="Remove Track"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
