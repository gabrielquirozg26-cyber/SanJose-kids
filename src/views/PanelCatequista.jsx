import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import GraficoProgreso from '../components/GraficoProgreso';
import nivelesData from '../data/niveles.json';

const PanelCatequista = () => {
  const {
    nombre,
    grupo,
    rol,
    cerrarSesion,
    obtenerEstudiantesGrupo,
    guardarExamenMultiple,
    obtenerResultadosExamenes,
    obtenerHistorialNiveles,
  } = useGame();

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [tab, setTab] = useState('examenes'); // 'examenes' o 'analitica'
  const [resultadosExamen, setResultadosExamen] = useState([]);
  const [historialNiveles, setHistorialNiveles] = useState([]);
  const [lessonResult, setLessonResult] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [toast, setToast] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar lista de estudiantes del grupo
  useEffect(() => {
    const cargarEstudiantes = async () => {
      setCargando(true);
      try {
        const data = await obtenerEstudiantesGrupo(grupo);
        setEstudiantes(data);
      } catch (e) {
        console.error(e);
        setError('No se pudo cargar la lista de estudiantes');
      } finally {
        setCargando(false);
      }
    };
    if (grupo && grupo !== 'Sin Grupo') cargarEstudiantes();
    else setError('Grupo no asignado');
  }, [grupo]);

  // Al seleccionar un estudiante, cargar sus exámenes e historial
  useEffect(() => {
    if (estudianteSeleccionado) {
      cargarDatosEstudiante(estudianteSeleccionado.uid);
    }
  }, [estudianteSeleccionado]);

  const cargarDatosEstudiante = async (uid) => {
    try {
      const [resultados, historial] = await Promise.all([
        obtenerResultadosExamenes(uid),
        obtenerHistorialNiveles(uid),
      ]);
      setResultadosExamen(resultados);
      setHistorialNiveles(historial);
    } catch (error) {
      console.error(error);
      mostrarToast('Error al cargar datos del estudiante');
    }
  };

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Guardar examen usando batch (rápido y evita duplicados por día)
  const handleGuardarExamen = async () => {
    if (!estudianteSeleccionado) return;
    if (guardando) return;
    setGuardando(true);
    try {
      const ok = await guardarExamenMultiple(
        estudianteSeleccionado.uid,
        lessonResult,
        observaciones
      );
      if (ok) {
        confetti({ particleCount: 80, spread: 60, colors: ['#facc15', '#fff'] });
        mostrarToast(`✅ Examen guardado para ${estudianteSeleccionado.nombre}`);
        setLessonResult({});
        setObservaciones('');
        await cargarDatosEstudiante(estudianteSeleccionado.uid);
      } else {
        mostrarToast('❌ Error al guardar el examen');
      }
    } catch (error) {
      console.error(error);
      mostrarToast('❌ Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar estudiantes por búsqueda
  const estudiantesFiltrados = estudiantes.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener todas las lecciones agrupadas por unidad (para el listado de exámenes)
  const todasLecciones = [];
  nivelesData.unidades.forEach((unidad) => {
    unidad.lecciones.forEach((leccion) => {
      todasLecciones.push({
        id: leccion.id,
        nombre: leccion.nombre,
        unidad: unidad.nombre,
        unidadId: unidad.id,
      });
    });
  });

  return (
    <div className="min-h-screen bg-[#080f1a] text-white font-sans pb-24">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl animate-slide-up bg-black/80 backdrop-blur border border-white/20">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">
              {rol === 'coordinador' ? 'Coordinador' : 'Catequista'}
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">{nombre}</h1>
            <p className="text-white/50 text-sm">Grupo: {grupo}</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="px-5 py-2 rounded-xl border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-red-500/10 transition-all"
          >
            Salir
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('examenes')}
            className={`px-5 py-2 rounded-xl font-black text-sm uppercase transition-all ${
              tab === 'examenes'
                ? 'bg-yellow-400 text-blue-900'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            📝 Exámenes
          </button>
          <button
            onClick={() => setTab('analitica')}
            className={`px-5 py-2 rounded-xl font-black text-sm uppercase transition-all ${
              tab === 'analitica'
                ? 'bg-yellow-400 text-blue-900'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            📊 Analítica
          </button>
        </div>

        {/* Buscador de estudiantes */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar estudiante por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm font-bold outline-none focus:border-blue-400 transition-all placeholder:text-white/20"
          />
        </div>

        {/* Lista de estudiantes (cards) */}
        {cargando && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <div className="glass-card p-6 text-center text-red-400">{error}</div>}
        {!cargando && !error && estudiantesFiltrados.length === 0 && (
          <div className="glass-card p-8 text-center border border-white/10">
            <p className="text-white/60">No hay estudiantes en este grupo</p>
          </div>
        )}

        {!cargando && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {estudiantesFiltrados.map((est) => (
              <div
                key={est.uid}
                onClick={() => setEstudianteSeleccionado(est)}
                className={`glass-card rounded-2xl p-4 border cursor-pointer transition-all ${
                  estudianteSeleccionado?.uid === est.uid
                    ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                    : 'border-white/10 hover:border-yellow-400/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl overflow-hidden">
                    {est.avatar &&
                    (est.avatar.startsWith('data:image') ||
                      est.avatar.startsWith('http')) ? (
                      <img src={est.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span>{est.avatar || '😇'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-white">{est.nombre}</p>
                    <p className="text-white/40 text-[10px]">
                      Nivel {est.nivelActual || 1} · Racha {est.racha || 0}🔥
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Panel detallado del estudiante seleccionado */}
        {estudianteSeleccionado && (
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-white">
                {estudianteSeleccionado.nombre}
              </h2>
              <button
                onClick={() => setEstudianteSeleccionado(null)}
                className="text-white/40 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {tab === 'examenes' && (
              <div>
                <p className="text-white/60 text-sm mb-4">
                  Califica el conocimiento de cada oración o concepto:
                </p>
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {todasLecciones.map((leccion) => {
                    const currentValue = lessonResult[leccion.id];
                    return (
                      <div
                        key={leccion.id}
                        className="border-b border-white/10 pb-3"
                      >
                        <p className="font-black text-white text-sm">
                          {leccion.nombre}{' '}
                          <span className="text-white/30 text-[10px]">
                            ({leccion.unidad})
                          </span>
                        </p>
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() =>
                              setLessonResult((prev) => ({ ...prev, [leccion.id]: 'sabe' }))
                            }
                            className={`px-3 py-1 rounded-xl text-xs font-black ${
                              currentValue === 'sabe'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            ✅ Lo sabe
                          </button>
                          <button
                            onClick={() =>
                              setLessonResult((prev) => ({ ...prev, [leccion.id]: 'regular' }))
                            }
                            className={`px-3 py-1 rounded-xl text-xs font-black ${
                              currentValue === 'regular'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            🟡 Regular
                          </button>
                          <button
                            onClick={() =>
                              setLessonResult((prev) => ({ ...prev, [leccion.id]: 'no_sabe' }))
                            }
                            className={`px-3 py-1 rounded-xl text-xs font-black ${
                              currentValue === 'no_sabe'
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            ❌ No lo sabe
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <textarea
                  placeholder="Observaciones generales (opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-yellow-400"
                  rows="2"
                />
                <button
                  onClick={handleGuardarExamen}
                  disabled={guardando}
                  className="btn-primary w-full mt-4 py-3 flex justify-center items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar examen'
                  )}
                </button>
              </div>
            )}

            {tab === 'analitica' && (
              <div className="space-y-6">
                {historialNiveles && historialNiveles.length > 0 ? (
                  <GraficoProgreso
                    data={historialNiveles.map((h) => ({ fecha: h.fecha, nivel: h.nivel }))}
                    title="Evolución de nivel"
                  />
                ) : (
                  <div className="text-white/40 text-center py-4">
                    No hay datos de progreso aún
                  </div>
                )}
                <div className="glass-card rounded-2xl p-4 border border-white/10">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">
                    Últimos exámenes
                  </p>
                  {resultadosExamen.length === 0 && (
                    <p className="text-white/40 text-sm">Sin exámenes registrados</p>
                  )}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {resultadosExamen.slice(0, 10).map((ex) => {
                      const leccion = todasLecciones.find((l) => l.id === ex.lessonId);
                      const resultadoText = {
                        sabe: '✅ Sabe',
                        regular: '🟡 Regular',
                        no_sabe: '❌ No sabe',
                      }[ex.resultado];
                      return (
                        <div
                          key={ex.id}
                          className="flex justify-between items-center border-b border-white/10 pb-2"
                        >
                          <span className="text-sm text-white/80">
                            {leccion?.nombre || ex.lessonId}
                          </span>
                          <span className="text-xs font-black">{resultadoText}</span>
                          <span className="text-[10px] text-white/40">
                            {new Date(ex.fecha).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelCatequista;