/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Settings, Users, Star, Award, ShieldAlert, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { 
  KidProfile, 
  loadProfiles, 
  saveProfiles, 
  getActiveProfileId, 
  setActiveProfileId, 
  createNewProfile, 
  AVATAR_OPTIONS, 
  COLOR_OPTIONS, 
  TRACING_PATHS, 
  checkStickerUnlocks, 
  COLLECTIBLE_STICKERS,
  getCharacterColor
} from './data';
import TracingCanvas, { CHAR_ASSOCIATIONS } from './components/TracingCanvas';
import ParentsDashboard from './components/ParentsDashboard';
import BadgeAlbum from './components/BadgeAlbum';
import { sounds } from './utils/sounds';
// @ts-ignore
import appIcon from './assets/images/app_icon_1782430677445.jpg';

type Screen = 'welcome' | 'onboarding' | 'map' | 'tracing' | 'album' | 'parents';

export default function App() {
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<KidProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [category, setCategory] = useState<'letters' | 'numbers'>('letters');
  
  // Active selected tracing character
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  // Profile selection modal/dropdown state
  const [showProfileSwitcher, setShowProfileSwitcher] = useState<boolean>(false);

  // New Profile Onboarding state
  const [kidName, setKidName] = useState<string>('');
  const [onboardAvatar, setOnboardAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [onboardColor, setOnboardColor] = useState<any>(COLOR_OPTIONS[0]);

  // Completion Reward Overlay state
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebratedChar, setCelebratedChar] = useState<string>('');
  const [newStickersUnlocked, setNewStickersUnlocked] = useState<string[]>([]);

  useEffect(() => {
    // Load all local sibling profiles
    const loaded = loadProfiles();
    setProfiles(loaded);

    if (loaded.length > 0) {
      const activeId = getActiveProfileId();
      const active = loaded.find(p => p.id === activeId) || loaded[0];
      setActiveProfile(active);
      setActiveProfileId(active.id);
    }
    setCurrentScreen('welcome');
  }, []);

  const handleProfileUpdate = () => {
    const loaded = loadProfiles();
    setProfiles(loaded);

    const activeId = getActiveProfileId();
    const active = loaded.find(p => p.id === activeId);
    if (active) {
      setActiveProfile(active);
    } else if (loaded.length > 0) {
      setActiveProfile(loaded[0]);
      setActiveProfileId(loaded[0].id);
    } else {
      setActiveProfile(null);
      setActiveProfileId(null);
      setCurrentScreen('onboarding');
    }
  };

  const handleStartApp = () => {
    sounds.playCheer();
    
    // Welcome kid using sweet natural TTS voice!
    sounds.speak('¡Hola amiguito! Bienvenido a Trazos Mágicos. ¡Vamos a jugar!');

    if (profiles.length === 0) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('map');
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidName.trim()) return;

    sounds.playUnlockSticker();
    const newKid = createNewProfile(kidName.trim(), onboardAvatar, onboardColor.value);
    const updated = [...profiles, newKid];
    
    setProfiles(updated);
    saveProfiles(updated);
    setActiveProfile(newKid);
    setActiveProfileId(newKid.id);
    
    // Clear onboard inputs
    setKidName('');
    
    // Go to map
    setCurrentScreen('map');
    
    // Tiny initial reward spark
    setTimeout(() => {
      triggerConfetti();
    }, 400);
  };

  const selectActiveProfile = (profile: KidProfile) => {
    sounds.playClick();
    setActiveProfile(profile);
    setActiveProfileId(profile.id);
    setShowProfileSwitcher(false);
  };

  const handleTraceComplete = (starsEarned: number) => {
    if (!activeProfile || !selectedChar) return;

    sounds.playSuccess();
    sounds.playCheer();
    sounds.speakCompletion(selectedChar);
    triggerConfetti();

    // Calculate details before updating profile
    const alreadyCompleted = activeProfile.completed.includes(selectedChar);
    const updatedCompleted = alreadyCompleted 
      ? activeProfile.completed 
      : [...activeProfile.completed, selectedChar];

    // Award star points
    const earnedStars = alreadyCompleted ? 1 : starsEarned; // Give less stars for replaying to keep progression genuine
    const updatedStarsCount = activeProfile.stars + earnedStars;

    // Check which stickers are newly unlocked with this star count
    const oldUnlocks = checkStickerUnlocks(activeProfile.stars);
    const newUnlocks = checkStickerUnlocks(updatedStarsCount);
    const newlyUnlockedIds = newUnlocks.filter(id => !oldUnlocks.includes(id));

    // Save trace log
    const newLog = {
      id: 'log_' + Date.now(),
      character: selectedChar,
      date: new Date().toISOString(),
      accuracy: 95
    };

    const updatedProfile: KidProfile = {
      ...activeProfile,
      completed: updatedCompleted,
      stars: updatedStarsCount,
      stickers: newUnlocks,
      logs: [...(activeProfile.logs || []), newLog]
    };

    // Update profiles database
    const updatedProfilesList = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfilesList);
    saveProfiles(updatedProfilesList);
    setActiveProfile(updatedProfile);

    // Trigger Celebratory Overlay
    setCelebratedChar(selectedChar);
    setNewStickersUnlocked(newlyUnlockedIds);
    setShowCelebration(true);
  };

  const triggerConfetti = () => {
    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5E7E', '#FFBB00', '#00D2FC', '#2ECC71', '#9B59B6', '#E67E22']
    });

    // Side showers
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF5E7E', '#FFBB00', '#00D2FC']
      });
    }, 250);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2ECC71', '#9B59B6', '#E67E22']
      });
    }, 400);
  };

  const closeCelebrationAndNext = () => {
    sounds.playClick();
    setShowCelebration(false);
    setSelectedChar(null);
    setCurrentScreen('map');
  };

  // Divide keys into Letters and Numbers
  const characterKeys = Object.keys(TRACING_PATHS);
  const letters = characterKeys.filter(c => isNaN(Number(c)));
  const numbers = characterKeys.filter(c => !isNaN(Number(c)));

  const currentCategoryCharacters = category === 'letters' ? letters : numbers;

  return (
    <div className="min-h-screen w-full bg-[#FFF9C4] flex items-center justify-center p-3 md:p-6 text-slate-800 font-sans select-none antialiased relative overflow-hidden">
      
      {/* Background patterns: beautiful artistic splatters & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#FFA726_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* App Shell */}
      <div className="w-full max-w-5xl z-10 relative">
        
        <AnimatePresence mode="wait">
          
          {/* 0. WELCOME / SPLASH SCREEN */}
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 md:border-[12px] border-[#9575CD] rounded-[24px] md:rounded-[40px] p-5 md:p-12 shadow-[0_8px_0_#512DA8,0_20px_25px_rgba(0,0,0,0.15)] md:shadow-[0_16px_0_#512DA8,0_25px_30px_rgba(0,0,0,0.15)] max-w-xl mx-auto text-center relative overflow-hidden"
            >
              {/* Decorative floating items */}
              <div className="absolute top-4 left-6 text-2xl md:text-4xl animate-bounce" style={{ animationDuration: '3s' }}>🎈</div>
              <div className="absolute top-8 right-8 text-2xl md:text-4xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🌟</div>
              <div className="absolute bottom-6 left-8 text-2xl md:text-4xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🎨</div>
              <div className="absolute bottom-8 right-6 text-2xl md:text-4xl animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>🧩</div>

              {/* Main character / 3D app icon display */}
              <div className="relative flex justify-center items-center mb-6">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 1.5, -1.5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <img
                    src={appIcon}
                    alt="Trazos Mágicos Logo"
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] md:rounded-[32px] border-4 border-white shadow-[0_8px_16px_rgba(0,0,0,0.15)] object-cover"
                  />
                  {/* Glowing halo */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-amber-400 to-purple-400 rounded-[28px] md:rounded-[36px] blur-sm opacity-50 -z-10 animate-pulse" />
                </motion.div>

                {/* Floating sparkles */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="text-4xl md:text-5xl absolute -top-2 right-12 md:right-16 select-none filter drop-shadow-sm z-20 pointer-events-none"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-4xl md:text-5xl absolute bottom-0 left-12 md:left-16 select-none filter drop-shadow-sm z-20 pointer-events-none"
                >
                  🌈
                </motion.div>
              </div>

              {/* Title with comic-style shadows */}
              <h1 className="text-4xl md:text-6xl font-black text-[#FF7043] mb-3 md:mb-4 tracking-tight leading-none drop-shadow-sm">
                Trazos Mágicos
              </h1>
              
              <p className="text-sm md:text-lg text-slate-600 font-extrabold max-w-md mx-auto mb-6 md:mb-8 leading-normal">
                ¡El camino más divertido para aprender a escribir letras y números con sonidos y hermosas calcomanías! 🌟🏆
              </p>

              {/* Kid avatars teaser banner */}
              <div className="bg-[#FFFDE7] border-4 border-[#FFD54F] rounded-2xl md:rounded-3xl p-3 md:p-4 mb-6 md:mb-8">
                <span className="block text-[9px] md:text-[10px] uppercase font-black text-[#E67E22] tracking-wider mb-1.5 md:mb-2">🎁 ¡Elige tu personaje favorito! 🎁</span>
                <div className="flex justify-center gap-2 md:gap-3 text-2xl md:text-3xl animate-pulse" style={{ animationDuration: '3s' }}>
                  <span>🐱</span>
                  <span>🐶</span>
                  <span>🐯</span>
                  <span>🐸</span>
                  <span>🦊</span>
                  <span>🦁</span>
                </div>
              </div>

              <button
                onClick={handleStartApp}
                id="btn-welcome-start"
                className="w-full max-w-xs mx-auto bg-[#81C784] hover:bg-[#66BB6A] text-xl md:text-2xl font-black py-3 md:py-4 px-6 md:px-8 rounded-2xl md:rounded-3xl border-b-6 md:border-b-8 border-[#388E3C] active:translate-y-1 active:border-b-4 transition-all shadow-lg flex items-center justify-center gap-2 md:gap-3 animate-pulse cursor-pointer"
                style={{ animationDuration: '1.5s' }}
              >
                <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" /> ¡JUGAR! 🎮
              </button>
            </motion.div>
          )}

          {/* 1. ONBOARDING SCREEN: Let kids create their first profile */}
          {currentScreen === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 md:border-[12px] border-[#4FC3F7] rounded-[24px] md:rounded-[40px] p-4 md:p-10 shadow-[0_8px_0_#0288D1,0_20px_25px_rgba(0,0,0,0.15)] md:shadow-[0_16px_0_#0288D1,0_25px_30px_rgba(0,0,0,0.15)] max-w-lg mx-auto text-center"
            >
              <div className="text-5xl md:text-7xl mb-3 md:mb-4 animate-bounce" style={{ animationDuration: '2.5s' }}>✏️🎨</div>
              <h1 className="text-3xl md:text-5xl font-black text-[#FF7043] mb-2 leading-none tracking-tight">
                Trazos Mágicos
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-bold mb-6 md:mb-8">
                ¡Hola amiguito! Crea tu personaje para aprender a escribir letras y números con hermosos premios.
              </p>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4 md:space-y-6 text-left">
                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5 md:mb-2">
                    ¿Cuál es tu nombre?
                  </label>
                  <input
                    type="text"
                    value={kidName}
                    onChange={(e) => setKidName(e.target.value)}
                    placeholder="Escribe tu nombre..."
                    maxLength={12}
                    className="w-full text-center p-3 md:p-4 border-2 md:border-4 border-[#FFD54F] focus:border-[#FF9800] rounded-xl md:rounded-2xl text-xl md:text-2xl font-black focus:outline-none transition-all shadow-inner uppercase placeholder-slate-300 bg-[#FFFDE7]"
                    required
                    autoFocus
                    id="onboarding-kid-name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5 md:mb-2">
                    Elige tu Avatar de Animalito:
                  </label>
                  <div className="grid grid-cols-6 gap-1.5 md:gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => { sounds.playClick(); setOnboardAvatar(avatar); }}
                        className={`text-2xl md:text-3xl p-1.5 md:p-2 rounded-xl md:rounded-2xl transition-all border-2 ${
                          onboardAvatar === avatar
                            ? 'bg-[#9575CD] border-[#512DA8] text-white scale-110 shadow-md ring-2 ring-white'
                            : 'bg-white border-slate-200 hover:bg-slate-50 active:scale-95'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-1.5 md:mb-2">
                    Elige tu Color de Fondo Mágico:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { sounds.playClick(); setOnboardColor(color); }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl md:rounded-2xl border-2 md:border-4 font-black transition-all text-[10px] md:text-xs ${
                          onboardColor.value === color.value
                            ? 'bg-slate-800 text-white border-slate-900 scale-105 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${color.value}`} />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-onboarding-start"
                  className="w-full bg-[#81C784] hover:bg-[#66BB6A] text-white text-lg md:text-xl font-black py-3 md:py-4 rounded-xl md:rounded-2xl border-b-6 md:border-b-8 border-[#388E3C] active:translate-y-1 active:border-b-4 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" /> ¡Empezar Aventura!
                </button>
              </form>
            </motion.div>
          )}

          {/* 2. MAP/LEVEL SELECTOR SCREEN */}
          {currentScreen === 'map' && activeProfile && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full bg-white rounded-[24px] md:rounded-[40px] border-4 md:border-[12px] border-[#81C784] shadow-[0_8px_0_#388E3C,0_20px_25px_rgba(0,0,0,0.15)] md:shadow-[0_16px_0_#388E3C,0_25px_30px_rgba(0,0,0,0.15)] p-3 md:p-8 relative flex flex-col overflow-hidden"
            >
              {/* Top status bar - beautifully embedded header */}
              <div className="flex flex-wrap items-center justify-between bg-[#4FC3F7] rounded-t-2xl md:rounded-t-3xl rounded-b-[24px] md:rounded-b-[36px] border-b-4 md:border-b-8 border-[#0288D1] p-3 md:p-5 -mx-3 -mt-3 md:-mx-8 md:-mt-8 mb-6 md:mb-8 gap-3 md:gap-4 shadow-md relative z-10">
                
                {/* Active Kid Info Box */}
                <div className="relative">
                  <div 
                    onClick={() => { sounds.playClick(); setShowProfileSwitcher(!showProfileSwitcher); }}
                    className="flex items-center gap-2 bg-[#FFFDE7] border-2 md:border-4 border-[#FFD54F] px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl cursor-pointer hover:bg-[#FFF9C4] transition-all active:scale-95 shadow-md"
                  >
                    <span className="text-2xl md:text-3xl">{activeProfile.avatar}</span>
                    <div className="text-left">
                      <span className="text-[9px] md:text-[10px] uppercase font-black text-[#E67E22] leading-none">Jugador</span>
                      <h3 className="text-xs md:text-base font-black text-slate-800 leading-tight flex items-center gap-1">
                        {activeProfile.name} <span className="text-[9px] md:text-xs text-[#E67E22]">▼</span>
                      </h3>
                    </div>
                  </div>
 
                  {/* Profile Dropdown list for siblings */}
                  <AnimatePresence>
                    {showProfileSwitcher && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-3 bg-white border-4 border-[#FFD54F] rounded-2xl shadow-xl p-2 w-56 z-50 text-left"
                      >
                        <span className="block text-[10px] uppercase font-black text-[#FFA726] px-3 py-1.5 border-b-2 border-slate-100 mb-1">Elegir Hermano/a</span>
                        {profiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => selectActiveProfile(p)}
                            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-all text-left font-extrabold text-sm"
                          >
                            <span className="text-2xl">{p.avatar}</span>
                            <span>{p.name}</span>
                            {p.id === activeProfile.id && <span className="ml-auto text-emerald-500">✓</span>}
                          </button>
                        ))}
                        <button
                          onClick={() => { sounds.playClick(); setCurrentScreen('onboarding'); setShowProfileSwitcher(false); }}
                          className="w-full border-t-2 border-slate-100 text-[#9575CD] font-extrabold text-xs p-2.5 mt-1 text-center hover:bg-purple-50 rounded-xl block"
                        >
                          ➕ Agregar Hermano
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
 
                {/* Stars Trophy */}
                <div className="flex items-center gap-1 md:gap-1.5 bg-[#FFD54F] px-3 md:px-4 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#FFA726] shadow-md animate-pulse" style={{ animationDuration: '3s' }}>
                  <span className="text-xl md:text-2xl">⭐</span>
                  <div className="text-left">
                    <span className="text-[9px] md:text-[10px] uppercase font-black text-[#D84315] leading-none">Estrellas</span>
                    <div className="text-xs md:text-sm font-black text-[#C2185B] leading-none mt-0.5">{activeProfile.stars}</div>
                  </div>
                </div>
 
                {/* Main Kids Navigation Controls */}
                <div className="flex items-center gap-2 md:gap-2.5">
                  {/* Sticker Album Badge */}
                  <button
                    onClick={() => { sounds.playClick(); setCurrentScreen('album'); }}
                    id="btn-nav-album"
                    className="flex items-center gap-1 md:gap-2 bg-[#9575CD] hover:bg-[#7E57C2] text-white font-black px-3.5 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border-b-4 md:border-b-6 border-[#512DA8] shadow-md active:scale-95 transition-all text-xs md:text-base cursor-pointer"
                  >
                    🏆 Álbum
                  </button>
 
                  {/* Parents Section Button */}
                  <button
                    onClick={() => { sounds.playClick(); setCurrentScreen('parents'); }}
                    id="btn-nav-parents"
                    className="flex items-center gap-1 md:gap-2 bg-[#FF8A80] hover:bg-[#FF5252] text-white font-black px-3.5 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border-b-4 md:border-b-6 border-[#D50000] shadow-md active:scale-95 transition-all text-xs md:text-base cursor-pointer"
                  >
                    👨‍👩‍👦 Padres
                  </button>
                </div>
 
              </div>
 
              {/* Character Categories Selector */}
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                <button
                  onClick={() => { sounds.playClick(); setCategory('letters'); }}
                  id="btn-cat-letters"
                  className={`px-3 md:px-6 py-2.5 md:py-3.5 rounded-2xl md:rounded-3xl font-black text-xs sm:text-base md:text-lg border-b-4 md:border-b-6 shadow-md transition-all ${
                    category === 'letters'
                      ? 'bg-[#FF7043] border-[#D84315] text-white scale-105 shadow-lg'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200 hover:scale-102'
                  }`}
                >
                  🔤 Abecedario (Letras)
                </button>
                <button
                  onClick={() => { sounds.playClick(); setCategory('numbers'); }}
                  id="btn-cat-numbers"
                  className={`px-3 md:px-6 py-2.5 md:py-3.5 rounded-2xl md:rounded-3xl font-black text-xs sm:text-base md:text-lg border-b-4 md:border-b-6 shadow-md transition-all ${
                    category === 'numbers'
                      ? 'bg-[#4FC3F7] border-[#0288D1] text-white scale-105 shadow-lg'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200 hover:scale-102'
                  }`}
                >
                  🔢 Números (0 al 9)
                </button>
              </div>
 
              {/* Playful Interactive Grid Map */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 md:gap-5">
                {currentCategoryCharacters.map((char) => {
                  const isCompleted = activeProfile.completed.includes(char);
                  const charColor = getCharacterColor(char);
                  const assoc = CHAR_ASSOCIATIONS[char] || { word: '', emoji: '' };
 
                  return (
                    <motion.div
                      key={char}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedChar(char);
                        setCurrentScreen('tracing');
                      }}
                      className="relative bg-white hover:bg-[#FFFDE7] rounded-[20px] md:rounded-[32px] border-2 md:border-4 border-[#FFE082] hover:border-[#FFB300] p-2 md:p-4 flex flex-col items-center justify-center shadow-[0_4px_0_#FFE082] md:shadow-[0_8px_0_#FFE082] hover:shadow-[0_4px_0_#FFB300] md:hover:shadow-[0_8px_0_#FFB300] cursor-pointer aspect-square transition-all group overflow-hidden active:translate-y-0.5 active:shadow-none"
                    >
                      {/* Character Display */}
                      <span 
                        className="text-3xl sm:text-4xl md:text-6xl font-black mb-1 filter drop-shadow-sm select-none group-hover:scale-110 transition-transform"
                        style={{ color: charColor }}
                      >
                        {char}
                      </span>
 
                      {/* Cute associated emoji */}
                      <span className="text-lg md:text-2xl select-none mt-0.5 md:mt-1">{assoc.emoji}</span>
 
                      {/* Small Completed Checkbox */}
                      {isCompleted && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-[#81C784] text-white rounded-full p-0.5 md:p-1 shadow-md border-2 border-white animate-bounce">
                          <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current text-white" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
 
              {/* Secure child mode footer banner */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t-2 md:border-t-4 border-[#E2E8F0] flex flex-wrap justify-between items-center text-slate-400 text-[10px] md:text-xs font-bold gap-2 md:gap-3">
                <span className="flex items-center gap-1 text-slate-500">🔒 Modo Seguro Activo: Sin anuncios ni compras externas</span>
                <span className="flex items-center gap-1 text-slate-500">🌐 Funciona 100% Sin Internet (Datos Privados)</span>
              </div>
 
            </motion.div>
          )}

          {/* 3. TRACING CANVAS SCREEN */}
          {currentScreen === 'tracing' && selectedChar && (
            <motion.div
              key="tracing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <TracingCanvas
                character={selectedChar}
                onComplete={handleTraceComplete}
                onBack={() => {
                  setSelectedChar(null);
                  setCurrentScreen('map');
                }}
              />
            </motion.div>
          )}

          {/* 4. STICKER ALBUM SCREEN */}
          {currentScreen === 'album' && activeProfile && (
            <motion.div
              key="album"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <BadgeAlbum
                profile={activeProfile}
                onBack={() => setCurrentScreen('map')}
              />
            </motion.div>
          )}

          {/* 5. PARENTS DASHBOARD SCREEN */}
          {currentScreen === 'parents' && (
            <motion.div
              key="parents"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <ParentsDashboard
                activeProfile={activeProfile}
                onProfileUpdated={handleProfileUpdate}
                onBack={() => setCurrentScreen('map')}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* Level Success Celebration Pop-up Overlay (Modal) */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.7, rotate: -5, y: 100 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={{ scale: 0.7, rotate: 5, y: 100 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-white border-[12px] border-[#FFD54F] p-6 md:p-8 rounded-[40px] max-w-sm w-full text-center shadow-[0_16px_0_#FFA726,0_25px_30px_rgba(0,0,0,0.15)] relative overflow-hidden"
              >
                {/* Visual balloons and star background decorations */}
                <div className="absolute -top-10 -left-10 text-6xl opacity-30 animate-pulse">🎈</div>
                <div className="absolute -bottom-10 -right-10 text-6xl opacity-30 animate-pulse delay-500">🌈</div>
 
                {/* Big completed character */}
                <div className="text-8xl font-black mb-4 select-none animate-bounce" style={{ color: getCharacterColor(celebratedChar) }}>
                  {celebratedChar}
                </div>
 
                <h2 className="text-3xl font-black text-[#FF7043] mb-1 leading-tight tracking-tight">
                  ¡Excelente trabajo!
                </h2>
                
                {activeProfile && (
                  <p className="text-sm md:text-base text-slate-500 font-bold mb-4">
                    Has completado la letra/número <span className="text-[#9575CD] font-black">{celebratedChar}</span> de forma increíble.
                  </p>
                )}
 
                {/* Stars Display */}
                <div className="flex items-center justify-center gap-1.5 mb-6">
                  <Star className="w-8 h-8 fill-[#FFD54F] stroke-[#FFA726] stroke-2 animate-bounce" style={{ animationDelay: '0s' }} />
                  <Star className="w-12 h-12 fill-[#FFD54F] stroke-[#FFA726] stroke-2 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <Star className="w-8 h-8 fill-[#FFD54F] stroke-[#FFA726] stroke-2 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
 
                {/* Newly unlocked sticker announcement */}
                {newStickersUnlocked.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-4 border-[#BA68C8] p-4 rounded-3xl mb-6">
                    <span className="text-[10px] uppercase font-black text-pink-500 tracking-wider block mb-1">🎁 ¡Premio Desbloqueado!</span>
                    {newStickersUnlocked.map(stickerId => {
                      const sticker = COLLECTIBLE_STICKERS.find(s => s.id === stickerId);
                      if (!sticker) return null;
                      return (
                        <div key={stickerId} className="flex items-center gap-2.5 justify-center">
                          <span className="text-5xl animate-wiggle">{sticker.emoji}</span>
                          <div className="text-left">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-none">{sticker.name}</h4>
                            <span className="text-[10px] text-slate-500 font-semibold">{sticker.phrase}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
 
                <button
                  onClick={closeCelebrationAndNext}
                  id="btn-celebration-next"
                  className="w-full bg-[#81C784] hover:bg-[#66BB6A] text-white font-black py-4 px-6 rounded-2xl border-b-6 border-[#388E3C] active:translate-y-1 active:border-b-2 transition-all text-base shadow-md cursor-pointer"
                >
                  🎉 ¡Súper, Continuar!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
