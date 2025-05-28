import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

const BottomNavigation = ({ activeTab, onTabPress }) => {
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

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.navButton,
            activeTab === tab.name && styles.activeNavButton,
          ]}
          onPress={() => onTabPress(tab.name)}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={tab.icon}
              style={[
                styles.navIcon,
                activeTab === tab.name && styles.activeNavIcon,
              ]}
              resizeMode="contain" // 👈 Makes sure the icon fits properly
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
  );
};

const styles = StyleSheet.create({
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
  activeNavIcon: {
    tintColor: "#2563eb",
  },
  activeNavText: {
    color: "#2563eb",
    fontWeight: "bold",
  },
});

export default BottomNavigation;
