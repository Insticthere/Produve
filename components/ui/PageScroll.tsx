import React from 'react';
import { Platform, ScrollView, View } from 'react-native';
import AppFooter from '@/components/ui/AppFooter';

type PageScrollProps = {
  children: React.ReactNode;
};

export default function PageScroll({ children }: PageScrollProps) {
  const isWeb = Platform.OS === 'web';
  const contentPaddingTop = isWeb ? 32 : 36;
  const contentPaddingBottom = isWeb ? 40 : 120;

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <View
          style={
            {
              flex: 1,
              minHeight: 0,
              height: '100vh',
              maxHeight: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            } as any
          }
        >
          <View style={{ paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom, paddingHorizontal: 24 }}>
            {children}
            <View style={{ marginTop: 16 }}>
              <AppFooter />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, minHeight: 0 }}
      contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom, paddingHorizontal: 24 }}
    >
      {children}
    </ScrollView>
  );
}


