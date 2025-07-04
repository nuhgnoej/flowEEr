export type FlowRow = {
  id: number;
  name: string;
  description: string;
};

export type StepRow = {
  id: number;
  name: string;
  description: string;
  flow_id: number;
  position: number;
};

export type TriggerRow = {
  id: string;
  type: string;
  target_step_ids: string | null;
  offset: number | null;
  time: string | null;
  step_id: number;
};

export type Flow = {
  id: number;
  name: string;
  description?: string;
  steps: Step[];
};

export type Step = {
  id: number;
  name: string;
  description?: string;
  triggers: Trigger[];
  representativeTime?: string;
  position: number;
};

export type Trigger = {
  id: string;
  type: TriggerType;
  targetStepIds?: number[];
  offset?: number;
  time?: string;
};

export type TriggerType =
  | "at_time"
  | "after"
  | "delay"
  | "end";

export const TRIGGER_TYPES: TriggerType[] = [
  "at_time",
  "after",
  "delay",
  "end",
];

export const TRIGGER_TYPE_LABELS: Record<string, string> = {
  at_time: "특정시간",
  delay: "오프셋",
  after: "특정스텝 후",
  end: "모든 스텝 완료",
};

export interface FlowEditorProps {
  initialFlow?: {
    name: string;
    description?: string;
    steps: Step[];
  };
  onSave: (name: string, description: string, steps: Step[]) => void;
}

export interface StepEditorProps {
  step: Step;
  index: number;
  allSteps: Step[];
  onChange: (step: Step) => void;
  onDelete: () => void;
  onAddTrigger: () => void;
  onRemoveTrigger: (triggerId: string) => void;
}

export interface TriggerEditorProps {
  visible: boolean;
  onClose: () => void;
  trigger: Trigger;
  allSteps: Step[];
  onChange: (updated: Trigger) => void;
}
