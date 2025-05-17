import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Sample data for live stalls
const liveStalls = [
  {
    id: "1",
    name: "STALL# 30",
    location: "2nd Floor / Grocery Section",
    size: "3x3 meters",
    image: require("../assets/stall.png"),
    status: "raffle",
  },
  {
    id: "2",
    name: "STALL# 50",
    location: "2nd Floor / Grocery Section",
    size: "3x3 meters",
    image: require("../assets/stall.png"),
    status: "countdown",
  },
];

export default function LiveScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("live");
  const [sortBy, setSortBy] = useState("Live");
  const [notificationStatus, setNotificationStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");

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
    const fetchUser = async () => {
      const storedFullName = await AsyncStorage.getItem("userFullName");
      const storedEmail = await AsyncStorage.getItem("userEmail");

      if (storedFullName && storedEmail) {
        setUserFullname(storedFullName);
        setUserEmail(storedEmail);
      }
    };

    fetchUser();
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

  const renderStatusButton = (status) => {
    switch (status) {
      case "raffle":
        return (
          <TouchableOpacity style={styles.raffleButton} disabled>
            <Text style={styles.raffleText}>RAFFLE ONGOING</Text>
          </TouchableOpacity>
        );
      case "countdown":
        return (
          <TouchableOpacity style={styles.countdownButton} disabled>
            <Text style={styles.countdownText}>COUNTDOWN</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      {item.status === "raffle" && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>Live</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <View style={styles.stallNameContainer}>
          <Text style={styles.stallName}>{item.name}</Text>
        </View>
        <Text style={styles.details}>{item.location}</Text>
        <Text style={styles.details}>{item.size}</Text>
        {renderStatusButton(item.status)}
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.userName}>👤 {userFullname}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
          <TouchableOpacity style={styles.stallBadge}>
            <Text style={styles.badgeText}>STALL#: None</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Short By: {sortBy}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationToggle}
          >
            <Image
              source={require("../assets/notification-icon.png")}
              style={[
                styles.notificationIcon,
                { tintColor: notificationStatus ? "#2563eb" : "#333" },
              ]}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={liveStalls}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          style={styles.flatList}
        />

        {/* Notification Popup */}
        <Modal
          visible={showPopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPopup(false)}
        >
          <TouchableOpacity
            style={styles.popupOverlay}
            activeOpacity={1}
            onPress={() => setShowPopup(false)}
          >
            <View style={styles.popupContainer}>
              <Text style={styles.popupText}>{popupMessage}</Text>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.bottomNav}>
          {[
            {
              name: "live",
              label: "Live",
              icon: require("../assets/live-icon.png"),
            },
            {
              name: "documents",
              label: "Documents",
              icon: require("../assets/documents-icon.png"),
            },
            {
              name: "stall",
              label: "Stall",
              icon: require("../assets/stall-icon.png"),
            },
            {
              name: "logout",
              label: "Logout",
              icon: require("../assets/logout-icon.png"),
            },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.navButton,
                activeTab === tab.name && styles.activeNavButton,
              ]}
              onPress={() => handleTabPress(tab.name)}
            >
              <Image
                source={tab.icon}
                style={[
                  styles.navIcon,
                  activeTab === tab.name && styles.activeNavIcon,
                ]}
              />
              <Text
                style={[
                  styles.navText,
                  activeTab === tab.name && styles.activeNavText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  stallBadge: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontWeight: "bold",
    marginRight: 5,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  flatList: {
    flex: 1,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
    flexDirection: "row",
    height: 120,
  },
  image: {
    width: "40%",
    height: "100%",
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "red",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  liveBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  stallNameContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  stallName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  details: {
    fontSize: 12,
    color: "#666",
  },
  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  raffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  countdownButton: {
    backgroundColor: "red",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  countdownText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  // Popup styles
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popupContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 15,
    width: "80%",
    alignItems: "center",
  },
  popupText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 3,
    tintColor: "#888",
  },
  navText: {
    fontSize: 12,
    color: "#888",
  },
  activeNavButton: {
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
  },
  activeNavIcon: {
    tintColor: "#2563eb",
  },
  activeNavText: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 13,
    color: "#555",
    marginTop: -5,
  },
});
