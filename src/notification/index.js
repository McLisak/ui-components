import { Notifications } from './notifications';

const notifications = new Notifications({});

notifications.addNotification(`Greetings notification! :)`);
notifications.addNotification(`Greetings notification2! :)`);
// setTimeout(() => notifications.addNotification(`New notification incoming`, 3000, false), 1000);
setTimeout(() => notifications.addNotification(`Another notification incoming`), 4000);

const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');

button1.addEventListener('click', () => {
  notifications.addNotification('You pressed me! Wow, thanks!');
});

button2.addEventListener('click', () => {
  notifications.addNotification('You even pressed the other one! Holy... :)');
});

notifications.on('busy-change', (isBusy) => console.log('isBusy', isBusy));
