import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon({
  name,
  focusedName,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  focusedName: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      size={24}
      style={{ marginBottom: -3 }}
      name={focused ? focusedName : name}
      color={color}
    />
  );
}

// 헤더 타이틀 (아이콘 + 텍스트, 예쁘게 개선)
function HeaderTitle({
  iconName,
  label,
}: {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons
        name={iconName}
        size={20}
        color={textColor}
        style={{ marginRight: 8 }}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: textColor,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle iconName="home" label="Home" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="home-outline"
              focusedName="home"
              color={color}
              focused={focused}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="information-circle-outline"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="flow"
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle iconName="repeat" label="My Flows" />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="repeat-outline"
              focusedName="repeat"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="step"
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle iconName="checkmark-done" label="My Steps" />
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="checkmark-done-outline"
              focusedName="checkmark-done"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: true,
          headerTitle: () => (
            <HeaderTitle iconName="settings" label="Settings" />
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="settings-outline"
              focusedName="settings"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
