import * as Haptics from 'expo-haptics';

export const triggerHapticLight = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // Fail silently in environments where Haptics aren't supported
  }
};

export const triggerHapticSuccess = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    // Fail silently
  }
};

export const triggerHapticError = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (e) {
    // Fail silently
  }
};
