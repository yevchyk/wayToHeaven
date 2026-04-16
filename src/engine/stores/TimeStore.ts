import { makeAutoObservable } from 'mobx';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import {
  getHoursFromTimeCost,
  getTimeSegmentForHour,
  HOURS_PER_DAY,
  HOURS_PER_SEGMENT,
  type AdvanceTimeOptions,
  type TimeCost,
  type TimeSegment,
  type TimeSnapshot,
} from '@engine/types/time';

const STORY_DAY_FLAG_ID = 'story.day';
const STORY_TIME_SEGMENT_FLAG_ID = 'story.timeSegment';

interface StoryFlagSyncOptions {
  syncFlags?: boolean;
}

export class TimeStore {
  readonly rootStore: GameRootStore;

  day = 1;
  hour = 8;

  private isMirroringStoryFlags = false;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get snapshot(): TimeSnapshot {
    return {
      day: this.day,
      hour: this.hour,
    };
  }

  get segment(): TimeSegment {
    return getTimeSegmentForHour(this.hour);
  }

  get segmentIndex() {
    return Math.floor(this.hour / HOURS_PER_SEGMENT);
  }

  get segmentLabel() {
    switch (this.segment) {
      case 'dawn':
        return 'Dawn';
      case 'day':
        return 'Day';
      case 'evening':
        return 'Evening';
      case 'night':
      default:
        return 'Night';
    }
  }

  get clockLabel() {
    return `${String(this.hour).padStart(2, '0')}:00`;
  }

  get isStoryFlagSyncSuppressed() {
    return this.isMirroringStoryFlags;
  }

  setTime(day: number, hour: number, options: StoryFlagSyncOptions = {}) {
    const safeDay = Math.max(1, Math.floor(day));
    const normalizedHour = ((Math.floor(hour) % HOURS_PER_DAY) + HOURS_PER_DAY) % HOURS_PER_DAY;

    this.day = safeDay;
    this.hour = normalizedHour;

    if (options.syncFlags !== false) {
      this.mirrorToStoryFlags();
    }
  }

  setStoryDay(day: number, options: StoryFlagSyncOptions = {}) {
    this.setTime(day, this.hour, options);
  }

  setStorySegment(segment: TimeSegment, options: StoryFlagSyncOptions = {}) {
    const hourBySegment: Record<TimeSegment, number> = {
      night: 0,
      dawn: 6,
      day: 12,
      evening: 18,
    };

    this.setTime(this.day, hourBySegment[segment], options);
  }

  advanceHours(hours: number, options: AdvanceTimeOptions = {}) {
    const normalizedHours = Math.max(0, Math.floor(hours));

    if (normalizedHours <= 0) {
      return 0;
    }

    const nextAbsoluteHour = this.absoluteHour + normalizedHours;

    this.day = Math.floor(nextAbsoluteHour / HOURS_PER_DAY) + 1;
    this.hour = nextAbsoluteHour % HOURS_PER_DAY;
    this.mirrorToStoryFlags();

    if (options.applyDefaultConsequences !== false) {
      this.applyBaseTimePressure(normalizedHours);
    }

    return normalizedHours;
  }

  advanceSegments(segments: number, options: AdvanceTimeOptions = {}) {
    return this.advanceHours(segments * HOURS_PER_SEGMENT, options);
  }

  advanceDays(days: number, options: AdvanceTimeOptions = {}) {
    return this.advanceHours(days * HOURS_PER_DAY, options);
  }

  advanceByCost(cost: TimeCost | undefined, options: AdvanceTimeOptions = {}) {
    const hours = getHoursFromTimeCost(cost);

    return hours > 0 ? this.advanceHours(hours, options) : 0;
  }

  restore(snapshot?: TimeSnapshot | null) {
    if (!snapshot) {
      this.reset();

      return;
    }

    this.setTime(snapshot.day ?? 1, snapshot.hour ?? 8);
  }

  reset() {
    this.setTime(1, 8);
  }

  handleStoryDayFlagChanged(day: number) {
    if (this.isMirroringStoryFlags) {
      return;
    }

    this.setStoryDay(day, { syncFlags: false });
  }

  handleStorySegmentFlagChanged(segment: string) {
    if (this.isMirroringStoryFlags) {
      return;
    }

    if (
      segment !== 'night' &&
      segment !== 'dawn' &&
      segment !== 'day' &&
      segment !== 'evening'
    ) {
      return;
    }

    this.setStorySegment(segment, { syncFlags: false });
  }

  private get absoluteHour() {
    return (this.day - 1) * HOURS_PER_DAY + this.hour;
  }

  private mirrorToStoryFlags() {
    this.isMirroringStoryFlags = true;

    try {
      this.rootStore.flags.setNumericFlag(STORY_DAY_FLAG_ID, this.day);
      this.rootStore.flags.setStringFlag(STORY_TIME_SEGMENT_FLAG_ID, this.segment);
    } finally {
      this.isMirroringStoryFlags = false;
    }
  }

  private applyBaseTimePressure(hours: number) {
    const hungerDelta = Math.max(1, Math.ceil(hours / HOURS_PER_SEGMENT));

    this.rootStore.meta.changeMeta('hunger', hungerDelta);
  }
}
