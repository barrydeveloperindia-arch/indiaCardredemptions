import { Colors } from '../constants/theme';

describe('Design Tokens Configuration', () => {
  it('should have the correct Dark Luxury (Obsidian-Gold) palette values', () => {
    // Assert obsidian background
    expect(Colors.light.background).toBe('#090A0F');
    expect(Colors.dark.background).toBe('#090A0F');

    // Assert dark metal card background
    expect(Colors.light.backgroundElement).toBe('#14161F');
    expect(Colors.dark.backgroundElement).toBe('#14161F');

    // Assert white text
    expect(Colors.light.text).toBe('#F3F4F6');
    expect(Colors.dark.text).toBe('#F3F4F6');

    // Assert silver-gray secondary text
    expect(Colors.light.textSecondary).toBe('#9CA3AF');
    expect(Colors.dark.textSecondary).toBe('#9CA3AF');

    // Assert gold accent
    expect((Colors.light as any).gold).toBe('#D4AF37');
    expect((Colors.dark as any).gold).toBe('#D4AF37');
  });
});
