import { SideMenu } from './side-menu';
import './scss/page.scss';

window.SideMenu = SideMenu;
document.addEventListener('DOMContentLoaded', () => window.sideMenu = new SideMenu());
