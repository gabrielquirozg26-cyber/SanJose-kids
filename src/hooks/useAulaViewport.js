import { useEffect } from 'react';

// El teclado móvil puede reducir la zona visible sin cambiar 100dvh.
export function useAulaViewport(ref) {
  useEffect(() => {
    const aula = ref.current?.closest('.aula-leccion');
    if (!aula) return;
    const viewport = window.visualViewport;
    let frame = 0;
    const ajustar = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // No encoger el contenido cuando el jugador amplía con los dedos.
        if (viewport && Math.abs(viewport.scale - 1) > .05) return;
        const altura = viewport?.height ?? window.innerHeight;
        aula.style.setProperty('--aula-viewport', altura + 'px');
        aula.dataset.teclado = document.activeElement?.classList.contains('aula-input') && window.innerHeight - altura > 120 ? 'abierto' : 'cerrado';
        if (aula.dataset.teclado === 'abierto') document.activeElement.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      });
    };
    ajustar();
    viewport?.addEventListener('resize', ajustar);
    window.addEventListener('resize', ajustar);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', ajustar);
      window.removeEventListener('resize', ajustar);
      aula.style.removeProperty('--aula-viewport');
      delete aula.dataset.teclado;
    };
  }, [ref]);
}
