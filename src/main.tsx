import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import App from './App';

// A friendly hello for curious visitors who open the console.
console.log(
  `%c
     .-"""-.
    /  ★  ★ \\     hi! i'm pip.
   |  (o) (o) |    junior dream engineer.
    \\   ‿    /     you found the secret console!
     '-.___.-'     psst: try ↑ ↑ ↓ ↓ ← → ← → b a
`,
  'color:#A34063;font-family:monospace;font-size:12px',
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
