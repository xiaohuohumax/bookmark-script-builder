/**
 * #name vue component
 * #version 1.0.0
 */

import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

const root = document.createElement('div');
createApp(App).mount(root);
document.body.appendChild(root);
