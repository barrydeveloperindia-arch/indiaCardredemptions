import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PremiumSlider } from '../components/PremiumSlider';

describe('PremiumSlider Component', () => {
  const mockChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render label and current formatted value with suffix', () => {
    const { getByText } = render(
      <PremiumSlider
        value={50000}
        min={10000}
        max={100000}
        label="Test Limit"
        valueSuffix=" INR"
        onChange={mockChange}
      />
    );

    expect(getByText('Test Limit')).toBeTruthy();
    expect(getByText('50,000 INR')).toBeTruthy();
  });

  it('should call onChange with decremented/incremented values on stepper press', () => {
    const { getByText } = render(
      <PremiumSlider
        value={50000}
        min={10000}
        max={100000}
        step={5000}
        onChange={mockChange}
      />
    );

    // Decrement
    fireEvent.press(getByText('−'));
    expect(mockChange).toHaveBeenCalledWith(45000);

    // Increment
    fireEvent.press(getByText('+'));
    expect(mockChange).toHaveBeenCalledWith(55000);
  });

  it('should cap increment and decrement at min/max limits', () => {
    const { getByText, rerender } = render(
      <PremiumSlider
        value={10000}
        min={10000}
        max={100000}
        step={5000}
        onChange={mockChange}
      />
    );

    // Decrement from min
    fireEvent.press(getByText('−'));
    expect(mockChange).toHaveBeenCalledWith(10000);

    rerender(
      <PremiumSlider
        value={100000}
        min={10000}
        max={100000}
        step={5000}
        onChange={mockChange}
      />
    );

    // Increment from max
    fireEvent.press(getByText('+'));
    expect(mockChange).toHaveBeenCalledWith(100000);
  });
});
