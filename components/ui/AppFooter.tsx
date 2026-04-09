import React from "react";
import { Text, View } from "react-native";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <View
      className="rounded-[14px] bg-[rgba(19,19,19,0.78)] px-4 py-2"
      style={{ borderWidth: 1, borderColor: "rgba(214,235,253,0.16)" }}
    >
      <Text className="text-center font-mono text-[10px] uppercase tracking-[1.1px] text-void-text-tertiary">
        Produve | Deep Work OS
      </Text>
      <Text className="mt-1 text-center font-body text-[12px] text-void-text-secondary">
        {year} Produve. UI Prototype.
      </Text>
    </View>
  );
}

