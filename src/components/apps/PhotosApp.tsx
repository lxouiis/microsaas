'use client';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { PhotosConfig } from '@/lib/types';

interface PhotosAppProps {
  config: PhotosConfig;
}

export default function PhotosApp({ config }: PhotosAppProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState(
    config.photos.map((p) => ({ x: p.x, y: p.y, rotation: p.rotation }))
  );
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    if (zoomed !== null) return;
    setDragging(idx);
    dragOffset.current = {
      dx: e.clientX - positions[idx].x,
      dy: e.clientY - positions[idx].y,
    };
  }, [positions, zoomed]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const newX = e.clientX - dragOffset.current.dx;
    const newY = e.clientY - dragOffset.current.dy;
    setPositions((prev) =>
      prev.map((p, i) => (i === dragging ? { ...p, x: newX, y: newY } : p))
    );
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #F5EDE0 0%, #EDE0D0 100%)',
        cursor: dragging !== null ? 'grabbing' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Paper texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            90deg, transparent, transparent 20px,
            rgba(0,0,0,0.01) 20px, rgba(0,0,0,0.01) 21px
          )`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: 12, color: '#AAA' }}>
          Drag photos to rearrange · Click to zoom 🌸
        </span>
      </div>

      {config.photos.map((photo, idx) => (
        <motion.div
          key={idx}
          className="polaroid"
          style={{
            left: positions[idx].x,
            top: positions[idx].y,
            rotate: positions[idx].rotation,
            zIndex: dragging === idx ? 100 : zoomed === idx ? 50 : idx + 1,
            cursor: dragging === idx ? 'grabbing' : 'grab',
            width: 160,
          }}
          animate={
            zoomed === idx
              ? {
                  scale: 1.8,
                  rotate: 0,
                  zIndex: 50,
                  x: '50%',
                  y: '20%',
                }
              : {
                  scale: dragging === idx ? 1.05 : 1,
                  rotate: positions[idx].rotation,
                }
          }
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onMouseDown={(e) => handleMouseDown(e, idx)}
          onClick={() => {
            if (dragging === null) {
              setZoomed(zoomed === idx ? null : idx);
            }
          }}
          whileHover={{ scale: dragging === idx ? 1.05 : 1.04 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.caption}
            style={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
            }}
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/140x110/FFB7C5/FFFFFF?text=${encodeURIComponent(photo.caption || '📸')}`;
            }}
          />
          <div className="polaroid-caption">{photo.caption}</div>
        </motion.div>
      ))}

      {/* Click outside to unzoom */}
      {zoomed !== null && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 30 }}
          onClick={() => setZoomed(null)}
        />
      )}
    </div>
  );
}
