import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { DatabaseContext } from "@/lib/DatabaseProvider";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { deleteFlow, getAllFlows } from "@/lib/flowRepository";
import { View } from "react-native";

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

  const handleEdit = (id: number) => {
    const route = `/flow/${id}/edit` as const;
    router.push(route);
  }

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
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
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

            <Pressable onPress={() => handleEdit(flow.id)} style={styles.deleteButton}>
              <Ionicons name="create-outline" size={24} color="#333" />
            </Pressable>

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
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={handlePress}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
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
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // 안드로이드 그림자
    shadowColor: "#000", // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
