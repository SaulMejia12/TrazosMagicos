/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, ArrowLeft, Heart } from 'lucide-react';
import { Sticker, COLLECTIBLE_STICKERS, KidProfile } from '../data';
import { sounds } from '../utils/sounds';

interface BadgeAlbumProps {
  profile: KidProfile;
  onBack: () => void;
}

export default function BadgeAlbum({ profile, onBack }: BadgeAlbumProps) {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);

  const totalStars = profile.stars;
  const unlockedStickerIds = COLLECTIBLE_STICKERS
    .filter(s => totalStars >= s.unlockedAtStars)
    .map(s => s.id);

  const handleStickerClick = (sticker: Sticker) => {
    const isUnlocked = unlockedStickerIds.includes(sticker.id);
    if (isUnlocked) {
      sounds.playMagic();
      setSelectedSticker(sticker);
    } else {
      sounds.playBoing();
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto p-3 md:p-6 bg-white rounded-[24px] md:rounded-[40px] border-4 md:border-[12px] border-[#BA68C8] shadow-[0_8px_0_#7B1FA2,0_20px_25px_rgba(0,0,0,0.15)] md:shadow-[0_16px_0_#7B1FA2,0_25px_30px_rgba(0,0,0,0.15)] overflow-y-auto max-h-[92vh] select-none relative">
      
      {/* Sparkly corner overlays */}
      <div className="absolute top-4 right-4 text-purple-300 animate-pulse pointer-events-none">
        <Sparkles className="w-8 h-8 fill-purple-100" />
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between w-full bg-[#4FC3F7] rounded-2xl border-b-6 border-[#0288D1] p-3.5 mb-6 gap-3">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          id="btn-album-back"
          className="flex items-center justify-center bg-[#FF8A80] hover:bg-[#FF5252] active:scale-95 text-white font-black px-4 py-2.5 rounded-2xl shadow-md border-b-4 border-[#C62828] transition-all text-sm md:text-base cursor-pointer"
        >
          🏠 Inicio
        </button>

        <div className="bg-[#FFFDE7] px-4 py-1.5 rounded-full border-4 border-[#FFD54F] shadow-sm flex items-center gap-2">
          <span className="text-2xl animate-bounce">🏆</span>
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-[#FF7043] tracking-wider">Tus Premios</span>
            <h2 className="text-xs md:text-sm font-black text-slate-800 leading-none">
              Colección de {profile.name}
            </h2>
          </div>
        </div>

        <div className="bg-[#FFD54F] text-slate-800 font-black px-4 py-2 rounded-2xl shadow-sm border-b-4 border-[#FFB300] flex items-center gap-1 text-xs md:text-sm">
          ⭐ {totalStars} estrellas
        </div>
      </div>

      {/* Album Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#9575CD] tracking-tight flex items-center justify-center gap-2">
          🦄 Álbum de Calcomanías ✨
        </h1>
        <p className="text-xs md:text-sm font-bold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          ¡Sigue trazando letras y números para ganar estrellas y desbloquear hermosas calcomanías animadas!
        </p>
      </div>

      {/* Album Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {COLLECTIBLE_STICKERS.map((sticker) => {
          const isUnlocked = unlockedStickerIds.includes(sticker.id);

          return (
            <motion.div
              key={sticker.id}
              whileHover={isUnlocked ? { scale: 1.05, rotate: [0, -2, 2, 0] } : {}}
              onClick={() => handleStickerClick(sticker)}
              className={`relative aspect-square rounded-[32px] border-4 p-4 flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer ${
                isUnlocked
                  ? 'bg-white border-[#E1BEE7] hover:border-[#BA68C8] shadow-[0_8px_0_#E1BEE7] hover:shadow-[0_8px_0_#BA68C8] active:translate-y-1 active:shadow-none'
                  : 'bg-slate-100 border-slate-300 shadow-[0_8px_0_#CBD5E1] cursor-not-allowed opacity-85'
              }`}
            >
              {/* Sticker Content */}
              {isUnlocked ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-6xl md:text-7xl mb-2 filter drop-shadow-md animate-wiggle">
                    {sticker.emoji}
                  </span>
                  <h3 className="font-extrabold text-[#4A148C] text-xs md:text-sm leading-tight truncate w-full">
                    {sticker.name}
                  </h3>
                  <span className="text-[10px] uppercase font-black text-[#9575CD] mt-1">
                    {sticker.category}
                  </span>
                </div>
              ) : (
                /* Locked overlay */
                <div className="flex flex-col items-center justify-center text-center text-slate-400">
                  <span className="text-4xl mb-2 select-none">🔒</span>
                  <h3 className="font-extrabold text-slate-500 text-xs leading-tight">
                    Bloqueada
                  </h3>
                  <div className="mt-2 bg-[#FFD54F] text-slate-800 font-black px-2.5 py-1 rounded-full text-[9px] shadow-sm flex items-center gap-0.5 border border-[#FFA726]">
                    ⭐ {sticker.unlockedAtStars}
                  </div>
                </div>
              )}

              {/* Holographic sparkle effect on unlocked items */}
              {isUnlocked && (
                <div className="absolute top-2 right-2 text-amber-400 opacity-65 pointer-events-none">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Beautiful details sticker Pop-up Modal */}
      <AnimatePresence>
        {selectedSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-[40px]"
            onClick={() => setSelectedSticker(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white border-[12px] border-[#BA68C8] p-6 md:p-8 rounded-[40px] shadow-[0_16px_0_#7B1FA2,0_25px_30px_rgba(0,0,0,0.15)] max-w-sm w-full text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Explosion background stars */}
              <div className="absolute top-4 left-4 text-[#FF7043] animate-bounce">⭐</div>
              <div className="absolute top-4 right-4 text-[#4FC3F7] animate-bounce delay-100">✨</div>
              <div className="absolute bottom-4 left-4 text-[#FFD54F] animate-bounce delay-200">🎈</div>

              <span className="block text-9xl md:text-[10rem] mb-6 filter drop-shadow-xl animate-bounce select-none">
                {selectedSticker.emoji}
              </span>

              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 leading-tight">
                {selectedSticker.name}
              </h2>
              
              <span className="inline-block bg-purple-100 text-[#4A148C] font-black px-3 py-1 rounded-full text-xs uppercase tracking-wide mb-4 border border-purple-200">
                {selectedSticker.category}
              </span>

              <p className="text-base md:text-lg font-bold text-slate-500 italic mb-6">
                "{selectedSticker.phrase}"
              </p>

              <button
                onClick={() => { sounds.playClick(); setSelectedSticker(null); }}
                id="btn-close-sticker-popup"
                className="w-full bg-[#FF7043] hover:bg-[#FF5722] text-white font-black py-4 px-6 rounded-2xl border-b-6 border-[#E64A19] active:translate-y-1 active:border-b-2 transition-all text-base shadow-md cursor-pointer"
              >
                💖 ¡Súper!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
