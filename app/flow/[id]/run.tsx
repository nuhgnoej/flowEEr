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
    const isCompleted = step.status === "completed";
    const isInProgress = step.status === "in_progress";

    return (
      <View
        key={step.id}
        style={[
          styles.stepCard,
          isCompleted && styles.stepCardCompleted,
          isInProgress && styles.stepCardInProgress,
        ]}
      >
        <Text
          style={[
            styles.stepTime,
            step.expectedTime && step.expectedTime < new Date()
              ? styles.stepTimeLate
              : null,
          ]}
        >
          {formatTime(step.expectedTime)}
        </Text>

        <View style={{ flex: 1 }}>
          <Text
            style={[styles.stepName, isCompleted && styles.stepTextCompleted]}
          >
            {step.name}
          </Text>
          <Text
            style={[styles.stepStatus, isCompleted && styles.stepTextCompleted]}
          >
            {step.status}
          </Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          {step.status === "ready" && (
            <TouchableOpacity
              onPress={() => handleStartStep(step.id)}
              style={[styles.button, { backgroundColor: "#009688" }]}
            >
              <Text style={styles.buttonText}>시작</Text>
            </TouchableOpacity>
          )}
          {step.status === "in_progress" && (
            <TouchableOpacity
              onPress={() => handleComplete(step.id)}
              style={[styles.button, { backgroundColor: "#6200ee" }]}
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
        {inProgress.map(renderStepRow)}
        {ready.map(renderStepRow)}
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

  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: { color: "#fff" },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  stepCardCompleted: {
    backgroundColor: "#f0f0f0",
  },

  stepCardInProgress: {
    borderWidth: 2,
    borderColor: "#6200ee",
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },

  stepName: {
    fontSize: 16,
    fontWeight: "500",
  },

  stepStatus: {
    color: "#666",
    marginTop: 4,
  },

  stepTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  stepTime: {
    width: 60,
    fontSize: 14,
    color: "#555",
  },

  stepTimeLate: {
    color: "#d32f2f",
    fontWeight: "600",
  },
});
