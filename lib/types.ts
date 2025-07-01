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
};

export type TriggerRow = {
  id: string;
  type: string;
  targetStepId: number | null;
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
