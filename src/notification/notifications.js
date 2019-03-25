import EventEmitter from 'eventemitter3';
import './style.scss';

const debounce = (fn, delay) => {
  let timeout;
  return function() {
    const fnApply = () => fn.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(fnApply, delay);
  };
};

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
    return {
      BUSY_CHANGE: 'busy-change',
      ADD: 'add',
      REMOVE: 'remove',
      DISMISS: 'dismiss',
    };
  }

  /**
   * @param {NotificationsConfig} config
   */
  constructor(config = {}) {
    super();
    this.$container = config.container || document.body;
    this.duration = config.duration || 5000;

    this.lastNotificationId = 0;
    this.notifications = [];
    this._isBusy = false;
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', debounce(this._onResize, 150));
  }

  _onResize() {
    this._onAddUpdate();
  }

  _setBusy(state) {
    if (this._isBusy !== state) {
      const isAnyNotificationMoving = this.notifications.find((notification) => notification.moving === true);
      if (!state && isAnyNotificationMoving) {
        return;
      }
      this._isBusy = state;
      this.emit(Notifications.EVENT.BUSY_CHANGE, this._isBusy);
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
  add(content, duration = 'default', dismissable = true, _selfCalled = false) {
    return new Promise((resolve, reject) => {
      if (!content) {
        return reject(new Error(Notifications.ERROR.NO_NOTIFICATION_CONTENT));
      }
      if (this._isBusy) {
        if (!_selfCalled) {
          const onBusyChange = () => {
            this.add(content, duration, dismissable, true).then(resolve);
          };
          this.once(Notifications.EVENT.BUSY_CHANGE, onBusyChange);
        }
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
          this.emit(Notifications.EVENT.DISMISS, notification);
          this.remove(id);
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
            this.remove(id);
          };
          notification.timeout = window.setTimeout(onTimeout, duration);
        }
      }

      this.$container.appendChild($notification);
      this.notifications.unshift(notification);

      window.requestAnimationFrame(() =>
        this._onAddUpdate().then(() => {
          this._setBusy(false);
          this.emit(Notifications.EVENT.ADD, notification);
          resolve(notification);
        })
      );
    });
  }

  /**
   * Removes the notification. Can be used `on the fly` and is used internally.
   * @param {number} removeId - id of notification to be removed.
   */
  remove(removeId, _selfCalled = false) {
    return new Promise((resolve) => {
      if (this._isBusy) {
        if (!_selfCalled) {
          const onBusyChange = () => {
            this.remove(removeId, true).then(resolve);
          };
          this.once(Notifications.EVENT.BUSY_CHANGE, onBusyChange);
        }
        return;
      }
      this._setBusy(true);
      const notificationIndex = this.notifications.findIndex(({ id }) => id === removeId);
      const notification = this.notifications[notificationIndex];

      window.clearTimeout(notification.timeout);
      notification.show = false;

      this._onRemoveUpdate(notificationIndex).then(() => {
        this._setBusy(false);
        this.emit(Notifications.EVENT.REMOVE, notification);
        resolve(notification);
      });
    });
  }

  /**
   * Adjusts the position of all notifications after adding new one
   */
  _onAddUpdate() {
    return new Promise((resolve) => {
      let translateValue = 0;
      window.requestAnimationFrame(() => {
        const promises = [];
        for (let i = 0; i < this.notifications.length; i++) {
          const notification = this.notifications[i];
          promises.push(this._updateSingle(notification, translateValue));
          translateValue += notification.$el.clientHeight + 10;
        }
        Promise.all(promises).then(resolve);
      });
    });
  }

  _updateSingle(notification, translateValue) {
    return new Promise((resolve) => {
      notification.moving = true;
      const $notification = notification.$el;
      const onTransitionEnd = () => {
        notification.moving = false;
        $notification.removeEventListener('transitionend', onTransitionEnd);
        resolve(notification);
      };
      $notification.addEventListener('transitionend', onTransitionEnd);
      let transform;

      if (notification.show) {
        transform = `-${translateValue}px`;
        $notification.style.opacity = 1;
      } else {
        transform = `calc(100% - ${translateValue}px)`;
        $notification.style.opacity = 0;
      }
      $notification.style.transform = `translateY(${transform})`;
    });
  }

  /**
   * Adjusts the position of notifications above the one that got removed.
   * @param {*} removeIndex
   */
  _onRemoveUpdate(removeIndex) {
    return new Promise((resolve) => {
      let translateValue = 0;
      window.requestAnimationFrame(() => {
        const promises = [];
        for (let i = 0; i < this.notifications.length; i++) {
          if (i === removeIndex) {
            promises.push(
              this._updateSingle(this.notifications[i], translateValue, i).then(() => {
                this.$container.removeChild(this.notifications[i].$el);
              })
            );
            continue;
          }
          if (i > removeIndex) {
            promises.push(this._updateSingle(this.notifications[i], translateValue, i));
          }
          translateValue += this.notifications[i].$el.clientHeight + 10;
        }
        return Promise.all(promises).then(() => {
          this.notifications.splice(removeIndex, 1);
          resolve();
        });
      });
    });
  }
}
