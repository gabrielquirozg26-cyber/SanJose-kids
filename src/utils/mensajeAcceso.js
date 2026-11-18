export function mensajeAcceso(error) {
  switch (error?.code) {
    case 'auth/network-request-failed': return 'No pudimos conectarnos. Revisa tu internet e inténtalo otra vez.';
    case 'auth/too-many-requests': return 'Hagamos una pausa. Espera un momento antes de volver a intentarlo.';
    case 'auth/invalid-email': return 'Revisa el correo. Debe tener un formato como nombre@ejemplo.com.';
    case 'auth/user-disabled': return 'No pudimos acceder con esta cuenta. Pide ayuda al equipo de catequesis.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'El correo o la contraseña no coinciden. Revísalos con calma e inténtalo otra vez.';
    default: return 'No pudimos iniciar sesión. Inténtalo otra vez o pide ayuda a tu catequista.';
  }
}
