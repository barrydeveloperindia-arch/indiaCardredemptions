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
    color: '#9CA3AF',
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
    backgroundColor: '#14161F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  stepperText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 6,
    backgroundColor: '#1E2130',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFilled: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.5,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#090A0F',
    borderWidth: 2,
    marginLeft: -8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.8,
    elevation: 3,
  },
});
