export type BackgroundPromptFlavor =
  | 'cityScene'
  | 'travelBoard'
  | 'sceneMeta'
  | 'documentDefault'
  | 'sceneDefault'
  | 'nodeBeat';

export interface BackgroundWorkbenchEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  storyContext: string;
  backgroundId: string | null;
  contentFilePath: string;
  assetFieldPath: string;
  improvementHints: string[];
  promptFlavor: BackgroundPromptFlavor;
}

export type SceneAuthoringMode = 'sequence' | 'hub' | 'route';

export interface SceneAuthoringWorkbenchEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mode: SceneAuthoringMode;
  startNodeId: string;
  nodeCount: number;
  choiceCount: number;
  replayEnabled: boolean;
  isReplayScene: boolean;
  unlockSourceLabels: string[];
  contentFilePath: string;
  sceneFieldPath: string;
  metaFilePath?: string;
  improvementHints: string[];
}
