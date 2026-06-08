import React from 'react';
import { render } from '@testing-library/react-native';
import { TransferBridge } from '../components/TransferBridge';

describe('TransferBridge Component [FT-102_TransferBridgeVisualizer]', () => {
  it('should render the source node, destination node, and transfer ratio', () => {
    const { getByText, getByTestId } = render(
      <TransferBridge
        fromBank="HDFC"
        toProgram="Singapore Airlines KrisFlyer"
        ratio="1:1"
      />
    );

    expect(getByText('HDFC')).toBeTruthy();
    expect(getByText('Singapore Airlines KrisFlyer')).toBeTruthy();
    expect(getByText('1:1')).toBeTruthy();
    expect(getByTestId('flow-path')).toBeTruthy();
  });
});
