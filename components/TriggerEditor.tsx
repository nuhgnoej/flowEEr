// components/TriggerEditor.tsx

import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, Button, Pressable } from "react-native";
import WheelPicker from "react-native-wheely";
import { Trigger, TriggerEditorProps, TriggerType } from "@/lib/types";

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
  const [localTrigger, setLocalTrigger] = useState<Trigger>(trigger);

  useEffect(() => {
    setLocalTrigger(trigger);
  }, [trigger]);

  const update = (field: keyof Trigger, value: any) => {
    setLocalTrigger({ ...localTrigger, [field]: value });
  };

  const handleSave = () => {
    onChange(localTrigger);
    onClose();
  };

  // ⏱️ 오프셋 처리 (초 단위 → 시,분,초 분리)
  const offset = localTrigger.offset ?? 0;
  const offsetHours = Math.floor(offset / 3600);
  const offsetMinutes = Math.floor((offset % 3600) / 60);
  const offsetSeconds = offset % 60;

  const setOffset = (h: number, m: number, s: number) => {
    const total = h * 3600 + m * 60 + s;
    update("offset", total);
  };

  // ⏰ at_time 처리 (시:분 문자열 → 숫자 변환)
  const [atTimeHour, atTimeMinute] = (localTrigger.time ?? "07:00")
    .split(":")
    .map((v) => parseInt(v) || 0);

  const setAtTime = (h: number, m: number) => {
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;
    update("time", timeStr);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>트리거 설정</Text>

          {/* 트리거 타입 선택 */}
          <Text style={styles.label}>트리거 타입</Text>
          <View style={styles.typeRow}>
            {triggerTypes.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeButton,
                  localTrigger.type === type && styles.typeButtonActive,
                ]}
                onPress={() => update("type", type)}
              >
                <Text
                  style={
                    localTrigger.type === type
                      ? styles.typeButtonTextActive
                      : styles.typeButtonText
                  }
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 타겟 스텝 선택 */}
          {(localTrigger.type === "after_step" ||
            localTrigger.type === "delay_from_step" ||
            localTrigger.type === "immediate") && (
            <>
              <Text style={styles.label}>타겟 스텝</Text>
              {allSteps.length === 0 && (
                <Text style={{ color: "#888" }}>선택할 스텝이 없습니다.</Text>
              )}
              <View style={styles.typeRow}>
                {allSteps.map((step) => (
                  <Pressable
                    key={step.id}
                    style={[
                      styles.typeButton,
                      localTrigger.targetStepId === step.id &&
                        styles.typeButtonActive,
                    ]}
                    onPress={() => update("targetStepId", step.id)}
                  >
                    <Text
                      style={
                        localTrigger.targetStepId === step.id
                          ? styles.typeButtonTextActive
                          : styles.typeButtonText
                      }
                    >
                      {step.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* 오프셋 시간 설정 */}
          {["after_step", "delay_from_step", "immediate"].includes(
            localTrigger.type
          ) && (
            <>
              <Text style={styles.label}>오프셋 시간 (시:분:초)</Text>
              <View style={styles.pickerRow}>
                <WheelPicker
                  selectedIndex={offsetHours}
                  options={Array.from({ length: 24 }, (_, i) => `${i} 시`)}
                  onChange={(index) =>
                    setOffset(index, offsetMinutes, offsetSeconds)
                  }
                />
                <WheelPicker
                  selectedIndex={offsetMinutes}
                  options={Array.from({ length: 60 }, (_, i) => `${i} 분`)}
                  onChange={(index) =>
                    setOffset(offsetHours, index, offsetSeconds)
                  }
                />
                <WheelPicker
                  selectedIndex={offsetSeconds}
                  options={Array.from({ length: 60 }, (_, i) => `${i} 초`)}
                  onChange={(index) =>
                    setOffset(offsetHours, offsetMinutes, index)
                  }
                />
              </View>
            </>
          )}

          {/* at_time 시간 설정 */}
          {localTrigger.type === "at_time" && (
            <>
              <Text style={styles.label}>실행 시간 (시:분)</Text>
              <View style={styles.pickerRow}>
                <WheelPicker
                  selectedIndex={atTimeHour}
                  options={Array.from({ length: 24 }, (_, i) => `${i} 시`)}
                  onChange={(index) => setAtTime(index, atTimeMinute)}
                />
                <WheelPicker
                  selectedIndex={atTimeMinute}
                  options={Array.from({ length: 60 }, (_, i) => `${i} 분`)}
                  onChange={(index) => setAtTime(atTimeHour, index)}
                />
              </View>
            </>
          )}

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <Button title="닫기" onPress={onClose} />
            <Button title="저장" onPress={handleSave} />
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
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});
