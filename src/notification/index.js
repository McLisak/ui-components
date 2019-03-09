import './style.scss';

/**
 * @typedef {{
 * container: HTMLElement
 * }} NotificationsConfig
 */

export class Notifications {
  static get ERROR() {
    return {
      NO_CONFIG: 'No Notificatino config specified',
      NO_CONTAINER: 'No container specified in Notification config',
      NO_NOTIFICATION_CONTENT: 'Specify the notification content',
    };
  }
  static get EVENT() {
    return {};
  }

  /**
   *
   * @param {NotificationsConfig} config
   */
  constructor(config) {
    this.$container = config.container || document.body;
    this.notifiactions = [];
  }

  addNotification(content, dismissable = true) {
    if (!content) {
      throw new Error(Notifications.ERROR.NO_NOTIFICATION_CONTENT);
    }
    const $notification = document.createElement('div');
    $notification.classList.add('notification');
    const $notificationContent = document.createElement('div');
    $notificationContent.innerHTML = content;
    $notification.appendChild($notificationContent);
    if (dismissable) {
      $notification.appendChild(document.createElement('button'));
    }
    this.$container.appendChild($notification);
    this.notifiactions.push({
      $el: $notification,
    });
  }
}

const notifications = new Notifications({
});

notifications.addNotification(`<p>Greetings notification! :)</p>`);
// setTimeout(() => notifications.addNotification(`<p>New notification incoming</p>`), 5000);
