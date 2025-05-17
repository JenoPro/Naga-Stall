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
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import supabase from "../config/supabaseClient";

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

  // Fetch stalls from Supabase
  const fetchStalls = async () => {
    setLoading(true);
    try {
      // Fetch stalls data from the Stall table
      const { data: stallsData, error } = await supabase
        .from("Stall")
        .select("*");

      if (error) {
        console.log("❌ Supabase error fetching stalls:", error);
        Alert.alert("Error", "Failed to fetch stalls data");
        return;
      }

      console.log("✅ Fetched stalls:", stallsData);

      if (!stallsData || stallsData.length === 0) {
        console.log("No stalls data returned from Supabase");
        setLoading(false);
        return;
      }

      // Map database field names to component field names
      const mappedStalls = stallsData.map((stall) => ({
        id: stall.stallId,
        stall_number: stall.stallNo,
        location: stall.stallLocation,
        size: stall.size,
        price: stall.rentalPrice,
        status: stall.status || "available", // Set default status if not provided
        about: stall.stallAbout,
        imageUrl: null, // Will update with signed URL
        originalImagePath: stall.stallImage,
        created_at: stall.created_at,
        raffle_date: stall.raffleDate,
      }));

      // Get signed URLs for all stall images
      const stallsWithImages = await Promise.all(
        mappedStalls.map(async (stall) => {
          try {
            if (!stall.originalImagePath) {
              return {
                ...stall,
                imageUrl: null,
              };
            }

            const path = `stalls/${stall.originalImagePath}`;

            const { data, error: storageError } = await supabase.storage
              .from("stall-image")
              .createSignedUrl(path, 60); // expires in 60 seconds

            if (storageError) {
              console.error("Error fetching image:", storageError.message);
              return {
                ...stall,
                imageUrl: null,
              };
            }

            console.log(
              `✅ Image URL for stall #${stall.stall_number}:`,
              data?.signedUrl
            );

            return {
              ...stall,
              imageUrl: data?.signedUrl || null,
            };
          } catch (imgError) {
            console.log(
              `❌ Unexpected error getting image for stall #${stall.stall_number}:`,
              imgError
            );
            return {
              ...stall,
              imageUrl: null,
            };
          }
        })
      );

      console.log("✅ Stalls with images:", stallsWithImages);
      setStalls(stallsWithImages);
      // Initial sort
      sortStalls(sortBy, stallsWithImages);
    } catch (error) {
      console.log("❌ Error in fetchStalls:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user has already applied for any stall
  const checkUserApplications = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) return;

      // Check if the user has any stall applications
      const { data, error } = await supabase
        .from("StallApplications") // Adjust table name as needed
        .select("stallNo, status")
        .eq("applicant_email", userEmail);

      if (error) {
        console.log("❌ Error checking applications:", error);
        return;
      }

      // If user has applications, update the stalls status accordingly
      if (data && data.length > 0) {
        setStalls((currentStalls) => {
          return currentStalls.map((stall) => {
            const application = data.find(
              (app) => app.stallNo === stall.stall_number
            );
            if (application) {
              // If the application is approved, update user's stall number
              if (application.status === "approved") {
                setUserStallNumber(stall.stall_number);
              }
              return {
                ...stall,
                status:
                  application.status === "approved" ? "approved" : "applied",
              };
            }
            return stall;
          });
        });
      }
    } catch (error) {
      console.log("❌ Error in checkUserApplications:", error);
    }
  };

  useEffect(() => {
    fetchStalls();
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

  useEffect(() => {
    if (stalls.length > 0) {
      checkUserApplications();
    }
  }, [stalls]);

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

  const handleNotificationToggle = () => {
    const newStatus = !notificationStatus;
    setNotificationStatus(newStatus);
    setPopupMessage(
      newStatus
        ? "Notifications turned ON for stall listings"
        : "Notifications turned OFF for stall listings"
    );
    setShowPopup(true);
  };

  const handleApplyNow = (stall) => {
    navigation.navigate("ApplicationForm", { stall });
  };

  const renderStatusButton = (status, item) => {
    switch (status) {
      case "available":
        return (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => handleApplyNow(item)}
          >
            <Text style={styles.applyText}>APPLY NOW!</Text>
          </TouchableOpacity>
        );
      case "locked":
        return (
          <TouchableOpacity style={styles.lockButton} disabled>
            <Text style={styles.lockText}>🔒 LOCK</Text>
          </TouchableOpacity>
        );
      case "raffle":
        return (
          <TouchableOpacity style={styles.raffleButton} disabled>
            <Text style={styles.raffleText}>RAFFLE ONGOING</Text>
          </TouchableOpacity>
        );
      case "applied":
        return (
          <TouchableOpacity style={styles.appliedButton} disabled>
            <Text style={styles.appliedText}>ALREADY APPLIED</Text>
          </TouchableOpacity>
        );
      case "approved":
        return (
          <TouchableOpacity style={styles.approvedButton} disabled>
            <Text style={styles.approvedText}>APPROVED</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity style={styles.unknownButton} disabled>
            <Text style={styles.unknownText}>UNKNOWN STATUS</Text>
          </TouchableOpacity>
        );
    }
  };

  const renderItem = ({ item }) => {
    // Debug logging
    console.log("Rendering stall item:", item);

    return (
      <View style={styles.card}>
        {/* Use imageUrl if available, otherwise use default image */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            onError={(e) => {
              console.log(
                `❌ Error loading image for stall #${item.stall_number}:`,
                e.nativeEvent.error
              );
            }}
          />
        ) : (
          <Image
            source={require("../assets/stall.png")}
            style={styles.image}
            onError={(e) => {
              console.log(
                `❌ Error loading default image for stall #${item.stall_number}:`,
                e.nativeEvent.error
              );
            }}
          />
        )}
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.stallName}>STALL# {item.stall_number}</Text>
            <Text style={styles.price}>{item.price} Php / Monthly</Text>
          </View>
          <Text style={styles.details}>{item.location}</Text>
          <Text style={styles.details}>{item.size}</Text>
          <View style={styles.statusContainer}>
            {renderStatusButton(item.status, item)}
          </View>
        </View>
      </View>
    );
  };

  const handleTabPress = (tabName) => {
    if (tabName === "logout") {
      handleLogout();
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

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        { text: "Cancel" },
        { text: "No" },
        {
          text: "Yes",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            }),
        },
      ],
      { cancelable: true }
    );
  };

  // Show sort options modal
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const handleSortOption = (option) => {
    setSortBy(option);
    setSortModalVisible(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.userName}>👤 {userFullname}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
          <TouchableOpacity style={styles.stallBadge}>
            <Text style={styles.badgeText}>STALL#: {userStallNumber}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Text style={styles.filterText}>Sort By: {sortBy}</Text>
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
            renderItem={renderItem}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            contentContainerStyle={styles.list}
            style={styles.flatList}
          />
        )}

        {/* Sort Options Modal */}
        <Modal
          visible={sortModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSortModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.popupOverlay}
            activeOpacity={1}
            onPress={() => setSortModalVisible(false)}
          >
            <View style={styles.sortModalContainer}>
              <Text style={styles.sortModalTitle}>Sort By</Text>
              {["Stall", "Price", "Location"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortOption,
                    sortBy === option && styles.activeSortOption,
                  ]}
                  onPress={() => handleSortOption(option)}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option && styles.activeSortOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

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
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  info: {
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stallName: {
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  price: {
    fontWeight: "bold",
    fontSize: 14,
  },
  details: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  statusContainer: {
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },
  lockButton: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  lockText: {
    fontWeight: "bold",
  },
  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  raffleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  appliedButton: {
    backgroundColor: "#aaa",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  appliedText: {
    color: "#fff",
    fontWeight: "bold",
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
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
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
  userEmail: {
    fontSize: 13,
    color: "#555",
  },
});
