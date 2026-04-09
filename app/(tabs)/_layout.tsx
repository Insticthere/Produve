import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import WebSidebarTabBar from '@/components/navigation/WebSidebarTabBar';
import WebTopMenuTabBar from '@/components/navigation/WebTopMenuTabBar';
import { useAppTheme } from '@/lib/theme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return <FontAwesome {...props} />;
}

export default function TabLayout() {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktopWeb = isWeb && width >= 1024;
  const isSmallWeb = isWeb && width < 1024;
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const desktopSidebarWidth = sidebarCollapsed ? 88 : 248;

  return (
    <Tabs
      tabBar={
        isDesktopWeb
          ? (props) => (
              <WebSidebarTabBar
                {...props}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
              />
            )
          : isSmallWeb
          ? (props) => <WebTopMenuTabBar {...props} />
          : undefined
      }
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: palette.background,
          flex: 1,
          minHeight: 0,
          paddingLeft: isDesktopWeb ? desktopSidebarWidth : 0,
        },
        tabBarPosition: isDesktopWeb ? 'left' : isSmallWeb ? 'top' : 'bottom',
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: isWeb ? 0 : 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="bolt" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Todo"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="check-square-o" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="book" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="users" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="user-circle-o" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}


