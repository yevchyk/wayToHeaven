import type { Meta, StoryObj } from '@storybook/react-vite';

import { chapter1CharacterPromptWorkbenchData } from '../src/content/storybook/characterProfiles/chapter1CharacterPromptWorkbench';
import { CharacterPromptWorkbench } from '../src/ui/components/character-authoring/CharacterPromptWorkbench';

const meta = {
  title: 'Narrative Portrait/Character Prompt Composer',
  component: CharacterPromptWorkbench,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CharacterPromptWorkbench>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Chapter1PromptComposer: Story = {
  args: {
    data: chapter1CharacterPromptWorkbenchData,
  },
};
