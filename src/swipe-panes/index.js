import { SwipePanes } from './panes';
import { Notifications } from '@/notification/notifications';

const notifications = new Notifications();
window.panes = new SwipePanes();

window.panes.on(SwipePanes.EVENT.CHANGE, (currentPane, previousPane) => {
  notifications.add(`Pane changed, current pane ${currentPane}, previous pane: ${previousPane}`);
});
