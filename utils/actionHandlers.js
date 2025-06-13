import { Alert, Platform } from "react-native";

// Cross-platform alert function
const showAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    // For web, use browser confirm/alert
    if (buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      const confirmButton = buttons.find(btn => btn.text === 'Yes' || btn.onPress);
      if (confirmed && confirmButton && confirmButton.onPress) {
        confirmButton.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    // For mobile, use React Native Alert
    if (buttons.length > 0) {
      Alert.alert(title, message, buttons);
    } else {
      Alert.alert(title, message);
    }
  }
};

// Handle notification toggle
export const handleNotificationToggle = (
  currentStatus, 
  setNotificationStatus,
  setPopupMessage,
  setShowPopup
) => {
  const newStatus = !currentStatus;
  setNotificationStatus(newStatus);
  setPopupMessage(
    newStatus
      ? "Notifications turned ON for stall listings"
      : "Notifications turned OFF for stall listings"
  );
  setShowPopup(true);
};

// Handle apply now action
export const handleApplyNow = (stall, navigation) => {
  navigation.navigate("ApplicationForm", { stall });
};

// Handle logout action
export const handleLogout = (navigation) => {
  showAlert(
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
    ]
  );
};