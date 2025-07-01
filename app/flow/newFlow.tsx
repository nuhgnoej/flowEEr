// app/flow/newFlow.tsx

import React, { useLayoutEffect } from "react";
import FlowEditor from "@/components/FlowEditor";
import { saveFlow } from "@/lib/flowRepository";
import { useNavigation } from "expo-router";

export default function NewFlowScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "새 플로우 생성하기",
    });
  }, []);

  return (
    <FlowEditor
      onSave={async (name, desc, steps) => {
        await saveFlow(name, desc, steps);
        navigation.goBack();
      }}
    />
  );
}
