import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Sample document data with status for My Submissions tab
const submittedDocuments = [
  {
    id: "1",
    name: "Award Paper",
    filename: "MG_20241002_224228_271.jpg",
    status: "approved",
  },
  {
    id: "2",
    name: "Lease Contract",
    filename: "MG_20241002_224228_271.jpg",
    status: "approved",
  },
  {
    id: "3",
    name: "MFPO Market Clearance",
    filename: "MG_20241002_224228_271.jpg",
    status: "approved",
  },
  {
    id: "4",
    name: "Barangay Business Clearance",
    filename: "MG_20241002_224228_271.jpg",
    status: "approved",
  },
  {
    id: "5",
    name: "Cedula",
    filename: "MG_20241002_224228_271.jpg",
    status: "approved",
  },
  {
    id: "6",
    name: "Association Clearance",
    filename: "MG_20241002_224228_271.jpg",
    status: "approved",
  },
  {
    id: "7",
    name: "Voter's ID/Voter's Registration",
    filename: "MG_20241002_224228_271.jpg",
    status: "rejected",
  },
  {
    id: "8",
    name: "Health Card/Yellow Card",
    filename: "MG_20241002_224228_271.jpg",
    status: "rejected",
  },
];

// Required documents list for Upload Documents tab
const requiredDocuments = [
  { id: "1", name: "Award Paper" },
  { id: "2", name: "Lease Contract" },
  { id: "3", name: "MFPO Market Clearance" },
  { id: "4", name: "Barangay Business Clearance" },
  { id: "5", name: "Cedula" },
  { id: "6", name: "Association Clearance" },
  { id: "7", name: "Voter's ID/Voter's Registration" },
  { id: "8", name: "Health Card/Yellow Card" },
];

export default function DocumentsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedTab, setSelectedTab] = useState("upload"); // 'upload' or 'submissions'
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");

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
      if (tabName === "live") {
        navigation.navigate("LiveScreen");
      } else if (tabName === "stall") {
        navigation.navigate("StallScreen");
      }
    }
  };

  const handleLogout = () => {
    // Using the three-option alert style for logout confirmation
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

  const pickImage = async (document) => {
    try {
      // Request permission to access the media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "We need camera roll permissions to upload images"
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];

        // Update the state with the uploaded document
        setUploadedDocuments((prev) => ({
          ...prev,
          [document.id]: {
            uri: selectedImage.uri,
            name:
              selectedImage.fileName || `uploaded_document_${document.id}.jpg`,
            type: selectedImage.type || "image/jpeg",
          },
        }));

        // Updated to three-option alert
        Alert.alert(
          "Upload Success",
          `${document.name} uploaded successfully. What would you like to do next?`,
          [
            {
              text: "View Document",
              onPress: () => console.log("View Document Pressed"),
            },
            {
              text: "Upload Another",
              onPress: () => console.log("Upload Another Pressed"),
            },
            { text: "Done", onPress: () => console.log("Done Pressed") },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking the image");
      console.log(error);
    }
  };

  const takePhoto = async (document) => {
    try {
      // Request permission to access the camera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "We need camera permissions to take photos"
        );
        return;
      }

      // Launch the camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const takenPhoto = result.assets[0];

        // Update the state with the taken photo
        setUploadedDocuments((prev) => ({
          ...prev,
          [document.id]: {
            uri: takenPhoto.uri,
            name: takenPhoto.fileName || `camera_document_${document.id}.jpg`,
            type: takenPhoto.type || "image/jpeg",
          },
        }));

        // Updated to three-option alert
        Alert.alert(
          "Capture Success",
          `${document.name} captured successfully. What would you like to do next?`,
          [
            {
              text: "View Photo",
              onPress: () => console.log("View Photo Pressed"),
            },
            { text: "Retake", onPress: () => takePhoto(document) },
            { text: "Done", onPress: () => console.log("Done Pressed") },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while taking the photo");
      console.log(error);
    }
  };

  const handleUploadDocument = (document) => {
    // This is now using the three-option style from the image
    Alert.alert(
      "Upload Document",
      `Select how you want to upload ${document.name}`,
      [
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") },
        { text: "Gallery", onPress: () => pickImage(document) },
        { text: "Camera", onPress: () => takePhoto(document) },
      ],
      { cancelable: true }
    );
  };

  const handleSubmitDocuments = () => {
    // Check if at least one document is uploaded
    if (Object.keys(uploadedDocuments).length === 0) {
      Alert.alert(
        "Warning",
        "Please upload at least one document before submitting",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      return;
    }

    // Updated to three-option alert
    Alert.alert(
      "Submit Documents",
      "Are you sure you want to submit these documents?",
      [
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") },
        {
          text: "Review First",
          onPress: () => console.log("Review First Pressed"),
        },
        {
          text: "Submit",
          onPress: () => {
            console.log("Submit Pressed");
            Alert.alert("Success", "Documents submitted successfully!");
            setSelectedTab("submissions");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdateDocuments = () => {
    // Updated to three-option alert
    Alert.alert(
      "Update Documents",
      "Are you sure you want to update these documents?",
      [
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") },
        {
          text: "Review First",
          onPress: () => console.log("Review First Pressed"),
        },
        {
          text: "Update",
          onPress: () => {
            console.log("Update Pressed");
            Alert.alert("Success", "Documents updated successfully!");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleViewDocument = (document) => {
    // Updated to three-option alert
    Alert.alert(
      "Document Options",
      `What would you like to do with ${document.name}?`,
      [
        { text: "Close", onPress: () => console.log("Close Pressed") },
        { text: "Edit", onPress: () => handleEditDocument(document) },
        { text: "Download", onPress: () => console.log("Download Pressed") },
      ],
      { cancelable: true }
    );
  };

  const handleEditDocument = (document) => {
    handleUploadDocument(document);
  };

  const handleCheckStatus = (document) => {
    const statusMessages = {
      approved: "This document has been approved by the admin.",
      rejected: "This document was rejected. Please upload a new version.",
      pending: "This document is still pending review by the admin.",
    };

    // Updated to three-option alert for rejected documents
    if (document.status === "rejected") {
      Alert.alert(
        "Document Rejected",
        statusMessages[document.status],
        [
          {
            text: "View Details",
            onPress: () => console.log("View Details Pressed"),
          },
          { text: "Upload New", onPress: () => handleEditDocument(document) },
          { text: "Close", onPress: () => console.log("Close Pressed") },
        ],
        { cancelable: true }
      );
    } else {
      // For approved or pending documents
      Alert.alert(
        "Document Status",
        statusMessages[document.status] || "Status unknown",
        [
          {
            text: "View Details",
            onPress: () => console.log("View Details Pressed"),
          },
          { text: "Close", onPress: () => console.log("Close Pressed") },
        ]
      );
    }
  };

  const renderUploadDocuments = () => (
    <ScrollView style={styles.content}>
      {requiredDocuments.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          style={styles.documentItem}
          onPress={() => handleUploadDocument(doc)}
        >
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{doc.name}</Text>
            {uploadedDocuments[doc.id] && (
              <Text style={styles.uploadedStatus}>
                ✓ Uploaded: {uploadedDocuments[doc.id].name}
              </Text>
            )}
          </View>
          <Image
            source={require("../assets/upload-icon.png")}
            style={styles.uploadIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitDocuments}
      >
        <Text style={styles.submitButtonText}>Submit Documents</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMySubmissions = () => (
    <ScrollView style={styles.content}>
      {submittedDocuments.map((doc) => (
        <View key={doc.id} style={styles.submissionItem}>
          <Text style={styles.documentName}>{doc.name}</Text>
          <View style={styles.fileContainer}>
            <Text style={styles.filename}>{doc.filename}</Text>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  doc.status === "approved"
                    ? styles.approvedDot
                    : styles.rejectedDot,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  doc.status === "approved"
                    ? styles.approvedText
                    : styles.rejectedText,
                ]}
              >
                {doc.status === "approved" ? "Approved" : "Rejected"}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCheckStatus(doc)}
            >
              <Image
                source={require("../assets/check-icon.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Check Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleViewDocument(doc)}
            >
              <Image
                source={require("../assets/view-icon.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditDocument(doc)}
            >
              <Image
                source={require("../assets/edit-icon.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleUpdateDocuments}
      >
        <Text style={styles.submitButtonText}>Update Documents</Text>
      </TouchableOpacity>
    </ScrollView>
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

        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "upload" && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab("upload")}
          >
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === "upload" && styles.activeTabButtonText,
              ]}
            >
              Upload Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "submissions" && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab("submissions")}
          >
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === "submissions" && styles.activeTabButtonText,
              ]}
            >
              My Submissions
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "upload"
          ? renderUploadDocuments()
          : renderMySubmissions()}

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
  tabSelector: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  activeTabButton: {
    backgroundColor: "#4285F4",
  },
  tabButtonText: {
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
    paddingBottom: 80,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "500",
  },
  uploadedStatus: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
  },
  uploadIcon: {
    width: 30,
    height: 30,
    tintColor: "#888",
  },
  submissionItem: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filename: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  approvedDot: {
    backgroundColor: "#4CAF50",
  },
  rejectedDot: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  approvedText: {
    color: "#4CAF50",
  },
  rejectedText: {
    color: "#F44336",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  actionText: {
    fontSize: 12,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 80,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
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
  userEmail: {
    fontSize: 13,
    color: "#555",
    marginTop: -5,
  },
});
