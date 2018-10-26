self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const sendNotification = payload => {

    const payloadParsed = JSON.parse(payload);

    const title = payloadParsed.title;
    const options = {
      'body': payloadParsed.body,
      'icon': payloadParsed.icon,
      'badge': payloadParsed.badge
    };

    return self.registration.showNotification(title, options);
  };

  if (event.data) {
    const message = event.data.text();
    event.waitUntil(sendNotification(message));
  }
});
