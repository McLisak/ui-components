import { Notifications } from './notifications';

const notifications = new Notifications();
notifications.on('busy-change', (isBusy) => console.log('isBusy', isBusy));
notifications.on('add', (notification) => console.log('add', notification));
notifications.on('remove', (notification) => console.log('remove', notification));
notifications.on('dismiss', (notification) => console.log('dismiss', notification));

notifications.addNotification(`Greetings notification! :)`);
notifications.addNotification(`Greetings notification2! :)`, null);
setTimeout(() => notifications.addNotification(`New notification incoming`, 4000, false), 2000);
setTimeout(() => notifications.addNotification(`Another notification incoming`, 10000), 3000);

const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');

button1.addEventListener('click', () => {
  notifications.addNotification('You pressed me! Wow, thanks!');
});

button2.addEventListener('click', () => {
  notifications.addNotification('You even pressed the other one! Holy... :)');
});
