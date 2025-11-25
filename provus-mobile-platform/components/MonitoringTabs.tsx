import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Users, Activity } from "lucide-react-native";

interface Props {
  activeTab: "students" | "activity";
  onTabChange: (tab: "students" | "activity") => void;
  studentCount: number;
}

export default function MonitoringTabs({
  activeTab,
  onTabChange,
  studentCount,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onTabChange("students")}
        style={[
          styles.tab,
          activeTab === "students" ? styles.activeTab : styles.inactiveTab,
        ]}
      >
        <Users
          size={16}
          color={activeTab === "students" ? "#4f46e5" : "#6b7280"}
        />
        <Text
          style={[
            styles.text,
            activeTab === "students" ? styles.activeText : styles.inactiveText,
          ]}
        >
          Alunos ({studentCount})
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange("activity")}
        style={[
          styles.tab,
          activeTab === "activity" ? styles.activeTab : styles.inactiveTab,
        ]}
      >
        <Activity
          size={16}
          color={activeTab === "activity" ? "#4f46e5" : "#6b7280"}
        />
        <Text
          style={[
            styles.text,
            activeTab === "activity" ? styles.activeText : styles.inactiveText,
          ]}
        >
          Atividades
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#e5e7eb",
    padding: 4,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  text: {
    marginLeft: 8,
    fontWeight: "500",
    fontSize: 14,
  },
  activeText: {
    color: "#4f46e5",
  },
  inactiveText: {
    color: "#6b7280",
  },
});
