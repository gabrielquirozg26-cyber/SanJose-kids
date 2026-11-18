import CabeceraAventura from '../components/CabeceraAventura';
import ImagenJuego from '../components/ImagenJuego';
export default function DetalleSantos({ santo, onVolver }) {
  if (!santo) return <section className="zona-aventura"><button className="juego-btn" onClick={onVolver}>← Volver al álbum</button><p>No encontramos esta historia. Elige otro santo.</p></section>;
  return <section className="zona-aventura santo-historia"><button className="juego-btn juego-btn-secundario" onClick={onVolver}>← Volver a mi álbum</button>
    <CabeceraAventura etiqueta="📖 UN AMIGO PARA CONOCER" titulo={santo.nombre} descripcion={santo.descripcion}/>
    <div className="santo-historia-contenido"><div className="juego-panel santo-retrato"><ImagenJuego src={santo.imagen} icono={santo.icono} nombre={santo.nombre}/><p>🎉 Celebramos su fiesta</p><strong>{santo.festividad || 'Fecha por descubrir'}</strong></div><div><article className="juego-panel"><h2>📖 Su historia</h2><p>{santo.biografia || 'Pronto conoceremos más sobre su vida.'}</p></article><article className="juego-panel"><h2>💡 ¿Qué podemos aprender?</h2><p>{santo.ensenanza || 'Sus gestos nos invitan a vivir nuestra fe.'}</p></article></div></div>
  </section>;
}
