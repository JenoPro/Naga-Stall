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

  // Enhanced connection check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Network state:", state);
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      console.log("Initial network state:", state);
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      const { data, error } = await supabase
        .from("Registrant")
        .select("count", { count: "exact", head: true });
      
      if (error) {
        console.error("Supabase connection test failed:", error);
        return false;
      }
      
      console.log("Supabase connection successful");
      return true;
    } catch (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }
  };

  // Image picker function
  const pickImage = async () => {
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
      quality: 0.7, // Further reduced for better upload
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!fullName.trim() || !emailAddress.trim() || !phoneNumber.trim() || !address.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
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

      // Test network connectivity first
      console.log("Checking network connectivity...");
      const networkState = await NetInfo.fetch();
      console.log("Current network state:", networkState);

      if (!networkState.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your internet connection and try again."
        );
        return;
      }

      // Test Supabase connection
      const supabaseConnected = await testSupabaseConnection();
      if (!supabaseConnected) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again."
        );
        return;
      }

      let validIdUrl = null;

      // Upload image if exists
      if (image) {
        console.log("Starting image upload...");

        try {
          // Convert image URI to blob with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(image, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }

          const blob = await response.blob();
          console.log("Image converted to blob, size:", blob.size);

          // Generate a unique filename
          const timestamp = Date.now();
          const filename = `${timestamp}_${fullName.replace(/\s+/g, "_")}.jpg`;
          const filePath = `valid-ids/${filename}`;

          // Upload to Supabase Storage with retry logic
          let uploadSuccess = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (!uploadSuccess && attempts < maxAttempts) {
            attempts++;
            console.log(`Upload attempt ${attempts}/${maxAttempts}`);

            try {
              const { data: fileData, error: fileError } = await supabase.storage
                .from("registrant-images")
                .upload(filePath, blob, {
                  cacheControl: '3600',
                  upsert: false,
                  duplex: 'half' // Add duplex option for better compatibility
                });

              if (fileError) {
                throw fileError;
              }

              console.log("Image uploaded successfully:", fileData);
              uploadSuccess = true;

              // Get the public URL for the uploaded file
              const { data: urlData } = supabase.storage
                .from("registrant-images")
                .getPublicUrl(filePath);

              validIdUrl = urlData.publicUrl;
              console.log("Image URL generated:", validIdUrl);

            } catch (uploadError) {
              console.error(`Upload attempt ${attempts} failed:`, uploadError);
              
              if (attempts >= maxAttempts) {
                throw uploadError;
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

        } catch (imageError) {
          console.error("Image processing error:", imageError);
          Alert.alert(
            "Upload Failed",
            "Failed to upload your ID image. Please try with a smaller image or check your connection."
          );
          return;
        }
      }

      // Create the data object to insert
      const registrantData = {
        fullName: fullName.trim(),
        emailAddress: emailAddress.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        validId: validIdUrl,
      };

      console.log("Starting registration process with data:", registrantData);

      // Insert into Supabase with retry logic
      let insertSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!insertSuccess && attempts < maxAttempts) {
        attempts++;
        console.log(`Database insert attempt ${attempts}/${maxAttempts}`);

        try {
          const { data, error } = await supabase
            .from("Registrant")
            .insert([registrantData])
            .select();

          if (error) {
            throw error;
          }

          console.log("Insert successful, data:", data);
          insertSuccess = true;

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

        } catch (insertError) {
          console.error(`Insert attempt ${attempts} failed:`, insertError);
          
          if (attempts >= maxAttempts) {
            throw insertError;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.message.includes("Network request failed") || 
          error.message.includes("fetch")) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (error.message.includes("timeout") || 
                 error.message.includes("AbortError")) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.message.includes("duplicate") || 
                 error.message.includes("unique")) {
        errorMessage = "This email address is already registered. Please use a different email.";
      } else if (error.message) {
        errorMessage = `Registration failed: ${error.message}`;
      }

      Alert.alert("Registration Error", errorMessage);
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
              No internet connection. Please connect to register.
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
              autoCapitalize="none"
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

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (isLoading ||
                  !isConnected ||
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
                !isConnected ||
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
