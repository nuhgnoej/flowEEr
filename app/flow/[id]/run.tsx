import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getFlowById } from "@/lib/flowRepository";
import { Flow } from "@/lib/types";
import FlowScheduler, { StepStatus } from "@/lib/scheduler";

export default function RunFlowScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [statuses, setStatuses] = useState<Record<number, StepStatus>>({});
  const [scheduler, setScheduler] = useState<FlowScheduler | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "플로우 실행" });
  }, []);

  useEffect(() => {
    if (id) {
      getFlowById(Number(id)).then((f) => {
        setFlow(f);
        const statusMap: Record<number, StepStatus> = {};
        f.steps.forEach((s) => (statusMap[s.id] = "pending"));
        setStatuses(statusMap);
        const sch = new FlowScheduler(f);
        sch.start();
        setScheduler(sch);
      });
    }
  }, [id]);

  if (!flow) return null;

  const handleComplete = async (stepId: number) => {
    const updated = { ...statuses, [stepId]: "completed" as StepStatus };
    setStatuses(updated);
    await scheduler?.completeStep(stepId, updated);
  };

  const progress = flow?.steps?.length
    ? (Object.values(statuses).filter((s) => s === "completed").length /
        flow.steps.length) *
      100
    : 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{flow.name}</Text>
        <Text>{progress.toFixed(0)}% 완료</Text>
      </View>
      <ScrollView style={styles.container}>
        {flow.steps.map((step) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepName}>{step.name}</Text>
              <Text style={styles.stepStatus}>{statuses[step.id]}</Text>
            </View>
            {statuses[step.id] !== "completed" && (
              <TouchableOpacity
                onPress={() => handleComplete(step.id)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>완료</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#ccc" },
  title: { fontSize: 20, fontWeight: "600" },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stepName: { fontSize: 16 },
  stepStatus: { color: "#666", marginTop: 4 },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: { color: "#fff" },
});
