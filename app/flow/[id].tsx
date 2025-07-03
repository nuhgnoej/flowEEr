// // app/flow/[id].tsx
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Text, View } from "react-native";

export default function FlowDetailScreen (){
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "플로우",
    });
  }, []);
  return <View>
    <Text>This is Flow Detail Screen.</Text>
  </View>
}