import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { GameEffect, ScriptArgumentValue } from '@engine/types/effects';

export interface ScriptExecutionContext {
  rootStore: GameRootStore;
  scriptId: string;
  args: Record<string, ScriptArgumentValue>;
}

export type ScriptExecutionResult = void | GameEffect | GameEffect[];

export type ScriptHandler = (context: ScriptExecutionContext) => ScriptExecutionResult;

export class ScriptRegistry {
  private readonly handlers = new Map<string, ScriptHandler>();

  register(scriptId: string, handler: ScriptHandler) {
    this.handlers.set(scriptId, handler);

    return () => {
      this.handlers.delete(scriptId);
    };
  }

  has(scriptId: string) {
    return this.handlers.has(scriptId);
  }

  get(scriptId: string) {
    return this.handlers.get(scriptId);
  }

  execute(scriptId: string, context: ScriptExecutionContext) {
    const handler = this.handlers.get(scriptId);

    if (!handler) {
      return undefined;
    }

    return handler(context);
  }

  clear() {
    this.handlers.clear();
  }
}

