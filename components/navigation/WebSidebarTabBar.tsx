import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type WebSidebarTabBarProps = BottomTabBarProps & {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

function getLabel(tabBarLabel: unknown, title: unknown, routeName: string) {
  if (typeof tabBarLabel === 'string') return tabBarLabel;
  if (typeof title === 'string') return title;
  return routeName;
}

export default function WebSidebarTabBar({
  state,
  descriptors,
  navigation,
  collapsed,
  onToggleCollapse,
}: WebSidebarTabBarProps) {
  const sidebarWidth = collapsed ? 88 : 248;

  return (
    <View
      style={{
        position: 'fixed' as any,
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        backgroundColor: 'rgba(17,19,21,0.82)',
        borderRightWidth: 1,
        borderRightColor: 'rgba(214,235,253,0.18)',
        paddingTop: 16,
        paddingBottom: 12,
        paddingHorizontal: 12,
        zIndex: 90,
      }}
    >
      <View
        style={{
          marginBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
        }}
      >
        <Text
          style={{
            color: '#f0f0f0',
            fontSize: collapsed ? 16 : 34,
            letterSpacing: collapsed ? 0.6 : -0.4,
            fontWeight: '500',
            fontFamily: 'PlayfairDisplay_500Medium',
            lineHeight: collapsed ? 20 : 36,
            textAlign: collapsed ? 'center' : 'left',
          }}
        >
          {collapsed ? 'P' : 'Produve'}
        </Text>

        {!collapsed ? (
          <Pressable
            onPress={onToggleCollapse}
            style={{
              borderWidth: 1,
              borderColor: 'rgba(214,235,253,0.24)',
              borderRadius: 999,
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(78,164,255,0.1)',
            }}
          >
            <FontAwesome name="chevron-left" size={12} color="#70b1ff" />
          </Pressable>
        ) : null}
      </View>

      {collapsed ? (
        <Pressable
          onPress={onToggleCollapse}
          style={{
            marginBottom: 12,
            alignSelf: 'center',
            borderWidth: 1,
            borderColor: 'rgba(214,235,253,0.24)',
            borderRadius: 999,
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(78,164,255,0.1)',
          }}
        >
          <FontAwesome name="chevron-right" size={12} color="#70b1ff" />
        </Pressable>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 6 }}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const color = focused ? '#70b1ff' : '#9aa2a8';
            const options = descriptors[route.key]?.options;
            const label = getLabel(options?.tabBarLabel, options?.title, route.name);

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{
                  minHeight: 42,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  paddingHorizontal: collapsed ? 0 : 12,
                  backgroundColor: focused ? 'rgba(78,164,255,0.18)' : 'transparent',
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused ? 'rgba(112,177,255,0.35)' : 'transparent',
                }}
              >
                <View style={{ marginRight: collapsed ? 0 : 10 }}>
                  {options?.tabBarIcon?.({ focused, color, size: 17 }) ?? null}
                </View>
                {!collapsed ? (
                  <Text
                    style={{
                      color,
                      fontSize: 12,
                      letterSpacing: 0.6,
                      fontWeight: focused ? '700' : '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}


