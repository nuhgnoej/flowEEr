import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlowEditorProps, Step, TRIGGER_TYPE_LABELS } from "@/lib/types";
import StepEditorModal from "./StepEditorModal";
import { useNavigation } from "expo-router";

export default function FlowEditor({ initialFlow, onSave }: FlowEditorProps) {
  const navigation = useNavigation();
  const [flowName, setFlowName] = useState(initialFlow?.name || "");
  const [description, setDescription] = useState(
    initialFlow?.description || ""
  );
  const [steps, setSteps] = useState<Step[]>(
    initialFlow?.steps?.sort((a, b) => a.position - b.position) || []
  );

  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  const openStepEditor = (step?: Step) => {
    if (step) {
      setEditingStep(step);
    } else {
      const newStep: Step = {
        id: Date.now(),
        name: "",
        triggers: [],
        position: steps.length,
      };
      setEditingStep(newStep);
    }
    setStepModalVisible(true);
  };

  const handleSaveStep = (updatedStep: Step) => {
    setSteps((prev) => {
      const index = prev.findIndex((s) => s.id === updatedStep.id);
      let next = [] as Step[];
      if (index >= 0) {
        next = [...prev];
        next[index] = { ...updatedStep, position: index };
      } else {
        next = [...prev, { ...updatedStep, position: prev.length }];
      }
      return next.map((s, i) => ({ ...s, position: i }));
    });
  };

  const handleRemoveStep = (id: number) => {
    setSteps((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i }))
    );
  };

  const handleSaveFlow = () => {
    console.log("✅ handleSaveFlow 호출됨");
    if (!flowName.trim()) {
      alert("플로우 이름을 입력하세요.");
      return;
    }

    try {
      const ordered = steps
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((s, i) => ({ ...s, position: i }));

      console.log("🚀 저장할 flow:", {
        name: flowName,
        desc: description,
        steps: ordered,
      });

      onSave(flowName, description, ordered);
    } catch (e) {
      console.error("SAVE ERROR", e);
      alert(
        "저장 중 오류 발생: " + (e instanceof Error ? e.message : "unknown")
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 플로우 정보 */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>플로우 정보</Text>

        <Text style={styles.label}>플로우 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 아침 루틴"
          value={flowName}
          onChangeText={setFlowName}
        />

        <Text style={styles.label}>설명 (선택)</Text>
        <TextInput
          style={styles.input}
          placeholder="설명 입력"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* 스텝 목록 */}
      <View style={[styles.card, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>스텝 목록</Text>

        {steps.length === 0 && (
          <Text style={{ color: "#888" }}>스텝이 없습니다.</Text>
        )}

        {steps
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((step, index) => {
            const triggerSummary =
              step.triggers.length > 0
                ? step.triggers
                    .map((t) => TRIGGER_TYPE_LABELS[t.type] || t.type)
                    .join(", ")
                : "트리거 없음";

            return (
              <View key={step.id} style={styles.stepRow}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openStepEditor(step)}
                >
                  <Text style={styles.stepName}>
                    {index + 1}. {step.name || "(이름 없음)"}
                  </Text>
                  <Text style={styles.triggerSummary}>{triggerSummary}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveStep(step.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            );
          })}

        <TouchableOpacity
          onPress={() => openStepEditor()}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ 새 스텝 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 저장 버튼 */}
      <View style={{ marginTop: 32, marginBottom: 64 }}>
        <Button title="플로우 저장" onPress={handleSaveFlow} />
      </View>

      {/* Step Editor Modal */}
      {editingStep && (
        <StepEditorModal
          visible={stepModalVisible}
          step={editingStep}
          allSteps={steps}
          onSave={(updated) => {
            handleSaveStep(updated);
            setStepModalVisible(false);
          }}
          onClose={() => setStepModalVisible(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  label: { fontSize: 14, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 8,
  },

  stepName: {
    fontSize: 16,
  },

  triggerSummary: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },

  addButton: {
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#007bff",
    fontWeight: "600",
  },
});
