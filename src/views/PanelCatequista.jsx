import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

// ── Mapa de niveles para mostrar nombre de la oración ─────────────────────
const NIVEL_NOMBRE = {
  1: 'Padre Nuestro', 2: 'Ave María', 3: 'Gloria', 4: 'Ángel de la Guarda',
  5: 'Yo Confieso', 6: 'Acto de Contrición', 7: 'Dulce Madre',
  8: 'Credo Apostólico', 9: 'La Salve', 10: '10 Mandamientos',
  11: 'Bienaventuranzas', 12: '7 Sacramentos', 13: 'Obras de Misericordia',
  14: 'Misterios Gozosos', 15: 'Misterios Dolorosos',
  16: 'Misterios Gloriosos', 17: 'Misterios Luminosos',
};

// ── Tarjeta de estadística ─────────────────────────────────────────────────
const StatCard = ({ icono, label, value, color = 'text-white' }) => (
  <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
    <p className="text-2xl mb-1">{icono}</p>
    <p className={`font-black text-xl ${color}`}>{value}</p>
    <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

// ── Barra de progreso ──────────────────────────────────────────────────────
const BarraProgreso = ({ valor, total, color = 'bg-blue-500' }) => {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-black text-white/40 w-8 text-right">{pct}%</span>
    </div>
  );
};

// ── Fila de estudiante ─────────────────────────────────────────────────────
const FilaEstudiante = ({ estudiante, onClick, seleccionado }) => {
  const nivelNombre = NIVEL_NOMBRE[estudiante.nivelActual] ?? `Nivel ${estudiante.nivelActual}`;
  const activo = estudiante.racha > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left
        ${seleccionado
          ? 'bg-blue-500/20 border-blue-400/50'
          : 'bg-white/5 border-white/5 hover:border-white/20'}`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0
        ${activo ? 'bg-green-500/20 border border-green-400/40' : 'bg-white/10'}`}>
        😇
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm text-white truncate">{estudiante.nombre}</p>
        <p className="text-white/30 text-[10px] font-bold truncate">{nivelNombre}</p>
      </div>

      {/* Stats rápidas */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-yellow-400 font-black text-sm">🪙 {estudiante.monedas}</p>
          <p className="text-white/30 text-[10px]">🔥 {estudiante.racha}d</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${activo ? 'bg-green-400' : 'bg-white/10'}`} />
      </div>
    </button>
  );
};

// ── Detalle de estudiante ──────────────────────────────────────────────────
const DetalleEstudiante = ({ estudiante, onCerrar }) => {
  const nivelNombre = NIVEL_NOMBRE[estudiante.nivelActual] ?? `Nivel ${estudiante.nivelActual}`;
  const totalNiveles = Object.keys(NIVEL_NOMBRE).length;
  const progresoPct  = Math.round((estudiante.nivelActual / totalNiveles) * 100);

  return (
    <div className="glass-card rounded-3xl p-5 border border-blue-400/30 space-y-4 animate-slide-up">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/40
            flex items-center justify-center text-2xl">😇</div>
          <div>
            <p className="font-black text-white">{estudiante.nombre}</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
              {estudiante.rango ?? 'Iniciado'}
            </p>
          </div>
        </div>
        <button onClick={onCerrar}
          className="text-white/30 hover:text-white/60 text-xl font-black transition-colors">✕</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icono="🏅" label="Nivel"   value={estudiante.nivelActual ?? 1} />
        <StatCard icono="🪙" label="Monedas" value={estudiante.monedas ?? 0} color="text-yellow-400" />
        <StatCard icono="🔥" label="Racha"   value={`${estudiante.racha ?? 0}d`} color="text-orange-400" />
      </div>

      {/* Progreso general */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Progreso general</p>
          <p className="text-[10px] font-black text-blue-400">{nivelNombre}</p>
        </div>
        <BarraProgreso
          valor={estudiante.nivelActual ?? 1}
          total={totalNiveles}
          color="bg-gradient-to-r from-blue-500 to-cyan-400"
        />
      </div>

      {/* Fecha de registro */}
      {estudiante.fechaRegistro && (
        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest text-center">
          Registrado: {new Date(estudiante.fechaRegistro).toLocaleDateString('es-NI')}
        </p>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PANEL PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════
const PanelCatequista = () => {
  const { nombre, grupo, rol, cerrarSesion, obtenerEstudiantesGrupo } = useGame();

  const [estudiantes, setEstudiantes]     = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [seleccionado, setSeleccionado]   = useState(null);
  const [busqueda, setBusqueda]           = useState('');
  const [orden, setOrden]                 = useState('nombre'); // 'nombre' | 'monedas' | 'nivel'

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await obtenerEstudiantesGrupo(grupo);
        setEstudiantes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    if (grupo && grupo !== 'Sin Grupo') cargar();
    else setCargando(false);
  }, [grupo]);

  // ── Estadísticas globales del grupo ───────────────────────────────────
  const totalEstudiantes = estudiantes.length;
  const activos          = estudiantes.filter(e => (e.racha ?? 0) > 0).length;
  const promedioNivel    = totalEstudiantes > 0
    ? Math.round(estudiantes.reduce((s, e) => s + (e.nivelActual ?? 1), 0) / totalEstudiantes)
    : 0;
  const promedioMonedas  = totalEstudiantes > 0
    ? Math.round(estudiantes.reduce((s, e) => s + (e.monedas ?? 0), 0) / totalEstudiantes)
    : 0;
  const completaronTodo  = estudiantes.filter(e => (e.nivelActual ?? 1) >= Object.keys(NIVEL_NOMBRE).length).length;

  // ── Distribución por nivel ─────────────────────────────────────────────
  const distribucionNivel = Object.entries(NIVEL_NOMBRE).map(([id, nom]) => ({
    id: Number(id), nombre: nom,
    cantidad: estudiantes.filter(e => (e.nivelActual ?? 1) === Number(id)).length,
  })).filter(n => n.cantidad > 0);

  // ── Filtro y orden ─────────────────────────────────────────────────────
  const estudiantesFiltrados = estudiantes
    .filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (orden === 'monedas') return (b.monedas ?? 0) - (a.monedas ?? 0);
      if (orden === 'nivel')   return (b.nivelActual ?? 1) - (a.nivelActual ?? 1);
      return a.nombre.localeCompare(b.nombre);
    });

  return (
    <div className="min-h-screen bg-[#080f1a] text-white font-sans">

      {/* Fondos */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 relative">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">
              {rol === 'coordinador' ? 'Coordinador' : 'Catequista'}
            </p>
            <h1 className="text-2xl font-black text-white tracking-tighter">{nombre}</h1>
            <p className="text-white/40 text-xs font-bold mt-0.5">{grupo}</p>
          </div>
          <button onClick={cerrarSesion}
            className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400
              font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all">
            Salir
          </button>
        </div>

        {/* ── Stats del grupo ── */}
        <div>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">
            Resumen del grupo
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icono="👥" label="Estudiantes"    value={totalEstudiantes} />
            <StatCard icono="✅" label="Activos hoy"    value={activos} color="text-green-400" />
            <StatCard icono="📊" label="Nivel promedio" value={NIVEL_NOMBRE[promedioNivel] ? `Nv.${promedioNivel}` : '—'} color="text-blue-400" />
            <StatCard icono="🪙" label="Monedas prom."  value={promedioMonedas} color="text-yellow-400" />
          </div>
        </div>

        {/* ── Distribución por nivel ── */}
        {distribucionNivel.length > 0 && (
          <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">
              Distribución por nivel
            </p>
            {distribucionNivel.slice(0, 6).map(n => (
              <div key={n.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-white/70 truncate flex-1">{n.nombre}</p>
                  <span className="text-[10px] font-black text-white/40 ml-2">{n.cantidad}</span>
                </div>
                <BarraProgreso
                  valor={n.cantidad}
                  total={totalEstudiantes}
                  color={n.id <= 4 ? 'bg-gradient-to-r from-yellow-500 to-yellow-300'
                       : n.id <= 8 ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                       :             'bg-gradient-to-r from-purple-500 to-purple-300'}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Detalle estudiante seleccionado ── */}
        {seleccionado && (
          <DetalleEstudiante
            estudiante={seleccionado}
            onCerrar={() => setSeleccionado(null)}
          />
        )}

        {/* ── Lista de estudiantes ── */}
        <div className="space-y-3">
          {/* Buscador y orden */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar estudiante…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5
                text-white text-sm font-bold outline-none focus:border-blue-400 transition-all
                placeholder:text-white/20"
            />
            <select
              value={orden}
              onChange={e => setOrden(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5
                text-white text-xs font-black outline-none focus:border-blue-400 transition-all"
            >
              <option value="nombre">A-Z</option>
              <option value="monedas">Monedas</option>
              <option value="nivel">Nivel</option>
            </select>
          </div>

          {/* Conteo */}
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
            {estudiantesFiltrados.length} estudiantes
            {busqueda && ` · búsqueda: "${busqueda}"`}
          </p>

          {/* Cargando */}
          {cargando && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-white/40 text-xs font-black uppercase tracking-widest">Cargando grupo…</p>
            </div>
          )}

          {/* Sin estudiantes */}
          {!cargando && estudiantesFiltrados.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-white font-black">
                {busqueda ? 'Sin resultados' : 'No hay estudiantes en este grupo'}
              </p>
            </div>
          )}

          {/* Lista */}
          {!cargando && estudiantesFiltrados.map((est, i) => (
            <FilaEstudiante
              key={est.uid ?? i}
              estudiante={est}
              seleccionado={seleccionado?.uid === est.uid}
              onClick={() => setSeleccionado(
                seleccionado?.uid === est.uid ? null : est
              )}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-white/15 text-[9px] font-black uppercase tracking-[0.4em] pb-4">
          Parroquia San José · Diriamba · Panel Catequista
        </p>
      </div>
    </div>
  );
};

export default PanelCatequista;
