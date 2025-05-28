import React, { useEffect, useState, useCallback } from "react";
import { View, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import UserHeader from "./UserHeader";
import BottomNavigation from "./BottomNavigation";
import LiveScreen from "../screens/LiveScreen";
import StallScreen from "../screens/StallScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import NetworkAwareLoading from "./NetworkAwareLoading";

export default function AppLayout() {
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const name = await AsyncStorage.getItem("userFullName");
      const email = await AsyncStorage.getItem("userEmail");
      if (name) setUserFullname(name);
      if (email) setUserEmail(email);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        { text: "Cancel" },
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          },
        },
      ]
    );
  };

  const handleLoadingComplete = useCallback(() => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setLoading(false);
  }, [pendingTab]);

  const handleTabPress = (tab) => {
    if (tab === "logout") return handleLogout();
    
    if (tab !== activeTab) {
      setLoading(true);
      setPendingTab(tab);
      // The actual tab change will happen after loading completes
      // This is now handled by the NetworkAwareLoading component
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "live":
        return <LiveScreen />;
      case "stall":
        return <StallScreen />;
      case "documents":
        return <DocumentsScreen />;
      default:
        return <LiveScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <UserHeader userFullname={userFullname} userEmail={userEmail} />
        <View style={{ flex: 1 }}>{renderScreen()}</View>
        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
        <NetworkAwareLoading 
          visible={loading} 
          onLoadingComplete={handleLoadingComplete}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});