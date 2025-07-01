// components/StepEditor.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { StepEditorProps, Trigger } from "@/lib/types";
import TriggerEditor from "./TriggerEditor";

export default function StepEditor({
  step,
  index,
  allSteps,
  onChange,
  onDelete,
  onRemoveTrigger,
}: StepEditorProps) {
  const [triggerModalVisible, setTriggerModalVisible] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

  const handleAddTrigger = () => {
    const newTrigger: Trigger = {
      id: Date.now().toString(),
      type: "at_time",
      time: "07:00",
    };
    setEditingTrigger(newTrigger);
    setTriggerModalVisible(true);
  };

  const handleTriggerSave = (trigger: Trigger) => {
    const updatedTriggers = [...step.triggers];
    const index = updatedTriggers.findIndex((t) => t.id === trigger.id);
    if (index >= 0) {
      updatedTriggers[index] = trigger;
    } else {
      updatedTriggers.push(trigger);
    }
    onChange({ ...step, triggers: updatedTriggers });
    setTriggerModalVisible(false);
  };

  const handleEditTrigger = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setTriggerModalVisible(true);
  };

  return (
    <View style={styles.row}>
      <Text style={styles.cell}>{index + 1}</Text>

      <TextInput
        style={[styles.cell, styles.inputCell]}
        placeholder="스텝 이름"
        value={step.name}
        onChangeText={(text) => onChange({ ...step, name: text })}
      />

      <TouchableOpacity onPress={handleAddTrigger}>
        <Ionicons name="add-circle-outline" size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onDelete}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>

      {step.triggers.length > 0 && (
        <View style={styles.triggerList}>
          {step.triggers.map((t) => (
            <View key={t.id} style={styles.triggerRow}>
              {/* ✅ 트리거 클릭 시 수정 */}
              <TouchableOpacity
                style={{ flex: 4, flexDirection: "row" }}
                onPress={() => handleEditTrigger(t)}
              >
                <Text style={{ flex: 1 }}>{t.type}</Text>
                <Text style={{ flex: 1 }}>
                  대상:{" "}
                  {t.targetStepId
                    ? allSteps.find((s) => s.id === t.targetStepId)?.name ||
                      t.targetStepId
                    : "없음"}
                </Text>
                <Text style={{ flex: 1 }}>+{t.offset ?? 0}s</Text>
                <Text style={{ flex: 1 }}>{t.time ?? "-"}</Text>
              </TouchableOpacity>

              {/* 삭제 버튼 */}
              <TouchableOpacity onPress={() => onRemoveTrigger(t.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {editingTrigger && (
        <TriggerEditor
          visible={triggerModalVisible}
          trigger={editingTrigger}
          allSteps={allSteps}
          onChange={handleTriggerSave}
          onClose={() => setTriggerModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexWrap: "wrap",
  },
  cell: { flex: 1 },
  inputCell: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 4,
    marginHorizontal: 2,
  },
  triggerList: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    marginVertical: 4,
    padding: 6,
    borderRadius: 6,
  },
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 2,
  },
});
