export const HOURS_PER_DAY = 24 as const;
export const HOURS_PER_SEGMENT = 6 as const;

export type TimeSegment = 'dawn' | 'day' | 'evening' | 'night';

export interface TimeCost {
  hours?: number;
  segments?: number;
  days?: number;
  label?: string;
}

export interface TimeSnapshot {
  day: number;
  hour: number;
}

export interface AdvanceTimeOptions {
  reason?: string;
  applyDefaultConsequences?: boolean;
}

export function getTimeSegmentForHour(hour: number): TimeSegment {
  const normalizedHour = ((Math.floor(hour) % HOURS_PER_DAY) + HOURS_PER_DAY) % HOURS_PER_DAY;

  if (normalizedHour < 6) {
    return 'night';
  }

  if (normalizedHour < 12) {
    return 'dawn';
  }

  if (normalizedHour < 18) {
    return 'day';
  }

  return 'evening';
}

export function normalizeTimeCost(cost: TimeCost | undefined | null) {
  if (!cost) {
    return null;
  }

  const hours = Math.max(0, Math.floor(cost.hours ?? 0));
  const segments = Math.max(0, Math.floor(cost.segments ?? 0));
  const days = Math.max(0, Math.floor(cost.days ?? 0));

  if (hours <= 0 && segments <= 0 && days <= 0) {
    return null;
  }

  return {
    hours,
    segments,
    days,
    ...(cost.label ? { label: cost.label } : {}),
  };
}

export function getHoursFromTimeCost(cost: TimeCost | undefined | null) {
  const normalizedCost = normalizeTimeCost(cost);

  if (!normalizedCost) {
    return 0;
  }

  return (
    normalizedCost.hours +
    normalizedCost.segments * HOURS_PER_SEGMENT +
    normalizedCost.days * HOURS_PER_DAY
  );
}

export function formatTimeCost(cost: TimeCost | undefined | null) {
  const normalizedCost = normalizeTimeCost(cost);

  if (!normalizedCost) {
    return null;
  }

  if (normalizedCost.label) {
    return normalizedCost.label;
  }

  const parts: string[] = [];

  if (normalizedCost.days > 0) {
    parts.push(normalizedCost.days === 1 ? '1 day' : `${normalizedCost.days} days`);
  }

  if (normalizedCost.segments > 0) {
    parts.push(
      normalizedCost.segments === 1 ? '1 segment' : `${normalizedCost.segments} segments`,
    );
  }

  if (normalizedCost.hours > 0) {
    parts.push(normalizedCost.hours === 1 ? '1h' : `${normalizedCost.hours}h`);
  }

  return parts.join(' • ');
}
