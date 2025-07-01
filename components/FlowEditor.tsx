// components/FlowEditor.tsx

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
import { FlowEditorProps, Step, Trigger } from "@/lib/types";
import StepEditor from "./StepEditor";

export default function FlowEditor({ initialFlow, onSave }: FlowEditorProps) {
  const [flowName, setFlowName] = useState(initialFlow?.name || "");
  const [description, setDescription] = useState(
    initialFlow?.description || ""
  );
  const [steps, setSteps] = useState<Step[]>(initialFlow?.steps || []);

  const addStep = () => {
    const newStep: Step = {
      id: Date.now(),
      name: "",
      triggers: [],
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: number) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: number, field: keyof Step, value: any) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addTrigger = (stepId: number) => {
    const newTrigger: Trigger = {
      id: Date.now().toString(),
      targetStepId: null,
      type: "at_time",
      offset: 0,
      time: "07:00",
    };
    setSteps(
      steps.map((s) =>
        s.id === stepId ? { ...s, triggers: [...s.triggers, newTrigger] } : s
      )
    );
  };

  const removeTrigger = (stepId: number, triggerId: string) => {
    setSteps(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, triggers: s.triggers.filter((t) => t.id !== triggerId) }
          : s
      )
    );
  };

  const handleSave = () => {
    if (!flowName.trim()) {
      alert("플로우 이름을 입력하세요.");
      return;
    }
    onSave(flowName, description, steps);
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

        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>#</Text>
          <Text style={styles.headerCell}>이름</Text>
          <Text style={styles.headerCell}>트리거</Text>
          <Text style={styles.headerCell}></Text>
        </View>

        {steps.map((step, index) => (
          <StepEditor
            key={step.id}
            step={step}
            index={index}
            allSteps={steps}
            onChange={(updated) =>
              setSteps(steps.map((s) => (s.id === step.id ? updated : s)))
            }
            onDelete={() => setSteps(steps.filter((s) => s.id !== step.id))}
            onAddTrigger={() => addTrigger(step.id)}
            onRemoveTrigger={(triggerId) => removeTrigger(step.id, triggerId)}
          />
        ))}

        <TouchableOpacity onPress={addStep} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 새 스텝 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 저장 버튼 */}
      <View style={{ marginTop: 32, marginBottom: 64 }}>
        <Button title="플로우 저장" onPress={handleSave} />
      </View>
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

  tableHeader: {
    flexDirection: "row",
    marginTop: 8,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexWrap: "wrap",
  },

  headerCell: { flex: 1, fontWeight: "bold" },
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

  addButton: {
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#007bff",
    fontWeight: "600",
  },
});
