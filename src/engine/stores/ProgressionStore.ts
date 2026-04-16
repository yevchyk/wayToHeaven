import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  BattleRewardExperienceSummary,
  BattleRewardLootSummary,
  BattleRewardSummary,
  LevelUpChoice,
  PendingLevelUpReward,
  ProgressionSnapshot,
} from '@engine/types/progression';

export class ProgressionStore {
  readonly rootStore: GameRootStore;

  pendingBattleSummary: BattleRewardSummary | null = null;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get hasPendingBattleSummary() {
    return this.pendingBattleSummary !== null;
  }

  get hasUnresolvedLevelUps() {
    return (this.pendingBattleSummary?.levelUps ?? []).some((entry) => entry.resolvedChoiceId === null);
  }

  get snapshot(): ProgressionSnapshot {
    return {
      pendingBattleSummary: this.pendingBattleSummary
        ? JSON.parse(JSON.stringify(this.pendingBattleSummary))
        : null,
    };
  }

  getRequiredExperienceForNextLevel(level: number) {
    return 10 + Math.max(0, level - 1) * 5;
  }

  awardBattleRewards(input: {
    battleId: string;
    battleTitle: string;
    recipientUnitIds: string[];
    experience: number;
    loot: { itemId: string; quantity: number }[];
  }) {
    const lootSummary: BattleRewardLootSummary[] = input.loot.flatMap((entry) => {
      const item = this.rootStore.getItemById(entry.itemId);

      return item
        ? [
            {
              ...entry,
              itemName: item.name,
            },
          ]
        : [];
    });
    const experienceSummary: BattleRewardExperienceSummary[] = [];
    const levelUps: PendingLevelUpReward[] = [];

    input.recipientUnitIds.forEach((unitId) => {
      const unit = this.rootStore.party.getUnit(unitId);

      if (!unit || input.experience <= 0) {
        return;
      }

      const levelBefore = unit.level;

      this.rootStore.party.addExperience(unitId, input.experience);

      let currentUnit = this.rootStore.party.getUnit(unitId);
      let currentExperience = currentUnit?.experience ?? 0;
      let currentLevel = currentUnit?.level ?? levelBefore;

      while (currentExperience >= this.getRequiredExperienceForNextLevel(currentLevel)) {
        currentExperience -= this.getRequiredExperienceForNextLevel(currentLevel);
        currentLevel += 1;
        this.rootStore.party.setExperience(unitId, currentExperience);
        this.rootStore.party.setLevel(unitId, currentLevel);
        currentUnit = this.rootStore.party.getUnit(unitId);

        if (!currentUnit) {
          break;
        }

        levelUps.push({
          id: `${input.battleId}:${unitId}:level-${currentLevel}`,
          unitId,
          unitName: currentUnit.name,
          nextLevel: currentLevel,
          choices: this.buildLevelUpChoices(currentUnit.skillIds),
          resolvedChoiceId: null,
        });
      }

      const levelAfter = this.rootStore.party.getUnit(unitId)?.level ?? currentLevel;

      experienceSummary.push({
        unitId,
        unitName: unit.name,
        amount: input.experience,
        levelBefore,
        levelAfter,
      });
    });

    if (lootSummary.length === 0 && experienceSummary.length === 0 && levelUps.length === 0) {
      this.pendingBattleSummary = null;

      return null;
    }

    const summary: BattleRewardSummary = {
      battleId: input.battleId,
      battleTitle: input.battleTitle,
      loot: lootSummary,
      experience: experienceSummary,
      levelUps,
    };

    this.pendingBattleSummary = summary;

    return summary;
  }

  applyLevelUpChoice(levelUpId: string, choiceId: string) {
    const summary = this.pendingBattleSummary;

    if (!summary) {
      return false;
    }

    const levelUpEntry = summary.levelUps.find((entry) => entry.id === levelUpId);

    if (!levelUpEntry || levelUpEntry.resolvedChoiceId) {
      return false;
    }

    const choice = levelUpEntry.choices.find((entry) => entry.id === choiceId);

    if (!choice) {
      return false;
    }

    if (choice.type === 'skill' && choice.skillId) {
      this.rootStore.party.trainSkill(levelUpEntry.unitId, choice.skillId, 2);
    }

    if (choice.type === 'hp') {
      this.rootStore.party.increaseMaxResource(levelUpEntry.unitId, 'hp', 5);
    }

    if (choice.type === 'mana') {
      this.rootStore.party.increaseMaxResource(levelUpEntry.unitId, 'mana', 5);
    }

    this.pendingBattleSummary = {
      ...summary,
      levelUps: summary.levelUps.map((entry) =>
        entry.id === levelUpId
          ? {
              ...entry,
              resolvedChoiceId: choiceId,
            }
          : entry,
      ),
    };

    return true;
  }

  clearBattleSummary() {
    this.pendingBattleSummary = null;
  }

  restore(snapshot?: ProgressionSnapshot) {
    this.pendingBattleSummary = snapshot?.pendingBattleSummary
      ? JSON.parse(JSON.stringify(snapshot.pendingBattleSummary))
      : null;
  }

  reset() {
    this.pendingBattleSummary = null;
  }

  private buildLevelUpChoices(skillIds: string[]): LevelUpChoice[] {
    const skillChoices = skillIds.map((skillId) => {
      const skill = this.rootStore.getSkillById(skillId);

      return {
        id: `skill:${skillId}`,
        type: 'skill' as const,
        label: `Train ${skill?.name ?? skillId}`,
        description: 'Increase this skill by 2 ranks for future battles.',
        skillId,
      };
    });

    return [
      ...skillChoices,
      {
        id: 'hp',
        type: 'hp',
        label: '+5 Max HP',
        description: 'Thicken your endurance and start the next fight harder to break.',
      },
      {
        id: 'mana',
        type: 'mana',
        label: '+5 Max Mana',
        description: 'Expand the reserve that feeds spells, rites and pressure tools.',
      },
    ];
  }
}
