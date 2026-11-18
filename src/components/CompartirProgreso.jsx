import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import GuiaLuz from './GuiaLuz';
import DialogoJuego from './ui/DialogoJuego';
import nivelesData from '../data/niveles.json';
import { resumenCompartible, estadoRacha, textoParaCompartir } from '../utils/celebraciones';
import { useFechaJuego } from '../hooks/useFechaJuego';

function ContenidoCompartir({ onClose, progreso = {}, usuario = {} }) {
  const cardRef = useRef(null);
  const bloqueo = useRef(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [apodo, setApodo] = useState('Aventurero de luz');
  const [destacado, setDestacado] = useState('resumen');
  const hoy = useFechaJuego();
  const resumen = resumenCompartible(progreso.nivelesCompletados ?? [], nivelesData.unidades);
  const racha = estadoRacha(progreso, hoy).racha;
  const opciones = [
    { id: 'resumen', titulo: '¡Mi aventura sigue brillando!', detalle: 'Cada lección es un nuevo paso' },
    ...resumen.destacados,
    ...nivelesData.unidades.filter(u => progreso.examenesAprobados?.includes(u.id)).map(u => ({ id: 'examen-' + u.id, titulo: '¡Aprobé el examen de ' + u.nombre + '!', detalle: 'Un nuevo aprendizaje para mi aventura' })),
    ...(racha > 0 ? [{ id: 'racha', titulo: '¡' + racha + (racha === 1 ? ' día aprendiendo!' : ' días aprendiendo juntos!'), detalle: 'Una luz cada día en mi camino de fe' }] : []),
  ];
  const logro = opciones.find(o => o.id === destacado) ?? opciones[0];
  const texto = textoParaCompartir({ titulo: logro.titulo, nivel: resumen.nivel, racha, lecciones: resumen.lecciones });
  // Solo emojis locales: las fotos personales no se incluyen en una tarjeta pública.
  const avatar = typeof usuario.avatar === 'string' && usuario.avatar.length <= 24 && !/[/:<>]/.test(usuario.avatar) ? usuario.avatar : '😇';
  async function ejecutar(accion) {
    if (bloqueo.current) return;
    bloqueo.current = true; setOcupado(true); setMensaje(''); setError('');
    try { await accion(); }
    catch (e) { if (e.name !== 'AbortError') setError('No pudimos preparar la tarjeta. Puedes guardar la imagen o copiar el mensaje e intentarlo de nuevo.'); }
    finally { bloqueo.current = false; setOcupado(false); }
  }
  function descargar(dataUrl) {
    const enlace = document.createElement('a');
    enlace.download = 'mi-aventura-sanjosekids.png'; enlace.href = dataUrl;
    document.body.appendChild(enlace); enlace.click(); enlace.remove();
    setMensaje('Imagen preparada para descargar.');
  }
  async function prepararImagen() {
    await document.fonts?.ready;
    const imagenes = [...cardRef.current.querySelectorAll('img')];
    await Promise.all(imagenes.map(img => img.decode().catch(() => {})));
    return toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#14183d', cacheBust: false });
  }
  function imagen(compartir) {
    return ejecutar(async () => {
      const dataUrl = await prepararImagen();
      if (compartir && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'mi-aventura-sanjosekids.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ title: 'Mi aventura en San JoseKids', text: texto, files: [file] });
            setMensaje('Tarjeta compartida.'); return;
          } catch (e) {
            if (e.name !== 'NotAllowedError' && e.name !== 'TypeError') throw e;
            // Algunos navegadores pierden la activación durante la captura.
            descargar(dataUrl); setMensaje('El navegador no pudo compartirla directamente. Tu imagen está preparada para descargar.'); return;
          }
        }
      }
      descargar(dataUrl);
    });
  }
  function copiar() {
    return ejecutar(async () => { await navigator.clipboard.writeText(texto); setMensaje('Mensaje copiado. Pégalo donde quieras compartirlo.'); });
  }
  return <DialogoJuego titulo="Mira lo que aprendí" onClose={onClose} className="compartir-dialogo">
    <p className="celebracion-intro">Un recuerdo de tu aventura para compartir con tu familia.</p>
    <div className="compartir-opciones"><label htmlFor="compartir-momento">¿Qué quieres celebrar?</label><select id="compartir-momento" value={logro.id} onChange={e => setDestacado(e.target.value)} disabled={ocupado}>{opciones.map(o => <option key={o.id} value={o.id}>{o.id === 'resumen' ? 'Mi progreso' : o.titulo}</option>)}</select>
    <label htmlFor="compartir-apodo">Tu apodo en la tarjeta</label><input id="compartir-apodo" value={apodo} maxLength={24} onChange={e => setApodo(e.target.value)} disabled={ocupado}/><small>Usa un apodo. Tu nombre completo, foto y grupo no se incluyen automáticamente.</small></div>
    <div ref={cardRef} className="compartir-tarjeta" aria-label="Vista previa de tu tarjeta">
      <div className="compartir-identidad"><img src="/logo.jpg" alt="Escudo de San José"/><span><strong>San JoseKids</strong>Catequesis San José · Diriamba</span></div>
      <div className="compartir-amigos"><span className="compartir-avatar" aria-hidden="true">{avatar || '😇'}</span><GuiaLuz/></div>
      <p>{apodo.trim() || 'Aventurero de luz'}</p><h3>{logro.titulo}</h3><p>{logro.detalle}</p>
      <div className="compartir-datos"><div><strong>{resumen.nivel}</strong><span>⭐ Nivel</span></div><div><strong>{racha}</strong><span>🔥 Días de racha</span></div><div><strong>{resumen.lecciones}</strong><span>📖 Lecciones</span></div></div>
      <div className="compartir-pie">¡Aprendemos y crecemos juntos!<br/>sanjosekids.netlify.app</div>
    </div>
    <p><small>La tarjeta refleja tu progreso actual. Tú eliges si la compartes.</small></p>
    {error && <p className="celebracion-error" role="alert">{error}</p>}<p role="status" aria-live="polite">{ocupado ? 'Preparando tu recuerdo…' : mensaje}</p>
    <button className="celebracion-btn" disabled={ocupado} onClick={() => imagen(true)}>Compartir tarjeta</button>
    <p><small>Si tu navegador no comparte imágenes, se descargará la tarjeta.</small></p>
    <div className="compartir-acciones"><button className="celebracion-btn celebracion-btn-secundario" disabled={ocupado} onClick={() => imagen(false)}>Guardar imagen</button><button className="celebracion-btn celebracion-btn-secundario" disabled={ocupado} onClick={copiar}>Copiar mensaje</button></div>
  </DialogoJuego>;
}
export default function CompartirProgreso({ isOpen, ...props }) {
  return isOpen ? <ContenidoCompartir {...props}/> : null;
}
