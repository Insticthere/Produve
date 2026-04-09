import React from 'react';
import { Platform, SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppFooter from '@/components/ui/AppFooter';

export default function ModalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-full max-w-[520px] rounded-[20px] bg-[rgba(19,19,19,0.78)] p-6"
          style={{ borderWidth: 1, borderColor: 'rgba(214,235,253,0.2)' }}
        >
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#70b1ff]">Produve</Text>
          <Text className="mt-2 font-display text-[38px] leading-[42px] text-void-text-primary">System Modal</Text>
          <Text className="mt-3 font-body text-[14px] leading-[22px] text-void-text-secondary">
            This route is now themed to match your task modal. Keep it as a global utility surface for future settings, shortcuts, or profile actions.
          </Text>
        </View>
      </View>
      {Platform.OS === 'web' ? (
        <View className="px-6 pb-4">
          <AppFooter />
        </View>
      ) : null}
    </SafeAreaView>
  );
}


