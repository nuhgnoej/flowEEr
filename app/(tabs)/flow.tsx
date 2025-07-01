import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { DatabaseContext } from "@/lib/DatabaseProvider";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { deleteFlow, getAllFlows } from "@/lib/flowRepository";

export default function FlowScreen() {
  const router = useRouter();
  const { isReady } = useContext(DatabaseContext);

  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFlows = async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      const result = await getAllFlows();
      setFlows(result);
    } catch (error) {
      console.error("Failed to load flows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push("/flow/newFlow");
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "플로우 삭제",
      "이 플로우를 정말 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFlow(id);
              setFlows((prev) => prev.filter((f) => f.id !== id));
            } catch (err) {
              console.error("삭제 실패:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ✅ 포커스 될 때마다 데이터 로딩
  useFocusEffect(
    useCallback(() => {
      if (isReady) {
        loadFlows();
      }
    }, [isReady])
  );

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>DB 로딩 중...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Flows</Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>불러오는 중...</Text>
        </View>
      )}

      {flows.map((flow) => (
        <View key={flow.id} style={styles.itemRow}>
          <Link href={`/flow/${flow.id}`} asChild>
            <TouchableOpacity style={styles.itemContent}>
              <Text style={styles.name}>{flow.name}</Text>
              <Text style={styles.description}>
                {flow.description || "설명 없음"}
              </Text>
            </TouchableOpacity>
          </Link>

          <Pressable
            onPress={() => handleDelete(flow.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </Pressable>
        </View>
      ))}

      {flows.length === 0 && !loading && (
        <View style={styles.center}>
          <Text>저장된 플로우가 없습니다.</Text>
        </View>
      )}

      <Pressable onPress={handlePress}>
        <Text>새 플로우 만들기</Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
    backgroundColor: "#eee",
  },
  container: {
    padding: 20,
  },
  item: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    color: "#666",
    marginTop: 4,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
});
