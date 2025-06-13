import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import UserHeader from "../components/UserHeader";
import BottomNavigation from "../components/BottomNavigation";
import ResponsiveNavigation from "../components/BottomNavigation";
import UploadDocumentsTab from "../components/Documents/UploadDocumentsTab";
import MySubmissionsTab from "../components/Documents/MySubmissionsTab";
import { handleLogout } from "../utils/actionHandlers";
import styles from "../styles/DocumentsScreenStyles";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isLargeScreen = screenWidth >= 768;

export default function DocumentsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("documents");
  const [documentTab, setDocumentTab] = useState("Upload Documents");
  const [isConnected, setIsConnected] = useState(true);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [stallNumber, setStallNumber] = useState("None");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Network state:", state);
      setIsConnected(state.isConnected && state.isInternetReachable);
      setNetworkInfo(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const storedFullName = await AsyncStorage.getItem("userFullName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const storedStallNumber = await AsyncStorage.getItem("stallNumber");

      if (storedFullName && storedEmail) {
        setUserFullname(storedFullName);
        setUserEmail(storedEmail);
        setStallNumber(storedStallNumber || "None");
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

  const renderMobileLayout = () => (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <UserHeader userFullname={userFullname} userEmail={userEmail} />

        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              You are currently offline. Document upload requires internet
              connection.
            </Text>
            {networkInfo && (
              <Text style={styles.networkDetails}>
                Network: {networkInfo.type} | Reachable:{" "}
                {networkInfo.isInternetReachable ? "Yes" : "No"}
              </Text>
            )}
          </View>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              documentTab === "Upload Documents" && styles.activeTab,
            ]}
            onPress={() => setDocumentTab("Upload Documents")}
          >
            <Text
              style={[
                styles.tabText,
                documentTab === "Upload Documents" && styles.activeTabText,
              ]}
            >
              Upload Documents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              documentTab === "My Submissions" && styles.activeTab,
            ]}
            onPress={() => setDocumentTab("My Submissions")}
          >
            <Text
              style={[
                styles.tabText,
                documentTab === "My Submissions" && styles.activeTabText,
              ]}
            >
              My Submissions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {documentTab === "Upload Documents" ? (
            <UploadDocumentsTab
              userFullname={userFullname}
              isConnected={isConnected}
            />
          ) : (
            <MySubmissionsTab userFullname={userFullname} />
          )}
        </View>

        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </SafeAreaProvider>
  );

  const renderWebLayout = () => (
    <View style={styles.webContainer}>
      <ResponsiveNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        userFullname={userFullname}
        userEmail={userEmail}
        stallNumber={stallNumber}
      />

      <View style={styles.webContent}>
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              You are currently offline. Document upload requires internet
              connection.
            </Text>
            {networkInfo && (
              <Text style={styles.networkDetails}>
                Network: {networkInfo.type} | Reachable:{" "}
                {networkInfo.isInternetReachable ? "Yes" : "No"}
              </Text>
            )}
          </View>
        )}

        <View style={styles.webHeader}>
          <Text style={styles.webPageTitle}>Documents</Text>
        </View>

        <View style={styles.webTabContainer}>
          <TouchableOpacity
            style={[
              styles.webTab,
              documentTab === "Upload Documents" && styles.webActiveTab,
            ]}
            onPress={() => setDocumentTab("Upload Documents")}
          >
            <Text
              style={[
                styles.webTabText,
                documentTab === "Upload Documents" && styles.webActiveTabText,
              ]}
            >
              Upload Documents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.webTab,
              documentTab === "My Submissions" && styles.webActiveTab,
            ]}
            onPress={() => setDocumentTab("My Submissions")}
          >
            <Text
              style={[
                styles.webTabText,
                documentTab === "My Submissions" && styles.webActiveTabText,
              ]}
            >
              My Submissions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.webTabContent}>
          {documentTab === "Upload Documents" ? (
            <UploadDocumentsTab
              userFullname={userFullname}
              isConnected={isConnected}
            />
          ) : (
            <MySubmissionsTab userFullname={userFullname} />
          )}
        </View>
      </View>
    </View>
  );

  if (isWeb && isLargeScreen) {
    return renderWebLayout();
  } else {
    return renderMobileLayout();
  }
}
