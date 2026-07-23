// src/views/Tienda.jsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../context/ShopContext';
import { useTitles } from '../context/TitlesContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import TitulosModal from '../components/TitulosModal';

// ── ESTILOS ──────────────────────────────────────────────────────────────
const RAREZA_STYLES = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

const COFRE_STYLES = {
  madera: 'from-amber-800/40 to-amber-600/20 border-amber-600/50 shadow-amber-600/20',
  plata: 'from-slate-400/40 to-slate-300/20 border-slate-400/50 shadow-slate-400/20',
  oro: 'from-yellow-400/40 to-amber-300/20 border-yellow-400/50 shadow-yellow-400/30',
};

const CATEGORIES = [
  { 
    id: 'consumibles', 
    icono: '🛡️', 
    label: 'Consumibles', 
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-400/30',
    desc: 'Items para usar en lecciones'
  },
  { 
    id: 'potenciadores', 
    icono: '🚀', 
    label: 'Potenciadores', 
    color: 'from-orange-500/20 to-red-500/10 border-orange-400/30',
    desc: 'Mejora tu experiencia de juego'
  },
  { 
    id: 'cofres', 
    icono: '🎁', 
    label: 'Cofres', 
    color: 'from-purple-500/20 to-pink-500/10 border-purple-400/30',
    desc: 'Consigue santos misteriosos'
  },
  { 
    id: 'personalizacion', 
    icono: '✨', 
    label: 'Personalización', 
    color: 'from-amber-500/20 to-orange-500/10 border-amber-400/30',
    desc: 'Haz tu perfil único'
  },
];

// ── COMPONENTES DE ANIMACIÓN ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  }
};

const floatVariants = {
  initial: { y: 0 },
  animate: { 
    y: [-5, 0, -5],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};

// ── TIENDA PRINCIPAL ─────────────────────────────────────────────────────
const Tienda = () => {
  const { showToast } = useToast();
  
  const {
    monedas,
    vidas,
    inventario,
    comprarCorazon,
    comprarPocion,
    comprarDobleXp,
    comprarProtectorRacha,
    comprarTituloLegendario,
    titulosLegendarios,
  } = useGame();

  const {
    obtenerOfertaDiaria,
    corazonesCompradosHoy,
    cofresMaderaCompradosHoy,
    cofresPlataCompradosHoy,
    cofresOroCompradosHoy,
    pocionesCompradasHoy,
    dobleXpCompradosHoy,
    protectorRachaCompradosHoy,
    comprarCofreMadera,
    comprarCofrePlata,
    comprarCofreOro,
    comprarItem,
  } = useShop();

  const [toast, setToast] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [modalTitulosOpen, setModalTitulosOpen] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('consumibles');

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCompra = async (func, nombre, precio) => {
    if (comprando) {
      showToast('⏳ Espera a que termine la compra', 'warning');
      return;
    }
    
    if (monedas < precio) {
      mostrarToast(`🪙 Necesitas ${precio - monedas} monedas más`, 'error');
      return;
    }
    
    setComprando(true);
    
    try {
      if (typeof func !== 'function') {
        console.error('❌ handleCompra: func no es una función', func);
        mostrarToast('❌ Error interno en la compra', 'error');
        setComprando(false);
        return;
      }
      
      const ok = await func();
      
      if (ok) {
        confetti({ 
          particleCount: 120, 
          spread: 70, 
          origin: { y: 0.5 }, 
          colors: ['#facc15', '#ffffff', '#3b82f6', '#10b981'] 
        });
        mostrarToast(`✅ ${nombre} adquirido`, 'success');
        showToast(`🎉 ¡${nombre}!`, 'success', 2000);
      } else {
        mostrarToast(`❌ No se pudo comprar ${nombre}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error en compra:', error);
      mostrarToast(`❌ Error al comprar ${nombre}`, 'error');
    } finally {
      setComprando(false);
    }
  };

  const ofertaDiaria = obtenerOfertaDiaria();

  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6 animate-slide-up">
      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl bg-black/80 backdrop-blur border border-yellow-400/30"
          >
            {toast.mensaje}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER CON MONEDAS ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 text-center relative overflow-hidden border border-white/10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">💰 Tu balance</p>
          <motion.div 
            className="flex items-center justify-center gap-3 mt-1"
            variants={floatVariants}
            initial="initial"
            animate="animate"
          >
            <span className="text-4xl sm:text-5xl drop-shadow-lg">🪙</span>
            <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              {monedas.toLocaleString()}
            </span>
          </motion.div>
          <p className="text-white/30 text-[10px] sm:text-xs mt-2">¡Invierte en tu fe y consigue recompensas!</p>
        </div>
      </motion.div>

      {/* ── OFERTA DEL DÍA ── */}
      {ofertaDiaria && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card rounded-3xl p-4 sm:p-5 border-2 border-yellow-400/60 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center text-2xl sm:text-3xl"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {ofertaDiaria.icono}
              </motion.div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-yellow-400 font-black text-[8px] sm:text-[10px] uppercase tracking-wider">🔥 OFERTA DEL DÍA</span>
                  <motion.span 
                    className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px] font-black"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    -{ofertaDiaria.descuento}%
                  </motion.span>
                </div>
                <p className="font-black text-white text-sm sm:text-lg">{ofertaDiaria.nombre}</p>
                <p className="text-white/40 text-[10px] sm:text-xs">{ofertaDiaria.descripcion || 'Oferta especial por tiempo limitado'}</p>
              </div>
            </div>
            <div className="text-right w-full sm:w-auto">
              <p className="text-white/40 text-[10px] sm:text-xs line-through">{ofertaDiaria.precioOriginal} 🪙</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (ofertaDiaria.id === 'corazon_extra') {
                    handleCompra(comprarCorazon, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  } else if (ofertaDiaria.id === 'doble_xp') {
                    handleCompra(comprarDobleXp, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  } else if (ofertaDiaria.id === 'protector_racha') {
                    handleCompra(comprarProtectorRacha, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  } else if (ofertaDiaria.id === 'pocion_sabiduria') {
                    handleCompra(comprarPocion, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  } else {
                    handleCompra(
                      () => comprarItem({ ...ofertaDiaria, precio: ofertaDiaria.precioOferta }), 
                      ofertaDiaria.nombre, 
                      ofertaDiaria.precioOferta
                    );
                  }
                }}
                disabled={comprando}
                className="bg-yellow-400 text-blue-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-sm hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {comprando ? (
                  <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{ofertaDiaria.precioOferta} 🪙</span>
                    <span>→</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── CATEGORÍAS ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1 sm:gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10 overflow-x-auto scrollbar-hide"
      >
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-full font-black text-[8px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1 sm:gap-1.5 ${
              categoriaActiva === cat.id 
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>{cat.icono}</span>
            <span className="hidden xs:inline">{cat.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── CONTENIDO POR CATEGORÍA ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={categoriaActiva}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* === CONSUMIBLES === */}
          {categoriaActiva === 'consumibles' && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🛡️</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Consumibles</h3>
                <span className="text-white/20 text-[10px] ml-auto hidden sm:inline">Usa sabiamente tus recursos</span>
              </div>
              
              <ItemCard
                icon="❤️"
                title="Corazón Extra"
                desc="Recupera 1 vida · 3/día"
                price={150}
                disabledReason={corazonesCompradosHoy >= 3 ? 'Límite diario' : vidas >= 5 ? 'Vidas completas' : null}
                onBuy={() => handleCompra(comprarCorazon, 'Corazón Extra', 150)}
                glow={corazonesCompradosHoy < 3 && vidas < 5}
              />
              
              <ItemCard
                icon="🛡️"
                title="Escudo de San Miguel"
                desc="Te protege de 1 error en lección"
                price={150}
                owned={inventario.includes('escudo_miguel')}
                onBuy={() => handleCompra(
                  () => comprarItem({ id: 'escudo_miguel', nombre: 'Escudo de San Miguel', precio: 150 }), 
                  'Escudo de San Miguel', 
                  150
                )}
              />
              
              <ItemCard
                icon="🧪"
                title="Poción de Sabiduría"
                desc="Elimina 2 opciones incorrectas · 2/día, 3 max"
                price={120}
                disabledReason={pocionesCompradasHoy >= 2 ? 'Límite diario' : (inventario.filter(i => i === 'pocion_sabiduria').length >= 3 ? 'Inventario lleno' : null)}
                onBuy={() => handleCompra(comprarPocion, 'Poción de Sabiduría', 120)}
                glow={pocionesCompradasHoy < 2 && inventario.filter(i => i === 'pocion_sabiduria').length < 3}
              />
            </motion.div>
          )}

          {/* === POTENCIADORES === */}
          {categoriaActiva === 'potenciadores' && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🚀</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Potenciadores</h3>
                <span className="text-white/20 text-[10px] ml-auto hidden sm:inline">Mejora tu experiencia</span>
              </div>
              
              <ItemCard
                icon="⚡"
                title="Doble XP"
                desc="Duplica monedas en 1 lección · 3/día"
                price={80}
                disabledReason={dobleXpCompradosHoy >= 3 ? 'Límite diario' : null}
                onBuy={() => handleCompra(comprarDobleXp, 'Doble XP', 80)}
                glow={dobleXpCompradosHoy < 3}
              />
              
              <ItemCard
                icon="🔥"
                title="Protector de Racha"
                desc="Protege tu racha si no juegas 1 día · 1/día"
                price={100}
                disabledReason={protectorRachaCompradosHoy >= 1 ? 'Límite diario' : null}
                onBuy={() => handleCompra(comprarProtectorRacha, 'Protector de Racha', 100)}
                glow={protectorRachaCompradosHoy < 1}
              />
            </motion.div>
          )}

          {/* === COFRES === */}
          {categoriaActiva === 'cofres' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎁</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Cofres Misteriosos</h3>
                <span className="text-white/20 text-[10px] ml-auto hidden sm:inline">Cada cofre contiene un santo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CofreCard
                  tipo="madera"
                  nombre="Cofre de Madera"
                  icono="📦"
                  desc="Santo común o raro"
                  precio={200}
                  limite={cofresMaderaCompradosHoy}
                  max={3}
                  onComprar={() => handleCompra(comprarCofreMadera, 'Cofre de Madera', 200)}
                />
                <CofreCard
                  tipo="plata"
                  nombre="Cofre de Plata"
                  icono="🎁"
                  desc="Santo raro o legendario"
                  precio={300}
                  limite={cofresPlataCompradosHoy}
                  max={2}
                  onComprar={() => handleCompra(comprarCofrePlata, 'Cofre de Plata', 300)}
                />
                <CofreCard
                  tipo="oro"
                  nombre="Cofre de Oro"
                  icono="🏆"
                  desc="Santo legendario"
                  precio={450}
                  limite={cofresOroCompradosHoy}
                  max={1}
                  onComprar={() => handleCompra(comprarCofreOro, 'Cofre de Oro', 450)}
                />
              </div>
            </motion.div>
          )}

          {/* === PERSONALIZACIÓN === */}
          {categoriaActiva === 'personalizacion' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Personalización</h3>
                <span className="text-white/20 text-[10px] ml-auto hidden sm:inline">Haz tu perfil único</span>
              </div>

              {/* Títulos Legendarios */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center text-2xl sm:text-3xl"
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      👑
                    </motion.div>
                    <div>
                      <p className="font-black text-white text-sm sm:text-lg">Títulos Legendarios</p>
                      <p className="text-white/40 text-[10px] sm:text-sm">Adquiere títulos exclusivos para lucir en tu perfil</p>
                      <p className="text-purple-300 text-[10px] font-black mt-0.5">
                        {titulosLegendarios?.length || 0} títulos disponibles
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalTitulosOpen(true)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl transition-all"
                  >
                    Ver títulos →
                  </motion.button>
                </div>
              </motion.div>

              {/* Cosméticos con nuevos precios */}
              {[
                { id: 'titulo_guardian', nombre: 'Guardián del Credo', icono: '⚜️', precio: 800, rareza: 'epico', desc: 'Cambia tu rango visible' },
                { id: 'titulo_maestro', nombre: 'Maestro de la Fe', icono: '👑', precio: 1200, rareza: 'legendario', desc: 'El rango más alto' },
                { id: 'aura_santidad', nombre: 'Aura de Santidad', icono: '✨', precio: 500, rareza: 'raro', desc: 'Efecto brillante en tu perfil' },
                { id: 'marco_vitral_azul', nombre: 'Marco Vitral Azul', icono: '🔵', precio: 350, rareza: 'raro', desc: 'Borde azul para tu avatar' },
                { id: 'marco_vitral_dorado', nombre: 'Marco Vitral Dorado', icono: '🟡', precio: 600, rareza: 'epico', desc: 'Borde dorado para tu avatar' },
              ].map(item => (
                <ItemCard
                  key={item.id}
                  icon={item.icono}
                  title={item.nombre}
                  desc={item.desc}
                  price={item.precio}
                  rareza={item.rareza}
                  owned={inventario.includes(item.id)}
                  onBuy={() => handleCompra(
                    () => comprarItem(item), 
                    item.nombre, 
                    item.precio
                  )}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center pt-4"
      >
        <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
          💰 Los objetos cosméticos se aplican automáticamente al comprarlos
        </p>
      </motion.div>

      {/* ── MODAL TÍTULOS LEGENDARIOS ── */}
      <TitulosModal
        isOpen={modalTitulosOpen}
        onClose={() => setModalTitulosOpen(false)}
        onComprar={(titulo) => handleCompra(
          () => comprarTituloLegendario(titulo.id, titulo.nombre, titulo.rareza, titulo.precio),
          titulo.nombre,
          titulo.precio
        )}
      />
    </div>
  );
};

// ── ITEM CARD ────────────────────────────────────────────────────────────
const ItemCard = ({ icon, title, desc, price, rareza, owned, disabledReason, onBuy, glow = false }) => {
  const rarezaClass = rareza ? RAREZA_STYLES[rareza] : 'border-white/10 bg-white/5';
  const estaDeshabilitado = disabledReason || owned;
  const motivo = disabledReason || (owned ? '✓ Equipado' : null);

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        }
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass-card rounded-2xl p-3 sm:p-4 border transition-all ${
        glow ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : ''
      } ${rarezaClass}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl sm:text-3xl shrink-0"
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          {icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-xs sm:text-sm truncate">{title}</p>
          <p className="text-white/40 text-[10px] sm:text-xs truncate">{desc}</p>
          {motivo && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-[10px] font-black mt-0.5 ${owned ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {motivo}
            </motion.p>
          )}
        </div>
        <motion.button
          whileHover={!estaDeshabilitado ? { scale: 1.05 } : {}}
          whileTap={!estaDeshabilitado ? { scale: 0.95 } : {}}
          onClick={onBuy}
          disabled={!!estaDeshabilitado}
          className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-sm bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 hover:shadow-lg transition-all disabled:bg-white/10 disabled:text-white/30 disabled:hover:scale-100 shrink-0"
        >
          {owned ? '✓' : `${price} 🪙`}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── COFRE CARD ──────────────────────────────────────────────────────────
const CofreCard = ({ tipo, nombre, icono, desc, precio, limite, max, onComprar }) => {
  const estilo = COFRE_STYLES[tipo];
  const estaAgotado = limite >= max;
  const progreso = (limite / max) * 100;

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        }
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`glass-card rounded-2xl p-4 sm:p-5 border bg-gradient-to-br ${estilo} transition-all hover:shadow-xl text-center relative overflow-hidden`}
    >
      {estaAgotado && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px] font-black uppercase"
        >
          Agotado
        </motion.div>
      )}
      <motion.div 
        className="text-5xl sm:text-6xl mb-3"
        animate={!estaAgotado ? { 
          rotate: [0, 5, 0, -5, 0],
          scale: [1, 1.05, 1]
        } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {icono}
      </motion.div>
      <h4 className="font-black text-white text-base sm:text-lg">{nombre}</h4>
      <p className="text-white/40 text-[10px] sm:text-xs">{desc}</p>
      <div className="flex justify-center items-center gap-2 mt-3">
        <span className="text-yellow-400 font-black text-lg sm:text-xl">{precio}</span>
        <span className="text-white/40 text-sm">🪙</span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-white/30 text-[9px] font-black">
          <span>Hoy</span>
          <span>{limite}/{max}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-0.5">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <motion.button
        whileHover={!estaAgotado ? { scale: 1.02 } : {}}
        whileTap={!estaAgotado ? { scale: 0.95 } : {}}
        onClick={onComprar}
        disabled={estaAgotado || false}
        className="mt-4 w-full py-2.5 rounded-xl font-black text-sm bg-yellow-600/80 text-white hover:bg-yellow-500 transition-all disabled:bg-white/10 disabled:text-white/30 disabled:hover:bg-white/10"
      >
        {estaAgotado ? 'Límite alcanzado' : 'Abrir cofre'}
      </motion.button>
    </motion.div>
  );
};

export default Tienda;