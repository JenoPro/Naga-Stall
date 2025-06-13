import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../config/supabaseClient";

// Import components
import BottomNavigation from "../components/BottomNavigation";
import StallCard from "../components/Live/StallCard";
import UserHeader from "../components/UserHeader";
import FilterBar from "../components/FilterBar";
import NotificationPopup from "../components/NotificationPopup";
import ResponsiveNavigation from "../components/BottomNavigation";
import { handleLogout } from "../utils/actionHandlers";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isLargeScreen = screenWidth >= 768;

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
  const [loading, setLoading] = useState(true);

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

  // Enhanced function to get image URL from Supabase storage
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    try {
      // If it's already a full URL, return it
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }

      // Clean the image path - remove any leading slashes
      const cleanPath = imagePath.startsWith("/")
        ? imagePath.substring(1)
        : imagePath;

      // Generate public URL from Supabase storage
      const { data } = supabase.storage
        .from("stall-images") // Make sure this matches your actual bucket name
        .getPublicUrl(cleanPath);

      // Log for debugging
      console.log(
        `🔍 Image path: ${imagePath} -> Clean path: ${cleanPath} -> URL: ${data?.publicUrl}`
      );

      return data?.publicUrl || null;
    } catch (error) {
      console.error("Error generating image URL:", error);
      return null;
    }
  };

  // Enhanced fetch stalls function with better error handling
  const fetchStalls = async () => {
    try {
      setLoading(true);

      // First, let's check if the Stall table exists and what columns it has
      const { data: tableInfo, error: tableError } = await supabase
        .from("Stall")
        .select("*")
        .limit(1);

      if (tableError) {
        console.error("Table access error:", tableError);
        Alert.alert(
          "Database Error",
          `Cannot access Stall table: ${tableError.message}`
        );
        return;
      }

      const { data, error } = await supabase
        .from("Stall")
        .select(
          `
          stallId,
          stallNo,
          stallLocation,
          size,
          status,
          stallImage,
          rentalPrice,
          stallAbout,
          raffleDate,
          end_time,
          time_running,
          created_at
        `
        )
        .in("status", ["Countdown", "Raffle"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stalls:", error);
        Alert.alert("Error", `Failed to fetch stalls data: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No stalls found with Countdown or Raffle status");
        setLiveStalls([]);
        return;
      }

      // Transform data to match your component structure
      const transformedStalls = data.map((stall) => {
        const imageUrl = getImageUrl(stall.stallImage);

        return {
          id: stall.stallId?.toString() || Math.random().toString(),
          name: stall.stallNo || `Stall ${stall.stallId || "Unknown"}`,
          location: stall.stallLocation || "Location not specified",
          size: stall.size || "Size not specified",
          status: stall.status?.toLowerCase() || "unknown", // 'Countdown' -> 'countdown'
          imageUrl: imageUrl,
          rentalPrice: stall.rentalPrice,
          about: stall.stallAbout,
          raffleDate: stall.raffleDate,
          endTime: stall.end_time,
          timeRunning: stall.time_running,
        };
      });

      console.log(`✅ Successfully fetched ${transformedStalls.length} stalls`);
      setLiveStalls(transformedStalls);
    } catch (error) {
      console.error("Error in fetchStalls:", error);
      Alert.alert("Error", "Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced real-time subscription with better error handling
  useEffect(() => {
    fetchStalls();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("stall_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Stall",
          filter: "status=in.(Countdown,Raffle)",
        },
        (payload) => {
          console.log("🔄 Real-time update received:", payload.eventType);
          // Add a small delay to avoid rapid successive calls
          setTimeout(() => {
            fetchStalls();
          }, 1000);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("❌ Subscription error:", err);
        } else {
          console.log("✅ Subscription status:", status);
        }
      });

    return () => {
      console.log("🔌 Unsubscribing from real-time updates");
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedFullName = await AsyncStorage.getItem("userFullName");
        const storedEmail = await AsyncStorage.getItem("userEmail");

        if (storedFullName && storedEmail) {
          setUserFullname(storedFullName);
          setUserEmail(storedEmail);
          console.log(`👤 User data loaded: ${storedFullName}, ${storedEmail}`);
        } else {
          console.log("⚠️ No user data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
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

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    fetchStalls();
  };

  // Render individual stall card with user data
  const renderStallCard = ({ item }) => (
    <StallCard
      item={item}
      userRole="viewer" // You can modify this based on user permissions
      userFullName={userFullname || "Anonymous"}
      userEmail={userEmail || ""}
      participants={[]} // You can fetch actual participants if needed
      timerRunning={item.timeRunning || false}
      timerPaused={false}
      getImageUrl={getImageUrl}
    />
  );

  // Check if we should use sidebar (web + large screen)
  const shouldUseSidebar = isWeb && isLargeScreen;

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {/* Mobile Header - Only show on mobile */}
          {!shouldUseSidebar && (
            <UserHeader
              userFullname={userFullname || "Loading..."}
              userEmail={userEmail || "Loading..."}
            />
          )}

          {/* Web Sidebar - Only show on web */}
          {shouldUseSidebar && (
            <ResponsiveNavigation
              activeTab={activeTab}
              onTabPress={handleTabPress}
              userFullname={userFullname}
              userEmail={userEmail}
              stallNumber="None"
            />
          )}

          <View
            style={[
              styles.loadingContainer,
              shouldUseSidebar && styles.webContent,
            ]}
          >
            {/* Web Header Container - Only show on web */}
            {shouldUseSidebar && (
              <View style={styles.webHeader}>
                <Text style={styles.webTitle}>Live Stalls</Text>
              </View>
            )}
            <Text style={styles.loadingText}>Loading stalls...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Mobile Header - Only show on mobile */}
        {!shouldUseSidebar && (
          <UserHeader
            userFullname={userFullname || "Anonymous"}
            userEmail={userEmail || "No email"}
          />
        )}

        {/* Web Sidebar - Only show on web */}
        {shouldUseSidebar && (
          <ResponsiveNavigation
            activeTab={activeTab}
            onTabPress={handleTabPress}
            userFullname={userFullname}
            userEmail={userEmail}
            stallNumber="None"
          />
        )}

        <View
          style={[styles.mainContent, shouldUseSidebar && styles.webContent]}
        >
          {/* Web Header Container - Only show on web */}
          {shouldUseSidebar && (
            <View style={styles.webHeader}>
              <Text style={styles.webTitle}>Live Stalls</Text>
            </View>
          )}

          <FilterBar
            sortBy={sortBy}
            notificationStatus={notificationStatus}
            onNotificationToggle={handleNotificationToggle}
          />

          <FlatList
            data={liveStalls}
            renderItem={renderStallCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              shouldUseSidebar && styles.webList,
            ]}
            style={styles.flatList}
            refreshing={loading}
            onRefresh={handleRefresh}
            // Web-specific props for grid layout
            {...(shouldUseSidebar && {
              numColumns: 1, // We handle columns with flexbox in web
              key: "web-layout",
            })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? "Loading..." : "No live stalls available"}
                </Text>
                <Text style={styles.emptySubtext}>
                  Pull down to refresh or check back later
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            }
          />
          {/* Notification Popup */}
          <NotificationPopup
            visible={showPopup}
            message={popupMessage}
            onClose={() => setShowPopup(false)}
          />
        </View>

        {/* Mobile Bottom Navigation - Only show on mobile */}
        {!shouldUseSidebar && (
          <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Main content area (unchanged for mobile)
  mainContent: {
    flex: 1,
  },

  // Web content area with space for sidebar
  webContent: {
    marginLeft: 80, // Fixed space for the navbar
    padding: 30,
    width: "100%",
    maxWidth: "100%",
  },

  // Web header container with white background
  webHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
    borderRadius: 8,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },

  flatList: {
    flex: 1,
  },

  list: {
    padding: 15,
    paddingBottom: 80,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },

  refreshButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },

  refreshButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  webList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },

  list: {
    padding: 15,
    paddingBottom: 80,
  },
});
