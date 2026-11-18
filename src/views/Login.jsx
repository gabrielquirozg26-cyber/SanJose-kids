import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import PantallaAcceso from '../components/acceso/PantallaAcceso';

export default function Login({ onEnviando }) {
  const { iniciarSesion } = useAuth();
  const { showToast } = useToast();
  return <PantallaAcceso acceder={iniciarSesion} onEnviando={onEnviando} onExito={() => showToast('¡Bienvenido a tu aventura! 🌟', 'success')}/>;
}
