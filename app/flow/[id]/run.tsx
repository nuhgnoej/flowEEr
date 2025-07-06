// app/(tabs)/[id]/run.tsx

import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { getFlowById } from "@/lib/flowRepository";
import { Flow, Step } from "@/lib/types";
import { useFlowEngine } from "@/hooks/useFlowEngine";
import FlowScheduler from "@/lib/scheduler";
import type { StepState } from "@/lib/FlowEngine";
import StepEditorModal from "@/components/StepEditorModal";
import { Ionicons } from "@expo/vector-icons";
import StepDetailModal from "@/components/StepDetailModal";
import { FloatingAction } from "react-native-floating-action";
import { updateFlow } from "@/lib/flowRepository";

const actions = [
  {
    text: "스텝 추가",
    icon: <Ionicons name="add" size={24} color="#fff" />,
    name: "bt_add_step",
    position: 1,
    color: "#6200ee", // FAB 색상
  },
];

export default function RunFlowScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [scheduler, setScheduler] = useState<FlowScheduler | null>(null);
  const [ready, setReady] = useState<StepState[]>([]);
  const [waiting, setWaiting] = useState<StepState[]>([]);
  const [inProgress, setInProgress] = useState<StepState[]>([]);
  const [completed, setCompleted] = useState<StepState[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [detailStep, setDetailStep] = useState<StepState | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const { engine, refresh } = useFlowEngine(flow);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "플로우 실행" });
  }, []);

  useEffect(() => {
    if (id) {
      // console.log("라우팅된 ID:", id);
      getFlowById(Number(id)).then((f) => {
        setFlow(f);
        setScheduler(new FlowScheduler(f));
      });
    }
  }, [id]);

  useEffect(() => {
    if (!engine) return; // guard clause

    const ui = engine.getUIState();
    console.log("초기 UI 상태:", ui);
    setReady(ui.ready);
    setWaiting(ui.waiting);
    setInProgress(ui.in_progress);
    setCompleted(ui.completed);
  }, [engine]);

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

  const handleSaveStep = async (updatedStep: Step) => {
    if (!flow) return;

    const isNew = !flow.steps.some((s) => s.id === updatedStep.id);
    const updatedSteps = isNew
      ? [...flow.steps, updatedStep]
      : flow.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s));

    const updatedFlow = { ...flow, steps: updatedSteps };

    setFlow({ ...flow, steps: updatedSteps });
    setEditorVisible(false);

    try {
      await updateFlow(
        updatedFlow.id,
        updatedFlow.name,
        updatedFlow.description ?? "",
        updatedFlow.steps
      );
      console.log("DB에 플로우 저장 완료");
    } catch (error) {
      console.error("스텝 저장 중 오류 발생:", error);
    }
  };

  const progress = flow?.steps?.length
    ? (completed.length / flow.steps.length) * 100
    : 0;

  const renderStepRow = (step: StepState) => {
    const isCompleted = step.status === "completed";
    const isInProgress = step.status === "in_progress";

    return (
      <TouchableOpacity
        onPress={() => {
          setDetailStep(step);
          setDetailVisible(true);
        }}
      >
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
              style={[
                styles.stepStatus,
                isCompleted && styles.stepTextCompleted,
              ]}
            >
              {step.status}
            </Text>
          </View>

          {/* ✏️ 수정 버튼 */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.(); // 상위 터치 이벤트 막기
              const original = flow?.steps.find((s) => s.id === step.id);
              if (original) {
                setEditingStep(original);
                setEditorVisible(true);
              }
            }}
            style={[styles.iconButton, styles.editButton]}
          >
            <Ionicons name="create-outline" size={20} color="#007bff" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row" }}>
            {step.status === "ready" && (
              <TouchableOpacity
                onPress={() => handleStartStep(step.id)}
                style={[styles.iconButton, styles.startButton]}
              >
                <Text style={styles.buttonText}>시작</Text>
              </TouchableOpacity>
            )}
            {step.status === "in_progress" && (
              <TouchableOpacity
                onPress={() => handleComplete(step.id)}
                style={[styles.iconButton, styles.completeButton]}
              >
                <Text style={styles.buttonText}>완료</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.sectionTitle}>진행 중</Text>
        {inProgress.map((step) => (
          <View key={step.id}>{renderStepRow(step)}</View>
        ))}

        <Text style={styles.sectionTitle}>실행 가능</Text>
        {ready.map((step) => (
          <View key={step.id}>{renderStepRow(step)}</View>
        ))}

        <Text style={styles.sectionTitle}>대기 중</Text>

        {waiting.map((step) => (
          <View key={step.id}>{renderStepRow(step)}</View>
        ))}
        {completed.map((step) => (
          <View key={step.id}>{renderStepRow(step)}</View>
        ))}
      </ScrollView>

      {editingStep && (
        <StepEditorModal
          visible={editorVisible}
          step={editingStep}
          allSteps={flow?.steps || []}
          onSave={handleSaveStep}
          onClose={() => setEditorVisible(false)}
        />
      )}

      {detailStep && (
        <StepDetailModal
          visible={detailVisible}
          step={detailStep}
          onClose={() => setDetailVisible(false)}
        />
      )}

      <FloatingAction
        actions={actions}
        color="#6200ee"
        distanceToEdge={{
          vertical: Platform.OS === "android" ? 90 : 70,
          horizontal: 20,
        }}
        onPressItem={(name) => {
          if (name === "bt_add_step") {
            const newStep: Step = {
              id: Date.now(),
              name: "새 스텝",
              triggers: [],
              description: "",
              position: flow?.steps.length ?? 0,
            };

            setEditingStep(newStep);
            setEditorVisible(true);
          }
        }}
      />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#333",
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: "#e0e0e0",
  },
  startButton: {
    backgroundColor: "#009688",
  },
  completeButton: {
    backgroundColor: "#6200ee",
  },
});
