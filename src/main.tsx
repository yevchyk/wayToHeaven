import ReactDOM from 'react-dom/client';

import App from './App';
import { AppProviders } from '@app/bootstrap/AppProviders';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
);

