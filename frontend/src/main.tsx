import {StrictMode} from 'react';
import {createRoot } from 'react-dom/client';
import App from './App';

const node = document.getElementById('root');
if (!node) throw new Error('Failed to find the root element');
const root = createRoot(node);
root.render(<StrictMode><App /></StrictMode>);