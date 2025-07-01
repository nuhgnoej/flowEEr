// app/modal.tsx

import { Link, Stack } from "expo-router";
import { ScrollView, StyleSheet, Pressable } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";

export default function ModalScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "앱 소개", presentation: "modal" }} />

      <Text style={styles.title}>👋 FlowEEr에 오신 것을 환영합니다!</Text>

      <Text style={styles.section}>
        <Text style={styles.bold}>FlowEEr</Text>는 파워 T를 위한 시간 설계
        도구입니다.{"\n"}
        루틴한 업무를 더 이상 외우지 않아도 됩니다.{"\n\n"}
        플로우를 설계하고, 스텝을 연결하고, 조건에 따라 알람을 받으세요.
      </Text>

      <Text style={styles.subTitle}>💡 주요 개념</Text>
      <View style={styles.list}>
        <Text>
          • ⏰ <Text style={styles.bold}>플로우</Text> – 하루의 작업 흐름
        </Text>
        <Text>
          • ✅ <Text style={styles.bold}>스텝</Text> – 플로우 안의 작은 작업
          단위
        </Text>
        <Text>
          • 🔗 <Text style={styles.bold}>트리거</Text> – 시간, 다른 스텝,
          조건으로 연결되는 규칙
        </Text>
      </View>

      <Text style={styles.subTitle}>🚀 현재 제공 기능</Text>
      <View style={styles.list}>
        <Text>• 플로우 생성 및 삭제</Text>
        <Text>• 스텝 추가 및 트리거 설정</Text>
        <Text>• 시간 기반 알람</Text>
      </View>

      <Text style={styles.subTitle}>🧠 개발 중 기능</Text>
      <View style={styles.list}>
        <Text>• 플로우 진행 화면 (루틴 진행 시각화)</Text>
        <Text>• 푸시 알림</Text>
        <Text>• 클라우드 동기화</Text>
      </View>

      <Text style={styles.subTitle}>🌱 프로젝트 슬로건</Text>
      <Text style={styles.quote}>
        “시간을 설계하고, 흐름을 만들고, 삶을 피워낸다.”
      </Text>

      <Link href=".." asChild>
        <Pressable style={styles.button}>
          <Ionicons name="close-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>닫기</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  section: {
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
  },
  list: {
    gap: 4,
    paddingLeft: 8,
  },
  quote: {
    fontStyle: "italic",
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    marginTop: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
