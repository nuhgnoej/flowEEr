// TriggerTypeButton.tsx
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default React.memo(function TriggerTypeButton({
  type,
  active,
  label,
  onPress,
}: {
  type: string;
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.button, active && styles.active]}
      onPress={onPress}
    >
      <Text style={active ? styles.activeText : styles.text}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginVertical: 2,
  },
  active: {
    backgroundColor: "#007bff",
  },
  text: {
    color: "#333",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
