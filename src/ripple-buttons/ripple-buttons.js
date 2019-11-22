import './style.scss';

const masterClassName = 'hover-ripple';
const rippleHoverClassName = 'ripple-hover';
const rippleClickClassName = 'ripple-click';
const rippleClassName = 'ripple';
let elements = [];

export class RippleButtons {
  static get elements() {
    return elements;
  }
  static set elements(v) {
    elements = v;
  }
  static get masterClassName() {
    return masterClassName;
  }
  static get rippleHoverClassName() {
    return rippleHoverClassName;
  }
  static get rippleClickClassName() {
    return rippleClickClassName;
  }
  static get rippleClassName() {
    return rippleClassName;
  }
  static init() {
    this.elements = document.querySelectorAll(`.${this.masterClassName}`);
    this.elements.forEach((element) => {
      const rippleHoverEl = this.createRippleHoverElement();
      element.prepend(rippleHoverEl);
      element.addEventListener('mouseenter', (event) => this.ripple(rippleHoverEl, event));
      element.addEventListener('mouseleave', (event) => this.unripple(rippleHoverEl, event));
      element.addEventListener('click', (event) => this.handleRippleClick(element, event));
    });
  }
  static createRippleHoverElement() {
    const el = document.createElement('div');
    el.classList.add(this.rippleClassName);
    el.classList.add(this.rippleHoverClassName);
    return el;
  }

  static createRippleClickElement() {
    const el = document.createElement('div');
    el.classList.add(this.rippleClassName);
    el.classList.add(this.rippleClickClassName);
    return el;
  }

  static handleRippleClick(buttonEl, clickEvent) {
    window.requestAnimationFrame(() => {
      const rippleEl = this.createRippleClickElement();
      buttonEl.appendChild(rippleEl);
      const hideRipple = (transitionEvent) => {
        if (transitionEvent.propertyName === 'opacity') {
          buttonEl.removeChild(rippleEl);
          rippleEl.removeEventListener('transitionend', hideRipple);
        }
      };
      rippleEl.addEventListener('transitionend', hideRipple);
      window.requestAnimationFrame(() => {
        this.ripple(rippleEl, clickEvent);
        rippleEl.style.opacity = '0';
      });
    });
  }

  static ripple(rippleEl, mouseEvent) {
    this.adjustRipplePosition(rippleEl, mouseEvent);
    rippleEl.style.transform = 'translate(-50%, -50%) scale(3)';
  }

  static unripple(rippleEl, mouseEvent) {
    this.adjustRipplePosition(rippleEl, mouseEvent);
    rippleEl.style.transform = '';
    rippleEl.style.opacity = '';
  }

  static adjustRipplePosition(rippleEl, { offsetX, offsetY }) {
    rippleEl.style.left = offsetX + 'px';
    rippleEl.style.top = offsetY + 'px';
  }
}
