/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.8.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.8.2/firebase-messaging-compat.js"
);
// https://stackoverflow.com/questions/62204987/cant-get-click-action-to-work-on-fcm-notifications-with-web-app-pwa

console.log("init In Firebase Service Worker");
const channel = new BroadcastChannel("sw-messages");

const firebaseConfig = {
  apiKey: "AIzaSyCZZWgDchBhOt_FegFemyofULLHzTLVjA4",
  authDomain: "io-box.firebaseapp.com",
  databaseURL: "https://io-box-default-rtdb.firebaseio.com",
  projectId: "io-box",
  storageBucket: "io-box.appspot.com",
  messagingSenderId: "812477328372",
  appId: "1:812477328372:web:48d71b6a8390480d6827a1",
  measurementId: "G-JYYCY3TTPS",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log("FCM instance In Firebase Service Worker", messaging);

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification?.title;
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.image,
    // click_action: payload.notification?.,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
  window.location.href = payload.fcmOptions?.link;
});

self.addEventListener("notificationclick", function (event) {
  console.debug("SW addEventListener notificationclick event", event);
  console.debug("SW notification click event", event);
  const url = event.notification?.data?.FCM_MSG?.data?.link;

  channel.postMessage({
    type: "notification_clicked",
    data: {
      title: event.notification.title,
      clickAction: url,
    },
  });
});

self.addEventListener("install", function (e) {
  console.log("fcm sw install..");
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  console.log("fcm sw activate..");
});

self.addEventListener("push", function (e) {
  console.log("fcm sw push..", e.data.json());
  const noti = e.data.json().notification;
  const notificationTitle = noti.title;
  const notificationOptions = {
    body: noti.body,
    icon: noti.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
