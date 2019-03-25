import { Notifications } from './notifications';

const notifications = window.notifications = new Notifications();
notifications.on('busy-change', (isBusy) => console.log('isBusy', isBusy));
notifications.on('add', (notification) => console.log('add', notification));
notifications.on('remove', (notification) => console.log('remove', notification));
notifications.on('dismiss', (notification) => console.log('dismiss', notification));

notifications.add(`Greetings notification! :)`, null);
notifications.add(`Greetings notification2! :) i will not be dismissed automatically. You have to press the X button to close me :)`, null);
setTimeout(() => notifications.add(`New notification incoming`, null), 1000);
// setTimeout(() => notifications.add(`Another notification incoming`, 10000), 3000);

const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');

button1.addEventListener('click', () => {
  notifications.add('You pressed me! Wow, thanks!');
});

button2.addEventListener('click', () => {
  notifications.add('You even pressed the other one! Holy... :)');
});
