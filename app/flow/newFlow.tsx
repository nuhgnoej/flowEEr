// app/flow/newFlow.tsx

import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Step, Trigger } from "@/lib/types";
// import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "expo-router";
import { saveFlow } from "@/lib/flowRepository";

export default function NewFlowScreen() {
  const [flowName, setFlowName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "새 플로우 만들기",
    });
  }, []);

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
          ? {
              ...s,
              triggers: s.triggers.filter((t) => t.id !== triggerId),
            }
          : s
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>새 플로우 만들기</Text>

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

      <Text style={styles.sectionTitle}>스텝 목록</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>#</Text>
        <Text style={styles.headerCell}>이름</Text>
        <Text style={styles.headerCell}>트리거</Text>
        <Text style={styles.headerCell}></Text>
      </View>

      {steps.map((step, index) => (
        <View key={step.id} style={styles.tableRow}>
          <Text style={styles.cell}>{index + 1}</Text>

          <TextInput
            style={[styles.cell, styles.inputCell]}
            placeholder="스텝 이름"
            value={step.name}
            onChangeText={(text) => updateStep(step.id, "name", text)}
          />

          <TouchableOpacity onPress={() => addTrigger(step.id)}>
            <Ionicons name="add-circle-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => removeStep(step.id)}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>

          {step.triggers.length > 0 && (
            <View style={styles.triggerList}>
              {step.triggers.map((t) => (
                <View key={t.id} style={styles.triggerRow}>
                  <Text style={{ flex: 1 }}>{t.type}</Text>
                  <Text style={{ flex: 1 }}>
                    대상: {t.targetStepId ?? "없음"}
                  </Text>
                  <Text style={{ flex: 1 }}>+{t.offset}s</Text>
                  <Text style={{ flex: 1 }}>{t.time ?? "-"}</Text>
                  <TouchableOpacity
                    onPress={() => removeTrigger(step.id, t.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={addStep} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ 새 스텝 추가</Text>
      </TouchableOpacity>

      <Button
        title="플로우 저장"
        onPress={async () => {
          try {
            await saveFlow(flowName, description, steps);
            console.log({
              flowName,
              description,
              steps,
            });
            alert("플로우 저장 완료");
            navigation.goBack();
          } catch (e) {
            console.error(e);
            alert("저장 실패");
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 16, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18, marginTop: 16, fontWeight: "600" },
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
