import { fireEvent, screen } from '@testing-library/react';

import { GameRootStore } from '@engine/stores/GameRootStore';
import { getCityActionToneStyle } from '@ui/components/city/cityActionToneStyles';
import { renderWithStore } from '@test/renderWithStore';

describe('CitySceneScreen', () => {
  it('renders the heroine panel, central actions, and bottom route strip without developer descriptions', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    renderWithStore(rootStore);

    expect(screen.getByText(/Ashen Reach/i)).toBeInTheDocument();
    expect(screen.getByText('Мірелла')).toBeInTheDocument();
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('Mana')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Temple Exit Plaza' }).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('City background Temple Exit Plaza')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Market Lane' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: 'Silt Bar' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: 'Shrine Court' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Піти на ринок' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Покинути місто через північну браму' })).toBeInTheDocument();
    expect(screen.queryByText('Звичний guard check і кілька зайвих запитань про ваші наміри.')).not.toBeInTheDocument();
    expect(screen.queryByText('Тісні ряди лавок, де за харчі сперечаються голосніше, ніж моляться.')).not.toBeInTheDocument();
  }, 15_000);

  it('shows hover preview for dialogue actions on the right panel', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    renderWithStore(rootStore);

    expect(screen.queryByText('Gate Guard')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Поговорити з охоронцем біля брами' }));

    expect(screen.getByLabelText('City action preview')).toBeInTheDocument();
    expect(screen.getByText('Gate Guard')).toBeInTheDocument();
  });

  it('maps action tones into city button styling metadata', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    renderWithStore(rootStore);

    const travelButton = screen.getByTestId('city-action-leave-city');
    const toneStyle = getCityActionToneStyle('travel');

    expect(travelButton).toHaveAttribute('data-tone', 'travel');
    expect(toneStyle.accent).toContain('201, 164, 92');
  });

  it('supports scene transitions from city actions', () => {
    const rootStore = new GameRootStore();

    rootStore.citySceneController.startScene('chapter-1/city/temple-exit');
    renderWithStore(rootStore);

    fireEvent.click(screen.getByRole('button', { name: 'Піти на ринок' }));

    expect(screen.getAllByRole('heading', { name: 'Market Lane' }).length).toBeGreaterThan(0);
  });
});
