import type { GameEffect } from '@engine/types/effects';
import type { TimeCost } from '@engine/types/time';
import type { ScreenId } from '@engine/types/ui';

export type TravelNodeType =
  | 'battle'
  | 'loot'
  | 'empty'
  | 'trap'
  | 'question'
  | 'heal'
  | 'rest'
  | 'story'
  | 'exit'
  | 'eliteBattle'
  | 'shop'
  | 'boss';

export type TravelBoardPhase =
  | 'idle'
  | 'awaitingRoll'
  | 'moving'
  | 'awaitingDirection'
  | 'resolvingNode'
  | 'completed';

export type TravelLogEntryType = 'system' | 'roll' | 'movement' | 'encounter' | 'scout';

export interface TravelNode {
  id: string;
  x: number;
  y: number;
  type: TravelNodeType;
  nextNodeIds: string[];
  title?: string;
  description?: string;
  hidden?: boolean;
  oneTime?: boolean;
  tags?: string[];
  encounterRefId?: string;
  eventRefId?: string;
  battleTemplateId?: string;
  dialogueId?: string;
  itemId?: string;
  itemQuantity?: number;
  onResolveEffects?: GameEffect[];
}

export interface TravelBoardData {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, TravelNode>;
  chapterId?: string;
  description?: string;
  backgroundId?: string;
  scoutCharges?: number;
  scoutDepth?: number;
  stepTimeCost?: TimeCost;
}

export interface TravelLogEntry {
  id: string;
  type: TravelLogEntryType;
  message: string;
  nodeId?: string;
}

export interface TravelBoardRuntime {
  boardId: string;
  phase: TravelBoardPhase;
  currentNodeId: string;
  revealedNodeIds: string[];
  visitedNodeIds: string[];
  resolvedNodeIds: string[];
  remainingSteps: number;
  lastRoll: number | null;
  scoutCharges: number;
  scoutDepth: number;
  eventLog: TravelLogEntry[];
  returnScreenId: ScreenId | null;
}

export interface TravelEncounterResolution {
  message: string;
  completed?: boolean;
}
