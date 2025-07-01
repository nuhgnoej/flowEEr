import { getDatabase } from "./db";
import { Step, StepRow } from "./types";

/**
 * 플로우 목록 조회
 */
export async function getAllFlows() {
  const db = await getDatabase();
  return await db.getAllAsync(`SELECT * FROM flow ORDER BY id DESC`);
}

/**
 * 플로우 상세 조회 (스텝 포함)
 */
export async function getFlowById(id: number) {
  const db = await getDatabase();

  const flow = await db.getFirstAsync(`SELECT * FROM flow WHERE id = ?`, [id]);
  if (!flow) throw new Error("Flow not found");

  const steps: StepRow[] = await db.getAllAsync(
    `SELECT * FROM step WHERE flow_id = ?`,
    [id]
  );

  const stepsWithTriggers = await Promise.all(
    steps.map(async (step) => {
      const triggers = await db.getAllAsync(
        `SELECT * FROM trigger WHERE step_id = ?`,
        [step.id]
      );
      return { ...step, triggers };
    })
  );

  return { flow, steps: stepsWithTriggers };
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
          `INSERT INTO trigger (id, step_id, type, target_step_id, offset, time) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            trigger.id,
            stepId,
            trigger.type,
            trigger.targetStepId ?? null,
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
