import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Import shared components
import BottomNavigation from "../components/BottomNavigation";
import UserHeader from "../components/UserHeader";
import FilterBar from "../components/FilterBar";
import NotificationPopup from "../components/NotificationPopup";

// Import stall-specific components
import StallCard from "../components/Stall/StallCard";
import SortModal from "../components/Stall/SortModal";
import ImageViewerModal from "../components/Stall/ImageViewerModal";

// Import utils and api functions
import {
  getImageUrl,
  fetchStalls,
  checkUserApplications,
} from "../utils/stallUtils";
import {
  handleNotificationToggle,
  handleLogout,
  handleApplyNow,
} from "../utils/actionHandlers";

// Import styles
import styles from "../styles/StallScreenStyles";

export default function StallScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("stall");
  const [notificationStatus, setNotificationStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [sortBy, setSortBy] = useState("Stall"); // Default sorting by Stall
  const [stalls, setStalls] = useState([]);
  const [sortedStalls, setSortedStalls] = useState([]);
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [userStallNumber, setUserStallNumber] = useState("None");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: null });
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // View Image Handler
  const handleViewImage = (imagePath) => {
    const imageUrl = getImageUrl(imagePath);
    console.log("Opening image:", imageUrl);
    setSelectedImage({ url: imageUrl });
    setImageModalVisible(true);
  };

  // Sort stalls based on criteria
  const sortStalls = (criteria, stallsToSort = stalls) => {
    let sorted = [...stallsToSort];

    if (criteria === "Stall") {
      sorted.sort((a, b) => {
        // Extract numbers from stall_number for numeric sorting
        const aNum = parseInt(String(a.stall_number).replace(/\D/g, ""));
        const bNum = parseInt(String(b.stall_number).replace(/\D/g, ""));
        return aNum - bNum;
      });
    } else if (criteria === "Price") {
      sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (criteria === "Location") {
      sorted.sort((a, b) => a.location.localeCompare(b.location));
    }

    setSortedStalls(sorted);
  };

  // Handle sort option selection
  const handleSortOption = (option) => {
    setSortBy(option);
    setSortModalVisible(false);
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedFullName = await AsyncStorage.getItem("userFullName");
      const storedEmail = await AsyncStorage.getItem("userEmail");

      if (storedFullName && storedEmail) {
        setUserFullname(storedFullName);
        setUserEmail(storedEmail);
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  // Handle tab navigation
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

  // Handle filter button click
  const handleFilterClick = () => {
    setSortModalVisible(true);
  };

  // Handle notification toggle
  const handleNotificationToggle = () => {
    const newStatus = !notificationStatus;
    setNotificationStatus(newStatus);
    
    // Show popup message
    setPopupMessage(
      newStatus
        ? "Notifications turned ON for stalls"
        : "Notifications turned OFF for stalls"
    );
    setShowPopup(true);
  };

  // Fetch stalls data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await loadUserData();
        const stallsData = await fetchStalls();
        setStalls(stallsData);
        sortStalls(sortBy, stallsData);
      } catch (error) {
        console.log("Error loading data:", error);
        Alert.alert("Error", "Failed to load stall data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check for user applications when stalls are loaded
  useEffect(() => {
    if (stalls.length > 0) {
      checkUserApplications(stalls, setStalls, setUserStallNumber, userEmail);
    }
  }, [stalls, userEmail]);

  // Update sorted stalls when sort criteria changes
  useEffect(() => {
    sortStalls(sortBy, stalls);
  }, [sortBy, stalls]);

  // Hide notification popup after delay
  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* User Header - Reusing component */}
        <UserHeader 
          userFullname={userFullname} 
          userEmail={userEmail}
          stallNumber={userStallNumber} 
        />

        {/* Filter Bar - Reusing component */}
        <FilterBar 
          sortBy={sortBy}
          notificationStatus={notificationStatus}
          onNotificationToggle={handleNotificationToggle}
          onFilterClick={handleFilterClick}
        />

        {/* Stall Listings */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading stalls...</Text>
          </View>
        ) : sortedStalls.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No stalls available</Text>
          </View>
        ) : (
          <FlatList
            data={sortedStalls}
            renderItem={({ item }) => (
              <StallCard
                item={item}
                handleViewImage={handleViewImage}
                onApplyNow={() => handleApplyNow(item, navigation)}
              />
            )}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            contentContainerStyle={styles.list}
            style={styles.flatList}
          />
        )}

        {/* Modals */}
        <SortModal
          visible={sortModalVisible}
          sortBy={sortBy}
          onSelectOption={handleSortOption}
          onClose={() => setSortModalVisible(false)}
        />

        {/* NotificationPopup - Reusing component */}
        <NotificationPopup
          visible={showPopup}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />

        <ImageViewerModal
          visible={imageModalVisible}
          imageUrl={selectedImage.url}
          onClose={() => setImageModalVisible(false)}
        />

        {/* Bottom Navigation - Already reusing component */}
        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}