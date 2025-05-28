import { Alert } from "react-native";

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