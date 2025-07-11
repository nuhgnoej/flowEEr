import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Step, Trigger, TRIGGER_TYPE_LABELS, TriggerType } from "@/lib/types";
import TriggerEditor from "./TriggerEditor";
import uuid from "react-native-uuid";

interface Props {
  visible: boolean;
  step: Step;
  allSteps: Step[];
  onSave: (step: Step) => void;
  onClose: () => void;
}

export default function StepEditorModal({
  visible,
  step,
  allSteps,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(step?.name || "");
  const [triggers, setTriggers] = useState(step?.triggers || []);
  const [triggerModalVisible, setTriggerModalVisible] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [description, setDescription] = useState(step?.description || "");

  useEffect(() => {
    setName(step?.name || "");
    setTriggers(step?.triggers || []);
    setDescription(step?.description || "");
  }, [step]);

  const handleAddTrigger = () => {
    const id = uuid.v4();
    const newTrigger: Trigger = {
      id,
      type: "at_time",
      time: "07:00",
      targetStepIds: [],
    };
    setEditingTrigger(newTrigger);
    setTriggerModalVisible(true);
  };

  const handleEditTrigger = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setTriggerModalVisible(true);
  };

  const handleSaveTrigger = (updatedTrigger: Trigger) => {
    setTriggers((prev) => {
      const index = prev.findIndex((t) => t.id === updatedTrigger.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updatedTrigger;
        return copy;
      }
      return [...prev, updatedTrigger];
    });
    setTriggerModalVisible(false);
  };

  const handleRemoveTrigger = (id: string) => {
    setTriggers(triggers.filter((t) => t.id !== id));
  };

  const handleSaveStep = () => {
    onSave({
      ...step,
      name: name.trim(),
      triggers,
      description: description.trim(),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        {/* 바깥 눌렀을 때 닫히는 투명 레이어 */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.modal}>
          <Text style={styles.title}>스텝 편집</Text>

          <Text style={styles.label}>스텝 이름</Text>
          <TextInput
            style={styles.input}
            placeholder="스텝 이름"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.description}>설명</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="스텝에 대한 설명을 입력하세요"
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              minHeight: 60,
              textAlignVertical: "top",
            }}
          />

          {/* 트리거 목록 */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>트리거 목록</Text>

            {triggers.length === 0 && (
              <Text style={{ color: "#888", marginVertical: 4 }}>
                트리거가 없습니다.
              </Text>
            )}

            {triggers.map((t) => (
              <View key={t.id} style={styles.triggerRow}>
                <TouchableOpacity
                  style={{ flex: 4, flexDirection: "row" }}
                  onPress={() => handleEditTrigger(t)}
                >
                  <Text style={{ flex: 1 }}>
                    {TRIGGER_TYPE_LABELS[t.type] || t.type}
                  </Text>
                  <Text style={{ flex: 1 }}>
                    대상:{" "}
                    {t.targetStepIds && t.targetStepIds.length > 0
                      ? t.targetStepIds
                          .map(
                            (id) =>
                              allSteps.find((s) => s.id === id)?.name || id
                          )
                          .join(", ")
                      : "없음"}
                  </Text>
                  <Text style={{ flex: 1 }}>+{t.offset ?? 0}s</Text>
                  <Text style={{ flex: 1 }}>{t.time ?? "-"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleRemoveTrigger(t.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleAddTrigger}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ 트리거 추가</Text>
            </TouchableOpacity>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <Button title="저장" onPress={handleSaveStep} />
            <Button title="닫기" onPress={onClose} />
          </View>
        </View>

        {/* Trigger Editor */}
        {editingTrigger && (
          <TriggerEditor
            visible={triggerModalVisible}
            trigger={editingTrigger}
            allSteps={allSteps}
            onChange={handleSaveTrigger}
            onClose={() => setTriggerModalVisible(false)}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    width: "90%",
    borderRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
  },
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 4,
  },
  addButton: {
    marginTop: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#007bff",
    fontWeight: "600",
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  description: {
    marginTop: 12,
    marginBottom: 4,
  },
});
