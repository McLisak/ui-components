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
    this.duration = config.duration || 5000;

    this.lastNotificationId = 0;
    this.notifications = [];
  }

  /**
   * @param {string} content
   * @param {number|string} [duration=default] in number of ms
   * or string 'default' will take whatever is configured by config object
   * @param {boolean} [dismissable=true] - appends the close button.
   */
  addNotification(content, duration = 'default', dismissable = true) {
    if (!content) {
      throw new Error(Notifications.ERROR.NO_NOTIFICATION_CONTENT);
    }
    const id = ++this.lastNotificationId;
    const $notification = document.createElement('div');
    $notification.classList.add('notification');
    $notification.style.transform = 'translateY(100%)';
    $notification.style.opacity = '0';
    const $notificationContent = document.createElement('div');
    $notificationContent.innerHTML = `<p>${content}</p>`;
    $notification.appendChild($notificationContent);

    const notification = {
      $el: $notification,
      id,
      show: true,
    };

    if (dismissable) {
      const closeButton = document.createElement('button');
      const onCloseClick = () => {
        this.removeNotification(id);
        closeButton.removeEventListener('click', onCloseClick);
      };
      closeButton.addEventListener('click', onCloseClick);
      $notification.appendChild(closeButton);
    }

    if (duration === 'default') {
      duration = this.duration;
    }
    if (typeof duration === 'number') {
      const onTimeout = () => {
        this.removeNotification(id);
      };
      notification.timeout = window.setTimeout(onTimeout, duration);
    }

    this.$container.appendChild($notification);
    this.notifications.unshift(notification);

    window.requestAnimationFrame(() => this._onAddUpdate());
  }

  _onAddUpdate() {
    let ignoredNotificationCount = 0;
    window.requestAnimationFrame(() => {
      for (let i = this.notifications.length - 1; i >= 0; i--) {
        if (!this.notifications[i].show) {
          ignoredNotificationCount++;
        } else {
          const $notification = this.notifications[i].$el;
          const positionIncrementer = i - ignoredNotificationCount;
          const transformValue =
            i === 0 ? `0%` : `calc(${positionIncrementer * -100}% - ${positionIncrementer * 10}px)`;
          $notification.style.opacity = 1;
          $notification.style.transform = `translateY(${transformValue})`;
        }
      }
    });
  }

  removeNotification(removeId) {
    const notificationIndex = this.notifications.findIndex(({ id }) => id === removeId);
    const notification = this.notifications[notificationIndex];
    const $notification = this.notifications[notificationIndex].$el;

    window.clearTimeout(notification.timeout);
    notification.show = false;

    const onTransitionEnd = () => {
      this.$container.removeChild($notification);
      this.notifications.splice(notificationIndex, 1);
      $notification.removeEventListener('transitionend', onTransitionEnd);
    };
    $notification.addEventListener('transitionend', onTransitionEnd);

    this._onRemoveUpdate(notificationIndex);
  }

  _onRemoveUpdate(removedIndex) {
    window.requestAnimationFrame(() => {
      for (let i = this.notifications.length - 1; i >= removedIndex; i--) {
        const $notification = this.notifications[i].$el;
        let transformValue;
        if (i === removedIndex) {
          $notification.style.opacity = 0;
          transformValue = `calc(${i * -100 + 100}% - ${i * 10}px)`;
        } else {
          transformValue = `calc(${(i - 1) * -100}% - ${(i - 1) * 10}px)`;
        }
        $notification.style.transform = `translateY(${transformValue})`;
      }
    });
  }
}

const notifications = new Notifications({});

notifications.addNotification(`Greetings notification! :)`);
setTimeout(() => notifications.addNotification(`New notification incoming`, 2000, false), 1000);
setTimeout(() => notifications.addNotification(`Another notification incoming`), 2000);
