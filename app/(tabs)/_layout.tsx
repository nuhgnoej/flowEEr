import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";

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
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={iconName} size={20} style={{ marginRight: 8 }} />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{}}>
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
