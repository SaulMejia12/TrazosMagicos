/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plus, Users, Award, Trash2, RotateCcw, ArrowLeft, Check, AlertCircle, ChevronRight, Lock, Calendar } from 'lucide-react';
import { 
  KidProfile, 
  loadProfiles, 
  saveProfiles, 
  createNewProfile, 
  AVATAR_OPTIONS, 
  COLOR_OPTIONS, 
  PARENT_QUESTIONS, 
  TRACING_PATHS,
  COLLECTIBLE_STICKERS
} from '../data';
import { sounds } from '../utils/sounds';

interface ParentsDashboardProps {
  activeProfile: KidProfile | null;
  onProfileUpdated: () => void;
  onBack: () => void;
}

export default function ParentsDashboard({ activeProfile, onProfileUpdated, onBack }: ParentsDashboardProps) {
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  
  // Parental Gate Question state
  const [currentQuestion, setCurrentQuestion] = useState<{ text: string; answer: number } | null>(null);
  const [parentAnswer, setParentAnswer] = useState<string>('');
  const [gateError, setGateError] = useState<boolean>(false);

  // Profile Creation form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState<any>(COLOR_OPTIONS[0]);

  // Profile Delete & Reset confirmation states
  const [profileToDelete, setProfileToDelete] = useState<KidProfile | null>(null);
  const [profileToReset, setProfileToReset] = useState<KidProfile | null>(null);

  useEffect(() => {
    // Load all profiles
    const all = loadProfiles();
    setProfiles(all);
    
    // Choose random parental gate question
    const randQ = PARENT_QUESTIONS[Math.floor(Math.random() * PARENT_QUESTIONS.length)];
    setCurrentQuestion(randQ);
  }, []);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    if (parseInt(parentAnswer) === currentQuestion.answer) {
      sounds.playSuccess();
      setIsUnlocked(true);
      setGateError(false);
    } else {
      sounds.playBoing();
      setGateError(true);
      setParentAnswer('');
      // Switch to another question
      const randQ = PARENT_QUESTIONS[Math.floor(Math.random() * PARENT_QUESTIONS.length)];
      setCurrentQuestion(randQ);
    }
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    sounds.playUnlockSticker();
    const newKid = createNewProfile(newName.trim(), selectedAvatar, selectedColor.value);
    const updated = [...profiles, newKid];
    setProfiles(updated);
    saveProfiles(updated);

    // If there is no active profile, select this newly created one
    const activeId = localStorage.getItem('trazos_magicos_active_id');
    if (!activeId) {
      localStorage.setItem('trazos_magicos_active_id', newKid.id);
    }

    onProfileUpdated();
    
    // Reset form
    setNewName('');
    setShowAddForm(false);
  };

  const confirmDeleteProfile = (profile: KidProfile) => {
    sounds.playBoing();
    setProfileToDelete(profile);
  };

  const executeDeleteProfile = () => {
    if (!profileToDelete) return;
    const profileId = profileToDelete.id;
    sounds.playBoing();
    const updated = profiles.filter(p => p.id !== profileId);
    setProfiles(updated);
    saveProfiles(updated);

    const activeId = localStorage.getItem('trazos_magicos_active_id');
    if (activeId === profileId) {
      if (updated.length > 0) {
        localStorage.setItem('trazos_magicos_active_id', updated[0].id);
      } else {
        localStorage.removeItem('trazos_magicos_active_id');
      }
    }
    onProfileUpdated();
    setProfileToDelete(null);
  };

  const confirmResetProfileProgress = (profile: KidProfile) => {
    sounds.playBoing();
    setProfileToReset(profile);
  };

  const executeResetProfileProgress = () => {
    if (!profileToReset) return;
    const profileId = profileToReset.id;
    sounds.playBoing();
    const updated = profiles.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          completed: [],
          stars: 0,
          stickers: [],
          logs: []
        };
      }
      return p;
    });
    setProfiles(updated);
    saveProfiles(updated);
    onProfileUpdated();
    setProfileToReset(null);
  };

  // Helper to calculate statistics
  const letterCount = Object.keys(TRACING_PATHS).filter(c => isNaN(Number(c))).length;
  const numberCount = Object.keys(TRACING_PATHS).filter(c => !isNaN(Number(c))).length;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6 bg-white rounded-[24px] md:rounded-[40px] border-4 md:border-[12px] border-[#4FC3F7] shadow-[0_8px_0_#0288D1,0_20px_25px_rgba(0,0,0,0.15)] md:shadow-[0_16px_0_#0288D1,0_25px_30px_rgba(0,0,0,0.15)] overflow-y-auto max-h-[92vh] select-none">
      
      {/* Parental Gate Modal (Locks out kids) */}
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center py-10 md:py-16 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-[#FFA726] mb-6 shadow-md border-4 border-[#FFD54F]">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Control de Padres
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-md mb-8 px-4 font-bold">
            Esta sección contiene configuraciones de perfiles y seguimiento de aprendizaje. Por favor resuelve el siguiente problema matemático para ingresar:
          </p>

          <form onSubmit={handleGateSubmit} className="bg-[#FFFDE7] p-6 md:p-8 rounded-[32px] border-4 border-[#FFD54F] shadow-lg max-w-sm w-full mx-4">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#E67E22]">Operación Adulta</span>
              <div className="text-3xl font-black text-slate-800 mt-1">
                {currentQuestion?.text}
              </div>
            </div>

            <input
              type="number"
              value={parentAnswer}
              onChange={(e) => setParentAnswer(e.target.value)}
              placeholder="¿Resultado?"
              className="w-full text-center text-3xl font-black p-3.5 border-4 border-[#FFD54F] bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all mb-4 text-slate-800"
              autoFocus
              id="parent-gate-answer"
            />

            {gateError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-1.5 justify-center text-rose-500 font-extrabold text-xs mb-4"
              >
                <AlertCircle className="w-4 h-4" />
                ¡Inténtalo otra vez! Suma o resta bien.
              </motion.div>
            )}

            <button
              type="submit"
              id="btn-gate-submit"
              className="w-full bg-[#81C784] hover:bg-[#66BB6A] text-white font-black py-4 px-6 rounded-2xl border-b-6 border-[#388E3C] active:translate-y-1 active:border-b-2 transition-all text-base shadow-md cursor-pointer"
            >
              🔑 Entrar al Panel
            </button>
          </form>

          <button
            onClick={() => { sounds.playClick(); onBack(); }}
            id="btn-gate-cancel"
            className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a jugar
          </button>
        </div>
      ) : (
        /* Unlocked Dashboard Screen */
        <div>
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#FFD54F] rounded-2xl border-b-6 border-[#FFA726] p-4 mb-6 gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-md border-2 border-[#FFA726]">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">Panel de Control de Padres</h1>
                <p className="text-xs text-slate-600 font-bold">Gestiona hermanos y visualiza su progreso real de aprendizaje</p>
              </div>
            </div>

            <button
              onClick={() => { sounds.playClick(); onBack(); }}
              id="btn-parent-exit"
              className="bg-[#FF8A80] hover:bg-[#FF5252] active:scale-95 text-white font-black px-5 py-2.5 rounded-xl border-b-4 border-[#C62828] shadow-sm text-sm transition-all cursor-pointer"
            >
              👈 Salir del Panel
            </button>
          </div>

          {/* Sibling profiles section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
                👦👧 Perfiles de Niños Registrados
              </h2>
              <button
                onClick={() => { sounds.playClick(); setShowAddForm(!showAddForm); }}
                id="btn-add-profile-toggle"
                className="text-xs md:text-sm bg-[#FFFDE7] text-[#D84315] font-black px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-amber-100 transition-all border-2 border-[#FFD54F] shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Nuevo Perfil
              </button>
            </div>

            {/* Profile Creation Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleAddProfile}
                  className="bg-[#FFFDE7] border-4 border-[#FFD54F] rounded-[32px] p-4 md:p-6 mb-6 shadow-md overflow-hidden text-left"
                >
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#E67E22] mb-4">Crear Perfil para Hermano/a</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-2">Nombre del Niño/a:</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej. Sofía, Lucas..."
                        maxLength={12}
                        className="w-full p-2.5 border-4 border-[#FFD54F] bg-white rounded-xl focus:outline-none focus:border-[#FFA726] text-lg font-bold"
                        required
                        id="new-profile-name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-2">Elige un Personaje:</label>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_OPTIONS.map(avatar => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => { sounds.playClick(); setSelectedAvatar(avatar); }}
                            className={`w-10 h-10 text-2xl flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                              selectedAvatar === avatar 
                                ? 'bg-[#9575CD] text-white scale-110 shadow-md ring-4 ring-[#B39DDB]' 
                                : 'bg-white border-2 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-500 mb-2">Color Favorito:</label>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_OPTIONS.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { sounds.playClick(); setSelectedColor(color); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                              selectedColor.value === color.value
                                ? 'bg-slate-800 text-white border-slate-900 scale-105 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${color.value}`} />
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 border-t-2 border-slate-250 pt-4">
                    <button
                      type="button"
                      onClick={() => { sounds.playClick(); setShowAddForm(false); }}
                      className="px-4 py-2 border-2 border-slate-350 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      id="btn-save-profile"
                      className="bg-[#81C784] hover:bg-[#66BB6A] text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-md border-b-4 border-[#388E3C] active:translate-y-0.5 cursor-pointer"
                    >
                      ✨ Guardar Niño
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List of Kids Profiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profiles.map(p => {
                const totalCompletedLetters = p.completed.filter(c => isNaN(Number(c))).length;
                const totalCompletedNumbers = p.completed.filter(c => !isNaN(Number(c))).length;
                const progressPct = Math.round((p.completed.length / (letterCount + numberCount)) * 100) || 0;

                return (
                  <div key={p.id} className="bg-white border-4 border-[#FFD54F] rounded-3xl p-4 flex flex-col justify-between shadow-[0_6px_0_#FFE082] hover:shadow-[0_8px_0_#FFA726] relative overflow-hidden transition-all">
                    <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b" style={{ backgroundColor: p.color.includes('rose') ? '#FF5E7E' : p.color.includes('cyan') ? '#00D2FC' : p.color.includes('green') ? '#2ECC71' : p.color.includes('amber') ? '#E67E22' : '#9B59B6' }} />
                    
                    <div className="pl-3 text-left">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl">{p.avatar}</span>
                        <div className="text-left">
                          <h4 className="text-base font-black text-slate-800 leading-none">{p.name}</h4>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Hermano/a</span>
                        </div>
                      </div>

                      {/* Stat Metrics */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-50 border-2 border-slate-150 rounded-xl p-2.5 mb-3 text-center">
                        <div>
                          <span className="block text-[9px] uppercase font-extrabold text-slate-400 leading-none mb-1">Letras</span>
                          <span className="text-sm font-black text-slate-700">{totalCompletedLetters}/{letterCount}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-extrabold text-slate-400 leading-none mb-1">Números</span>
                          <span className="text-sm font-black text-slate-700">{totalCompletedNumbers}/{numberCount}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-extrabold text-slate-400 leading-none mb-1">Estrellas</span>
                          <span className="text-sm font-black text-amber-600">⭐{p.stars}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4 text-left">
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-400 mb-1">
                          <span>Progreso</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-150 rounded-full overflow-hidden border">
                          <div className="h-full bg-[#81C784] rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t-2 border-slate-100 pt-3">
                      <button
                        onClick={() => confirmResetProfileProgress(p)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-all cursor-pointer font-bold text-xs flex items-center gap-1"
                        title="Restablecer progreso"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteProfile(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer font-bold text-xs flex items-center gap-1"
                        title="Borrar Perfil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {profiles.length === 0 && (
                <div className="sm:col-span-2 md:col-span-3 bg-white border-4 border-dashed border-slate-300 rounded-[32px] p-8 text-center text-slate-400">
                  <p className="font-bold text-sm">No hay perfiles de niños creados todavía.</p>
                  <p className="text-xs mt-1">Crea uno en el botón "Nuevo Perfil" de arriba para comenzar a registrar su avance.</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Tracking Details for active user */}
          {activeProfile && (
            <div className="bg-white border-4 border-[#4FC3F7] rounded-[32px] p-4 md:p-6 mb-8 text-left shadow-md">
              <div className="flex items-center gap-2.5 mb-5 border-b-2 border-slate-100 pb-3">
                <span className="text-3xl bg-[#FFFDE7] p-1.5 rounded-full border-2 border-[#FFD54F]">{activeProfile.avatar}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Progreso Detallado: {activeProfile.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">Toda su actividad en las letras y números interactivos</p>
                </div>
              </div>

              {/* Progress Heatmap letters and numbers */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">Letras Completadas</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TRACING_PATHS).filter(c => isNaN(Number(c))).map(char => {
                    const isDone = activeProfile.completed.includes(char);
                    return (
                      <div
                        key={char}
                        className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl border-2 transition-all ${
                          isDone 
                            ? 'bg-[#E8F5E9] border-[#81C784] text-[#2E7D32] shadow-sm font-black' 
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                        title={isDone ? `¡Completado! Letter ${char}` : `Sin trazar letter ${char}`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Numbers Heatmap */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">Números Completados</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TRACING_PATHS).filter(c => !isNaN(Number(c))).map(char => {
                    const isDone = activeProfile.completed.includes(char);
                    return (
                      <div
                        key={char}
                        className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl border-2 transition-all ${
                          isDone 
                            ? 'bg-[#E8F5E9] border-[#81C784] text-[#2E7D32] shadow-sm font-black' 
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                        title={isDone ? `¡Completado! Number ${char}` : `Sin trazar number ${char}`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reward/Stickers section */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">Calcomanías Coleccionables Desbloqueadas ({activeProfile.stickers.length}/{COLLECTIBLE_STICKERS.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {COLLECTIBLE_STICKERS.map(sticker => {
                    const isUnlocked = activeProfile.stickers.includes(sticker.id) || activeProfile.stars >= sticker.unlockedAtStars;
                    return (
                      <div 
                        key={sticker.id}
                        className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                          isUnlocked 
                            ? 'bg-[#FFFDE7] border-[#FFD54F] text-slate-800 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-350 opacity-60'
                        }`}
                      >
                        <span className={`block text-3xl mb-1 ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                          {isUnlocked ? sticker.emoji : '🔒'}
                        </span>
                        <span className="block text-[10px] font-black truncate">{sticker.name}</span>
                        <span className="block text-[9px] text-[#9575CD] font-extrabold mt-0.5">⭐ {sticker.unlockedAtStars} estrellas</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trace Logs (Timeline) */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">Historial Reciente de Trazos</h4>
                <div className="max-h-48 overflow-y-auto border-2 border-slate-100 rounded-xl">
                  {activeProfile.logs && activeProfile.logs.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 border-b border-slate-100">
                          <th className="p-3">Símbolo</th>
                          <th className="p-3">Fecha</th>
                          <th className="p-3 text-right">Calificación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-bold">
                        {activeProfile.logs.slice().reverse().map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-7 h-7 rounded-full bg-purple-50 border-2 border-purple-200 text-[#4A148C] flex items-center justify-center font-black">{log.character}</span>
                            </td>
                            <td className="p-3 text-slate-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(log.date).toLocaleDateString()}</span>
                            </td>
                            <td className="p-3 text-right font-black text-amber-500">
                              {log.accuracy >= 90 ? '⭐⭐⭐ Excelente' : log.accuracy >= 60 ? '⭐⭐ Muy Bueno' : '⭐ Sigue Practicando'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-center text-xs text-slate-400 font-bold">Aún no se han registrado trazos de aprendizaje.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacy and Child Safety Banner */}
          <div className="bg-[#E8F5E9] border-4 border-[#81C784] rounded-[32px] p-4 md:p-5 text-left flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8 shadow-sm">
            <div className="w-12 h-12 bg-[#81C784] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border-2 border-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-900 flex items-center gap-1.5">
                🛡️ Privacidad Total & Seguridad Infantil Garantizada
              </h3>
              <p className="text-xs text-emerald-700 leading-relaxed mt-1 font-semibold">
                Esta aplicación funciona <strong>completamente sin conexión</strong>. Los datos de progreso, perfiles y estrellas se almacenan <strong>únicamente de forma local en este dispositivo</strong> utilizando <code>localStorage</code>. No hay servidores externos, no se requiere registro, no recopilamos ningún tipo de datos personales de los niños, y no hay anuncios externos de ningún tipo. Su privacidad y la de sus hijos está 100% protegida.
              </p>
            </div>
          </div>

          {/* Custom Delete Profile Confirmation Modal */}
          <AnimatePresence>
            {profileToDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white border-8 border-rose-400 p-6 rounded-[32px] max-w-sm w-full text-center shadow-[0_12px_0_#E57373,0_20px_25px_rgba(0,0,0,0.15)] relative"
                >
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 border-4 border-rose-200">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">¿Eliminar Perfil?</h3>
                  <p className="text-sm text-slate-500 font-bold mb-6 leading-relaxed">
                    ¿Estás seguro de que deseas borrar de forma permanente a <span className="text-rose-500">{profileToDelete.name}</span> {profileToDelete.avatar}? Se perderán todas sus estrellas y calcomanías para siempre.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => { sounds.playClick(); setProfileToDelete(null); }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-sm transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeDeleteProfile}
                      className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-sm border-b-4 border-rose-700 active:translate-y-0.5 shadow-md transition-all cursor-pointer"
                    >
                      Sí, Eliminar 🗑️
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Reset Progress Confirmation Modal */}
          <AnimatePresence>
            {profileToReset && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white border-8 border-amber-400 p-6 rounded-[32px] max-w-sm w-full text-center shadow-[0_12px_0_#FFD54F,0_20px_25px_rgba(0,0,0,0.15)] relative"
                >
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4 border-4 border-amber-200 animate-spin" style={{ animationDuration: '6s' }}>
                    <RotateCcw className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">¿Restablecer Progreso?</h3>
                  <p className="text-sm text-slate-500 font-bold mb-6 leading-relaxed">
                    ¿Quieres reiniciar el avance de <span className="text-amber-600">{profileToReset.name}</span> {profileToReset.avatar}? Volverá a tener 0 estrellas y no conservará calcomanías.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => { sounds.playClick(); setProfileToReset(null); }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-sm transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeResetProfileProgress}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-sm border-b-4 border-amber-700 active:translate-y-0.5 shadow-md transition-all cursor-pointer"
                    >
                      Sí, Reiniciar 🔄
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
}
