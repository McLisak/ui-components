import { EventEmitter } from 'events';
import { Notifications } from '../notification/notifications';
import '../notification/style.scss';
import './style.scss';

const clip = (min, max, value) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export class SwipePanes extends EventEmitter {
  static get EVENT() {
    return {
      CHANGE: 'change',
    };
  }
  constructor(config = {}) {
    super();
    /**
     * @type {HTMLElement}
     */
    this.container = config.container || document.querySelector('.panes');
    /**
     * @type {HTMLElement[]}
     */
    this.panes = Array.from(this.container.querySelectorAll('.pane'));
    /**
     * @type {number}
     */
    this.switchThreshold = config.switchThreshold || 25;

    this.currentPaneIndex = 0;
    this.updatePanesState();
    this.distributeItems();

    this.notifications = new Notifications();

    this.startX = 0;
    this.moveX = 0;
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.addEventListeners();
  }

  updatePanesState() {
    this.currentPane = this.panes[this.currentPaneIndex];
    this.previousPane = this.panes[this.currentPaneIndex - 1];
    this.nextPane = this.panes[this.currentPaneIndex + 1];
  }

  distributeItems() {
    this.panes.forEach((item, index) => {
      let translateX = 0;
      if (index < this.currentPaneIndex) {
        translateX = -100;
      } else if (index > this.currentPaneIndex) {
        translateX = 100;
      }
      item.style.transform = `translateX(${translateX}%)`;
    });
  }

  addEventListeners() {
    this.container.addEventListener('touchstart', this.onTouchStart);
    this.container.addEventListener('touchmove', this.onTouchMove);
    this.container.addEventListener('touchend', this.onTouchEnd);
  }

  onTouchStart(e) {
    this.startX = this.moveX = e.touches[0].clientX;
    this.removeTransition();
  }

  onTouchMove(e) {
    this.moveX = e.touches[0].clientX;
    let diff = clip(-100, 100, ((this.startX - this.moveX) * 100) / window.innerWidth);
    if ((!this.previousPane && diff < 0) || (!this.nextPane && diff > 0)) {
      diff = 0;
      this.startX = this.moveX;
    }

    const currentTranslate = -diff;
    this.currentPane.style.transform = `translateX(${currentTranslate}%)`;

    if (this.nextPane) {
      const nextTranslate = 100 - diff;
      this.nextPane.style.transform = `translateX(${nextTranslate}%)`;
    }

    if (this.previousPane) {
      const previousTranslate = -100 - diff;
      this.previousPane.style.transform = `translateX(${previousTranslate}%)`;
    }
  }

  onTouchEnd() {
    const diff = clip(-100, 100, ((this.startX - this.moveX) / window.innerWidth) * 100);

    if (this.moveX === 0) {
      return;
    }
    const beforeChangeIndex = this.currentPaneIndex;
    if (diff > this.switchThreshold) {
      // Transition to next (right)
      this.currentPaneIndex = Math.min(this.panes.length, ++this.currentPaneIndex);
    } else if (diff < -this.switchThreshold) {
      // Transition to previous (left)
      this.currentPaneIndex = Math.max(0, --this.currentPaneIndex);
    }

    this.updatePanesState();

    if (Math.abs(diff === 100)) {
      return;
    }

    const onTransitionEnd = () => {
      this.isAnimating = false;
      this.removeTransition();
      if (beforeChangeIndex !== this.currentPaneIndex) {
        this.emit(SwipePanes.EVENT.CHANGE, this.currentPaneIndex, beforeChangeIndex);
      }
      this.currentPane.removeEventListener('transitionend', onTransitionEnd);
    };

    this.addTransition();
    this.currentPane.addEventListener('transitionend', onTransitionEnd);
    window.requestAnimationFrame(() => this.distributeItems());
    this.startX = this.moveX = 0;
  }

  addTransition() {
    const transition = 'transform 200ms ease';
    this.currentPane.style.transition = transition;
    if (this.previousPane) {
      this.previousPane.style.transition = transition;
    }
    if (this.nextPane) {
      this.nextPane.style.transition = transition;
    }
  }

  removeTransition() {
    this.currentPane.style.transition = '';
    if (this.previousPane) {
      this.previousPane.style.transition = '';
    }
    if (this.nextPane) {
      this.nextPane.style.transition = '';
    }
  }
}
