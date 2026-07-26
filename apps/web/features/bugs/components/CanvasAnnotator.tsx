'use client';

/**
 * features/bugs/components/CanvasAnnotator.tsx
 *
 * Native HTML5 Canvas annotation tool for bug screenshots.
 * Supports image upload, freehand drawing, rectangle overlay, and text labels.
 * Exports a Blob back to the parent form.
 */

import React, { useState, useRef, useEffect, PointerEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Tool = 'pen' | 'rect' | 'text';

interface CanvasAnnotatorProps {
  onScreenshotChange: (blob: Blob | null) => void;
}

const COLORS = [
  { label: 'Red',   value: '#ef4444' },
  { label: 'Blue',  value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
];

export function CanvasAnnotator({ onScreenshotChange }: CanvasAnnotatorProps): React.ReactElement {
  // ─── State ─────────────────────────────────────────────────────────────
  const [hasImage, setHasImage] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  // ─── Refs ──────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drawing state
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);
  
  // Undo stack
  const undoStack = useRef<ImageData[]>([]);

  // ─── Core Methods ──────────────────────────────────────────────────────

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        onScreenshotChange(blob);
      },
      'image/png',
      0.9
    );
  };

  const pushUndoState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.current.push(data);
    // Keep stack manageable
    if (undoStack.current.length > 20) {
      undoStack.current.shift();
    }
    exportCanvas();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || undoStack.current.length === 0) return;
    
    // Pop current state (if any uncommitted changes, they are lost, but we commit on stroke end)
    undoStack.current.pop(); 
    
    if (undoStack.current.length > 0) {
      const prev = undoStack.current[undoStack.current.length - 1];
      ctx.putImageData(prev, 0, 0);
    } else {
      // If we popped the last state, we clear the canvas (or back to original image)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasImage(false);
      onScreenshotChange(null);
    }
    exportCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [];
    setHasImage(false);
    onScreenshotChange(null);
  };

  // ─── File Upload ───────────────────────────────────────────────────────

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Cap dimensions to fit screen comfortably
        const container = canvas.parentElement;
        const MAX_WIDTH = container ? container.clientWidth || 900 : 900;
        const MAX_HEIGHT = Math.round(window.innerHeight * 0.6);
        let width = img.width;
        let height = img.height;

        // Scale down to fit width first
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        // Then scale down to fit height if still too tall
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        
        // Reset undo stack and push base image
        undoStack.current = [];
        pushUndoState();
        setHasImage(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again if cleared
    e.target.value = '';
  };

  // ─── Drawing Handlers ──────────────────────────────────────────────────

  // Convert client coordinates to canvas internal coordinates
  const getPointerPos = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Calculate scale because canvas might be rendered smaller via CSS max-width: 100%
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!hasImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    isDrawing.current = true;
    const pos = getPointerPos(e);
    startPos.current = pos;

    // Save snapshot for rect/shape dragging
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === 'text') {
      const text = window.prompt('Enter label text:');
      if (text) {
        ctx.font = `bold ${strokeWidth * 8}px sans-serif`;
        ctx.fillStyle = color;
        // Basic background for text readability
        const metrics = ctx.measureText(text);
        const padding = 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(pos.x - padding, pos.y - (strokeWidth * 8) - padding, metrics.width + (padding * 2), (strokeWidth * 8) + (padding * 2));
        
        ctx.fillStyle = color;
        ctx.fillText(text, pos.x, pos.y);
        pushUndoState();
      }
      isDrawing.current = false; // text is instantaneous
      return;
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !hasImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !snapshot.current) return;

    const pos = getPointerPos(e);

    if (activeTool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (activeTool === 'rect') {
      // Restore previous snapshot to draw rubber-band rect
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath();
      const width = pos.x - startPos.current.x;
      const height = pos.y - startPos.current.y;
      ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
    }
  };

  const onPointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    pushUndoState();
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        aria-hidden="true"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-surface-2 border border-surface-3 rounded-md">
        {!hasImage ? (
          <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
            Upload Screenshot
          </Button>
        ) : (
          <>
            {/* Tools */}
            <div className="flex items-center gap-1 border-r border-surface-3 pr-3">
              {(['pen', 'rect', 'text'] as Tool[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTool(t)}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded transition-colors uppercase',
                    activeTool === t ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-3'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2 border-r border-surface-3 pr-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-transform',
                    color === c.value ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                  )}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-2 border-r border-surface-3 pr-3">
              <button
                type="button"
                onClick={() => setStrokeWidth(3)}
                className={cn('w-6 h-6 rounded-full flex items-center justify-center bg-surface-3', strokeWidth === 3 && 'ring-2 ring-primary')}
                aria-label="Thin stroke"
              >
                <div className="w-1 h-1 bg-text rounded-full" />
              </button>
              <button
                type="button"
                onClick={() => setStrokeWidth(8)}
                className={cn('w-6 h-6 rounded-full flex items-center justify-center bg-surface-3', strokeWidth === 8 && 'ring-2 ring-primary')}
                aria-label="Thick stroke"
              >
                <div className="w-2.5 h-2.5 bg-text rounded-full" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="ghost" size="sm" onClick={handleUndo} disabled={undoStack.current.length <= 1}>
                Undo
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={clearCanvas}>
                Clear
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Canvas Container */}
      <div
        className={cn(
          'relative w-full rounded-md border border-surface-3 bg-surface-1',
          !hasImage
            ? 'flex items-center justify-center h-48 border-dashed'
            : 'overflow-auto max-h-[60vh]'
        )}
      >
        {!hasImage && (
          <p className="text-sm text-text-disabled text-center">
            Upload an image to start annotating
          </p>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerOut={onPointerUp}
          className={cn(
            'block max-w-full h-auto mx-auto touch-none',
            !hasImage && 'hidden',
            activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'
          )}
          style={{ display: hasImage ? 'block' : 'none' }}
        />
      </div>
    </div>
  );
}
