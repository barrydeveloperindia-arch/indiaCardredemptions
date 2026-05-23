import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LiveValuationTickerProps {
  initialRate: number;
  updateIntervalMs?: number;
}

const LiveValuationTicker: React.FC<LiveValuationTickerProps> = ({
  initialRate,
  updateIntervalMs = 10000,
}) => {
  const [currentRate, setCurrentRate] = useState(initialRate);
  const [rateHistory, setRateHistory] = useState<number[]>([initialRate]);
  const [trend, setTrend] = useState<'up' | 'down' | 'flat'>('flat');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate((prevRate) => {
        // Fluctuate the rate by a small random factor: -0.8% to +1.0%
        const changePercent = (Math.random() * 1.8 - 0.8) / 100;
        const newRate = prevRate * (1 + changePercent);
        
        // Save history (keep last 12 ticks)
        setRateHistory((prevHistory) => {
          const updated = [...prevHistory, newRate];
          if (updated.length > 12) {
            updated.shift();
          }
          return updated;
        });

        // Determine trend
        if (newRate > prevRate) {
          setTrend('up');
        } else if (newRate < prevRate) {
          setTrend('down');
        } else {
          setTrend('flat');
        }

        return newRate;
      });
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateIntervalMs]);

  // Math calculation for percentage change from initial
  const percentChange = ((currentRate - initialRate) / initialRate) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Text style={styles.title}>LIVE REWARD VALUE</Text>
        <View
          testID="trend-indicator"
          style={[
            styles.indicatorBadge,
            trend === 'up' ? styles.badgeUp : trend === 'down' ? styles.badgeDown : styles.badgeFlat,
          ]}
        >
          <Text style={styles.indicatorText}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'} {percentChange.toFixed(2)}%
          </Text>
        </View>
      </View>

      <Text style={styles.rateValue}>₹{currentRate.toFixed(4)}</Text>

      {/* Sparkline Graph */}
      <View style={styles.sparklineContainer}>
        {rateHistory.map((val, idx) => {
          // Normalize height to a percentage of containers 24px
          const min = Math.min(...rateHistory);
          const max = Math.max(...rateHistory);
          const range = max - min || 1;
          const normalizedHeight = ((val - min) / range) * 18 + 4; // min 4px height

          // Color based on comparison with previous index value
          const isUp = idx === 0 || val >= rateHistory[idx - 1];

          return (
            <View
              key={idx}
              style={[
                styles.sparkBar,
                {
                  height: normalizedHeight,
                  backgroundColor: isUp ? '#22c55e' : '#ef4444',
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1.5,
  },
  indicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeUp: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeFlat: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rateValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 24,
    paddingHorizontal: 4,
  },
  sparkBar: {
    width: 6,
    borderRadius: 3,
  },
});

export default LiveValuationTicker;
