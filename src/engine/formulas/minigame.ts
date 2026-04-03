import type { DanceMiniGameData, FishingMiniGameData } from '@engine/types/minigame';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number) {
  return clamp(value, 0, 1);
}

export function getFishingZoneWidth(data: FishingMiniGameData, skillLevel: number) {
  return clamp(data.zoneWidth + skillLevel * 0.018, 0.12, 0.46);
}

export function getFishingGainPerSecond(data: FishingMiniGameData, skillLevel: number) {
  return data.progressGainPerSecond * (1 + skillLevel * 0.06);
}

export function getFishingDecayPerSecond(data: FishingMiniGameData, skillLevel: number) {
  return data.progressDecayPerSecond * Math.max(0.55, 1 - skillLevel * 0.05);
}

export function getDanceHitWindowMs(data: DanceMiniGameData, skillLevel: number) {
  return Math.min(320, data.hitWindowMs + skillLevel * 10);
}

export function resolveDanceHitQuality(offsetMs: number, hitWindowMs: number) {
  const distance = Math.abs(offsetMs);

  if (distance > hitWindowMs) {
    return null;
  }

  return distance <= Math.max(48, hitWindowMs * 0.35) ? 'perfect' : 'good';
}
