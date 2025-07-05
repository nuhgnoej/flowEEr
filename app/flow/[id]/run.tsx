// app/(tabs)/[id]/run.tsx

import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getFlowById } from "@/lib/flowRepository";
import { Flow } from "@/lib/types";
import { useFlowEngine } from "@/hooks/useFlowEngine";
import FlowScheduler from "@/lib/scheduler";
import type { StepState } from "@/lib/FlowEngine";

export default function RunFlowScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [scheduler, setScheduler] = useState<FlowScheduler | null>(null);
  const [ready, setReady] = useState<StepState[]>([]);
  const [waiting, setWaiting] = useState<StepState[]>([]);
  const [inProgress, setInProgress] = useState<StepState[]>([]);
  const [completed, setCompleted] = useState<StepState[]>([]);

  const engine = useFlowEngine(flow); // flow가 null이면 engine도 null

  useLayoutEffect(() => {
    navigation.setOptions({ title: "플로우 실행" });
  }, []);

  useEffect(() => {
    if (id) {
      console.log("라우팅된 ID:", id);
      getFlowById(Number(id)).then((f) => {
        setFlow(f);
        setScheduler(new FlowScheduler(f));
      });
    }
  }, [id]);

  useEffect(() => {
    if (flow && engine) {
      const ui = engine.getUIState();
      console.log("초기 UI 상태:", ui);
      setReady(ui.ready);
      setWaiting(ui.waiting);
      setInProgress(ui.in_progress);
      setCompleted(ui.completed);
    } else {
      console.log("flow 없음 또는 engine 없음");
    }
  }, [flow, engine]);

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const refreshUI = () => {
    if (!engine) return;
    const ui = engine.getUIState();
    setReady(ui.ready);
    setWaiting(ui.waiting);
    setInProgress(ui.in_progress);
    setCompleted(ui.completed);
  };

  const handleStartStep = (stepId: number) => {
    if (!engine) return;
    engine.startStep(stepId);
    refreshUI();
  };

  const handleComplete = async (stepId: number) => {
    if (!engine) return;
    const newlyReady = engine.completeStep(stepId);
    refreshUI();

    if (scheduler) {
      for (const s of newlyReady) {
        scheduler.scheduleStep(s);
      }
    }
  };

  const progress = flow?.steps?.length
    ? (completed.length / flow.steps.length) * 100
    : 0;

  const renderStepRow = (step: StepState) => {
    console.log(
      `[step: ${step.name}] expectedTime:`,
      step.expectedTime,
      "typeof:",
      typeof step.expectedTime
    );
    return (
      <View key={step.id} style={styles.stepRow}>
        <Text style={styles.stepTime}>{formatTime(step.expectedTime)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepName}>{step.name}</Text>
          <Text style={styles.stepStatus}>{step.status}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          {step.status === "ready" && (
            <TouchableOpacity
              onPress={() => handleStartStep(step.id)}
              style={[
                styles.button,
                { backgroundColor: "#009688", marginRight: 8 },
              ]}
            >
              <Text style={styles.buttonText}>시작</Text>
            </TouchableOpacity>
          )}
          {step.status === "in_progress" && (
            <TouchableOpacity
              onPress={() => handleComplete(step.id)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>완료</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!flow || !engine) {
    return (
      <View style={{ padding: 20 }}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{flow.name}</Text>
        <Text>{progress.toFixed(0)}% 완료</Text>
      </View>
      <ScrollView style={styles.container}>
        {ready.map(renderStepRow)}
        {inProgress.map(renderStepRow)}
        {waiting.map(renderStepRow)}
        {completed.map(renderStepRow)}
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
  stepTime: {
    width: 60,
    fontSize: 14,
    color: "#555",
  },
});
