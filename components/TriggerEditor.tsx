import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Pressable,
} from "react-native";
import React from "react";
import { Step, Trigger, TriggerEditorProps, TriggerType } from "@/lib/types";

const triggerTypes: TriggerType[] = [
  "at_time",
  "after_step",
  "delay_from_step",
  "manual",
  "immediate",
  "after_all",
];

export default function TriggerEditor({
  visible,
  onClose,
  trigger,
  allSteps,
  onChange,
}: TriggerEditorProps) {
  const update = (field: keyof Trigger, value: any) => {
    onChange({ ...trigger, [field]: value });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>트리거 설정</Text>

          {/* 타입 선택 */}
          <Text style={styles.label}>트리거 타입</Text>
          {triggerTypes.map((type) => (
            <Pressable
              key={type}
              style={[
                styles.typeButton,
                trigger.type === type && styles.typeButtonActive,
              ]}
              onPress={() => update("type", type)}
            >
              <Text
                style={
                  trigger.type === type
                    ? styles.typeButtonTextActive
                    : styles.typeButtonText
                }
              >
                {type}
              </Text>
            </Pressable>
          ))}

          {/* 타겟 스텝 선택 */}
          {(trigger.type === "after_step" ||
            trigger.type === "delay_from_step" ||
            trigger.type === "immediate") && (
            <>
              <Text style={styles.label}>타겟 스텝</Text>
              {allSteps.length === 0 && (
                <Text style={{ color: "#888" }}>선택할 스텝이 없습니다.</Text>
              )}
              {allSteps.map((step) => (
                <Pressable
                  key={step.id}
                  style={[
                    styles.typeButton,
                    trigger.targetStepId === step.id && styles.typeButtonActive,
                  ]}
                  onPress={() => update("targetStepId", step.id)}
                >
                  <Text
                    style={
                      trigger.targetStepId === step.id
                        ? styles.typeButtonTextActive
                        : styles.typeButtonText
                    }
                  >
                    {step.name}
                  </Text>
                </Pressable>
              ))}
            </>
          )}

          {/* 오프셋 */}
          {["after_step", "delay_from_step", "immediate"].includes(
            trigger.type
          ) && (
            <>
              <Text style={styles.label}>오프셋 (초)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(trigger.offset ?? 0)}
                onChangeText={(text) => update("offset", parseInt(text) || 0)}
              />
            </>
          )}

          {/* 시간 설정 */}
          {trigger.type === "at_time" && (
            <>
              <Text style={styles.label}>시간 (HH:mm)</Text>
              <TextInput
                style={styles.input}
                value={trigger.time ?? ""}
                placeholder="예: 07:00"
                onChangeText={(text) => update("time", text)}
              />
            </>
          )}

          <View style={styles.buttonRow}>
            <Button title="저장" onPress={onClose} />
          </View>
        </View>
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
  typeButton: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginVertical: 2,
  },
  typeButtonActive: {
    backgroundColor: "#007bff",
  },
  typeButtonText: {
    color: "#333",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
