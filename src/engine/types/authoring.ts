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
