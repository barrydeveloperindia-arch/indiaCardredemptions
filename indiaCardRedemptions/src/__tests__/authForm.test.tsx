import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

describe('AuthForm Component TDD Specifications', () => {
  let mockLogin: jest.Mock;
  let mockRegister: jest.Mock;
  let mockAuthenticateBiometrics: jest.Mock;

  beforeEach(() => {
    mockLogin = jest.fn().mockResolvedValue(true);
    mockRegister = jest.fn().mockResolvedValue(true);
    mockAuthenticateBiometrics = jest.fn().mockResolvedValue(true);
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          login: mockLogin,
          register: mockRegister,
          logout: jest.fn(),
          authenticateBiometrics: mockAuthenticateBiometrics,
        }}
      >
        <AuthForm onSuccess={jest.fn()} />
      </AuthContext.Provider>
    );
  };

  it('should render login layout by default', () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
    expect(getByPlaceholderText('Enter password')).toBeTruthy();
    expect(getByText('LOGIN')).toBeTruthy();
    expect(getByText('Need an account? Register')).toBeTruthy();
  });

  it('should switch to registration layout on toggle link press', () => {
    const { getByText, getByPlaceholderText } = renderComponent();
    
    fireEvent.press(getByText('Need an account? Register'));
    
    expect(getByPlaceholderText('Confirm password')).toBeTruthy();
    expect(getByText('REGISTER')).toBeTruthy();
    expect(getByText('Already have an account? Login')).toBeTruthy();
  });

  it('should show error when submitting invalid email', async () => {
    const { getByText, getByPlaceholderText, findByText } = renderComponent();
    
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'bad-email');
    fireEvent.press(getByText('LOGIN'));

    const error = await findByText('Please enter a valid email address.');
    expect(error).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should show error when passwords do not match on registration', async () => {
    const { getByText, getByPlaceholderText, findByText } = renderComponent();
    
    fireEvent.press(getByText('Need an account? Register'));
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'valid@email.com');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'Pass123!');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'DifferentPass123!');
    
    fireEvent.press(getByText('REGISTER'));

    const error = await findByText('Passwords do not match.');
    expect(error).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should submit login credentials successfully on valid input', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();
    
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'admin@pointsarray.com');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'AdminPass123!');
    
    await act(async () => {
      fireEvent.press(getByText('LOGIN'));
    });

    expect(mockLogin).toHaveBeenCalledWith('admin@pointsarray.com', 'AdminPass123!');
  });

  it('should submit registration successfully on valid input', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();
    
    fireEvent.press(getByText('Need an account? Register'));
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'new@pointsarray.com');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'Password123!');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'Password123!');
    
    await act(async () => {
      fireEvent.press(getByText('REGISTER'));
    });

    expect(mockRegister).toHaveBeenCalledWith('new@pointsarray.com', 'Password123!');
  });

  it('should trigger biometric authentication on fingerprint icon press', async () => {
    const { getByTestId } = renderComponent();
    
    await act(async () => {
      fireEvent.press(getByTestId('biometric-auth-button'));
    });

    expect(mockAuthenticateBiometrics).toHaveBeenCalled();
  });
});
