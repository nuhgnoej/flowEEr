export type Step = {
  id: number;
  name: string;
  description?: string;
  triggers: Trigger[];
  representativeTime?: string;
};

export type Trigger = {
  id: string;
  type: TriggerType;
  targetStepId?: number | null;
  offset?: number;
  time?: string;
};

export type TriggerType =
  | "at_time"
  | "after_step"
  | "delay_from_step"
  | "manual"
  | "immediate"
  | "after_all";

export type StepRow = {
  id: number;
  flow_id: number;
  name: string;
  description: string;
};
