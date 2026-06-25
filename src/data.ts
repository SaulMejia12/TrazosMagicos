/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
}

export interface CharacterPath {
  char: string;
  points: Point[];
  type: 'letter' | 'number';
  color: string;
}

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  category: string;
  phrase: string;
  unlockedAtStars: number;
}

export interface TraceLog {
  id: string;
  character: string;
  date: string;
  accuracy: number; // 0 to 100
}

export interface KidProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  completed: string[]; // Completed characters
  stars: number;
  stickers: string[]; // Unlocked sticker IDs
  logs: TraceLog[];
}

// 12 adorable collectible stickers
export const COLLECTIBLE_STICKERS: Sticker[] = [
  { id: 'st_uni', emoji: '🦄', name: 'Unicornio Mágico', category: 'Fantasía', phrase: '¡Brilla con luz propia!', unlockedAtStars: 3 },
  { id: 'st_rex', emoji: '🦖', name: 'Tiranosaurio Rex', category: 'Dinosaurios', phrase: '¡Un rugido de victoria!', unlockedAtStars: 6 },
  { id: 'st_rkt', emoji: '🚀', name: 'Cohete Espacial', category: 'Espacio', phrase: '¡Hasta las estrellas!', unlockedAtStars: 10 },
  { id: 'st_lio', emoji: '🦁', name: 'León Valiente', category: 'Animales', phrase: '¡Rey de los trazos!', unlockedAtStars: 15 },
  { id: 'st_pan', emoji: '🐼', name: 'Panda Juguetón', category: 'Animales', phrase: '¡Amante del bambú!', unlockedAtStars: 20 },
  { id: 'st_dol', emoji: '🐬', name: 'Delfín Saltador', category: 'Océano', phrase: '¡Un salto de alegría!', unlockedAtStars: 25 },
  { id: 'st_ice', emoji: '🍦', name: 'Helado Gigante', category: 'Postres', phrase: '¡Premio super dulce!', unlockedAtStars: 30 },
  { id: 'st_don', emoji: '🍩', name: 'Dona Feliz', category: 'Postres', phrase: '¡Redonda y deliciosa!', unlockedAtStars: 35 },
  { id: 'st_pal', emoji: '🎨', name: 'Paleta Creativa', category: 'Arte', phrase: '¡Pintas de colores!', unlockedAtStars: 40 },
  { id: 'st_ted', emoji: '🧸', name: 'Osito Cariñoso', category: 'Juguetes', phrase: '¡Un súper abrazo para ti!', unlockedAtStars: 45 },
  { id: 'st_ufo', emoji: '🛸', name: 'Platillo Volador', category: 'Espacio', phrase: '¡Visitante espacial!', unlockedAtStars: 50 },
  { id: 'st_str', emoji: '🍓', name: 'Fresita Alegre', category: 'Frutas', phrase: '¡Súper fresca y dulce!', unlockedAtStars: 55 },
];

export const AVATAR_OPTIONS = ['🐯', '🦊', '🐨', '🐸', '🦁', '🐱', '🐼', '🐵', '🦄', '🦖', '🐰', '🐷'];
export const COLOR_OPTIONS = [
  { name: 'Rosa Pastel', value: 'from-pink-400 to-rose-500', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-600', accent: 'bg-rose-500' },
  { name: 'Celeste Mágico', value: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-600', accent: 'bg-blue-500' },
  { name: 'Verde Dinosaurio', value: 'from-green-400 to-emerald-500', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-600', accent: 'bg-emerald-500' },
  { name: 'Naranja Sol', value: 'from-amber-400 to-orange-500', bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-600', accent: 'bg-orange-500' },
  { name: 'Púrpura Galaxia', value: 'from-purple-400 to-indigo-500', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-600', accent: 'bg-indigo-500' },
];

// Normalized coordinates (0 to 100) for letter and number shapes
export const TRACING_PATHS: Record<string, Point[]> = {
  // Letters
  'A': [{ x: 20, y: 85 }, { x: 50, y: 15 }, { x: 80, y: 85 }, { x: 65, y: 55 }, { x: 35, y: 55 }],
  'B': [{ x: 25, y: 85 }, { x: 25, y: 15 }, { x: 60, y: 15 }, { x: 60, y: 48 }, { x: 25, y: 48 }, { x: 65, y: 48 }, { x: 65, y: 85 }, { x: 25, y: 85 }],
  'C': [{ x: 75, y: 25 }, { x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 75, y: 75 }],
  'D': [{ x: 30, y: 85 }, { x: 30, y: 15 }, { x: 65, y: 15 }, { x: 75, y: 50 }, { x: 65, y: 85 }, { x: 30, y: 85 }],
  'E': [{ x: 70, y: 15 }, { x: 30, y: 15 }, { x: 30, y: 50 }, { x: 60, y: 50 }, { x: 30, y: 50 }, { x: 30, y: 85 }, { x: 70, y: 85 }],
  'F': [{ x: 70, y: 15 }, { x: 30, y: 15 }, { x: 30, y: 50 }, { x: 60, y: 50 }, { x: 30, y: 50 }, { x: 30, y: 85 }],
  'G': [{ x: 75, y: 25 }, { x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 75, y: 85 }, { x: 75, y: 55 }, { x: 55, y: 55 }],
  'H': [{ x: 25, y: 15 }, { x: 25, y: 85 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 75, y: 15 }, { x: 75, y: 85 }],
  'I': [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 50, y: 15 }, { x: 50, y: 85 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
  'J': [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 50, y: 15 }, { x: 50, y: 75 }, { x: 40, y: 85 }, { x: 25, y: 75 }],
  'K': [{ x: 25, y: 15 }, { x: 25, y: 85 }, { x: 25, y: 50 }, { x: 70, y: 15 }, { x: 25, y: 50 }, { x: 70, y: 85 }],
  'L': [{ x: 30, y: 15 }, { x: 30, y: 85 }, { x: 70, y: 85 }],
  'M': [{ x: 20, y: 85 }, { x: 20, y: 15 }, { x: 50, y: 50 }, { x: 80, y: 15 }, { x: 80, y: 85 }],
  'N': [{ x: 25, y: 85 }, { x: 25, y: 15 }, { x: 75, y: 85 }, { x: 75, y: 15 }],
  'O': [{ x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 75, y: 50 }, { x: 50, y: 15 }],
  'P': [{ x: 30, y: 85 }, { x: 30, y: 15 }, { x: 65, y: 15 }, { x: 65, y: 50 }, { x: 30, y: 50 }],
  'Q': [{ x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 75, y: 50 }, { x: 50, y: 15 }, { x: 60, y: 60 }, { x: 80, y: 85 }],
  'R': [{ x: 30, y: 85 }, { x: 30, y: 15 }, { x: 65, y: 15 }, { x: 65, y: 48 }, { x: 30, y: 48 }, { x: 70, y: 85 }],
  'S': [{ x: 75, y: 25 }, { x: 50, y: 15 }, { x: 25, y: 35 }, { x: 50, y: 50 }, { x: 75, y: 65 }, { x: 50, y: 85 }, { x: 25, y: 75 }],
  'T': [{ x: 20, y: 15 }, { x: 80, y: 15 }, { x: 50, y: 15 }, { x: 50, y: 85 }],
  'U': [{ x: 25, y: 15 }, { x: 25, y: 65 }, { x: 50, y: 85 }, { x: 75, y: 65 }, { x: 75, y: 15 }],
  'V': [{ x: 20, y: 15 }, { x: 50, y: 85 }, { x: 80, y: 15 }],
  'W': [{ x: 15, y: 15 }, { x: 30, y: 85 }, { x: 50, y: 45 }, { x: 70, y: 85 }, { x: 85, y: 15 }],
  'X': [{ x: 20, y: 15 }, { x: 80, y: 85 }, { x: 50, y: 50 }, { x: 80, y: 15 }, { x: 20, y: 85 }],
  'Y': [{ x: 20, y: 15 }, { x: 50, y: 50 }, { x: 80, y: 15 }, { x: 50, y: 50 }, { x: 50, y: 85 }],
  'Z': [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 25, y: 85 }, { x: 75, y: 85 }],

  // Numbers
  '0': [{ x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 75, y: 50 }, { x: 50, y: 15 }],
  '1': [{ x: 35, y: 30 }, { x: 50, y: 15 }, { x: 50, y: 85 }, { x: 30, y: 85 }, { x: 70, y: 85 }],
  '2': [{ x: 25, y: 30 }, { x: 50, y: 15 }, { x: 75, y: 30 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
  '3': [{ x: 25, y: 20 }, { x: 75, y: 20 }, { x: 45, y: 48 }, { x: 75, y: 65 }, { x: 50, y: 85 }, { x: 25, y: 75 }],
  '4': [{ x: 20, y: 55 }, { x: 60, y: 15 }, { x: 60, y: 85 }, { x: 60, y: 55 }, { x: 80, y: 55 }],
  '5': [{ x: 70, y: 15 }, { x: 30, y: 15 }, { x: 30, y: 48 }, { x: 70, y: 48 }, { x: 70, y: 85 }, { x: 30, y: 85 }],
  '6': [{ x: 70, y: 20 }, { x: 40, y: 15 }, { x: 25, y: 50 }, { x: 45, y: 85 }, { x: 70, y: 70 }, { x: 45, y: 50 }, { x: 25, y: 50 }],
  '7': [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 35, y: 85 }],
  '8': [{ x: 50, y: 50 }, { x: 25, y: 30 }, { x: 50, y: 15 }, { x: 75, y: 30 }, { x: 50, y: 50 }, { x: 25, y: 70 }, { x: 50, y: 85 }, { x: 75, y: 70 }, { x: 50, y: 50 }],
  '9': [{ x: 75, y: 50 }, { x: 50, y: 15 }, { x: 25, y: 30 }, { x: 50, y: 50 }, { x: 75, y: 50 }, { x: 75, y: 85 }]
};

export const COLOR_PALETTE = [
  '#FF5E7E', // Bright Pink
  '#FFBB00', // Gold/Yellow
  '#00D2FC', // Light Blue
  '#2ECC71', // Emerald Green
  '#9B59B6', // Amethyst Purple
  '#E67E22', // Orange
];

export function getCharacterColor(char: string): string {
  const code = char.charCodeAt(0);
  return COLOR_PALETTE[code % COLOR_PALETTE.length];
}

// Parent test questions (to lock parents section)
export const PARENT_QUESTIONS = [
  { text: '¿Cuánto es 8 más 7?', answer: 15 },
  { text: '¿Cuánto es 9 más 6?', answer: 15 },
  { text: '¿Cuánto es 5 más 9?', answer: 14 },
  { text: '¿Cuánto es 12 menos 4?', answer: 8 },
  { text: '¿Cuánto es 15 menos 6?', answer: 9 },
  { text: '¿Cuánto es 6 más 8?', answer: 14 },
  { text: '¿Cuánto es 7 más 7?', answer: 14 }
];

// Helper functions for profile persistence in localStorage
const PROFILE_KEY = 'trazos_magicos_profiles';
const ACTIVE_PROFILE_KEY = 'trazos_magicos_active_id';

export function loadProfiles(): KidProfile[] {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading profiles from localStorage', e);
  }
  return [];
}

export function saveProfiles(profiles: KidProfile[]): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Error saving profiles to localStorage', e);
  }
}

export function getActiveProfileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function setActiveProfileId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  } catch (e) {
    console.error('Error saving active profile ID to localStorage', e);
  }
}

export function createNewProfile(name: string, avatar: string, colorClass: string): KidProfile {
  return {
    id: 'kid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name,
    avatar: avatar,
    color: colorClass,
    completed: [],
    stars: 0,
    stickers: [],
    logs: []
  };
}

export function checkStickerUnlocks(starsCount: number): string[] {
  // Check which stickers are unlocked based on total star count
  return COLLECTIBLE_STICKERS
    .filter(sticker => starsCount >= sticker.unlockedAtStars)
    .map(sticker => sticker.id);
}
