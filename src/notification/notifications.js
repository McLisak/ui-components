import EventEmitter from 'eventemitter3';
import './style.scss';

/**
 * @typedef {{
 * container: HTMLElement,
 * duration: number,
 * }} NotificationsConfig
 */

/**
 * @typedef {{
 * $el: HTMLElement,
 * id: number,
 * timeout: number,
 * show: boolean,
 * moving: boolean,
 * }} Notification
 */

export class Notifications extends EventEmitter {
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
   * @param {NotificationsConfig} config
   */
  constructor(config) {
    super();
    this.$container = config.container || document.body;
    this.duration = config.duration || 5000;

    this.lastNotificationId = 0;
    this.notifications = [];
    this._isBusy = false;
  }

  _setBusy(state) {
    if (this._isBusy !== state) {
      const isAnyNotificationMoving = this.notifications.find((notification) => notification.moving === true);
      if (!state && isAnyNotificationMoving) {
        return;
      }
      this._isBusy = state;
      console.log('Busy Change', state);
      this.emit('busy-change', this._isBusy);
    }
  }

  /**
   * Adds new notification, triggers animation of other existing notifications.
   * @param {string} content
   * @param {number|string} [duration=default] in number of ms
   * or string 'default' will take whatever is configured by config object
   * @param {boolean} [dismissable=true] - appends the close button.
   * @returns {Notification} notification
   */
  addNotification(content, duration = 'default', dismissable = true) {
    if (!content) {
      throw new Error(Notifications.ERROR.NO_NOTIFICATION_CONTENT);
    }
    if (this._isBusy) {
      this.once('busy-change', () => {
        return this.addNotification(content, duration, dismissable);
      });
      return;
    }
    this._setBusy(true);

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
      moving: true,
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
    if (duration !== null) {
      if (duration === 'default') {
        duration = this.duration;
      }
      if (typeof duration === 'number') {
        const onTimeout = () => {
          this.removeNotification(id);
        };
        notification.timeout = window.setTimeout(onTimeout, duration);
      }
    }

    this.$container.appendChild($notification);
    this.notifications.unshift(notification);

    window.requestAnimationFrame(() => this._onAddUpdate());

    return notification;
  }

  /**
   * Adjusts the position of all notifications after adding new one
   */
  _onAddUpdate() {
    let ignoredNotificationCount = 0;
    window.requestAnimationFrame(() => {
      for (let i = this.notifications.length - 1; i >= 0; i--) {
        if (!this.notifications[i].show) {
          ignoredNotificationCount++;
        } else {
          const notification = this.notifications[i];
          notification.moving = true;
          const $notification = notification.$el;
          $notification.addEventListener('transitionend', () => {
            notification.moving = false;
            this._setBusy(false);
          });
          const positionIncrementer = i - ignoredNotificationCount;
          const transformValue =
            i === 0 ? `0%` : `calc(${positionIncrementer * -100}% - ${positionIncrementer * 10}px)`;
          $notification.style.opacity = 1;
          $notification.style.transform = `translateY(${transformValue})`;
        }
      }
    });
  }

  /**
   * Removes the notification. Can be used `on the fly` and is used internally.
   * @param {number} removeId - id of notification to be removed.
   */
  removeNotification(removeId) {
    if (this._isBusy) {
      this.once('busy-change', () => {
        this.removeNotification(removeId);
      });
      return;
    }
    this._setBusy(true);

    const notificationIndex = this.notifications.findIndex(({ id }) => id === removeId);
    const notification = this.notifications[notificationIndex];
    window.clearTimeout(notification.timeout);
    notification.show = false;

    this._onRemoveUpdate(notificationIndex);
  }

  /**
   * Adjusts the position of notifications above the one that got removed.
   * @param {*} removeIndex
   */
  _onRemoveUpdate(removeIndex) {
    window.requestAnimationFrame(() => {
      for (let i = this.notifications.length - 1; i >= removeIndex; i--) {
        const notification = this.notifications[i];
        notification.moving = true;
        const $notification = notification.$el;
        const onTransitionEnd = () => {
          notification.moving = false;
          this._setBusy(false);
          if (i === removeIndex) {
            this.$container.removeChild($notification);
            $notification.removeEventListener('transitionend', onTransitionEnd);
            this.notifications.splice(removeIndex, 1);
          }
        };
        $notification.addEventListener('transitionend', onTransitionEnd);

        let transformValue;
        if (i === removeIndex) {
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
