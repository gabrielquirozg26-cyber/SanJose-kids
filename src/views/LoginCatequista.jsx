import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import PantallaAcceso from '../components/acceso/PantallaAcceso';

export default function LoginCatequista({ onEnviando }) {
  const { iniciarSesion } = useAuth();
  const { showToast } = useToast();
  return <PantallaAcceso catequista acceder={iniciarSesion} onEnviando={onEnviando} onExito={() => showToast('¡Bienvenido al panel de catequistas!', 'success')}/>;
}
