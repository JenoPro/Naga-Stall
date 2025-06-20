import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import BottomNavigation from "../components/BottomNavigation";
import UserHeader from "../components/UserHeader";
import FilterBar from "../components/FilterBar";
import NotificationPopup from "../components/NotificationPopup";
import ResponsiveNavigation from "../components/BottomNavigation";

import StallCard from "../components/Stall/StallCard";
import SortModal from "../components/Stall/SortModal";
import ImageViewerModal from "../components/Stall/ImageViewerModal";

import {
  getImageUrl,
  fetchStalls,
  checkUserApplications,
} from "../utils/stallUtils";
import {
  handleNotificationToggle,
  handleLogout,
} from "../utils/actionHandlers";

import styles from "../styles/StallScreenStyles";

export default function StallScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("stall");
  const [notificationStatus, setNotificationStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [sortBy, setSortBy] = useState("Stall");
  const [stalls, setStalls] = useState([]);
  const [sortedStalls, setSortedStalls] = useState([]);
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [userStallNumber, setUserStallNumber] = useState("None");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: null });
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get("window"));

  const isWeb = Platform.OS === "web";
  const isTablet = screenData.width >= 768;
  const showWebLayout = isWeb || isTablet;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  const handleViewImage = (imagePath) => {
    const imageUrl = getImageUrl(imagePath);
    console.log("Opening image:", imageUrl);
    setSelectedImage({ url: imageUrl });
    setImageModalVisible(true);
  };

  const sortStalls = (criteria, stallsToSort = stalls) => {
    let sorted = [...stallsToSort];

    if (criteria === "Stall") {
      sorted.sort((a, b) => {
        const aNum = parseInt(String(a.stall_number).replace(/\D/g, ""));
        const bNum = parseInt(String(b.stall_number).replace(/\D/g, ""));
        return aNum - bNum;
      });
    } else if (criteria === "Price") {
      sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (criteria === "Location") {
      sorted.sort((a, b) => a.location.localeCompare(b.location));
    } else if (
      ["Available", "Applied", "Raffle", "Countdown"].includes(criteria)
    ) {
      sorted.sort((a, b) => {
        const getEffectiveStatus = (item) => {
          if (item.hasUserApplied) return "Applied";
          return item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "Unknown";
        };

        const aStatus = getEffectiveStatus(a);
        const bStatus = getEffectiveStatus(b);

        if (aStatus === criteria && bStatus === criteria) {
          const aNum = parseInt(String(a.stall_number).replace(/\D/g, ""));
          const bNum = parseInt(String(b.stall_number).replace(/\D/g, ""));
          return aNum - bNum;
        }

        if (aStatus === criteria) return -1;
        if (bStatus === criteria) return 1;

        const statusOrder = ["available", "applied", "Raffle", "Countdown"];
        const aIndex = statusOrder.indexOf(aStatus);
        const bIndex = statusOrder.indexOf(bStatus);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        const aNum = parseInt(String(a.stall_number).replace(/\D/g, ""));
        const bNum = parseInt(String(b.stall_number).replace(/\D/g, ""));
        return aNum - bNum;
      });
    }

    setSortedStalls(sorted);
  };

  const handleSortOption = (option) => {
    setSortBy(option);
    setSortModalVisible(false);
  };

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

  const handleApplicationSuccess = async () => {
    console.log("🔄 Application submitted, refreshing data...");
    if (userFullname && stalls.length > 0) {
      await checkUserApplications(
        stalls,
        setStalls,
        setUserStallNumber,
        userFullname
      );
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

  const handleFilterClick = () => {
    setSortModalVisible(true);
  };

  const handleNotificationToggle = () => {
    const newStatus = !notificationStatus;
    setNotificationStatus(newStatus);

    setPopupMessage(
      newStatus
        ? "Notifications turned ON for stalls"
        : "Notifications turned OFF for stalls"
    );
    setShowPopup(true);
  };

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

  useEffect(() => {
    if (stalls.length > 0 && userFullname) {
      console.log("🔄 Checking applications for user:", userFullname);
      checkUserApplications(
        stalls,
        setStalls,
        setUserStallNumber,
        userFullname
      );
    }
  }, [stalls.length, userFullname]);

  useEffect(() => {
    sortStalls(sortBy, stalls);
  }, [sortBy, stalls]);

  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  const getNumColumns = () => {
    FlatList;
    if (!showWebLayout) return 1;

    const availableWidth = screenData.width - 80 - 40;

    if (availableWidth >= 1200) return 3;
    if (availableWidth >= 900) return 2;
    return 1;
  };

  const WebHeader = () => (
    <View style={styles.webHeader}>
      <Text style={styles.webTitle}>Market Stalls</Text>
    </View>
  );

  const WebFilterBar = () => (
    <View style={styles.webFilterContainer}>
      <FilterBar
        sortBy={sortBy}
        notificationStatus={notificationStatus}
        onNotificationToggle={handleNotificationToggle}
        onFilterClick={handleFilterClick}
      />
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, showWebLayout && styles.webContainer]}
      >
        {/* Web Layout with Sidebar */}
        {showWebLayout ? (
          <>
            {/* Responsive Navigation - includes sidebar for web */}
            <ResponsiveNavigation
              activeTab={activeTab}
              onTabPress={handleTabPress}
              userFullname={userFullname}
              userEmail={userEmail}
              stallNumber={userStallNumber}
            />

            {/* Main Content Area with proper spacing */}
            <View style={styles.content}>
              <WebHeader />
              <WebFilterBar />

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
                      onApplicationSuccess={handleApplicationSuccess}
                      isWebLayout={showWebLayout}
                      screenWidth={screenData.width}
                    />
                  )}
                  keyExtractor={(item) =>
                    item.id?.toString() || Math.random().toString()
                  }
                  contentContainerStyle={[styles.list, styles.webList]}
                  style={[styles.flatList, styles.webFlatList]}
                  numColumns={getNumColumns()}
                  key={`${getNumColumns()}-${screenData.width}`}
                  columnWrapperStyle={getNumColumns() > 1 ? styles.row : null}
                  scrollEventThrottle={16}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <UserHeader
              userFullname={userFullname}
              userEmail={userEmail}
              stallNumber={userStallNumber}
            />
            <FilterBar
              sortBy={sortBy}
              notificationStatus={notificationStatus}
              onNotificationToggle={handleNotificationToggle}
              onFilterClick={handleFilterClick}
            />

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
                    onApplicationSuccess={handleApplicationSuccess}
                    isWebLayout={showWebLayout}
                    screenWidth={screenData.width}
                  />
                )}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                contentContainerStyle={styles.list}
                style={styles.flatList}
                numColumns={1}
              />
            )}

            <BottomNavigation
              activeTab={activeTab}
              onTabPress={handleTabPress}
            />
          </>
        )}

        <SortModal
          visible={sortModalVisible}
          sortBy={sortBy}
          onSelectOption={handleSortOption}
          onClose={() => setSortModalVisible(false)}
        />

        {/* Only show notification popup on mobile */}
        {!showWebLayout && (
          <NotificationPopup
            visible={showPopup}
            message={popupMessage}
            onClose={() => setShowPopup(false)}
          />
        )}

        <ImageViewerModal
          visible={imageModalVisible}
          imageUrl={selectedImage.url}
          onClose={() => setImageModalVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
