// lib/FlowEngine.ts
import { Flow, Step, Trigger } from "./types";

export type StepStatus = "waiting" | "ready" | "in_progress" | "completed";

export interface StepState {
  id: number;
  name: string;
  status: StepStatus;
  reason?: string;
  readyTime?: Date;
  triggerInfo?: string;
}

export default class FlowEngine {
  private stepStates = new Map<number, StepState>();

  constructor(private flow: Flow) {
    this.initialize();
  }

  private initialize() {
    for (const step of this.flow.steps) {
      const status = this.initialStatus(step);
      this.stepStates.set(step.id, {
        id: step.id,
        name: step.name,
        status,
        triggerInfo: this.describeTriggers(step),
      });
    }
  }

  private initialStatus(step: Step): StepStatus {
    const hasAtTime = step.triggers.some((t) => t.type === "at_time");
    const hasDependency = step.triggers.some(
      (t) => t.type === "after" || t.type === "delay"
    );

    if (hasAtTime || step.triggers.length === 0) return "ready";
    if (hasDependency) return "waiting";
    return "waiting";
  }

  private describeTriggers(step: Step): string {
    return step.triggers.map((t) => t.type).join(", ");
  }

  public getStepStates(): StepState[] {
    return Array.from(this.stepStates.values());
  }

  public getStepState(stepId: number): StepState | undefined {
    return this.stepStates.get(stepId);
  }

  public completeStep(stepId: number): StepState[] {
    const completed = this.stepStates.get(stepId);
    if (!completed) return [];
    completed.status = "completed";

    const newlyReady: StepState[] = [];

    for (const step of this.flow.steps) {
      const current = this.stepStates.get(step.id);
      if (!current || current.status !== "waiting") continue;

      const dependencyTriggers = step.triggers.filter(
        (t) => t.type === "after" || t.type === "delay"
      );

      const allDepsCompleted = dependencyTriggers.every((t) =>
        (t.targetStepIds || []).every(
          (targetId) => this.stepStates.get(targetId)?.status === "completed"
        )
      );

      if (allDepsCompleted) {
        current.status = "ready";
        newlyReady.push(current);
      }
    }

    return newlyReady;
  }

  public startStep(stepId: number) {
    const current = this.stepStates.get(stepId);
    if (current && current.status === "ready") {
      current.status = "in_progress";
    }
  }

  public getUIState() {
    const result = {
      ready: [] as StepState[],
      waiting: [] as StepState[],
      in_progress: [] as StepState[],
      completed: [] as StepState[],
    };

    for (const step of this.stepStates.values()) {
      result[step.status].push(step);
    }

    return result;
  }
}
