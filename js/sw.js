self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const sendNotification = payload => {

    const payloadParsed = JSON.parse(payload);

    const title = payloadParsed.title;
    const options = {
      'body': payloadParsed.body,
      'data': {
        'url': payloadParsed.url
      }
    };
    if (payloadParsed.icon) {
      options.icon = payloadParsed.icon;
    }
    if (payloadParsed.badge) {
      options.badge = payloadParsed.badge;
    }

    return self.registration.showNotification(title, options);
  };

  if (event.data) {
    const message = event.data.text();
    event.waitUntil(sendNotification(message));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  Promise.resolve();
  clients.openWindow(event.notification.data.url);
});
