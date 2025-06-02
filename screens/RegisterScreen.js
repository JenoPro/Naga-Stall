import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import supabase from "../config/supabaseClient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";

import Header from "../components/Register/Header";
import BackButton from "../components/Register/BackButton";
import ConnectionBanner from "../components/Register/ConnectionBanner";
import RegistrationForm from "../components/Register/RegistrationForm";

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    address: "",
    image: null,
    termsAccepted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Enhanced connection check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Network state:", state);
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
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

  const validateForm = () => {
    const {
      fullName,
      emailAddress,
      phoneNumber,
      address,
      image,
      termsAccepted,
    } = formData;

    if (
      !fullName.trim() ||
      !emailAddress.trim() ||
      !phoneNumber.trim() ||
      !address.trim()
    ) {
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

      // Replace your image upload section with this:
      if (formData.image) {
        console.log("Starting image upload...");

        try {
          // Create a unique filename
          const timestamp = Date.now();
          const filename = `${timestamp}_${formData.fullName.replace(
            /\s+/g,
            "_"
          )}.jpg`;
          const filePath = `valid-ids/${filename}`;

          // Get your Supabase URL without https://
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL.replace(
            "https://",
            ""
          );
          const uploadUrl = `https://${supabaseUrl}/storage/v1/object/registrant-images/${filePath}`;

          console.log("Upload URL:", uploadUrl);

          // Use FileSystem.uploadAsync - this works better with Expo Go
          const uploadResult = await FileSystem.uploadAsync(
            uploadUrl,
            formData.image,
            {
              httpMethod: "POST",
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
              fieldName: "file",
              headers: {
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Upload result:", uploadResult);

          if (uploadResult.status !== 200) {
            throw new Error(
              `Upload failed with status: ${uploadResult.status}`
            );
          }

          console.log("Image uploaded successfully");

          // Get the public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from("registrant-images")
            .getPublicUrl(filePath);

          validIdUrl = urlData.publicUrl;
          console.log("Image URL generated:", validIdUrl);
        } catch (imageError) {
          console.error("Image processing error:", imageError);
          Alert.alert(
            "Upload Failed",
            "Failed to upload your ID image. Please try again or use a smaller image."
          );
          return;
        }
      }
      // Create the data object to insert
      const registrantData = {
        fullName: formData.fullName.trim(),
        emailAddress: formData.emailAddress.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
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
            { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
          ]);

          // Clear form
          setFormData({
            fullName: "",
            emailAddress: "",
            phoneNumber: "",
            address: "",
            image: null,
            termsAccepted: false,
          });
        } catch (insertError) {
          console.error(`Insert attempt ${attempts} failed:`, insertError);

          if (attempts >= maxAttempts) {
            throw insertError;
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error.message.includes("Network request failed") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Network connection failed. Please check your internet connection and try again.";
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("AbortError")
      ) {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (
        error.message.includes("duplicate") ||
        error.message.includes("unique")
      ) {
        errorMessage =
          "This email address is already registered. Please use a different email.";
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

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ConnectionBanner isConnected={isConnected} />
        <Header />
        <BackButton onPress={handleBack} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <RegistrationForm
            formData={formData}
            updateFormData={updateFormData}
            onRegister={handleRegister}
            isLoading={isLoading}
            isConnected={isConnected}
          />
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
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
  },
});
