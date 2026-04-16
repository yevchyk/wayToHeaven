import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';
import type { SceneMeta } from '@engine/types/narrative';
import type { ContentGraphValidationIssue } from '@engine/validators/ContentGraphValidator';
import { buildSceneReplayUnlockReferenceIndex } from '@engine/utils/sceneReplayReferences';

export type SceneAuthoringValidationIssueCode =
  | 'missingSceneFlowLink'
  | 'missingGeneratedSceneForMeta'
  | 'missingSceneMetaForReplayScene'
  | 'replayUnlockTargetsMissingScene'
  | 'replayUnlockTargetsNonReplayScene'
  | 'replaySceneNotReplayEnabled'
  | 'orphanReplayScene';

export class SceneAuthoringValidator {
  private readonly sceneRegistry: Record<string, SceneMeta>;
  private readonly sceneGenerationRegistry: Record<string, SceneGenerationDocument>;

  constructor(
    sceneRegistry: Record<string, SceneMeta>,
    sceneGenerationRegistry: Record<string, SceneGenerationDocument>,
  ) {
    this.sceneRegistry = sceneRegistry;
    this.sceneGenerationRegistry = sceneGenerationRegistry;
  }

  validate() {
    const issues: ContentGraphValidationIssue[] = [];
    const documents = Object.values(this.sceneGenerationRegistry);
    const authoredScenes = new Map<
      string,
      { documentId: string; title: string; replayEnabled: boolean; unlockOnStart: boolean }
    >();

    documents.forEach((document) => {
      Object.values(document.scenes).forEach((scene) => {
        authoredScenes.set(scene.id, {
          documentId: document.id,
          title: scene.title ?? scene.id,
          replayEnabled: scene.replay?.enabled === true,
          unlockOnStart: scene.replay?.unlockOnStart === true,
        });
      });
    });

    const replayUnlockReferences = buildSceneReplayUnlockReferenceIndex(documents);

    Object.values(this.sceneRegistry).forEach((sceneMeta) => {
      if (!sceneMeta.mainSceneFlowId) {
        issues.push({
          sourceType: 'sceneAuthoring',
          sourceId: sceneMeta.id,
          code: 'missingSceneFlowLink',
          message: `Scene meta "${sceneMeta.id}" must provide mainSceneFlowId so runtime and replay tooling can resolve it.`,
          path: 'mainSceneFlowId',
        });

        return;
      }

      if (!authoredScenes.has(sceneMeta.mainSceneFlowId)) {
        issues.push({
          sourceType: 'sceneAuthoring',
          sourceId: sceneMeta.id,
          code: 'missingGeneratedSceneForMeta',
          message: `Scene meta "${sceneMeta.id}" points to missing authored scene "${sceneMeta.mainSceneFlowId}".`,
          path: 'mainSceneFlowId',
          targetId: sceneMeta.mainSceneFlowId,
        });
      }
    });

    authoredScenes.forEach((scene, sceneId) => {
      const sceneMeta = Object.values(this.sceneRegistry).find(
        (entry) => entry.mainSceneFlowId === sceneId,
      );
      const replayUnlockRefs = replayUnlockReferences.get(sceneId) ?? [];
      const looksLikeReplayScene = sceneId.includes('/replay/') || sceneId.endsWith('/replay');

      if (!sceneMeta && scene.replayEnabled) {
        issues.push({
          sourceType: 'sceneAuthoring',
          sourceId: sceneId,
          code: 'missingSceneMetaForReplayScene',
          message: `Replay-enabled scene "${sceneId}" is missing SceneMeta, so library/codex/replay surfaces cannot describe it.`,
          path: `${scene.documentId}.scenes.${sceneId}`,
          targetId: scene.documentId,
        });
      }

      if (looksLikeReplayScene && !scene.replayEnabled) {
        issues.push({
          sourceType: 'sceneAuthoring',
          sourceId: sceneId,
          code: 'replaySceneNotReplayEnabled',
          message: `Scene "${sceneId}" looks like a replay scene but replay.enabled is not set.`,
          path: `${scene.documentId}.scenes.${sceneId}.replay`,
        });
      }

      if (looksLikeReplayScene && scene.replayEnabled && !scene.unlockOnStart && replayUnlockRefs.length === 0) {
        issues.push({
          sourceType: 'sceneAuthoring',
          sourceId: sceneId,
          code: 'orphanReplayScene',
          message: `Replay scene "${sceneId}" has no unlockSceneReplay source and will stay unreachable in the archive.`,
          path: `${scene.documentId}.scenes.${sceneId}.replay`,
        });
      }
    });

    replayUnlockReferences.forEach((references, targetSceneId) => {
      const targetScene = authoredScenes.get(targetSceneId);

      if (!targetScene) {
        references.forEach((reference) => {
          issues.push({
            sourceType: 'sceneAuthoring',
            sourceId: reference.documentId,
            code: 'replayUnlockTargetsMissingScene',
            message: `Replay unlock in "${reference.documentId}" points to missing scene "${targetSceneId}".`,
            path: reference.path,
            targetId: targetSceneId,
          });
        });

        return;
      }

      if (!targetScene.replayEnabled) {
        references.forEach((reference) => {
          issues.push({
            sourceType: 'sceneAuthoring',
            sourceId: reference.documentId,
            code: 'replayUnlockTargetsNonReplayScene',
            message: `Replay unlock in "${reference.documentId}" points to scene "${targetSceneId}" that is not replay-enabled.`,
            path: reference.path,
            targetId: targetSceneId,
          });
        });
      }
    });

    return issues;
  }

  assertValid() {
    const issues = this.validate();

    if (issues.length === 0) {
      return;
    }

    const summary = issues.map((issue) => `[${issue.sourceId}] ${issue.message}`).join(' ');

    throw new Error(`Invalid scene authoring graph. ${summary}`);
  }
}
