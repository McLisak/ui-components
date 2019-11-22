export const CSS = {
  OPENED: 'side-menu-open',
  TRIGGER: 'side-menu-trigger',
  MENU: 'side-menu',
};
export const SIDE = {
  LEFT: 'left',
  RIGHT: 'right',
};
export const SIZE = {
  TABLET_WIDTH: 768,
  DESKTOP_WIDTH: 1280,
  MENU_FIXED_WIDTH: 500,
};
export const TOUCH = {
  TRIGGER_AREA_WIDTH: '5%',
  TRIGGER_THRESHOLD: {
    VELOCITY: 1,
    DRAG_DISTANCE: 50, //px
    DISTANCE_OPEN: 10, //%
    DISTANCE_CLOSE: 60, //%
  },
  EVENT: {},
};

export const EVENT = {
  STATECHANGE: 'statechange',
  OPENED: 'opened',
  CLOSED: 'closed',
  TRIGGERED: 'triggered',
  OPENING: 'opening',
  OPENING_ABORT: 'opening-abort',
  CLOSING: 'closing',
  CLOSING_ABORT: 'closing-abort',
  TRANSITION_END: 'transitionend',
  DRAG: 'drag',
};

export const STATE = {
  OPENED: 'opened',
  CLOSED: 'closed',
  OPENING: 'opening',
  CLOSING: 'closing',
};
