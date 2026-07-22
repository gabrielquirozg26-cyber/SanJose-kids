// src/components/catequista/EvaluacionesCatequista.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/ui/Toast';
import santosData from '../../data/santos.json';
import { motion, AnimatePresence } from 'framer-motion';

const EvaluacionesCatequista = () => {
  const { showToast } = useToast();
  const { 
    usuarioId, 
    nombre, 
    grupo, 
    obtenerEstudiantesGrupo, 
    guardarEvaluacion,
    obtenerEvaluaciones,
  } = useGame();

  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState([]);

  // Estados para evaluación
  const [rangoInicio, setRangoInicio] = useState(1);
  const [rangoFin, setRangoFin] = useState(12);
  const [resultados, setResultados] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [modo, setModo] = useState('evaluar');

  // Obtener oraciones disponibles
  const oracionesDisponibles = [
    { id: 'padre_nuestro', nombre: 'Padre Nuestro' },
    { id: 'ave_maria', nombre: 'Ave María' },
    { id: 'gloria', nombre: 'Gloria' },
    { id: 'angel_guarda', nombre: 'Ángel de la Guarda' },
    { id: 'yo_confieso', nombre: 'Yo Confieso' },
    { id: 'acto_contricion', nombre: 'Acto de Contrición' },
    { id: 'credo_apostolico', nombre: 'Credo Apostólico' },
    { id: 'salve', nombre: 'Salve' },
    { id: 'mandamientos', nombre: '10 Mandamientos' },
    { id: 'bienaventuranzas', nombre: 'Bienaventuranzas' },
    { id: 'sacramentos', nombre: '7 Sacramentos' },
    { id: 'obras_misericordia', nombre: 'Obras de Misericordia' },
    { id: 'misterios_gozosos', nombre: 'Misterios Gozosos' },
    { id: 'misterios_dolorosos', nombre: 'Misterios Dolorosos' },
    { id: 'misterios_gloriosos', nombre: 'Misterios Gloriosos' },
    { id: 'misterios_luminosos', nombre: 'Misterios Luminosos' },
  ];

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerEstudiantesGrupo(grupo);
      setEstudiantes(data);
      setCargando(false);
    };
    cargar();
  }, [grupo]);

  const cargarEvaluacionesEstudiante = async (uid) => {
    setCargandoEvaluaciones(true);
    try {
      const data = await obtenerEvaluaciones(uid);
      setEvaluaciones(data);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar evaluaciones', 'error');
    } finally {
      setCargandoEvaluaciones(false);
    }
  };

  const handleSeleccionarEstudiante = (est) => {
    setEstudianteSeleccionado(est);
    setResultados({});
    setObservaciones('');
    cargarEvaluacionesEstudiante(est.uid);
  };

  const handleResultadoChange = (oracionId, valor) => {
    setResultados(prev => ({ ...prev, [oracionId]: valor }));
  };

  const handleGuardarEvaluacion = async () => {
    if (!estudianteSeleccionado) {
      showToast('Selecciona un estudiante primero', 'warning');
      return;
    }

    const oracionesFiltradas = oracionesDisponibles.slice(rangoInicio - 1, rangoFin);
    const todasCalificadas = oracionesFiltradas.every(o => resultados[o.id]);
    if (!todasCalificadas) {
      showToast('Califica todas las oraciones antes de guardar', 'warning');
      return;
    }

    setGuardando(true);
    try {
      const oracionesData = oracionesFiltradas.map(o => ({
        id: o.id,
        nombre: o.nombre,
        resultado: resultados[o.id],
      }));

      const resultado = await guardarEvaluacion({
        estudianteId: estudianteSeleccionado.uid,
        estudianteNombre: estudianteSeleccionado.nombre,
        catequistaId: usuarioId,
        catequistaNombre: nombre,
        grupo: grupo,
        rangoInicio: rangoInicio,
        rangoFin: rangoFin,
        oraciones: oracionesData,
        observaciones: observaciones,
      });

      if (resultado.success) {
        showToast(`✅ Evaluación guardada para ${estudianteSeleccionado.nombre}`, 'success');
        setResultados({});
        setObservaciones('');
        await cargarEvaluacionesEstudiante(estudianteSeleccionado.uid);
      } else {
        showToast('❌ Error al guardar la evaluación', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('❌ Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const oracionesFiltradas = oracionesDisponibles.slice(rangoInicio - 1, rangoFin);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">📋 Evaluaciones</h2>
          <p className="text-white/40 text-sm">Selecciona un estudiante para evaluar o ver su historial</p>
        </div>
        {estudianteSeleccionado && (
          <button
            onClick={() => setEstudianteSeleccionado(null)}
            className="text-white/40 hover:text-white text-sm font-black flex items-center gap-1 transition-colors"
          >
            ✕ Cerrar
          </button>
        )}
      </div>
      {/* Cuando no hay estudiante seleccionado */}
      {!estudianteSeleccionado ? (
      <>
        {/* Buscador */}
        <input
          type="text"
          placeholder="🔍 Buscar estudiante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
        />

        {/* Lista de estudiantes */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="glass-card p-8 text-center border border-white/10">
            <p className="text-white/60">No hay estudiantes en este grupo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((est) => (
              <motion.div
                key={est.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSeleccionarEstudiante(est)}
                className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden">
                    {est.avatar?.startsWith('http') || est.avatar?.startsWith('data:image') ? (
                      <img src={est.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span>{est.avatar || '😇'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white truncate">{est.nombre}</p>
                    <p className="text-white/40 text-xs">Nivel {est.nivelActual || 1}</p>
                  </div>
                  <span className="text-yellow-400 text-sm">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </>
    ) : (
      /* ── CUANDO HAY ESTUDIANTE SELECCIONADO ── */
      <div className="space-y-4">
        {/* Estudiante seleccionado */}
        <div className="glass-card rounded-2xl p-4 border border-yellow-400/30 bg-yellow-400/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden">
              {estudianteSeleccionado.avatar?.startsWith('http') || estudianteSeleccionado.avatar?.startsWith('data:image') ? (
                <img src={estudianteSeleccionado.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <span>{estudianteSeleccionado.avatar || '😇'}</span>
              )}
            </div>
            <div>
              <p className="font-black text-white text-xl">{estudianteSeleccionado.nombre}</p>
              <p className="text-white/40 text-sm">Nivel {estudianteSeleccionado.nivelActual || 1}</p>
            </div>
            <button
              onClick={() => setEstudianteSeleccionado(null)}
              className="ml-auto text-white/40 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── TABS PARA EVALUAR / HISTORIAL ── */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setModo('evaluar')}
            className={`flex-1 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
              modo === 'evaluar'
                ? 'bg-yellow-400 text-blue-900 shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            📝 Evaluar
          </button>
          <button
            onClick={() => setModo('historial')}
            className={`flex-1 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
              modo === 'historial'
                ? 'bg-yellow-400 text-blue-900 shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            📋 Historial
          </button>
        </div>

        {/* ── MODO EVALUAR ── */}
        {modo === 'evaluar' && (
          <div className="space-y-4">
            {/* Selector de rango */}
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">
                📚 Seleccionar rango de oraciones
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-sm">Desde:</label>
                  <input
                    type="number"
                    min="1"
                    max={oracionesDisponibles.length}
                    value={rangoInicio}
                    onChange={(e) => setRangoInicio(Number(e.target.value))}
                    className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-white text-center font-black outline-none focus:border-yellow-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-sm">Hasta:</label>
                  <input
                    type="number"
                    min="1"
                    max={oracionesDisponibles.length}
                    value={rangoFin}
                    onChange={(e) => setRangoFin(Number(e.target.value))}
                    className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-white text-center font-black outline-none focus:border-yellow-400"
                  />
                </div>
                <span className="text-white/30 text-sm">
                  ({oracionesFiltradas.length} oraciones)
                </span>
              </div>
            </div>

            {/* Lista de oraciones */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 max-h-96 overflow-y-auto">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">
                📝 Calificar oraciones
              </p>
              <div className="space-y-2">
                {oracionesFiltradas.map((o, index) => (
                  <div key={o.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <span className="text-white/30 text-xs font-black w-6">{rangoInicio + index}.</span>
                    <span className="font-black text-white flex-1 text-sm">{o.nombre}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResultadoChange(o.id, 'sabe')}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                          resultados[o.id] === 'sabe'
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        ✅ Sabe
                      </button>
                      <button
                        onClick={() => handleResultadoChange(o.id, 'no_sabe')}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                          resultados[o.id] === 'no_sabe'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        ❌ No sabe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <textarea
              placeholder="📝 Observaciones generales (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400 transition-all placeholder:text-white/20 resize-none"
              rows="2"
            />

            {/* Guardar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuardarEvaluacion}
              disabled={guardando}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                '📥 Guardar Evaluación'
              )}
            </motion.button>
          </div>
        )}

        {/* ── MODO HISTORIAL ── */}
        {modo === 'historial' && (
          <div className="space-y-4">
            {cargandoEvaluaciones ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : evaluaciones.length === 0 ? (
              <div className="glass-card p-8 text-center border border-white/10">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-white font-black">Sin evaluaciones</p>
                <p className="text-white/40 text-sm">Este estudiante aún no tiene evaluaciones</p>
              </div>
            ) : (
              <>
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card rounded-2xl p-3 text-center border border-white/10">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📝 Total</p>
                    <p className="text-2xl font-black text-white">{evaluaciones.length}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-3 text-center border border-green-400/20">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">✅ Promedio</p>
                    <p className="text-2xl font-black text-green-400">
                      {Math.round(evaluaciones.reduce((s, e) => s + (e.totalSabe || 0), 0) / 
                        evaluaciones.reduce((s, e) => s + e.oraciones.length, 0) * 100) || 0}%
                    </p>
                  </div>
                  <div className="glass-card rounded-2xl p-3 text-center border border-yellow-400/20">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🕒 Última</p>
                    <p className="text-sm font-black text-yellow-400">
                      {new Date(evaluaciones[0]?.fecha?.toDate()).toLocaleDateString() || '-'}
                    </p>
                  </div>
                </div>

                {/* Lista de evaluaciones */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {evaluaciones.map((evalucion) => (
                    <div key={evalucion.id} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-white/40 text-[10px] font-black">
                          {new Date(evalucion.fecha?.toDate()).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <span className="text-green-400 text-xs font-black">✅ {evalucion.totalSabe || 0}</span>
                          <span className="text-red-400 text-xs font-black">❌ {evalucion.totalNoSabe || 0}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {evalucion.oraciones?.map((o) => (
                          <span
                            key={o.id}
                            className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                              o.resultado === 'sabe'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {o.resultado === 'sabe' ? '✅' : '❌'} {o.nombre}
                          </span>
                        ))}
                      </div>
                      {evalucion.observaciones && (
                        <p className="text-white/40 text-xs mt-2 italic">📝 {evalucion.observaciones}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )}
  </div>
  );
};

export default EvaluacionesCatequista;