import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

import App from '../App';
import { AppProviders } from '@app/bootstrap/AppProviders';
import type { GameRootStore } from '@engine/stores/GameRootStore';

export function renderWithStore(rootStore: GameRootStore): RenderResult {
  return render(
    <AppProviders rootStore={rootStore}>
      <App />
    </AppProviders>,
  );
}
