import EventEmitter from 'eventemitter3';
import { CSS, EVENT, SIDE, STATE, SIZE } from './constants';
import './scss/main.scss';
/**
 *
 * @class SideMenu
 * @extends {EventEmitter}
 */
export class SideMenu extends EventEmitter {
  static get EVENT() {
    return EVENT;
  }

  /**
   * @override
   */
  emit(eventName, data) {
    if (this.options.debug) {
      if (data !== undefined) {
        console.log('SideMenu', '->', eventName, '->', data);
      } else {
        console.log('SideMenu', '->', eventName);
      }
    }
    super.emit(eventName, data);
  }

  constructor(options) {
    super();
    this.elements = {
      menu: this.findMenu(),
      trigger: document.getElementsByClassName(CSS.TRIGGER)[0] || undefined,
    };
    this.state = document.body.classList.contains(CSS.OPENED) ? STATE.OPENED : STATE.CLOSED;
    this.options = options || {};
    this.defaultStyle = Object.assign({}, this.elements.menu.style);
    this.setOptions(this.getCustomOptions());
    if (!this.options.touchDisabled) {
      import('./feature/touch').then((imported) => {
        const sideMenuTouch = imported.SideMenuTouch;
        this.touch = new sideMenuTouch(this);
      });
    }
    this.setEventListeners();
  }

  getMaxWidth() {
    return window.innerWidth > SIZE.TABLET_WIDTH ? SIZE.MENU_FIXED_WIDTH : window.innerWidth;
  }

  findMenu() {
    const menu = document.getElementsByClassName(CSS.MENU);
    if (!menu[0]) throw new Error('SideMenu element not found in the DOM. Add a div.side-menu');
    return menu[0];
  }

  setDefaultOptions() {
    this.options = this.getDefaultOptions();
  }

  getDefaultOptions() {
    return {
      side: SIDE.LEFT,
    };
  }

  setOptions(options) {
    Object.assign(this.options, this.getDefaultOptions(), options);
  }

  getCustomOptions() {
    const dataset = Object.assign({}, this.elements.menu.dataset);
    for (const key in dataset) {
      if (dataset[key] === 'false' || dataset[key] === '') dataset[key] = false;
    }
    return dataset;
  }

  setEventListeners() {
    this.on(EVENT.TRIGGERED, this.onTrigger);
    this.on(EVENT.STATECHANGE, (newState) => this.onStateChange(newState));
    this.elements.menu.addEventListener(EVENT.TRANSITION_END, (event) => this.onTransitionEnd(event));
    this.elements.trigger.addEventListener('click', () => this.emit(EVENT.TRIGGERED));
  }

  onTransitionEnd(event) {
    if (event.target !== this.elements.menu || event.pseudoElement !== '') return;
  }

  changeState(newState) {
    this.enableTransition();
    this.clearTransform();
    if (typeof newState === 'undefined') {
      if (this.state === STATE.OPENED) {
        this.state = STATE.CLOSED;
      } else if (this.state === STATE.CLOSED) {
        this.state = STATE.OPENED;
      }
    } else if (newState !== this.state) {
      this.state = newState;
    }
    this.emit(EVENT.STATECHANGE, this.state);
  }

  onStateChange() {
    const emitChange = () => {
      this.emit(this.state === STATE.OPENED ? EVENT.OPENED : EVENT.CLOSED);
      this.elements.menu.removeEventListener(EVENT.TRANSITION_END, emitChange);
    };
    this.elements.menu.addEventListener(EVENT.TRANSITION_END, emitChange);
    if (this.state === STATE.CLOSED) {
      document.body.classList.remove(CSS.OPENED);
    } else if (this.state === STATE.OPENED) {
      document.body.classList.add(CSS.OPENED);
    }
  }

  onTrigger() {
    this.changeState();
  }

  disableTransition() {
    this.elements.menu.style.transition = 'none';
  }

  enableTransition() {
    this.elements.menu.style.transition = this.defaultStyle.transition;
  }

  clearTransform() {
    this.elements.menu.style.transform = '';
  }

  setMenuX(x) {
    this.elements.menu.style.transform = `translateX(${x}px)`;
  }
}
