import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import supabase from "../config/supabaseClient";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Check for internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Effect to sync offline registrations when coming back online
  useEffect(() => {
    const handleConnectivityChange = (state) => {
      const currentlyConnected = state.isConnected;

      // If we just came online (was offline, now online)
      if (currentlyConnected && !isConnected) {
        syncOfflineRegistrations();
      }

      setIsConnected(currentlyConnected);
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return () => unsubscribe();
  }, [isConnected]);

  // Image picker function
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload your ID"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to save registration data locally with image
  const saveRegistrationLocally = async (registrantData, localImageUri) => {
    try {
      // Get existing offline registrations or initialize empty array
      const existingDataString = await AsyncStorage.getItem(
        "offlineRegistrations"
      );
      const existingData = existingDataString
        ? JSON.parse(existingDataString)
        : [];

      // Add new registration with timestamp and local image path
      const newData = [
        ...existingData,
        {
          ...registrantData,
          localImageUri,
          timestamp: new Date().toISOString(),
          synced: false,
        },
      ];

      // Save updated array back to AsyncStorage
      await AsyncStorage.setItem(
        "offlineRegistrations",
        JSON.stringify(newData)
      );
      console.log("Registration saved locally with image reference");
      return true;
    } catch (error) {
      console.error("Error saving registration locally:", error);
      return false;
    }
  };

  // Function to sync offline registrations
  const syncOfflineRegistrations = async () => {
    try {
      const existingDataString = await AsyncStorage.getItem(
        "offlineRegistrations"
      );
      if (!existingDataString) return;

      const offlineRegistrations = JSON.parse(existingDataString);
      const unsynced = offlineRegistrations.filter((reg) => !reg.synced);

      if (unsynced.length === 0) return;

      // Process each unsynced registration
      const results = await Promise.all(
        unsynced.map(async (registration, index) => {
          try {
            let validIdUrl = null;

            // If there's a local image, upload it
            if (registration.localImageUri) {
              const response = await fetch(registration.localImageUri);
              const blob = await response.blob();

              const filename = `${Date.now()}_offline_${index}.jpg`;
              const filePath = `valid-ids/${filename}`;

              const { data: fileData, error: fileError } =
                await supabase.storage
                  .from("registrant-images")
                  .upload(filePath, blob);

              if (fileError) throw fileError;

              const { data: urlData } = supabase.storage
                .from("registrant-images")
                .getPublicUrl(filePath);

              validIdUrl = urlData.publicUrl;
            }

            // Create the data object with validId URL
            const registrantData = {
              fullName: registration.fullName,
              emailAddress: registration.emailAddress,
              phoneNumber: registration.phoneNumber,
              address: registration.address,
              validId: validIdUrl,
            };

            // Insert into Supabase
            const { error } = await supabase
              .from("Registrant")
              .insert([registrantData]);

            if (error) throw error;

            return { success: true, index };
          } catch (error) {
            console.error(`Error syncing registration ${index}:`, error);
            return { success: false, index };
          }
        })
      );

      // Update offline storage to mark synced items
      const updatedRegistrations = offlineRegistrations.map((reg, index) => {
        const result = results.find((r) => r.index === index);
        if (result && result.success) {
          return { ...reg, synced: true };
        }
        return reg;
      });

      await AsyncStorage.setItem(
        "offlineRegistrations",
        JSON.stringify(updatedRegistrations)
      );

      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        Alert.alert(
          "Sync Complete",
          `Successfully synced ${successCount} offline registrations.`
        );
      }
    } catch (error) {
      console.error("Error in sync process:", error);
    }
  };

  const validateForm = () => {
    if (!fullName || !emailAddress || !phoneNumber || !address) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return false;
    }

    if (!image) {
      Alert.alert("Missing ID", "Please upload a valid ID");
      return false;
    }

    if (!termsAccepted) {
      Alert.alert(
        "Terms & Conditions",
        "Please agree to the terms and conditions"
      );
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      let validIdUrl = null;

      // Check if online first
      if (isConnected) {
        try {
          // If there's an image, upload it first
          if (image) {
            // Convert image URI to blob
            const response = await fetch(image);
            const blob = await response.blob();

            // Generate a unique filename
            const filename = `${Date.now()}_${fullName.replace(
              /\s+/g,
              "_"
            )}.jpg`;
            const filePath = `valid-ids/${filename}`;

            // Upload to Supabase Storage with timeout
            const uploadTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Upload timeout")), 15000)
            );

            const uploadPromise = supabase.storage
              .from("registrant-images")
              .upload(filePath, blob);

            const { data: fileData, error: fileError } = await Promise.race([
              uploadPromise,
              uploadTimeoutPromise,
            ]);

            if (fileError) {
              console.error("ID image upload error:", fileError);
              throw fileError;
            }

            // Get the public URL for the uploaded file
            const { data: urlData } = supabase.storage
              .from("registrant-images")
              .getPublicUrl(filePath);

            validIdUrl = urlData.publicUrl;
          }

          // Create the data object to insert
          const registrantData = {
            fullName,
            emailAddress,
            phoneNumber,
            address,
            validId: validIdUrl,
          };

          console.log(
            "Starting registration process with data:",
            registrantData
          );

          // Set a timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 10000)
          );

          // Try to insert with timeout
          const insertPromise = supabase
            .from("Registrant")
            .insert([registrantData]);

          const { data, error } = await Promise.race([
            insertPromise,
            timeoutPromise,
          ]);

          if (error) {
            console.error("Supabase insert error:", error);
            throw error;
          }

          console.log("Insert successful, data:", data);

          Alert.alert("Success", "Registration submitted successfully!", [
            { text: "OK", onPress: () => navigation.navigate("Home") },
          ]);

          // Clear form
          setFullName("");
          setEmailAddress("");
          setPhoneNumber("");
          setAddress("");
          setImage(null);
          setTermsAccepted(false);

          return;
        } catch (directError) {
          console.log("Direct insert failed, saving locally:", directError);
          // Fall through to offline storage
        }
      }

      // Create the data object for offline storage
      const registrantData = {
        fullName,
        emailAddress,
        phoneNumber,
        address,
      };

      // If we're offline or the insert failed, save locally
      const savedLocally = await saveRegistrationLocally(registrantData, image);

      if (savedLocally) {
        Alert.alert(
          "Registration Saved",
          "Your registration has been saved locally and will be submitted when your device reconnects to the internet.",
          [{ text: "OK", onPress: () => navigation.navigate("Home") }]
        );

        // Clear form
        setFullName("");
        setEmailAddress("");
        setPhoneNumber("");
        setAddress("");
        setImage(null);
        setTermsAccepted(false);
      } else {
        Alert.alert(
          "Registration Failed",
          "We couldn't save your registration. Please try again later."
        );
      }
    } catch (error) {
      console.error("Final registration error:", error);
      Alert.alert(
        "Registration Issue",
        "We're having trouble processing your registration. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Connection Status Banner */}
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              You are currently offline. Your registration will be saved
              locally.
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Image
              source={require("../assets/nagastall.png")}
              style={styles.nagaLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Apply For Stall</Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require("../assets/back.png")}
            style={styles.backImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Form */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {/* Required Fields */}
            <Text style={styles.fieldLabel}>Full Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.fieldLabel}>Email Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
            />

            <Text style={styles.fieldLabel}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              multiline={true}
              numberOfLines={3}
            />

            {/* Valid ID Upload */}
            <Text style={styles.fieldLabel}>Valid ID*</Text>
            <View style={styles.imageContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text>No ID image selected</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <Text style={styles.imagePickerText}>Upload Valid ID</Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (isLoading ||
                  !fullName ||
                  !emailAddress ||
                  !phoneNumber ||
                  !address ||
                  !image ||
                  !termsAccepted) &&
                  styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={
                isLoading ||
                !fullName ||
                !emailAddress ||
                !phoneNumber ||
                !address ||
                !image ||
                !termsAccepted
              }
            >
              <Text style={styles.registerText}>
                {isLoading ? "Submitting..." : "Register"}
              </Text>
            </TouchableOpacity>

            {/* Terms & Conditions */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I have agreed to the terms and conditions
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  offlineBanner: {
    backgroundColor: "#f8d7da",
    padding: 10,
    alignItems: "center",
  },
  offlineText: {
    color: "#721c24",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#3055D7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  nagaLogo: {
    width: 80,
    height: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 15,
    marginLeft: 15,
    width: 30,
    height: 30,
  },
  backImage: {
    width: 30,
    height: 30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  previewImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 5,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 5,
  },
  imagePickerButton: {
    backgroundColor: "#3055D7",
    padding: 10,
    borderRadius: 5,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#2B8000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: "#aad0a4",
  },
  registerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 3,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2B8000",
    borderColor: "#2B8000",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 14,
  },
});
