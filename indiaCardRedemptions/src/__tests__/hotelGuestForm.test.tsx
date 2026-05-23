import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HotelGuestForm } from '../components/HotelGuestForm';

describe('HotelGuestForm Component', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <HotelGuestForm onSubmit={mockSubmit} />
    );

    expect(getByPlaceholderText('First Name (e.g. John)')).toBeTruthy();
    expect(getByPlaceholderText('Last Name (e.g. Doe)')).toBeTruthy();
    expect(getByPlaceholderText('Email Address')).toBeTruthy();
    expect(getByText('Confirm Hotel Reservation')).toBeTruthy();
  });

  it('should validate inputs and display error if fields are empty', () => {
    const { getByPlaceholderText, getByText } = render(
      <HotelGuestForm onSubmit={mockSubmit} />
    );

    // Empty out first name
    fireEvent.changeText(getByPlaceholderText('First Name (e.g. John)'), '');
    const submitBtn = getByText('Confirm Hotel Reservation');
    fireEvent.press(submitBtn);

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(getByText('All guest checkout fields are required.')).toBeTruthy();
  });

  it('should validate date format and display error for invalid formats', () => {
    const { getByPlaceholderText, getAllByPlaceholderText, getByText } = render(
      <HotelGuestForm onSubmit={mockSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText('First Name (e.g. John)'), 'Barry');
    fireEvent.changeText(getByPlaceholderText('Last Name (e.g. Doe)'), 'Developer');
    fireEvent.changeText(getByPlaceholderText('Email Address'), 'barry@example.com');
    
    // Change check-in date to invalid format
    const dateInputs = getAllByPlaceholderText('YYYY-MM-DD');
    fireEvent.changeText(dateInputs[0], '12-01-2026'); // invalid format

    const submitBtn = getByText('Confirm Hotel Reservation');
    fireEvent.press(submitBtn);

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(getByText('Dates must be in YYYY-MM-DD format.')).toBeTruthy();
  });

  it('should submit successfully when all fields are filled correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <HotelGuestForm onSubmit={mockSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText('First Name (e.g. John)'), 'Barry');
    fireEvent.changeText(getByPlaceholderText('Last Name (e.g. Doe)'), 'Developer');
    fireEvent.changeText(getByPlaceholderText('Email Address'), 'barry@example.com');

    const submitBtn = getByText('Confirm Hotel Reservation');
    fireEvent.press(submitBtn);

    expect(mockSubmit).toHaveBeenCalledWith({
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      checkInDate: '2026-12-01',
      checkOutDate: '2026-12-05',
    });
  });
});
