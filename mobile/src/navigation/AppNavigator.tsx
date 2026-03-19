import { Ionicons } from '@expo/vector-icons';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { ExpenseListScreen } from '../screens/expenses/ExpenseListScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useAuthStore } from '../store/auth-store';
import type { AuthStackParamList, RootStackParamList, TabParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen component={LoginScreen} name="Login" />
    <AuthStack.Screen component={SignupScreen} name="Signup" />
  </AuthStack.Navigator>
);

const MainTabs = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fontFamilies.semibold,
          fontSize: 12,
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          height: 84,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            Expenses: 'receipt-outline',
            Insights: 'pie-chart-outline',
            Profile: 'person-outline',
          };

          return <Ionicons color={color} name={iconMap[route.name]} size={size} />;
        },
      })}
    >
      <Tab.Screen component={DashboardScreen} name="Home" />
      <Tab.Screen component={ExpenseListScreen} name="Expenses" />
      <Tab.Screen component={InsightsScreen} name="Insights" />
      <Tab.Screen component={ProfileScreen} name="Profile" />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const theme = useAppTheme();
  const token = useAuthStore((state) => state.token);

  const navigationTheme = theme.mode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.colors.background,
          card: theme.colors.tabBar,
          border: theme.colors.border,
          primary: theme.colors.primary,
          text: theme.colors.text,
        },
        fonts: {
          ...navigationTheme.fonts,
          regular: {
            ...navigationTheme.fonts.regular,
            fontFamily: fontFamilies.regular,
          },
          medium: {
            ...navigationTheme.fonts.medium,
            fontFamily: fontFamilies.medium,
          },
          bold: {
            ...navigationTheme.fonts.bold,
            fontFamily: fontFamilies.bold,
          },
          heavy: {
            ...navigationTheme.fonts.heavy,
            fontFamily: fontFamilies.extraBold,
          },
        },
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <RootStack.Screen component={AuthNavigator} name="Auth" />
        ) : (
          <>
            <RootStack.Screen component={MainTabs} name="Main" />
            <RootStack.Screen
              component={AddExpenseScreen}
              name="AddExpense"
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

