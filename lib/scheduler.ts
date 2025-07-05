// lib/scheduler.ts
import * as Notifications from "expo-notifications";
import { Flow, Step } from "./types";
import {
  NotificationTriggerInput,
  SchedulableTriggerInputTypes,
} from "expo-notifications";
import { StepState } from "./FlowEngine";

export type StepStatus = "waiting" | "ready" | "in_progress" | "completed";

export default class FlowScheduler {
  private scheduledSteps = new Set<number>();

  constructor(private flow: Flow) {}

  async start() {
    for (const step of this.flow.steps) {
      for (const trigger of step.triggers) {
        if (trigger.type === "at_time" && trigger.time) {
          const date = this.parseTime(trigger.time);
          await this.scheduleNotification(step, date);
        }
      }
    }
  }

  async completeStep(stepId: number, statuses: Record<number, StepStatus>) {
    for (const step of this.flow.steps) {
      if (
        this.scheduledSteps.has(step.id) ||
        statuses[step.id] === "completed"
      ) {
        continue;
      }

      for (const trigger of step.triggers) {
        if (
          trigger.type === "after" &&
          trigger.targetStepIds?.includes(stepId)
        ) {
          await this.scheduleNotification(step);
          break;
        }

        if (
          trigger.type === "delay" &&
          trigger.targetStepIds?.includes(stepId)
        ) {
          await this.scheduleNotification(step, undefined, trigger.offset ?? 0);
          break;
        }

        if (
          trigger.type === "end" &&
          this.flow.steps.every((s) =>
            s.id === step.id ? true : statuses[s.id] === "completed"
          )
        ) {
          await this.scheduleNotification(step);
          break;
        }
      }
    }
  }

  private parseTime(time: string) {
    const [h, m] = time.split(":").map((v) => parseInt(v, 10) || 0);
    const now = new Date();
    let date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h,
      m,
      0,
      0
    );
    if (date.getTime() <= now.getTime()) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  public async scheduleStep(stepState: StepState) {
    const originalStep = this.flow.steps.find((s) => s.id === stepState.id);
    if (!originalStep) return;

    const date = stepState.readyTime;
    await this.scheduleNotification(originalStep, date);
  }

  private async scheduleNotification(
    step: Step,
    date?: Date,
    seconds?: number
  ) {
    let trigger: NotificationTriggerInput;

    if (date) {
      trigger = {
        type: SchedulableTriggerInputTypes.DATE,
        date,
      };
    } else {
      trigger = {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: seconds ?? 0,
      };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: step.name,
        body: step.description || "Step triggered",
      },
      trigger,
    });

    this.scheduledSteps.add(step.id);
    return identifier;
  }
}
