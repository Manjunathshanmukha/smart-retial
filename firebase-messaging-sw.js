importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyArjZp9ZL0FEHyC81--e2EY0WeqBuRkKyQ",
  authDomain: "smart-retail-automation.firebaseapp.com",
  projectId: "smart-retail-automation",
  storageBucket: "smart-retail-automation.firebasestorage.app",
  messagingSenderId: "775850945596",
  appId: "1:775850945596:web:8681d22dddd25b72f26739",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    data: payload.data,
  });
});
