import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import React from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';

import { ThemedText } from './ThemedText';
import { MaxContentWidth, Spacing, Fonts } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={styles.webTabsContainer}>
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
          <TabTrigger name="insights" href="/insights" asChild>
            <TabButton>Hacks</TabButton>
          </TabTrigger>
          <TabTrigger name="intel" href="/intel" asChild>
            <TabButton>Intel</TabButton>
          </TabTrigger>
          <TabTrigger name="deals" href="/deals" asChild>
            <TabButton>Deals</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
      <TabSlot style={{ flex: 1 }} />
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          isFocused && styles.tabButtonViewSelected
        ]}>
        <ThemedText style={{ fontSize: 13, fontWeight: 'bold', color: isFocused ? '#D4AF37' : '#9CA3AF', letterSpacing: 0.5 }}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <ThemedText style={styles.brandText}>
          THE POINTS ARRAY
        </ThemedText>

        <View style={styles.tabButtonsRow}>
          {props.children}
        </View>

        <View style={styles.membershipBadge}>
          <ThemedText style={styles.membershipText}>
            BLACK MEMBERSHIP
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webTabsContainer: {
    flex: 1,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        height: '100vh',
      },
      default: {
        height: '100%',
      },
    }),
    backgroundColor: '#090A0F',
  },
  tabListContainer: {
    width: '100%',
    backgroundColor: '#14161F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    zIndex: 100,
  },
  innerContainer: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  brandText: {
    fontSize: 14,
    letterSpacing: 2,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  tabButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonViewSelected: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  membershipBadge: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(20, 22, 31, 0.5)',
  },
  membershipText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
