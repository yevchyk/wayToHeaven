import { observer } from 'mobx-react-lite';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { BattleScreen } from '@ui/screens/BattleScreen';
import { CitySceneScreen } from '@ui/screens/CitySceneScreen';
import { DialogueScreen } from '@ui/screens/DialogueScreen';
import { MainMenuScreen } from '@ui/screens/MainMenuScreen';
import { MiniGameScreen } from '@ui/screens/MiniGameScreen';
import { TravelBoardScreen } from '@ui/screens/TravelBoardScreen';
import { WorldScreen } from '@ui/screens/WorldScreen';

export const ScreenRenderer = observer(function ScreenRenderer() {
  const rootStore = useGameRootStore();
  const activeScreen = rootStore.activeRuntimeLayer;

  switch (activeScreen) {
    case 'battle':
      return <BattleScreen />;
    case 'dialogue':
      return <DialogueScreen />;
    case 'minigame':
      return <MiniGameScreen />;
    case 'city':
      return <CitySceneScreen />;
    case 'travelBoard':
      return <TravelBoardScreen />;
    case 'world':
      return <WorldScreen />;
    case 'home':
    case 'mainMenu':
    default:
      return <MainMenuScreen />;
  }
});
