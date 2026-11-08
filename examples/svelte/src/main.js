import { mount } from 'svelte';
import '../../shared/fira.css';
import '../../../dist/css/tokens.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
