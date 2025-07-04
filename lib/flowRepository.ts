import { getDatabase } from "./db";
import { Flow, FlowRow, Step, StepRow, TriggerRow, TriggerType } from "./types";

/**
 * 플로우 목록 조회
 */
export async function getAllFlows() {
  const db = await getDatabase();
  return await db.getAllAsync(`SELECT * FROM flow ORDER BY id DESC`);
}

export function mapDbToFlow(
  flowRow: FlowRow,
  steps: (StepRow & { triggers: TriggerRow[] })[]
): Flow {
  return {
    id: flowRow.id,
    name: flowRow.name,
    description: flowRow.description,
    steps: steps.map((step) => ({
      id: step.id,
      name: step.name,
      triggers: step.triggers.map((t) => ({
        id: t.id,
        type: t.type as TriggerType,
        targetStepIds: t.target_step_ids
          ? (JSON.parse(t.target_step_ids) as number[])
          : [],
        offset: t.offset ?? undefined,
        time: t.time ?? undefined,
      })),
    })),
  };
}

/**
 * 플로우 상세 조회 (스텝 포함)
 */
export async function getFlowById(id: number): Promise<Flow> {
  const db = await getDatabase();

  const flowRow = await db.getFirstAsync<FlowRow>(
    `SELECT * FROM flow WHERE id = ?`,
    [id]
  );
  if (!flowRow) throw new Error("Flow not found");

  const stepRows = await db.getAllAsync<StepRow>(
    `SELECT * FROM step WHERE flow_id = ?`,
    [id]
  );

  const stepsWithTriggers = await Promise.all(
    stepRows.map(async (step) => {
      const triggers = await db.getAllAsync<TriggerRow>(
        `SELECT * FROM trigger WHERE step_id = ?`,
        [step.id]
      );
      return { ...step, triggers };
    })
  );

  return mapDbToFlow(flowRow, stepsWithTriggers);
}

/**
 * 플로우 저장
 */
export async function saveFlow(
  name: string,
  description: string,
  steps: Step[]
) {
  const db = await getDatabase();

  try {
    await db.runAsync("BEGIN TRANSACTION");

    const flowResult = await db.runAsync(
      `INSERT INTO flow (name, description) VALUES (?, ?)`,
      [name, description]
    );
    const flowId = flowResult.lastInsertRowId;

    for (const step of steps) {
      const stepResult = await db.runAsync(
        `INSERT INTO step (flow_id, name, description) VALUES (?, ?, ?)`,
        [flowId, step.name, step.description ?? ""]
      );
      const stepId = stepResult.lastInsertRowId;

      for (const trigger of step.triggers) {
        await db.runAsync(
          `INSERT INTO trigger (id, step_id, type, target_step_ids, offset, time)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            trigger.id,
            stepId,
            trigger.type,
            trigger.targetStepIds && trigger.targetStepIds.length > 0
              ? JSON.stringify(trigger.targetStepIds)
              : null,
            trigger.offset ?? null,
            trigger.time ?? null,
          ]
        );
      }
    }

    await db.runAsync("COMMIT");
  } catch (error) {
    await db.runAsync("ROLLBACK");
    throw error;
  }
}

/**
 * 플로우 삭제
 */
export async function deleteFlow(id: number) {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM flow WHERE id = ?`, [id]);
}

/**
 * 플로우 수정
 */
export async function updateFlow(
  id: number,
  name: string,
  description: string,
  steps: Step[]
) {
  const db = await getDatabase();

  try {
    await db.runAsync("BEGIN TRANSACTION");
    await db.runAsync(
      `UPDATE flow SET name = ?, description = ? WHERE id = ?`,
      [name, description, id]
    );
    // 기존 스텝 및 트리거 삭제
    await db.runAsync(`DELETE FROM step WHERE flow_id = ?`, [id]);
    // 새로운 스텝 저장
    await saveSteps(id, steps);

    await db.runAsync("COMMIT");
  } catch (error) {
    await db.runAsync("ROLLBACK");
    throw error;
  }
}

/**
 * 스텝 및 트리거 저장 (내부 함수)
 */
async function saveSteps(flowId: number, steps: Step[]) {
  const db = await getDatabase();

  for (const step of steps) {
    const result = await db.runAsync(
      `INSERT INTO step (flow_id, name) VALUES (?, ?)`,
      [flowId, step.name]
    );
    const stepId = result.lastInsertRowId as number;

    for (const trigger of step.triggers) {
      await db.runAsync(
        `INSERT INTO trigger (step_id, type, target_step_ids, offset, time, id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          stepId,
          trigger.type,
          trigger.targetStepIds && trigger.targetStepIds.length > 0
            ? JSON.stringify(trigger.targetStepIds)
            : null,
          trigger.offset ?? null,
          trigger.time ?? null,
          trigger.id,
        ]
      );
    }
  }
}
