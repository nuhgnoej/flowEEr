// lib/FlowEngine.ts
import { Flow, Step } from "./types";

export type StepStatus = "waiting" | "ready" | "in_progress" | "completed";

export interface StepState {
  id: number;
  name: string;
  status: StepStatus;
  reason?: string;
  readyTime?: Date;
  triggerInfo?: string;
  expectedTime?: Date;
  description?: string;
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
        expectedTime: undefined,
        description: step.description,
      });
    }
    this.calculateExpectedTimes();
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

  private getAllExpectedTimesExcept(excludeId: number): Date[] {
    return Array.from(this.stepStates.entries())
      .filter(([id, s]) => id !== excludeId && s.expectedTime)
      .map(([_, s]) => s.expectedTime!);
  }

  private calculateExpectedTimes() {
    function parseTimeStringToTodayDate(timeStr: string): Date | undefined {
      const [hourStr, minuteStr] = timeStr.split(":");
      const hour = Number(hourStr);
      const minute = Number(minuteStr);

      if (
        isNaN(hour) ||
        isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return undefined;
      }

      const now = new Date();
      now.setHours(hour, minute, 0, 0); // 시, 분, 초, 밀리초
      return now;
    }

    for (const step of this.flow.steps) {
      const state = this.stepStates.get(step.id);
      if (!state) continue;

      let expected: Date | undefined;

      for (const trigger of step.triggers) {
        if (trigger.type === "at_time" && trigger.time) {
          expected = parseTimeStringToTodayDate(trigger.time);
        }

        if (trigger.type === "delay") {
          const latest = this.getLatestExpectedTime(trigger.targetStepIds);
          if (latest && trigger.offset !== undefined) {
            expected = new Date(latest.getTime() + trigger.offset * 1000);
          }
        }

        if (trigger.type === "after") {
          const latest = this.getLatestExpectedTime(trigger.targetStepIds);
          if (latest) {
            expected = latest;
          }
        }

        // end: 전체 완료 후 실행 (후처리 로직이 필요한 경우 별도 구현)
        if (trigger.type === "end") {
          const allExpected = this.getAllExpectedTimesExcept(step.id);
          if (allExpected.length > 0) {
            const latest = new Date(
              Math.max(...allExpected.map((t) => t.getTime()))
            );
            expected = new Date(latest.getTime() + 1000); // 1초 버퍼
          }
        }
      }

      state.expectedTime = expected;
    }
  }

  private getLatestExpectedTime(targetIds?: number[]): Date | undefined {
    if (!targetIds?.length) return undefined;
    const times = targetIds
      .map((id) => this.stepStates.get(id)?.expectedTime)
      .filter((t): t is Date => !!t);
    if (!times.length) return undefined;
    return new Date(Math.max(...times.map((t) => t.getTime())));
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

      // ✅ end 스텝은 일반 dependency 평가에서 제외
      if (step.triggers.some((t) => t.type === "end")) continue;

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

    // ✅ 모든 non-end 스텝이 완료되었을 때만 end 스텝을 ready로
    const nonEndSteps = this.flow.steps.filter(
      (step) => !step.triggers.some((t) => t.type === "end")
    );

    const nonEndStepsCompleted =
      nonEndSteps.length > 0 &&
      nonEndSteps.every(
        (step) => this.stepStates.get(step.id)?.status === "completed"
      );

    if (nonEndStepsCompleted) {
      for (const step of this.flow.steps) {
        const current = this.stepStates.get(step.id);
        if (!current || current.status !== "waiting") continue;

        const hasEndTrigger = step.triggers.some((t) => t.type === "end");
        if (hasEndTrigger) {
          current.status = "ready";
          newlyReady.push(current);
        }
      }
    }

    this.calculateExpectedTimes();
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

  public refresh(flow: Flow) {
    this.flow = flow;
    this.stepStates.clear();
    this.initialize();
  }
}
