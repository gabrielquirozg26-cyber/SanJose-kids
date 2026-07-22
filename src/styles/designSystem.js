// src/styles/designSystem.js

// ── COLORES ──────────────────────────────────────────────────────────────
export const colors = {
  // Colores primarios (dorados - tema de iglesia)
  primary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',   // Dorado principal
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  // Colores secundarios (azules - cielo, espiritualidad)
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // Azul principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Colores de acento
  accent: {
    purple: '#a855f7',
    pink: '#ec4899',
    orange: '#f97316',
    green: '#22c55e',
    red: '#ef4444',
    amber: '#f59e0b',
  },
  // Colores neutrales (blancos y grises)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Colores de estado
  state: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

// ── TIPOGRAFÍA ──────────────────────────────────────────────────────────
export const typography = {
  // Títulos
  h1: 'text-4xl sm:text-5xl font-black tracking-tighter',
  h2: 'text-3xl sm:text-4xl font-black tracking-tighter',
  h3: 'text-2xl sm:text-3xl font-black tracking-tight',
  h4: 'text-xl sm:text-2xl font-black tracking-tight',
  h5: 'text-lg sm:text-xl font-black tracking-tight',
  h6: 'text-base sm:text-lg font-black tracking-tight',
  
  // Cuerpo
  body: {
    large: 'text-base font-medium',
    base: 'text-sm font-medium',
    small: 'text-xs font-medium',
    tiny: 'text-[10px] font-black uppercase tracking-widest',
  },
  
  // Especiales
  uppercase: 'font-black uppercase tracking-widest',
  label: 'text-[10px] font-black uppercase tracking-widest',
  caption: 'text-xs text-white/50 font-medium',
};

// ── ESPACIADO ────────────────────────────────────────────────────────────
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
  xxxl: '4rem',    // 64px
};

// ── BORDES Y SOMBRAS ────────────────────────────────────────────────────
export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  full: '9999px',
};

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-[0_0_30px_rgba(250,204,21,0.15)]',
  glowStrong: 'shadow-[0_0_50px_rgba(250,204,21,0.25)]',
};

// ── ANIMACIONES ──────────────────────────────────────────────────────────
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  float: 'animate-float',
  scale: 'transition-transform duration-200 hover:scale-105 active:scale-95',
};

// ── GLASSMORPHISM ──────────────────────────────────────────────────────
export const glass = {
  card: 'glass-card backdrop-blur-xl bg-white/5 border border-white/10',
  cardHover: 'glass-card backdrop-blur-xl bg-white/5 border border-white/10 transition-all hover:scale-[1.01] hover:border-white/20',
  cardGlow: 'glass-card backdrop-blur-xl bg-white/5 border border-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.1)]',
};

// ── GRADIENTES ──────────────────────────────────────────────────────────
export const gradients = {
  hero: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900',
  gold: 'bg-gradient-to-r from-yellow-400 to-amber-400',
  goldHover: 'bg-gradient-to-r from-yellow-300 to-amber-300',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
  green: 'bg-gradient-to-r from-green-500 to-emerald-500',
  red: 'bg-gradient-to-r from-red-500 to-rose-500',
};

// ── TAMAÑOS DE BOTONES ──────────────────────────────────────────────────
export const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

// ── VARIANTES DE BOTONES ──────────────────────────────────────────────
export const buttonVariants = {
  primary: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
  secondary: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
  danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
  success: 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30',
  glass: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
  gold: 'bg-yellow-400 text-blue-900 hover:bg-yellow-300',
  outline: 'border-2 border-white/20 text-white hover:bg-white/10',
};

// ── VARIANTES DE TARJETAS ──────────────────────────────────────────────
export const cardVariants = {
  default: 'glass-card rounded-2xl p-5 border border-white/10',
  glow: 'glass-card rounded-2xl p-5 border border-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.1)]',
  interactive: 'glass-card rounded-2xl p-5 border border-white/10 transition-all hover:scale-[1.01] hover:border-white/20 cursor-pointer',
  dark: 'bg-black/40 rounded-2xl p-5 border border-white/10',
};

// ── EXPORTAR TODO JUNTO ────────────────────────────────────────────────
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  glass,
  gradients,
  buttonSizes,
  buttonVariants,
  cardVariants,
};