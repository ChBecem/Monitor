export interface LullabyInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const LULLABIES: LullabyInfo[] = [
  { id: 'twinkle', name: 'Ah vous dirai-je, maman (Twinkle)', emoji: '⭐', description: 'Mélodie douce et rassurante' },
  { id: 'brahms', name: 'Berceuse de Brahms', emoji: '🎵', description: 'Classique universel pour le dodo' },
  { id: 'whitenoise', name: 'Bruit Blanc Pur', emoji: '💨', description: 'Simule un souffle doux et continu' },
  { id: 'heartbeat', name: 'Battement de Cœur', emoji: '❤️', description: 'Rassure bébé comme dans le ventre' }
];

export const NIGHTLIGHT_COLORS = [
  { id: 'yellow', name: 'Lueur Dorée (Chaud)', class: 'from-amber-500/20 to-amber-950/80', glow: '#fbbf24', border: 'border-amber-500' },
  { id: 'purple', name: 'Nébuleuse Lilas', class: 'from-purple-500/20 to-purple-950/80', glow: '#a855f7', border: 'border-purple-500' },
  { id: 'blue', name: 'Ciel Paisible', class: 'from-blue-500/20 to-blue-950/80', glow: '#3b82f6', border: 'border-blue-500' },
  { id: 'green', name: 'Aurore Douce', class: 'from-emerald-500/20 to-emerald-950/80', glow: '#10b981', border: 'border-emerald-500' }
];
