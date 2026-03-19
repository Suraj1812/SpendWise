import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type FloatingAddButtonProps = {
  onPress: () => void;
};

export const FloatingAddButton = ({ onPress }: FloatingAddButtonProps) => {
  const theme = useAppTheme();

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.9 : 1,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <Ionicons color="#FFFFFF" name="add" size={30} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 30,
    position: 'absolute',
    right: 24,
  },
  button: {
    alignItems: 'center',
    borderRadius: 999,
    height: 62,
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 1,
    shadowRadius: 26,
    width: 62,
  },
});

