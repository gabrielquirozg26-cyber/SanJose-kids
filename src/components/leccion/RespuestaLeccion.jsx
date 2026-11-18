export default function RespuestaLeccion({ resultado, respuesta, explicacion, monedas = 0, procesando, puedeComprobar, onComprobar, onContinuar, ultimo, error }) {
  return <footer className="aula-pie" data-feedback={!!resultado}>
    {error && <p className="aula-error" role="alert">{error}</p>}
    {resultado ? <div className={'aula-feedback aula-feedback-' + resultado}>
      <div role="status"><h2>{resultado === 'acierto' ? '✓ ¡Lo encontraste!' : resultado === 'escudo' ? '🛡️ ¡Tu escudo te cuidó!' : '💡 Aprendamos juntos'}</h2>
        {resultado === 'acierto' ? <p>{monedas > 0 ? '+' + monedas + ' monedas para tu aventura' : 'Tu respuesta ya está guardada.'}</p> : <p>La respuesta es: <strong>{respuesta}</strong></p>}
        {explicacion && <p>{explicacion}</p>}
      </div><button className="aula-boton aula-boton-principal" disabled={procesando} onClick={onContinuar}>{procesando ? 'Guardando…' : ultimo ? '¡Ver mis resultados!' : '¡Continuar! →'}</button>
    </div> : <div className="aula-acciones"><p aria-live="polite">{puedeComprobar ? '¡Listo para comprobar!' : 'Completa el reto'}</p><button id="btn-comprobar" className="aula-boton aula-boton-principal" disabled={!puedeComprobar || procesando} onClick={onComprobar}>{procesando ? 'Guardando…' : 'Comprobar'}</button></div>}
  </footer>;
}
