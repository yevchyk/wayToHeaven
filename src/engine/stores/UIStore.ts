import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { ActiveModal, NotificationTone, OverlayId, ScreenId, UINotification } from '@engine/types/ui';

export class UIStore {
  readonly rootStore: GameRootStore;

  activeScreen: ScreenId = 'home';
  activeModal: ActiveModal | null = null;
  overlays: OverlayId[] = [];
  notifications: UINotification[] = [];

  private notificationSequence = 0;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get isModalOpen() {
    return this.activeModal !== null;
  }

  get hasNotifications() {
    return this.notifications.length > 0;
  }

  setScreen(screenId: ScreenId) {
    this.activeScreen = screenId;
  }

  openScreen(screenId: ScreenId) {
    this.setScreen(screenId);
  }

  openModal(modalId: ActiveModal['id'], payload?: Record<string, unknown>) {
    this.activeModal = payload ? { id: modalId, payload } : { id: modalId };
  }

  closeModal() {
    this.activeModal = null;
  }

  showOverlay(overlayId: OverlayId) {
    if (!this.overlays.includes(overlayId)) {
      this.overlays.push(overlayId);
    }
  }

  hideOverlay(overlayId: OverlayId) {
    this.overlays = this.overlays.filter((entry) => entry !== overlayId);
  }

  notify(message: string, tone: NotificationTone = 'info') {
    this.notificationSequence += 1;

    const notificationId = `notification-${this.notificationSequence}`;

    this.notifications.push({
      id: notificationId,
      message,
      tone,
    });

    return notificationId;
  }

  dismissNotification(notificationId: string) {
    this.notifications = this.notifications.filter((entry) => entry.id !== notificationId);
  }

  reset() {
    this.activeScreen = 'home';
    this.activeModal = null;
    this.overlays = [];
    this.notifications = [];
    this.notificationSequence = 0;
  }
}
