import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';

import { GameRootStore } from '@engine/stores/GameRootStore';

const StoreContext = createContext<GameRootStore | null>(null);

interface StoreProviderProps extends PropsWithChildren {
  rootStore?: GameRootStore;
}

export function StoreProvider({ children, rootStore: providedRootStore }: StoreProviderProps) {
  const [rootStore] = useState(() => providedRootStore ?? new GameRootStore());

  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}

export function useGameRootStore() {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error('GameRootStore is not available outside of StoreProvider.');
  }

  return store;
}
