import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../context/ShopContext';
import { PRODUCTOS } from '../utils/economia';
import { useToast } from '../components/ui/Toast';
import TitulosModal from '../components/TitulosModal';
import DialogoAprendizaje from '../components/DialogoAprendizaje';
import CabeceraAventura from '../components/CabeceraAventura';

const objetos = [
  { id: 'corazon_extra', nombre: 'Corazón extra', icono: '❤️', categoria: 'ayudas', desc: 'Recupera una vida para seguir aprendiendo.', uso: 'Se usa al comprarlo.' },
  { id: 'escudo_miguel', nombre: 'Escudo de San Miguel', icono: '🛡️', categoria: 'ayudas', desc: 'Te protege de un error durante una lección.', uso: 'Se usa automáticamente al equivocarte.' },
  { id: 'pocion_sabiduria', nombre: 'Poción de sabiduría', icono: '🧪', categoria: 'ayudas', desc: 'Elimina dos opciones incorrectas de una pregunta.', uso: 'Úsala con el botón de poción en la lección.' },
  { id: 'doble_xp', nombre: 'Doble XP', icono: '⚡', categoria: 'poderes', desc: 'Duplica las monedas de tu próxima lección.', uso: 'Se activa al entrar a tu próxima lección.' },
  { id: 'protector_racha', nombre: 'Protector de racha', icono: '🔥', categoria: 'poderes', desc: 'Cuida tu racha si te pierdes un día.', uso: 'Protege un solo día de ausencia.' },
  { id: 'cofre_madera', nombre: 'Cofre de madera', icono: '📦', categoria: 'cofres', desc: 'Descubre un santo común o raro.', uso: 'Contiene una carta sorpresa. Si se repite, recibes monedas.' },
  { id: 'cofre_plata', nombre: 'Cofre de plata', icono: '🎁', categoria: 'cofres', desc: 'Puede traer un santo común, raro o legendario.', uso: 'Contiene una carta sorpresa. Si se repite, recibes monedas.' },
  { id: 'cofre_oro', nombre: 'Cofre de oro', icono: '🏆', categoria: 'cofres', desc: 'Más posibilidades de un santo legendario.', uso: 'La carta es sorpresa: no garantiza un legendario.' },
  { id: 'titulo_guardian', nombre: 'Guardián del Credo', icono: '⚜️', categoria: 'estilo', desc: 'Un nuevo rango para tu aventurero.', uso: 'Tu rango cambia al comprarlo.' },
  { id: 'titulo_maestro', nombre: 'Maestro de la Fe', icono: '👑', categoria: 'estilo', desc: 'Lleva este rango en tu aventura.', uso: 'Tu rango cambia al comprarlo.' },
  { id: 'aura_santidad', nombre: 'Aura de santidad', icono: '✨', categoria: 'estilo', desc: 'Una luz especial alrededor de tu avatar.', uso: 'Se muestra en tu perfil.' },
  { id: 'marco_vitral_azul', nombre: 'Marco vitral azul', icono: '🔵', categoria: 'estilo', desc: 'Un marco azul inspirado en los vitrales.', uso: 'Se equipa al comprarlo. Puedes cambiarlo en tu perfil.' },
  { id: 'marco_vitral_dorado', nombre: 'Marco vitral dorado', icono: '🟡', categoria: 'estilo', desc: 'Un marco dorado para tu avatar.', uso: 'Se equipa al comprarlo. Puedes cambiarlo en tu perfil.' },
];
const categorias = [['ayudas', '🛡️ Ayudas'], ['poderes', '⚡ Poderes'], ['cofres', '🎁 Cofres'], ['estilo', '✨ Mi estilo']];
export default function Tienda() {
  const game = useGame();
  const shop = useShop();
  const { monedas, vidas, inventario, setActiveTab } = game;
  const { showToast } = useToast();
  const [categoria, setCategoria] = useState('ayudas');
  const [elegido, setElegido] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [modalTitulos, setModalTitulos] = useState(false);
  const [error, setError] = useState('');
  const operando = useRef(false);
  const acciones = { corazon_extra: game.comprarCorazon, pocion_sabiduria: game.comprarPocion, doble_xp: game.comprarDobleXp, protector_racha: game.comprarProtectorRacha, cofre_madera: shop.comprarCofreMadera, cofre_plata: shop.comprarCofrePlata, cofre_oro: shop.comprarCofreOro };
  const comprados = { corazon_extra: shop.corazonesCompradosHoy, pocion_sabiduria: shop.pocionesCompradasHoy, doble_xp: shop.dobleXpCompradosHoy, protector_racha: shop.protectorRachaCompradosHoy, cofre_madera: shop.cofresMaderaCompradosHoy, cofre_plata: shop.cofresPlataCompradosHoy, cofre_oro: shop.cofresOroCompradosHoy };
  const oferta = shop.obtenerOfertaDiaria();
  const cantidad = id => inventario.filter(i => i === id).length;
  const mochila = objetos.filter(o => cantidad(o.id) > 0);
  function bloqueo(id, precio) {
    const p = PRODUCTOS[id];
    if (id === 'corazon_extra' && vidas >= 5) return 'Tus vidas están completas';
    if (p.limite && comprados[id] >= p.limite) return 'Ya alcanzaste el límite de hoy';
    if (p.maximo && cantidad(id) >= p.maximo) return p.maximo === 1 ? 'Ya lo tienes' : 'Tu mochila está llena';
    if (monedas < precio) return 'Te faltan ' + (precio - monedas) + ' monedas';
    return null;
  }
  function elegir(objeto, esOferta = false) {
    setError('');
    const precio = esOferta ? oferta.precioOferta : PRODUCTOS[objeto.id].precio;
    setElegido({ ...objeto, precio, accion: esOferta ? () => shop.comprarOferta(objeto.id) : acciones[objeto.id] ?? (() => shop.comprarItem({ id: objeto.id })) });
  }
  async function comprar() {
    if (!elegido || operando.current) return;
    operando.current = true; setComprando(true); setError('');
    try {
      const ok = await elegido.accion();
      if (!ok) throw new Error('No pudimos guardar la compra. Intenta otra vez.');
      setElegido(null);
      showToast('¡' + elegido.nombre + ' ya es tuyo!', 'success');
    } catch (e) { setError(e.message || 'No se pudo comprar. Revisa tu conexión.'); }
    finally { operando.current = false; setComprando(false); }
  }
  return <section className="zona-aventura zona-tienda">
    <CabeceraAventura etiqueta="🛍️ LA TIENDA DE LA AVENTURA" titulo="¡Prepara tu mochila!" descripcion="Elige ayudas para aprender y detalles para tu aventurero. Usas las monedas que ganas jugando.">
      <div className="tienda-balance"><span aria-hidden="true">🪙</span><span><strong>{monedas.toLocaleString()}</strong><small>Tus monedas del juego</small></span><button className="juego-btn juego-btn-secundario" onClick={() => setActiveTab('mapa')}>Ganar monedas →</button></div>
    </CabeceraAventura>
    <details className="juego-panel tienda-mochila"><summary>🎒 Mi mochila <span>{mochila.length} tipos de objetos · Ver lo que tengo</span></summary>{!mochila.length ? <p>Tu mochila está lista para tu primer objeto.</p> : <ul>{mochila.map(o => <li key={o.id}><span>{o.icono} {o.nombre}</span><strong>×{cantidad(o.id)}</strong><small>{o.uso}</small></li>)}</ul>}</details>
    {oferta && <aside className="tienda-oferta"><span className="tienda-oferta-icono" aria-hidden="true">{oferta.icono}</span><div><span className="juego-etiqueta">PRECIO ESPECIAL DE HOY · −{oferta.descuento}%</span><h2>{oferta.nombre}</h2><p>{objetos.find(o => o.id === oferta.id)?.desc}</p><span><s>{oferta.precioOriginal}</s> <strong>🪙 {oferta.precioOferta} monedas</strong></span></div><button className="juego-btn" disabled={!!bloqueo(oferta.id, oferta.precioOferta) || comprando} onClick={() => elegir(objetos.find(o => o.id === oferta.id), true)}>{bloqueo(oferta.id, oferta.precioOferta) ?? 'Ver oferta'}</button></aside>}
    <nav className="juego-pestanas" aria-label="Categorías de la tienda">{categorias.map(([id, label]) => <button key={id} aria-pressed={categoria === id} onClick={() => setCategoria(id)}>{label}</button>)}</nav>
    <div className="juego-seccion-titulo"><h2>{categorias.find(c => c[0] === categoria)[1]}</h2><p>Elige un objeto para conocerlo antes de comprar.</p></div>
    <div className="tienda-productos">{objetos.filter(o => o.categoria === categoria).map(o => {
      const p = PRODUCTOS[o.id]; const razon = bloqueo(o.id, p.precio);
      return <article className="juego-panel tienda-producto" key={o.id} data-categoria={categoria}><div className="tienda-producto-arriba"><span className="tienda-producto-icono" aria-hidden="true">{o.icono}</span><span className="juego-chip">🪙 {p.precio}</span></div><h3>{o.nombre}</h3><p>{o.desc}</p><p className="juego-secundario">{o.uso}</p><div className="tienda-producto-stock"><span>{p.cofre || o.id === 'corazon_extra' ? '' : '🎒 Tienes: ' + cantidad(o.id)}</span>{p.limite && <span>Hoy: {comprados[o.id]} / {p.limite}</span>}</div><button className="juego-btn" disabled={!!razon || comprando} onClick={() => elegir(o)}>{razon ?? 'Lo quiero · ' + p.precio + ' 🪙'}</button></article>;
    })}</div>
    {categoria === 'estilo' && <aside className="juego-nota"><span aria-hidden="true">🏅</span><p><strong>Un título con tu estilo</strong><br/>También puedes elegir un nombre especial para tu perfil.</p><button className="juego-btn juego-btn-secundario" onClick={() => setModalTitulos(true)}>Ver títulos →</button></aside>}
    <p className="juego-pie">⛪ San JoseKids · Aprendemos, compartimos y crecemos en la fe.</p>
    <DialogoAprendizaje abierto={!!elegido} onCerrar={() => { if (!operando.current) setElegido(null); }} titulo="¿Lo llevamos en tu aventura?">
      {elegido && <><span className="tienda-confirmar-icono" aria-hidden="true">{elegido.icono}</span><h1>{elegido.nombre}</h1><p>{elegido.desc}</p><p>{elegido.uso}</p><div className="juego-panel"><p>Precio: <strong>{elegido.precio} monedas</strong></p><p>Después tendrás: <strong>{Math.max(0, monedas - elegido.precio)} monedas</strong></p></div>{error && <p role="alert">{error}</p>}<button className="aprendizaje-cta" disabled={comprando || monedas < elegido.precio} onClick={comprar}>{comprando ? 'Guardando…' : 'Comprar por ' + elegido.precio + ' 🪙'}</button><button className="aprendizaje-cta aprendizaje-secundario" disabled={comprando} onClick={() => setElegido(null)}>Seguir mirando</button></>}
    </DialogoAprendizaje>
    <TitulosModal isOpen={modalTitulos} onClose={() => setModalTitulos(false)} onComprar={t => { setModalTitulos(false); setError(''); setElegido({ ...t, desc: t.descripcion, uso: 'Se añade a tu colección de títulos.', accion: () => game.comprarTituloLegendario(t.id) }); }}/>
  </section>;
}
