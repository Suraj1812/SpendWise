import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { fontFamilies } from '../constants/theme';

export const SplashView = () => {
  return (
    <LinearGradient colors={['#F4FFF7', '#E8FFF0', '#D4F8DE']} style={styles.container}>
      <Animated.View entering={ZoomIn.duration(900)} style={styles.logoWrap}>
        <View style={styles.logoInner} />
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(800)} style={styles.title}>
        SpendWise
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(320).duration(800)} style={styles.subtitle}>
        Track smart. Spend wiser.
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: 'center',
    backgroundColor: '#1F7B42',
    borderRadius: 34,
    height: 88,
    justifyContent: 'center',
    shadowColor: 'rgba(31, 123, 66, 0.25)',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 1,
    shadowRadius: 26,
    width: 88,
  },
  logoInner: {
    backgroundColor: '#F4FFF7',
    borderRadius: 999,
    height: 28,
    width: 28,
  },
  title: {
    color: '#102116',
    fontFamily: fontFamilies.extraBold,
    fontSize: 34,
    marginTop: 28,
  },
  subtitle: {
    color: '#456153',
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    marginTop: 10,
  },
});
