// app/flow/[id]/edit.tsx
import FlowEditor from "@/components/FlowEditor";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { getFlowById, updateFlow } from "@/lib/flowRepository";
import { useEffect, useLayoutEffect, useState } from "react";
import { Flow } from "@/lib/types";

type FlowForm = Omit<Flow, "id">;

export default function EditFlowScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [initial, setInitial] = useState<FlowForm | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "플로우 수정하기",
    });
  }, []);

  useEffect(() => {
    if (id) {
      getFlowById(Number(id)).then((flow) => {
        setInitial({
          name: flow.name,
          description: flow.description,
          steps: flow.steps,
        });
      });
    }
  }, [id]);

  if (!initial) {
    return null;
  }

  return (
    <FlowEditor
      initialFlow={initial}
      onSave={async (name, desc, steps) => {
        await updateFlow(Number(id), name, desc, steps);
        navigation.goBack();
      }}
    />
  );
}
