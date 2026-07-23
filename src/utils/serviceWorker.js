// src/utils/serviceWorker.js
// ✅ Asegúrate de que la exportación sea correcta

// ── REGISTRAR SERVICE WORKER ──
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.error('❌ Error al registrar Service Worker:', error);
        });
    });
  } else {
    console.log('ℹ️ Service Worker no soportado en este navegador');
  }
};

// ── SOLICITAR PERMISO PARA NOTIFICACIONES ──
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('ℹ️ Notificaciones no soportadas');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Permiso de notificaciones ya concedido');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('❌ Permiso de notificaciones denegado');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// ── SUSCRIBIR A NOTIFICACIONES PUSH ──
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'TU_VAPID_PUBLIC_KEY'
      ),
    });

    console.log('✅ Suscripción a Push Notifications:', subscription);
    return subscription;
  } catch (error) {
    console.error('❌ Error al suscribir a Push Notifications:', error);
    return null;
  }
};

// ── CONVERTIR VAPID KEY ──
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── ENVIAR NOTIFICACIÓN LOCAL ──
export const sendLocalNotification = async (title, body, url = '/') => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('ℹ️ No se puede enviar notificación: permiso no concedido');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body: body,
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      vibrate: [200, 100, 200],
      data: { url },
      actions: [
        { action: 'open', title: '📖 Ver ahora' },
        { action: 'close', title: '❌ Cerrar' },
      ],
    });
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
  }
};