import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import UserHeader from "../components/UserHeader";
import BottomNavigation from "../components/BottomNavigation";
import UploadDocumentsTab from "../components/Documents/UploadDocumentsTab";
import MySubmissionsTab from "../components/Documents/MySubmissionsTab";
import { handleLogout } from "../utils/actionHandlers";
import styles from "../styles/DocumentsScreenStyles";

export default function DocumentsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("documents");
  const [documentTab, setDocumentTab] = useState("Upload Documents");
  const [isConnected, setIsConnected] = useState(true);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Check internet connection with detailed info
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Network state:", state);
      setIsConnected(state.isConnected && state.isInternetReachable);
      setNetworkInfo(state);
    });
    return () => unsubscribe();
  }, []);

  // Get user data on mount
  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const storedFullName = await AsyncStorage.getItem("userFullName");
      const storedEmail = await AsyncStorage.getItem("userEmail");

      if (storedFullName && storedEmail) {
        setUserFullname(storedFullName);
        setUserEmail(storedEmail);
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  };

  const handleTabPress = (tabName) => {
    if (tabName === "logout") {
      handleLogout(navigation);
    } else {
      setActiveTab(tabName);
      if (tabName === "live") {
        navigation.navigate("LiveScreen");
      } else if (tabName === "documents") {
        navigation.navigate("DocumentsScreen");
      } else if (tabName === "stall") {
        navigation.navigate("StallScreen");
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <UserHeader userFullname={userFullname} userEmail={userEmail} />

        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              You are currently offline. Document upload requires internet connection.
            </Text>
            {networkInfo && (
              <Text style={styles.networkDetails}>
                Network: {networkInfo.type} | Reachable: {networkInfo.isInternetReachable ? 'Yes' : 'No'}
              </Text>
            )}
          </View>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, documentTab === "Upload Documents" && styles.activeTab]}
            onPress={() => setDocumentTab("Upload Documents")}
          >
            <Text style={[styles.tabText, documentTab === "Upload Documents" && styles.activeTabText]}>
              Upload Documents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, documentTab === "My Submissions" && styles.activeTab]}
            onPress={() => setDocumentTab("My Submissions")}
          >
            <Text style={[styles.tabText, documentTab === "My Submissions" && styles.activeTabText]}>
              My Submissions
            </Text>
          </TouchableOpacity>
        </View>

        {documentTab === "Upload Documents" ? (
          <UploadDocumentsTab
            userFullname={userFullname}
            isConnected={isConnected}
          />
        ) : (
          <MySubmissionsTab
            userFullname={userFullname}
          />
        )}

        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}