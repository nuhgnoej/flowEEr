import { StepState } from "@/lib/FlowEngine";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Button,
  ScrollView,
} from "react-native";

interface Props {
  visible: boolean;
  step: StepState;
  onClose: () => void;
}

export default function StepDetailModal({ visible, step, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.modal}>
          <Text style={styles.title}>{step.name}</Text>

          <View style={styles.statusRow}>
            <Text style={styles.label}>상태</Text>
            <Text style={styles.value}>{step.status}</Text>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.label}>예상 시간</Text>
            <Text style={styles.value}>
              {step.expectedTime
                ? new Date(step.expectedTime).toLocaleString()
                : "-"}
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>설명</Text>
            <View style={styles.descriptionBox}>
              <ScrollView
                contentContainerStyle={styles.descriptionScrollContent}
              >
                <Text style={styles.descriptionText}>
                  {step.description || "(설명 없음)"}
                </Text>
              </ScrollView>
            </View>
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
    height: "80%",
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#222",
    marginTop: 4,
  },
  descriptionContainer: {
    flex: 1,
    marginTop: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 6,
  },
  descriptionBox: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  descriptionScrollContent: {
    flexGrow: 1,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  statusRow: {
    marginBottom: 12,
  },
  timeRow: {
    marginBottom: 12,
  },
});
