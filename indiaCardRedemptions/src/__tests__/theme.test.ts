import { Colors } from '../constants/theme';

describe('Design Tokens Configuration', () => {
  it('should have the correct Dark Luxury (Obsidian-Gold) palette values', () => {
    // Assert obsidian background
    expect(Colors.light.background).toBe('#050508');
    expect(Colors.dark.background).toBe('#050508');

    // Assert dark metal card background
    expect(Colors.light.backgroundElement).toBe('#121318');
    expect(Colors.dark.backgroundElement).toBe('#121318');

    // Assert white text
    expect(Colors.light.text).toBe('#F5F2EB');
    expect(Colors.dark.text).toBe('#F5F2EB');

    // Assert silver-gray secondary text
    expect(Colors.light.textSecondary).toBe('#8A8E9A');
    expect(Colors.dark.textSecondary).toBe('#8A8E9A');

    // Assert gold accent
    expect((Colors.light as any).gold).toBe('#D4AF37');
    expect((Colors.dark as any).gold).toBe('#D4AF37');
  });
});
