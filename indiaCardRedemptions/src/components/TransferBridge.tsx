import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { ThemedText } from './ThemedText';
import { Spacing } from '@/constants/theme';

/**
 * @feature FT-102_TransferBridgeVisualizer
 */

interface TransferBridgeProps {
  fromBank: string;
  toProgram: string;
  ratio: string;
}

export function TransferBridge({ fromBank, toProgram, ratio }: TransferBridgeProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  // Interpolate position across the container path
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <View style={styles.container} testID="transfer-bridge">
      <View style={styles.bridgeRow}>
        {/* Source Bank Node */}
        <View style={styles.node} testID="source-node">
          <ThemedText style={styles.nodeTitle} type="smallBold">
            {fromBank}
          </ThemedText>
        </View>

        {/* Center Flow Path */}
        <View style={styles.flowPathContainer} testID="flow-path">
          <View style={styles.trackLine} />
          {/* Animated dot representing the value flow */}
          <Animated.View
            style={[
              styles.animatedDot,
              {
                transform: [{ translateX }],
              },
            ]}
          />
          <View style={styles.ratioContainer}>
            <ThemedText style={styles.ratioText} type="code">
              {ratio}
            </ThemedText>
          </View>
        </View>

        {/* Destination Partner Program Node */}
        <View style={[styles.node, styles.destNode]} testID="dest-node">
          <ThemedText style={styles.nodeTitle} type="smallBold">
            {toProgram}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#121318',
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    marginVertical: Spacing.three,
  },
  bridgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  node: {
    width: 90,
    height: 50,
    borderRadius: Spacing.two,
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: 'rgba(245, 242, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.one,
  },
  destNode: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  nodeTitle: {
    textAlign: 'center',
    fontSize: 10,
    color: '#F5F2EB',
  },
  flowPathContainer: {
    flex: 1,
    height: 40,
    marginHorizontal: Spacing.two,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  trackLine: {
    height: 2,
    backgroundColor: 'rgba(245, 242, 235, 0.15)',
    width: '100%',
  },
  animatedDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    left: 0,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  ratioContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#121318',
    paddingHorizontal: Spacing.two,
  },
  ratioText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
