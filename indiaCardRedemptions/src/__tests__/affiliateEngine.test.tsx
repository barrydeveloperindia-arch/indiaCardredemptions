import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AffiliateEngine from '../components/AffiliateEngine';
import { Linking, Platform } from 'react-native';

describe('AffiliateEngine Component', () => {
  let openUrlSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    openUrlSpy.mockRestore();
  });

  it('should render analysis titles and recommended card', () => {
    const { getByText } = render(
      <AffiliateEngine recommendedCard="HDFC Infinia" />
    );

    expect(getByText('OPTIMIZATION ANALYSIS')).toBeTruthy();
    expect(getByText('Missing Out On Points?')).toBeTruthy();
    expect(getByText(/HDFC Infinia/)).toBeTruthy();
  });

  it('should trigger click redirect to application link', () => {
    const { getByText } = render(
      <AffiliateEngine recommendedCard="HDFC Infinia" />
    );

    const button = getByText('Apply Now');
    fireEvent.press(button);

    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/affiliate-link');
  });
});
