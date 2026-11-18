// Solo para scripts de Node. Nunca importar en src/ ni usar variables VITE_.
export function readAdminPassword(variable) {
  const value = process.env[variable];
  if (!value || value.trim().length < 12) {
    throw new Error('Configura ' + variable + ' con al menos 12 caracteres en .env.admin.local. Consulta scripts/README.md.');
  }
  return value;
}
