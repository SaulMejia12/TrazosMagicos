/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Volume2, VolumeX, Sparkles, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { Point, TRACING_PATHS, getCharacterColor } from '../data';
import { sounds } from '../utils/sounds';

interface TracingCanvasProps {
  character: string;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

// Interactive association mapping for kids
export const CHAR_ASSOCIATIONS: Record<string, { word: string; emoji: string }> = {
  'A': { word: 'Abeja', emoji: '🐝' },
  'B': { word: 'Búho', emoji: '🦉' },
  'C': { word: 'Conejo', emoji: '🐰' },
  'D': { word: 'Dinosaurio', emoji: '🦖' },
  'E': { word: 'Elefante', emoji: '🐘' },
  'F': { word: 'Foca', emoji: '🦭' },
  'G': { word: 'Gato', emoji: '🐱' },
  'H': { word: 'Helado', emoji: '🍦' },
  'I': { word: 'Isla', emoji: '🏝️' },
  'J': { word: 'Jirafa', emoji: '🦒' },
  'K': { word: 'Koala', emoji: '🐨' },
  'L': { word: 'León', emoji: '🦁' },
  'M': { word: 'Mono', emoji: '🐵' },
  'N': { word: 'Nido', emoji: '🪺' },
  'O': { word: 'Oso', emoji: '🐻' },
  'P': { word: 'Perro', emoji: '🐶' },
  'Q': { word: 'Queso', emoji: '🧀' },
  'R': { word: 'Ratón', emoji: '🐭' },
  'S': { word: 'Sol', emoji: '☀️' },
  'T': { word: 'Tortuga', emoji: '🐢' },
  'U': { word: 'Uvas', emoji: '🍇' },
  'V': { word: 'Vaca', emoji: '🐮' },
  'W': { word: 'Waffle', emoji: '🧇' },
  'X': { word: 'Xilófono', emoji: '🪵' },
  'Y': { word: 'Yate', emoji: '⛵' },
  'Z': { word: 'Zorro', emoji: '🦊' },
  '0': { word: 'Cero burbujas', emoji: '🫧' },
  '1': { word: 'Un sol brillante', emoji: '☀️' },
  '2': { word: 'Dos patitos', emoji: '🦆' },
  '3': { word: 'Tres estrellitas', emoji: '⭐' },
  '4': { word: 'Cuatro globos', emoji: '🎈' },
  '5': { word: 'Cinco manzanas', emoji: '🍎' },
  '6': { word: 'Seis caracoles', emoji: '🐌' },
  '7': { word: 'Siete arcoíris', emoji: '🌈' },
  '8': { word: 'Ocho tentáculos', emoji: '🐙' },
  '9': { word: 'Nueve flores', emoji: '🌸' }
};

export default function TracingCanvas({ character, onComplete, onBack }: TracingCanvasProps) {
  const waypoints = TRACING_PATHS[character] || [{ x: 50, y: 15 }, { x: 50, y: 85 }];
  const characterColor = getCharacterColor(character);

  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [nextWaypointIdx, setNextWaypointIdx] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [shakeActive, setShakeActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sparkleIdRef = useRef<number>(0);
  const lastPointRef = useRef<Point | null>(null);
  const nextWaypointIdxRef = useRef<number>(0);

  const association = CHAR_ASSOCIATIONS[character] || { word: 'Trazar', emoji: '✨' };

  // Reset tracing state when the character changes
  useEffect(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setNextWaypointIdx(0);
    nextWaypointIdxRef.current = 0;
    lastPointRef.current = null;
  }, [character]);

  // Handle Mute toggle
  const toggleMute = () => {
    const newState = sounds.toggleMute();
    setIsMuted(newState);
    sounds.playClick();
  };

  // Trigger temporary sparkle explosion at logical coords
  const addSparkleBurst = (lx: number, ly: number, color: string) => {
    const newSparkles = Array.from({ length: 12 }).map(() => ({
      id: sparkleIdRef.current++,
      x: lx + (Math.random() * 12 - 6),
      y: ly + (Math.random() * 12 - 6),
      color: color
    }));
    setSparkles(prev => [...prev, ...newSparkles]);
    // Cleanup sparkles shortly after
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  };

  // Convert client pointer coordinate to logical percentage (0-100)
  const getLogicalCoords = (clientX: number, clientY: number): Point | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  // Check distance to next waypoint
  const checkWaypointCompletion = (point: Point) => {
    const currentIdx = nextWaypointIdxRef.current;
    if (currentIdx >= waypoints.length) return;
    const target = waypoints[currentIdx];
    
    // Distance calculation (logical units)
    const dist = Math.sqrt(Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2));
    
    // Threshold (within ~12% of container size to be a bit more forgiving and fun)
    if (dist < 12) {
      // Success! Popped a waypoint
      sounds.playBubble(currentIdx, waypoints.length);
      addSparkleBurst(target.x, target.y, characterColor);
      
      const newIdx = currentIdx + 1;
      nextWaypointIdxRef.current = newIdx;
      setNextWaypointIdx(newIdx);

      // Check if completely finished tracing all points
      if (newIdx >= waypoints.length) {
        // Sparkle explosion for the whole character
        addSparkleBurst(50, 50, '#FFBB00');
        addSparkleBurst(30, 40, '#FF5E7E');
        addSparkleBurst(70, 60, '#00D2FC');
        
        // Brief delay before celebrating
        setTimeout(() => {
          onComplete(3); // 3 stars completed!
        }, 600);
      }
    }
  };

  const startDrawing = (clientX: number, clientY: number) => {
    const point = getLogicalCoords(clientX, clientY);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke([point]);
    lastPointRef.current = point;
    checkWaypointCompletion(point);
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    const point = getLogicalCoords(clientX, clientY);
    if (!point) return;

    const prevPoint = lastPointRef.current;
    setCurrentStroke(prev => [...prev, point]);
    lastPointRef.current = point;

    if (prevPoint) {
      // Interpolate points between prevPoint and point to make sure we don't skip waypoints!
      const dist = Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2));
      const steps = Math.max(1, Math.floor(dist / 2)); // Check every 2 logical units
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const interpolatedPoint = {
          x: prevPoint.x + (point.x - prevPoint.x) * t,
          y: prevPoint.y + (point.y - prevPoint.y) * t
        };
        checkWaypointCompletion(interpolatedPoint);
      }
    } else {
      checkWaypointCompletion(point);
    }

    // Occasional drawing sparkles
    if (Math.random() < 0.25) {
      const colors = ['#FF5E7E', '#FFBB00', '#00D2FC', '#2ECC71', '#9B59B6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setSparkles(prev => [
        ...prev,
        {
          id: sparkleIdRef.current++,
          x: point.x + (Math.random() * 4 - 2),
          y: point.y + (Math.random() * 4 - 2),
          color: randomColor
        }
      ]);
      // Prune drawing sparkles after 500ms
      const idToRemove = sparkleIdRef.current - 1;
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== idToRemove));
      }, 500);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke([]);
    lastPointRef.current = null;
  };

  // Event handlers for mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    startDrawing(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    drawMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  // Event handlers for touch screen
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      // Prevent scrolling while tracing! Extremely critical for mobile focus mode
      if (e.cancelable) {
        e.preventDefault();
      }
      drawMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  const clearCanvas = () => {
    sounds.playBoing();
    setStrokes([]);
    setCurrentStroke([]);
    setNextWaypointIdx(0);
    nextWaypointIdxRef.current = 0;
    lastPointRef.current = null;
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 500);
  };

  // Render trace helper SVG path for the actual character guide line
  const buildSvgPath = (pointsList: Point[]) => {
    if (pointsList.length === 0) return '';
    return `M ${pointsList[0].x} ${pointsList[0].y} ` + 
      pointsList.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-3 md:p-6 bg-white rounded-[24px] md:rounded-[40px] border-4 md:border-[12px] border-[#FFB74D] shadow-[0_8px_0_#F57C00,0_20px_25px_rgba(0,0,0,0.15)] md:shadow-[0_16px_0_#F57C00,0_25px_30px_rgba(0,0,0,0.15)] select-none relative overflow-hidden">
      
      {/* Visual background decorations for safe kid mode */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 -translate-x-6 -translate-y-6 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 translate-x-10 translate-y-10 pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between w-full z-10 gap-2 md:gap-3 bg-[#4FC3F7] rounded-xl md:rounded-2xl border-b-4 md:border-b-6 border-[#0288D1] p-2.5 md:p-3.5 mb-3 md:mb-4 shadow-sm">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          id="btn-tracing-back"
          className="flex items-center justify-center bg-[#FF8A80] hover:bg-[#FF5252] active:scale-95 text-white font-black px-3.5 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-md border-b-4 border-[#C62828] transition-all text-xs md:text-base cursor-pointer"
        >
          🏠 Inicio
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 md:gap-3 bg-[#FFFDE7] px-2.5 md:px-4 py-1 md:py-1.5 rounded-full border-2 md:border-4 border-[#FFD54F] shadow-sm">
            <span className="text-xl md:text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
              {association.emoji}
            </span>
            <div className="text-left">
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold text-[#E67E22]">Mírala y Trázala</span>
              <h2 className="text-xs sm:text-base md:text-xl font-black text-slate-800 leading-none">
                {character} <span className="text-[#FF7043] font-black font-sans">de {association.word}</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            id="btn-tracing-mute"
            className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl shadow-md border-b-4 md:border-b-6 transition-all active:scale-95 cursor-pointer ${
              isMuted 
                ? 'bg-slate-400 border-slate-600 text-white' 
                : 'bg-[#81C784] border-[#388E3C] text-white hover:bg-[#66BB6A]'
            }`}
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="w-4 h-4 md:w-6 md:h-6" />}
          </button>
        </div>
      </div>

      {/* Main interactive tracing zone */}
      <motion.div
        ref={containerRef}
        animate={shakeActive ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-[75vw] h-[75vw] max-w-[380px] max-h-[380px] sm:w-[420px] sm:h-[420px] landscape:w-[45vh] landscape:h-[45vh] bg-[#FFFDE7] rounded-[24px] md:rounded-[32px] border-6 md:border-8 border-[#FFD54F] shadow-inner flex items-center justify-center cursor-crosshair overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Guide character shown beautifully as dotted background */}
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.08]">
          <span className="text-[28rem] font-extrabold select-none leading-none select-none">
            {character}
          </span>
        </div>

        {/* SVG Drawing Layer with 100x100 viewBox matching normalized coordinates */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none select-none">
          {/* Faint guided stroke behind */}
          <path
            d={buildSvgPath(waypoints)}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />

          {/* Dotted target path line inside the stroke */}
          <path
            d={buildSvgPath(waypoints)}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 8"
            className="opacity-70"
          />

          {/* Render previously completed strokes */}
          {strokes.map((stroke, index) => (
            <path
              key={`stroke-${index}`}
              d={buildSvgPath(stroke)}
              fill="none"
              stroke={characterColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            />
          ))}

          {/* Render active current drawing stroke */}
          {currentStroke.length > 0 && (
            <path
              d={buildSvgPath(currentStroke)}
              fill="none"
              stroke={characterColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90 shadow-lg"
            />
          )}

          {/* Render guide arrow from current waypoint to next */}
          {nextWaypointIdx > 0 && nextWaypointIdx < waypoints.length && (
            <line
              x1={waypoints[nextWaypointIdx - 1].x}
              y1={waypoints[nextWaypointIdx - 1].y}
              x2={waypoints[nextWaypointIdx].x}
              y2={waypoints[nextWaypointIdx].y}
              stroke="#F59E0B"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Floating sparkles */}
        <AnimatePresence>
          {sparkles.map(sp => (
            <motion.div
              key={`sp-${sp.id}`}
              initial={{ scale: 0, opacity: 1, x: `${sp.x}%`, y: `${sp.y}%` }}
              animate={{
                scale: [0.8, 1.4, 0],
                opacity: [1, 0.8, 0],
                y: [`${sp.y}%`, `${sp.y - 8}%`]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute w-4 h-4 pointer-events-none"
              style={{ color: sp.color }}
            >
              <Sparkles className="w-full h-full fill-current" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Waypoints Bubbles Layer */}
        {waypoints.map((point, index) => {
          const isPopped = index < nextWaypointIdx;
          const isActive = index === nextWaypointIdx;
          const isUpcoming = index > nextWaypointIdx;

          return (
            <div
              key={`waypoint-${index}`}
              className="absolute pointer-events-none select-none -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              {isPopped ? (
                // Popped waypoint - simple cute star badge
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-10 h-10 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center shadow-md text-white font-black"
                >
                  <Star className="w-6 h-6 fill-amber-300 stroke-amber-500" />
                </motion.div>
              ) : isActive ? (
                // Current active waypoint - glowing, pulsing, friendly colored circle
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    boxShadow: [
                      '0 0 0 0px rgba(245, 158, 11, 0.4)',
                      '0 0 0 14px rgba(245, 158, 11, 0)',
                      '0 0 0 0px rgba(245, 158, 11, 0.4)'
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-full border-4 border-amber-400 bg-amber-500 flex items-center justify-center shadow-lg text-white text-xl font-extrabold select-none"
                >
                  <span className="animate-bounce select-none" style={{ animationDuration: '1s' }}>
                    {index + 1}
                  </span>
                </motion.div>
              ) : (
                // Upcoming waypoints - faded grey/pink dotted circles
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-500 text-sm font-bold opacity-60">
                  {index + 1}
                </div>
              )}
            </div>
          );
        })}

        {/* Start tutorial pointer bubble if drawing hasn't started */}
        {nextWaypointIdx === 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 bg-amber-400 text-white font-black px-4 py-2 rounded-full border-2 border-white shadow-md flex items-center gap-1.5 text-xs md:text-sm animate-pulse"
          >
            👆 ¡Toca el número 1 y arrastra!
          </motion.div>
        )}
      </motion.div>

      {/* Footer controls */}
      <div className="w-full flex flex-wrap justify-between items-center z-10 gap-2 md:gap-3 mt-3 md:mt-4">
        <button
          onClick={clearCanvas}
          id="btn-tracing-clear"
          className="flex items-center gap-1.5 bg-[#FFD54F] hover:bg-[#FFCA28] active:scale-95 text-slate-800 font-black px-3.5 md:px-5 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl border-b-4 md:border-b-6 border-[#FFB300] shadow-md transition-all text-xs md:text-base cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 md:w-5 md:h-5" />
          Reiniciar
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-1 md:gap-2.5 bg-white py-1.5 md:py-2.5 px-3 md:px-4 rounded-xl md:rounded-2xl border-2 border-[#FFD54F] shadow-inner">
          {waypoints.map((_, i) => (
            <div
              key={`dot-${i}`}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-300 ${
                i < nextWaypointIdx
                  ? 'bg-[#81C784] border-[#388E3C] scale-110 shadow-sm'
                  : i === nextWaypointIdx
                  ? 'bg-[#FF7043] border-[#D84315] scale-125 animate-pulse'
                  : 'bg-slate-200 border-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Association Word Helper */}
        <div className="bg-[#E1BEE7] text-[#4A148C] font-black px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl border-2 border-[#BA68C8] text-[10px] md:text-sm shadow-sm max-w-[150px] md:max-w-none text-center">
          {character} de <span className="underline decoration-[#9575CD] decoration-2">{association.word}</span>
        </div>
      </div>
    </div>
  );
}
