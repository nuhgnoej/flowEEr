export type TriggerType =
  | "at_time"
  | "after_step"
  | "delay_from_step"
  | "manual"
  | "immediate"
  | "after_all";

export type Trigger = {
  id: string;
  targetStepId: number | null;
  type: TriggerType;
  offset: number;
  time?: string;
};

export type Step = {
  id: number;
  name: string;
  triggers: Trigger[];
  repeat: string;
  alarm: boolean;
};
