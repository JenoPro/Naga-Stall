import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import StallScreen from "./screens/StallScreen";
import LiveScreen from "./screens/LiveScreen";
import DocumentsScreen from "./screens/DocumentsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StallScreen"
          component={StallScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LiveScreen"
          component={LiveScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DocumentsScreen"
          component={DocumentsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
