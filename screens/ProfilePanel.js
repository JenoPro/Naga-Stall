import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const ProfilePanel = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible && slideAnim.__getValue() === -width) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Image
            source={require("../assets/user-icon.png")} // Replace with actual profile icon
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>Jeno Laurente</Text>
            <Text style={styles.email}>jenoaldrei.laurente@unc.edu.ph</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {[
          { icon: "👤", label: "Personal information" },
          { icon: "🛡️", label: "Password & Security" },
          { icon: "🔔", label: "Notification Preferences" },
          { icon: "📚", label: "Language & Region" },
          { icon: "🗑️", label: "Delete Account" },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.item}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

export default ProfilePanel;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width,
    backgroundColor: "#fff",
    zIndex: 1000,
    elevation: 5,
  },
  header: {
    backgroundColor: "#002B80",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backArrow: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#fff",
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  email: {
    color: "#d1d5db",
    fontSize: 13,
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#444",
    marginBottom: 15,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemIcon: {
    marginRight: 15,
    fontSize: 18,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  chevron: {
    fontSize: 18,
    color: "#ccc",
  },
});
