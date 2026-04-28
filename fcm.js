import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js';

const firebaseConfig = {
  apiKey: "AIzaSyArjZp9ZL0FEHyC81--e2EY0WeqBuRkKyQ",
  authDomain: "smart-retail-automation.firebaseapp.com",
  projectId: "smart-retail-automation",
  storageBucket: "smart-retail-automation.firebasestorage.app",
  messagingSenderId: "775850945596",
  appId: "1:775850945596:web:8681d22dddd25b72f26739",
};

const VAPID_KEY = 'b-WjP0_a7QhE8nXNwTLvjKcnfRLP3bEK5LELTvt-NXM';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function initFCM() {
  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Save token to backend
      await fetchAPI('/api/notifications/token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      console.log('FCM token registered');
    }

    // Handle foreground messages — show toast
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      showToast(title, body, payload.data?.type);
    });

  } catch (err) {
    console.error('FCM init error:', err.message);
  }
}

function showToast(title, body, type = '') {
  const toast = document.createElement('div');
  toast.className = 'fcm-toast';

  const icon = type === 'low_stock' ? '⚠️' : type === 'new_sale' ? '🛒' : '🔔';
  toast.innerHTML = `
    <div class="fcm-toast-icon">${icon}</div>
    <div class="fcm-toast-text">
      <strong>${title || 'Notification'}</strong>
      <span>${body || ''}</span>
    </div>
    <button class="fcm-toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  // Inject styles once
  if (!document.getElementById('fcm-toast-style')) {
    const style = document.createElement('style');
    style.id = 'fcm-toast-style';
    style.textContent = `
      .fcm-toast {
        position: fixed; top: 20px; right: 20px;
        background: #2c3e50; color: #fff;
        padding: 14px 16px; border-radius: 10px;
        display: flex; align-items: center; gap: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        z-index: 99999; max-width: 340px;
        animation: fcm-slide-in .3s ease;
      }
      @keyframes fcm-slide-in {
        from { transform: translateX(120%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      .fcm-toast-icon { font-size: 24px; }
      .fcm-toast-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      .fcm-toast-text strong { font-size: 14px; }
      .fcm-toast-text span   { font-size: 12px; opacity: .85; }
      .fcm-toast-close {
        background: none; border: none; color: #fff;
        font-size: 16px; cursor: pointer; padding: 0;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}
