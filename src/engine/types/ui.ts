export type ScreenId =
  | 'home'
  | 'mainMenu'
  | 'city'
  | 'world'
  | 'dialogue'
  | 'battle'
  | 'travelBoard'
  | (string & {});

export type ModalId =
  | 'character-menu'
  | 'inventory'
  | 'party'
  | 'unit-details'
  | 'backlog'
  | 'preferences'
  | (string & {});

export type OverlayId = 'loading' | 'battle-hud' | (string & {});

export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export interface ActiveModal {
  id: ModalId;
  payload?: Record<string, unknown>;
}

export interface UINotification {
  id: string;
  message: string;
  tone: NotificationTone;
}
