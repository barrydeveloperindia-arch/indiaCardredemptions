import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Spacing } from '@/constants/theme';

interface PremiumSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  accentColor?: string;
  label?: string;
  valueSuffix?: string;
}

export function PremiumSlider({
  value,
  min,
  max,
  step = 1000,
  onChange,
  accentColor = '#10B981',
  label,
  valueSuffix = '',
}: PremiumSliderProps) {
  // Cap value between min and max
  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Handle direct click/tap on the track to jump to value
  const handleTrackPress = (event: any) => {
    // Basic coordinate checking for web and native
    const { locationX, width } = event.nativeEvent;
    if (width || event.currentTarget) {
      const layoutWidth = width || event.currentTarget.getBoundingClientRect?.().width || 200;
      const clickedX = locationX || event.nativeEvent.offsetX || 0;
      const pct = Math.max(0, Math.min(1, clickedX / layoutWidth));
      const rawVal = min + pct * (max - min);
      const steppedVal = Math.round(rawVal / step) * step;
      onChange(Math.max(min, Math.min(max, steppedVal)));
    }
  };

  const increment = () => {
    onChange(Math.min(max, clampedValue + step));
  };

  const decrement = () => {
    onChange(Math.max(min, clampedValue - step));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {label && (
          <ThemedText style={styles.label} type="code">
            {label}
          </ThemedText>
        )}
        <ThemedText style={[styles.valueText, { color: accentColor }]} type="code">
          {clampedValue.toLocaleString()}{valueSuffix}
        </ThemedText>
      </View>

      <View style={styles.sliderRow}>
        <Pressable onPress={decrement} style={styles.stepperButton}>
          <ThemedText style={styles.stepperText}>−</ThemedText>
        </Pressable>

        <Pressable
          style={styles.trackContainer}
          onPress={handleTrackPress}
          testID="slider-track">
          <View style={styles.trackBackground}>
            <View
              style={[
                styles.trackFilled,
                {
                  width: `${percentage}%`,
                  backgroundColor: accentColor,
                  shadowColor: accentColor,
                },
              ]}
            />
            {/* Slider Thumb */}
            <View
              style={[
                styles.sliderThumb,
                {
                  left: `${percentage}%`,
                  borderColor: accentColor,
                },
              ]}
            />
          </View>
        </Pressable>

        <Pressable onPress={increment} style={styles.stepperButton}>
          <ThemedText style={styles.stepperText}>+</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
    alignSelf: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  label: {
    fontSize: 9,
    color: '#6B7280',
    letterSpacing: 1.5,
  },
  valueText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E3135',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  stepperText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 4,
    backgroundColor: '#2E3135',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFilled: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.5,
  },
  sliderThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#090A0F',
    borderWidth: 3,
    marginLeft: -7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.3,
    elevation: 3,
  },
});
