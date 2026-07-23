// src/utils/leccionHelpers.js

/**
 * Mezcla un array (Fisher-Yates)
 */
export const mezclar = (arr) => [...arr].sort(() => Math.random() - 0.5);

/**
 * Normaliza texto para comparación
 */
export const normalizar = (str) =>
  str.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

/**
 * Elige un tipo de ejercicio diferente al anterior
 */
export const elegirTipoEjercicio = (anterior) => {
  const tipos = ['seleccion', 'ordenar', 'escritura'];
  const disponibles = tipos.filter(t => t !== anterior);
  return disponibles[Math.floor(Math.random() * disponibles.length)];
};

/**
 * Calcula la precisión
 */
export const calcularPrecision = (aciertos, total) => {
  if (total === 0) return 0;
  return Math.round((aciertos / total) * 100);
};

/**
 * Obtiene el rango basado en precisión
 */
export const obtenerRango = (precision) => {
  if (precision === 100) {
    return {
      label: '¡PERFECTO!',
      icono: '⭐',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10 border-yellow-400/30'
    };
  }
  if (precision >= 80) {
    return {
      label: '¡EXCELENTE!',
      icono: '🔥',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10 border-orange-400/30'
    };
  }
  if (precision >= 60) {
    return {
      label: '¡BIEN HECHO!',
      icono: '👍',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/30'
    };
  }
  return {
    label: '¡COMPLETADO!',
    icono: '✝️',
    color: 'text-white/60',
    bg: 'bg-white/5 border-white/10'
  };
};

/**
 * Obtiene la recompensa por tipo de ejercicio
 */
export const obtenerRecompensa = (tipo, factor = 1) => {
  const base = tipo === 'escritura' ? 40 : tipo === 'ordenar' ? 35 : 25;
  return Math.floor(base * factor);
};