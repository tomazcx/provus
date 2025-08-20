import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import ApplicationsScreen from '../screens/teacher/ApplicationsScreen';
import DashboardScreen from '../screens/teacher/DashboardScreen';
import StudentBaseScreen from '../screens/student/StudentBaseScreen';
import TestSubmissionResultScreen from '../screens/student/TestSubmissionResultScreen';

export type RootStackParamList = {
  Login: undefined;
  Applications: undefined;
  Dashboard: { applicationId?: number };
  StudentBase: undefined;
  TestSubmissionResult: { submissionId?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Applications" component={ApplicationsScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="StudentBase" component={StudentBaseScreen} />
        <Stack.Screen name="TestSubmissionResult" component={TestSubmissionResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
