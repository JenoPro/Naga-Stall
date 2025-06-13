import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isLargeScreen = screenWidth >= 768;

const ResponsiveNavigation = ({
  activeTab,
  onTabPress,
  userFullname: propUserFullname,
  userEmail: propUserEmail,
  stallNumber = "None",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userFullname, setUserFullname] = useState(propUserFullname || "");
  const [userEmail, setUserEmail] = useState(propUserEmail || "");
  const [loading, setLoading] = useState(true);
  const animatedWidth = useRef(new Animated.Value(80)).current;
  const shouldUseSidebar = isWeb && isLargeScreen;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        const storedUserFullname =
          (await AsyncStorage.getItem("userFullname")) ||
          (await AsyncStorage.getItem("userFullName"));
        const storedUserEmail = await AsyncStorage.getItem("userEmail");

        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserFullname(
            userData.fullname || userData.name || propUserFullname || "User"
          );
          setUserEmail(userData.email || propUserEmail || "");
        } else if (storedUserFullname || storedUserEmail) {
          setUserFullname(storedUserFullname || propUserFullname || "User");
          setUserEmail(storedUserEmail || propUserEmail || "");
        } else if (propUserFullname || propUserEmail) {
          setUserFullname(propUserFullname || "User");
          setUserEmail(propUserEmail || "");
        } else {
          setUserFullname("User");
          setUserEmail("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        setUserFullname(propUserFullname || "User");
        setUserEmail(propUserEmail || "");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [propUserFullname, propUserEmail]);

  useEffect(() => {
    if (shouldUseSidebar) {
      Animated.timing(animatedWidth, {
        toValue: isExpanded ? 250 : 80,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isExpanded, shouldUseSidebar]);

  const tabs = [
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
  ];

  const handleMouseEnter = () => {
    if (shouldUseSidebar) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (shouldUseSidebar) {
      setIsExpanded(false);
    }
  };

  const handleTabPress = (tabName) => {
    onTabPress(tabName);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!shouldUseSidebar) {
    return (
      <>
        {/* Mobile Header */}
        <View style={styles.mobileHeader}>
          <View>
            <Text style={styles.userName}>👤 {userFullname || "User"}</Text>
            <Text style={styles.userEmail}>{userEmail || "No email"}</Text>
          </View>
          <TouchableOpacity style={styles.stallBadge}>
            <Text style={styles.badgeText}>STALL#: {stallNumber}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.navButton,
                activeTab === tab.name && styles.activeNavButton,
              ]}
              onPress={() => handleTabPress(tab.name)}
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={tab.icon}
                  style={[
                    styles.navIcon,
                    activeTab === tab.name && styles.activeNavIcon,
                  ]}
                  resizeMode="contain"
                />
              </View>
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
      </>
    );
  }

  return (
    <>
      {/* Sidebar Navigation */}
      <Animated.View
        style={[styles.sidebar, { width: animatedWidth }]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Profile Section in Sidebar */}
        <View style={styles.sidebarProfile}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          {isExpanded && (
            <View style={styles.profileInfo}>
              <Text style={styles.sidebarUserName} numberOfLines={1}>
                {userFullname || "User"}
              </Text>
              <Text style={styles.sidebarUserEmail} numberOfLines={1}>
                {userEmail || "No email"}
              </Text>
            </View>
          )}
        </View>

        {/* Navigation Items */}
        <View style={styles.sidebarNavSection}>
          <View style={styles.navItemsContainer}>
            {tabs.slice(0, -1).map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={[
                    styles.sidebarNavItem,
                    isActive && styles.activeSidebarNavItem,
                  ]}
                  onPress={() => handleTabPress(tab.name)}
                >
                  <Image
                    source={tab.icon}
                    style={[
                      styles.sidebarNavIcon,
                      isActive && styles.activeSidebarNavIcon,
                    ]}
                    resizeMode="contain"
                  />
                  {isExpanded && (
                    <Text
                      style={[
                        styles.sidebarNavLabel,
                        isActive && styles.activeSidebarNavLabel,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.sidebarNavItem}
            onPress={() => handleTabPress("logout")}
          >
            <Image
              source={tabs[tabs.length - 1].icon}
              style={styles.sidebarNavIcon}
              resizeMode="contain"
            />
            {isExpanded && <Text style={styles.sidebarNavLabel}>Logout</Text>}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },

  webHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    position: "fixed",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 999,
    transition: "margin-left 0.3s ease",
  },

  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 13,
    color: "#555",
    marginTop: -5,
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
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: "#888",
  },
  navText: {
    fontSize: 12,
    color: "#888",
  },
  activeNavButton: {},
  activeNavIcon: {
    tintColor: "#2563eb",
  },
  activeNavText: {
    color: "#2563eb",
    fontWeight: "bold",
  },

  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 1000,
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
  },
  sidebarProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  sidebarUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  sidebarUserEmail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  sidebarNavSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  navItemsContainer: {
    flex: 1,
  },
  sidebarNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 12,
    cursor: "pointer",
  },
  activeSidebarNavItem: {
    backgroundColor: "#e3f2fd",
  },
  sidebarNavIcon: {
    width: 24,
    height: 24,
    tintColor: "#666",
  },
  activeSidebarNavIcon: {
    tintColor: "#2563eb",
  },
  sidebarNavLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 15,
  },
  activeSidebarNavLabel: {
    color: "#2563eb",
    fontWeight: "600",
  },
  sidebarStallBadge: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  sidebarBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default ResponsiveNavigation;
