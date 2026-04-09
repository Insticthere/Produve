import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useAppTheme } from '@/lib/theme';

function getLabel(tabBarLabel: unknown, title: unknown, routeName: string) {
  if (typeof tabBarLabel === 'string') return tabBarLabel;
  if (typeof title === 'string') return title;
  return routeName;
}

export default function WebTopMenuTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { palette } = useAppTheme();
  const [open, setOpen] = React.useState(false);
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [anim, open]);

  const menuHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, state.routes.length * 48 + 12],
  });

  return (
    <View
      style={{
        backgroundColor: palette.surfaceAlt,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: palette.textPrimary,
            fontSize: 28,
            letterSpacing: -0.3,
            fontWeight: '500',
            fontFamily: 'PlayfairDisplay_500Medium',
            lineHeight: 32,
          }}
        >
          Produve
        </Text>
        <Pressable
          onPress={() => setOpen((v) => !v)}
          style={{
            borderWidth: 1,
            borderColor: palette.borderStrong,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: palette.primarySoft,
          }}
        >
          <FontAwesome name={open ? 'close' : 'bars'} size={14} color={palette.primary} />
        </Pressable>
      </View>

      <Animated.View
        style={{
          overflow: 'hidden',
          height: menuHeight,
          opacity: anim,
          marginTop: 10,
        }}
      >
        <View style={{ gap: 6 }}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key]?.options;
            const color = focused ? palette.primary : palette.textSecondary;
            const label = getLabel(options?.tabBarLabel, options?.title, route.name);
            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                  setOpen(false);
                }}
                style={{
                  minHeight: 40,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  backgroundColor: focused ? palette.primarySoft : 'transparent',
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused ? palette.borderStrong : 'transparent',
                }}
              >
                <View style={{ marginRight: 10 }}>
                  {options?.tabBarIcon?.({ focused, color, size: 16 }) ?? null}
                </View>
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
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}
