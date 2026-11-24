import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

const ASPECT_PRESETS = [
  { id: '1:1', label: '1:1', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
];

export default function ImageCropModal({
  imageSrc,
  aspect = 1,
  allowAspectSwitch = false,
  theme = 'default',
  onCancel,
  onConfirm,
}) {
  const [selectedAspect, setSelectedAspect] = useState(aspect);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef(null);
  const isChristmas = theme === 'christmas';

  useEffect(() => {
    setSelectedAspect(aspect);
  }, [aspect]);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc, selectedAspect]);

  const frameWidth = 280;
  const frameHeight = Math.max(158, Math.min(280, Math.round(frameWidth / selectedAspect)));

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgSize({ width: naturalWidth, height: naturalHeight });
  };

  const baseScale =
    imgSize.width && imgSize.height
      ? Math.max(frameWidth / imgSize.width, frameHeight / imgSize.height)
      : 1;

  const effectiveScale = baseScale * zoom;
  const renderedWidth = imgSize.width * effectiveScale;
  const renderedHeight = imgSize.height * effectiveScale;

  const clampOffset = (nextX, nextY, currentZoom = zoom) => {
    if (!imgSize.width || !imgSize.height) return { x: 0, y: 0 };
    const scale = baseScale * currentZoom;
    const maxX = Math.max(0, (imgSize.width * scale - frameWidth) / 2);
    const maxY = Math.max(0, (imgSize.height * scale - frameHeight) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setOffset(clampOffset(e.clientX - dragStart.x, e.clientY - dragStart.y));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.min(3, Math.max(1, Number(newZoom)));
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, clampedZoom));
  };

  const handleSaveCrop = () => {
    const imageEl = imgRef.current;
    if (!imageEl || !imgSize.width || !imgSize.height) return;

    const outputWidth = selectedAspect === 1 ? 512 : 960;
    const outputHeight = Math.round(outputWidth / selectedAspect);

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgLeftInFrame = (frameWidth - renderedWidth) / 2 + offset.x;
    const imgTopInFrame = (frameHeight - renderedHeight) / 2 + offset.y;

    const sx = Math.max(0, -imgLeftInFrame / effectiveScale);
    const sy = Math.max(0, -imgTopInFrame / effectiveScale);
    const sWidth = Math.min(imgSize.width - sx, frameWidth / effectiveScale);
    const sHeight = Math.min(imgSize.height - sy, frameHeight / effectiveScale);

    ctx.drawImage(imageEl, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onConfirm({ file: croppedFile, dataUrl: previewDataUrl });
      },
      'image/jpeg',
      0.9
    );
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`max-w-sm w-full rounded-2xl p-5 border shadow-2xl space-y-4 ${
          isChristmas
            ? 'bg-red-950/95 border-red-300/30 text-white'
            : 'bg-slate-900 border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold flex items-center gap-2">
            <Crop className="w-4 h-4 text-amber-300" strokeWidth={2.2} />
            <span>Вибір кадру фотографії</span>
          </span>

          <button
            type="button"
            onClick={onCancel}
            className="press-btn p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            title="Скасувати"
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <p className="text-[11px] opacity-75 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
          <span>Перетягуй фото всередині рамки та налаштуй масштаб</span>
        </p>

        {allowAspectSwitch && (
          <div className="grid grid-cols-3 gap-1.5">
            {ASPECT_PRESETS.map((preset) => {
              const active = Math.abs(selectedAspect - preset.value) < 0.02;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedAspect(preset.value)}
                  className={`press-btn py-1.5 rounded-lg text-xs font-semibold border ${
                    active
                      ? isChristmas
                        ? 'bg-red-700 border-red-200/50 text-white'
                        : 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-slate-950/70 border-white/10 text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ width: frameWidth, height: frameHeight }}
            className="relative overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-black cursor-grab active:cursor-grabbing touch-none select-none shadow-inner"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Кадрування"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                width: renderedWidth || 'auto',
                height: renderedHeight || 'auto',
                maxWidth: 'none',
                position: 'absolute',
                left: (frameWidth - renderedWidth) / 2 + offset.x,
                top: (frameHeight - renderedHeight) / 2 + offset.y,
              }}
            />

            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <ZoomOut className="w-4 h-4 opacity-75 shrink-0" strokeWidth={2.2} />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => handleZoomChange(e.target.value)}
            className="flex-1 accent-indigo-500 cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 opacity-75 shrink-0" strokeWidth={2.2} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="press-btn py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Скасувати
          </button>

          <button
            type="button"
            onClick={handleSaveCrop}
            className={`press-btn py-2.5 px-3 rounded-xl text-xs font-semibold text-white border flex items-center justify-center gap-1.5 ${
              isChristmas
                ? 'bg-red-700 hover:bg-red-600 border-red-200/40'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40'
            }`}
          >
            <Check className="w-4 h-4" strokeWidth={2.4} />
            <span>Застосувати кадр</span>
          </button>
        </div>
      </div>
    </div>
  );
}