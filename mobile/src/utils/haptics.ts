import * as Haptics from 'expo-haptics';

export const triggerHaptic = async (
  type: 'success' | 'warning' | 'error' | 'selection' | 'impact' = 'selection',
) => {
  try {
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'impact':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'selection':
      default:
        await Haptics.selectionAsync();
        break;
    }
  } catch {
    // Haptics can fail on unsupported platforms; the app should continue silently.
  }
};

