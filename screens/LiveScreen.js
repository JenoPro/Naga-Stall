import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Import components
import BottomNavigation from "../components/BottomNavigation";
import StallCard from "../components/Live/StallCard";
import UserHeader from "../components/UserHeader";
import FilterBar from "../components/FilterBar";
import NotificationPopup from "../components/NotificationPopup";

// Import data and utilities
import { fetchLiveStalls } from "../utils/dataFetching";

export default function LiveScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("live");
  const [sortBy, setSortBy] = useState("Live");
  const [notificationStatus, setNotificationStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [liveStalls, setLiveStalls] = useState([]);

  // Effect to automatically close popup after 3 seconds
  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedFullName = await AsyncStorage.getItem("userFullName");
      const storedEmail = await AsyncStorage.getItem("userEmail");

      if (storedFullName && storedEmail) {
        setUserFullname(storedFullName);
        setUserEmail(storedEmail);
      }
    };

    fetchUserData();
    
    // Fetch stalls data
    const stallsData = fetchLiveStalls();
    setLiveStalls(stallsData);
  }, []);

  const handleTabPress = (tabName) => {
    if (tabName === "logout") {
      handleLogout();
    } else {
      setActiveTab(tabName);
      if (tabName === "stall") {
        navigation.navigate("StallScreen");
      } else if (tabName === "documents") {
        navigation.navigate("DocumentsScreen");
      } else if (tabName === "live") {
        navigation.navigate("LiveScreen");
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") },
        { text: "No", onPress: () => console.log("No Pressed") },
        {
          text: "Yes",
          onPress: () => {
            console.log("Yes Pressed");
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleNotificationToggle = () => {
    const newStatus = !notificationStatus;
    setNotificationStatus(newStatus);

    // Show popup message
    setPopupMessage(
      newStatus
        ? "Notifications turned ON for live stalls"
        : "Notifications turned OFF for live stalls"
    );
    setShowPopup(true);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <UserHeader 
          userFullname={userFullname} 
          userEmail={userEmail} 
        />

        <FilterBar 
          sortBy={sortBy} 
          notificationStatus={notificationStatus}
          onNotificationToggle={handleNotificationToggle}
        />

        <FlatList
          data={liveStalls}
          renderItem={({ item }) => <StallCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          style={styles.flatList}
        />

        {/* Notification Popup */}
        <NotificationPopup 
          visible={showPopup}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />

        <BottomNavigation 
          activeTab={activeTab}
          onTabPress={handleTabPress}
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
  flatList: {
    flex: 1,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
});