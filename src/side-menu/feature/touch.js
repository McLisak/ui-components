import { TOUCH, SIDE, STATE, EVENT } from '../constants';
import { SideMenu } from '../side-menu';

export class SideMenuTouch {
  static get EVENT() {
    return TOUCH.EVENT;
  }
  /**
   * @param {SideMenu} sideMenu
   */
  constructor(sideMenu) {
    if (!(sideMenu instanceof SideMenu)) throw new Error('Did not receive SideMenu instance');
    this.sideMenu = sideMenu;
    this.triggerAreaTriggered = false;
    this.createOpenTriggerArea();
    this.setTouchListeners();
  }

  styleInitialOpenTriggerArea(triggerArea) {
    this.side = this.sideMenu.options.side === SIDE.LEFT ? SIDE.LEFT : SIDE.RIGHT;
    triggerArea.id = 'side-menu-trigger-area';
    triggerArea.style.width = TOUCH.TRIGGER_AREA_WIDTH;
    triggerArea.style.height = '100vh';
    triggerArea.style.position = 'fixed';
    triggerArea.style[this.side] = '0';
    triggerArea.style.top = '0';
    triggerArea.style.zIndex = '201';
  }

  restyleOpenTriggerArea() {
    let width = TOUCH.TRIGGER_AREA_WIDTH;
    if (this.sideMenu.state === STATE.OPENED) {
      width = '100%';
    }
    this.openTriggerArea.style.width = width;
  }

  createOpenTriggerArea() {
    this.openTriggerArea = document.createElement('div');
    this.styleInitialOpenTriggerArea(this.openTriggerArea);
    document.body.prepend(this.openTriggerArea);
    this.sideMenu.on(EVENT.STATECHANGE, () => this.restyleOpenTriggerArea());
  }

  setTouchListeners() {
    window.addEventListener('touchstart', (data) => this.onTouchStart(data));
    window.addEventListener('touchmove', (data) => this.onTouchMove(data));
    window.addEventListener('touchend', (data) => this.onTouchEnd(data));
  }

  calculateVelocity() {}

  calculatePosition(eventData) {
    const touchX = eventData.clientX;
    const menuWidth = this.sideMenu.getMaxWidth();
    let result = menuWidth * -1 + touchX;
    if (this.sideMenu.state === STATE.OPENED) {
      result = Math.min(0, result + this.touchDragOffset);
    } else {
      result = Math.min(0, result - this.touchDragOffset);
    }
    return result;
  }

  calculateDistance(touchEndX) {
    touchEndX = Math.abs(touchEndX);
    const menuActualPosition = Math.floor(this.sideMenu.getMaxWidth() - touchEndX - this.touchDragOffset);
    const distance = Math.floor(100 - (menuActualPosition / this.sideMenu.getMaxWidth()) * 100);
    return distance;
  }

  distanceConditionOpen(menuPosition) {
    return this.calculateDistance(menuPosition) > TOUCH.TRIGGER_THRESHOLD.DISTANCE_OPEN;
  }

  distanceConditionClose(menuPosition) {
    return this.calculateDistance(menuPosition) < TOUCH.TRIGGER_THRESHOLD.DISTANCE_CLOSE;
  }

  velocityConditionOpen() {
    return true;
  }

  velocityConditionClose() {
    return true;
  }

  wasDragged({ clientX: touchEndX }) {
    return Math.abs(touchEndX - this.touchStartedOnX) > TOUCH.TRIGGER_THRESHOLD.DRAG_DISTANCE;
  }

  shouldMenuOpen(eventData) {
    return this.triggerAreaTriggered && this.distanceConditionOpen(eventData.clientX) && this.wasDragged(eventData);
    //|| this.velocityConditionOpen()
  }

  shouldMenuClose(eventData) {
    return this.triggerAreaTriggered && this.distanceConditionClose(eventData.clientX) && this.wasDragged(eventData);
    // || this.velocityConditionClose()
  }

  onTouchStart(data) {
    if (data.target === this.openTriggerArea) {
      this.sideMenu.disableTransition();
      this.triggerAreaTriggered = true;
      this.touchStartedOnX = data.touches[0].clientX;
      this.touchDragOffset = this.touchStartedOnX;
      if (this.sideMenu.state === STATE.OPENED) {
        this.touchDragOffset = this.sideMenu.getMaxWidth() - this.touchStartedOnX;
      }
    }
  }

  onTouchMove({ touches }) {
    if (this.triggerAreaTriggered) {
      const newPosition = this.calculatePosition(touches[0]);
      this.sideMenu.setMenuX(newPosition);
    }
  }

  onTouchEnd(data) {
    const state = this.sideMenu.state;
    if (this.shouldMenuOpen(data.changedTouches[0]) && state === STATE.CLOSED) {
      this.sideMenu.changeState(STATE.OPENED);
    } else if (this.shouldMenuClose(data.changedTouches[0]) && state === STATE.OPENED) {
      this.sideMenu.changeState(STATE.CLOSED);
    } else {
      this.sideMenu.enableTransition();
      this.sideMenu.clearTransform();
    }
    this.restyleOpenTriggerArea();
    this.triggerAreaTriggered = false;
  }
}
