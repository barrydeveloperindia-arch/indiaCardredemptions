import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ThemedText style={styles.title} type="subtitle">
            Something went wrong.
          </ThemedText>
          <ThemedText style={styles.message}>
            The Points Array application encountered an unexpected error. Please restart the app.
          </ThemedText>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F3F4F6', // Corporate silver light background
  },
  title: {
    color: '#1F2937',
    marginBottom: 8,
  },
  message: {
    color: '#4B5563',
    textAlign: 'center',
  },
});
