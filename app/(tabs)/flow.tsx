import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";

export default function FlowScreen() {
  const router = useRouter();
  const handlePress = () => {
    router.push("/flow/newFlow");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Flows</Text>
      <Pressable onPress={handlePress}>
        <Text>새 플로우 만들기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
