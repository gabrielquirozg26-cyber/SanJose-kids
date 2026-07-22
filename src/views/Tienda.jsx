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
  { id: 'consumibles', icono: '⚡', label: 'Consumibles', color: 'from-blue-500/20 to-cyan-500/10 border-blue-400/30' },
  { id: 'cofres', icono: '🎁', label: 'Cofres Misteriosos', color: 'from-purple-500/20 to-pink-500/10 border-purple-400/30' },
  { id: 'personalizacion', icono: '✨', label: 'Personalización', color: 'from-amber-500/20 to-orange-500/10 border-amber-400/30' },
];

// ── TOAST ────────────────────────────────────────────────────────────────
const ToastMessage = ({ mensaje }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50, scale: 0.9 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl bg-black/80 backdrop-blur border border-yellow-400/30"
  >
    {mensaje}
  </motion.div>
);

// ── TIENDA PRINCIPAL ─────────────────────────────────────────────────────
const Tienda = () => {
  const { showToast } = useToast();
  
  // ── CONTEXTOS ──────────────────────────────────────────────────────────
  const {
    monedas,
    vidas,
    inventario,
    comprarItem,
    comprarCorazon,
    comprarPocion,
    comprarTiqueteOro,
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
    comprarCofreMadera,
    comprarCofrePlata,
    comprarCofreOro,
  } = useShop();

  // ── ESTADOS ─────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [modalTitulosOpen, setModalTitulosOpen] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('consumibles');
  const [ultimaCompra, setUltimaCompra] = useState(null);

  // ── FUNCIONES ──────────────────────────────────────────────────────────
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCompra = async (func, nombre, precio) => {
    if (comprando) return;
    if (monedas < precio) {
      mostrarToast(`🪙 Necesitas ${precio - monedas} monedas más`, 'error');
      return;
    }
    setComprando(true);
    try {
      const ok = await func();
      setComprando(false);
      if (ok) {
        setUltimaCompra(nombre);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#facc15', '#fff'] });
        mostrarToast(`✅ ${nombre} adquirido`, 'success');
        showToast(`🎉 ¡${nombre}!`, 'success', 2000);
      } else {
        mostrarToast(`❌ No se pudo comprar ${nombre}`, 'error');
      }
    } catch (error) {
      setComprando(false);
      mostrarToast(`❌ Error al comprar ${nombre}`, 'error');
      console.error('Error en compra:', error);
    }
  };

  const ofertaDiaria = obtenerOfertaDiaria();

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="py-6 space-y-6 animate-slide-up">
      {toast && <ToastMessage mensaje={toast.mensaje} />}

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
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="text-5xl animate-float drop-shadow-lg">🪙</span>
            <span className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              {monedas.toLocaleString()}
            </span>
          </div>
          <p className="text-white/30 text-xs mt-2">¡Invierte en tu fe y consigue recompensas!</p>
        </div>
      </motion.div>

      {/* ── OFERTA DEL DÍA ── */}
      {ofertaDiaria && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-5 border-2 border-yellow-400/60 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center text-3xl">
                {ofertaDiaria.icono}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">🔥 OFERTA DEL DÍA</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px] font-black">-{ofertaDiaria.descuento}%</span>
                </div>
                <p className="font-black text-white text-lg">{ofertaDiaria.nombre}</p>
                <p className="text-white/40 text-xs">{ofertaDiaria.descripcion || 'Oferta especial por tiempo limitado'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs line-through">{ofertaDiaria.precioOriginal} 🪙</p>
              <button
                onClick={() => {
                  if (ofertaDiaria.id === 'corazon_extra') handleCompra(comprarCorazon, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else if (ofertaDiaria.id === 'tiquete_oro') handleCompra(comprarTiqueteOro, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else if (ofertaDiaria.id === 'pocion_sabiduria') handleCompra(comprarPocion, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else handleCompra(() => comprarItem({ ...ofertaDiaria, precio: ofertaDiaria.precioOferta }), ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                }}
                className="bg-yellow-400 text-blue-900 px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <span>{ofertaDiaria.precioOferta} 🪙</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── CATEGORÍAS ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10 overflow-x-auto"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`flex-1 py-2.5 px-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              categoriaActiva === cat.id 
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>{cat.icono}</span>
            <span>{cat.label}</span>
          </button>
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
          className="space-y-8"
        >
          {/* === CONSUMIBLES === */}
          {categoriaActiva === 'consumibles' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Consumibles</h3>
                <span className="text-white/20 text-[10px] ml-auto">Usa sabiamente tus recursos</span>
              </div>
              
              <ItemCard
                icon="❤️"
                title="Corazón Extra"
                desc="Recupera 1 vida. Máx 3 por día."
                price={200}
                disabledReason={corazonesCompradosHoy >= 3 ? 'Límite diario' : vidas >= 5 ? 'Vidas completas' : null}
                onBuy={() => handleCompra(comprarCorazon, 'Corazón Extra', 200)}
                glow={corazonesCompradosHoy < 3 && vidas < 5}
              />
              
              <ItemCard
                icon="🛡️"
                title="Escudo de San Miguel"
                desc="Te protege de un error en la lección."
                price={100}
                owned={inventario.includes('escudo_miguel')}
                onBuy={() => handleCompra(() => comprarItem({ id: 'escudo_miguel', nombre: 'Escudo de San Miguel', precio: 100 }), 'Escudo de San Miguel', 100)}
              />
              
              <ItemCard
                icon="🧪"
                title="Poción de Sabiduría"
                desc="Elimina opciones incorrectas. Máx 2/día, 3 en inventario."
                price={150}
                disabledReason={pocionesCompradasHoy >= 2 ? 'Límite diario' : (inventario.filter(i => i === 'pocion_sabiduria').length >= 3 ? 'Inventario lleno' : null)}
                onBuy={() => handleCompra(comprarPocion, 'Poción de Sabiduría', 150)}
                glow={pocionesCompradasHoy < 2 && inventario.filter(i => i === 'pocion_sabiduria').length < 3}
              />
              
              <ItemCard
                icon="🎫"
                title="Tiquete de Oro"
                desc="Abre un cofre de oro instantáneo (1 uso/día)."
                price={350}
                onBuy={() => handleCompra(comprarTiqueteOro, 'Tiquete de Oro', 350)}
              />
            </div>
          )}

          {/* === COFRES === */}
          {categoriaActiva === 'cofres' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎁</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Cofres Misteriosos</h3>
                <span className="text-white/20 text-[10px] ml-auto">Cada cofre contiene un santo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CofreCard
                  tipo="madera"
                  nombre="Cofre de Madera"
                  icono="📦"
                  desc="Santo común o raro"
                  precio={250}
                  limite={cofresMaderaCompradosHoy}
                  max={3}
                  onComprar={() => handleCompra(comprarCofreMadera, 'Cofre de Madera', 250)}
                />
                <CofreCard
                  tipo="plata"
                  nombre="Cofre de Plata"
                  icono="🎁"
                  desc="Santo raro o legendario"
                  precio={350}
                  limite={cofresPlataCompradosHoy}
                  max={2}
                  onComprar={() => handleCompra(comprarCofrePlata, 'Cofre de Plata', 350)}
                />
                <CofreCard
                  tipo="oro"
                  nombre="Cofre de Oro"
                  icono="🏆"
                  desc="Santo legendario"
                  precio={500}
                  limite={cofresOroCompradosHoy}
                  max={1}
                  onComprar={() => handleCompra(comprarCofreOro, 'Cofre de Oro', 500)}
                />
              </div>
            </div>
          )}

          {/* === PERSONALIZACIÓN === */}
          {categoriaActiva === 'personalizacion' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Personalización</h3>
                <span className="text-white/20 text-[10px] ml-auto">Haz tu perfil único</span>
              </div>

              {/* Títulos Legendarios */}
              <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center text-3xl">
                      👑
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">Títulos Legendarios</p>
                      <p className="text-white/40 text-sm">Adquiere títulos exclusivos para lucir en tu perfil</p>
                      <p className="text-purple-300 text-[10px] font-black mt-0.5">
                        {titulosLegendarios?.length || 0} títulos disponibles
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalTitulosOpen(true)}
                    className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 hover:shadow-xl transition-all active:scale-95"
                  >
                    Ver títulos →
                  </button>
                </div>
              </div>

              {/* Cosméticos */}
              {[
                { id: 'titulo_guardian', nombre: 'Guardián del Credo', icono: '⚜️', precio: 500, rareza: 'epico', desc: 'Cambia tu rango visible' },
                { id: 'titulo_maestro', nombre: 'Maestro de la Fe', icono: '👑', precio: 800, rareza: 'legendario', desc: 'El rango más alto' },
                { id: 'aura_santidad', nombre: 'Aura de Santidad', icono: '✨', precio: 300, rareza: 'raro', desc: 'Efecto brillante en tu perfil' },
                { id: 'marco_vitral_azul', nombre: 'Marco Vitral Azul', icono: '🔵', precio: 250, rareza: 'raro', desc: 'Borde azul para tu avatar' },
                { id: 'marco_vitral_dorado', nombre: 'Marco Vitral Dorado', icono: '🟡', precio: 400, rareza: 'epico', desc: 'Borde dorado para tu avatar' },
              ].map(item => (
                <ItemCard
                  key={item.id}
                  icon={item.icono}
                  title={item.nombre}
                  desc={item.desc}
                  price={item.precio}
                  rareza={item.rareza}
                  owned={inventario.includes(item.id)}
                  onBuy={() => handleCompra(() => comprarItem(item), item.nombre, item.precio)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <div className="text-center pt-4">
        <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
          💰 Los objetos cosméticos se aplican automáticamente al comprarlos
        </p>
      </div>

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-2xl p-4 border transition-all hover:scale-[1.02] ${
        glow ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : ''
      } ${rarezaClass}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm truncate">{title}</p>
          <p className="text-white/40 text-xs truncate">{desc}</p>
          {motivo && (
            <p className={`text-[10px] font-black mt-0.5 ${owned ? 'text-green-400' : 'text-yellow-400'}`}>
              {motivo}
            </p>
          )}
        </div>
        <button
          onClick={onBuy}
          disabled={!!estaDeshabilitado}
          className="px-5 py-2 rounded-xl font-black text-sm bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 hover:scale-105 hover:shadow-lg transition-all disabled:bg-white/10 disabled:text-white/30 disabled:hover:scale-100 shrink-0"
        >
          {owned ? '✓' : `${price} 🪙`}
        </button>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${estilo} transition-all hover:scale-105 hover:shadow-xl text-center relative overflow-hidden`}
    >
      {estaAgotado && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px] font-black uppercase">
          Agotado
        </div>
      )}
      <div className="text-6xl mb-3">{icono}</div>
      <h4 className="font-black text-white text-lg">{nombre}</h4>
      <p className="text-white/40 text-xs">{desc}</p>
      <div className="flex justify-center items-center gap-2 mt-3">
        <span className="text-yellow-400 font-black text-xl">{precio}</span>
        <span className="text-white/40 text-sm">🪙</span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-white/30 text-[9px] font-black">
          <span>Hoy</span>
          <span>{limite}/{max}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-0.5">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
      <button
        onClick={onComprar}
        disabled={estaAgotado}
        className="mt-4 w-full py-2.5 rounded-xl font-black text-sm bg-yellow-600/80 text-white hover:bg-yellow-500 transition-all disabled:bg-white/10 disabled:text-white/30 disabled:hover:bg-white/10"
      >
        {estaAgotado ? 'Límite alcanzado' : 'Abrir cofre'}
      </button>
    </motion.div>
  );
};

export default Tienda;