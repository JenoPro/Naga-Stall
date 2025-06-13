import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import supabase from "../config/supabaseClient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from 'expo-image-manipulator';

import Header from "../components/Register/Header";
import BackButton from "../components/Register/BackButton";
import ConnectionBanner from "../components/Register/ConnectionBanner";
import RegistrationForm from "../components/Register/RegistrationForm";

// Cross-platform image compression helper function
const compressImage = async (imageUri) => {
  try {
    console.log("Compressing image:", imageUri);
    
    if (Platform.OS === 'web') {
      // For web, we'll handle compression differently
      // Since we can't use FileSystem.getInfoAsync on web
      try {
        // Try to get the blob to check size
        const response = await fetch(imageUri);
        const blob = await response.blob();
        console.log("Original image size (web):", blob.size);
        
        // If image is larger than 2MB, compress it
        if (blob.size > 2 * 1024 * 1024) {
          // Use ImageManipulator for compression on web
          const manipResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [
              { resize: { width: 1080 } }
            ],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          
          console.log("Image compressed on web");
          return manipResult.uri;
        }
        
        return imageUri;
      } catch (webError) {
        console.log("Web compression fallback:", webError);
        // If we can't check size on web, just try to compress anyway
        try {
          const manipResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [
              { resize: { width: 1080 } }
            ],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          return manipResult.uri;
        } catch (manipError) {
          console.log("ImageManipulator failed on web, using original:", manipError);
          return imageUri;
        }
      }
    } else {
      // For mobile platforms, use the original FileSystem approach
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      console.log("Original image size:", imageInfo.size);
      
      // If image is larger than 2MB, compress it
      if (imageInfo.size > 2 * 1024 * 1024) {
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 1080 } }
          ],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        const compressedInfo = await FileSystem.getInfoAsync(manipResult.uri);
        console.log("Compressed image size:", compressedInfo.size);
        
        return manipResult.uri;
      }
      
      return imageUri;
    }
  } catch (error) {
    console.error("Image compression error:", error);
    return imageUri; // Return original if compression fails
  }
};

// Cross-platform file upload helper
const uploadImageToSupabase = async (imageUri, filePath) => {
  console.log("=== UPLOADING IMAGE ===");
  console.log("Platform:", Platform.OS);
  console.log("Image URI:", imageUri);
  console.log("Upload path:", filePath);

  if (Platform.OS === 'web') {
    // Web upload using fetch and blob
    try {
      console.log("Using web upload method");
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log("Blob size:", blob.size);
      
      const { data, error } = await supabase.storage
        .from('registrant-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;
      console.log("Web upload successful:", data);
      return data;
    } catch (webError) {
      console.error("Web upload failed:", webError);
      throw webError;
    }
  } else {
    // Mobile upload
    try {
      console.log("Using mobile upload method");
      
      // First, verify the file exists
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      console.log("Mobile image exists:", imageInfo.exists);
      console.log("Mobile image size:", imageInfo.size);
      
      if (!imageInfo.exists) {
        throw new Error("Image file not found on mobile device");
      }

      // Method 1: Try Supabase client with base64
      try {
        console.log("Trying Supabase client method...");
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        
        const { data, error } = await supabase.storage
          .from('registrant-images')
          .upload(filePath, byteArray, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (error) throw error;
        console.log("Supabase client upload successful:", data);
        return data;
      } catch (supabaseError) {
        console.log("Supabase client method failed, trying FileSystem upload...", supabaseError);
        
        // Method 2: Fallback to FileSystem.uploadAsync
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const uploadUrl = `${supabaseUrl}/storage/v1/object/registrant-images/${filePath}`;

        const uploadResponse = await FileSystem.uploadAsync(uploadUrl, imageUri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log("FileSystem upload response:", uploadResponse);

        if (uploadResponse.status !== 200) {
          const errorBody = uploadResponse.body ? JSON.parse(uploadResponse.body) : {};
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorBody.message || 'Unknown error'}`);
        }

        console.log("FileSystem upload successful");
        return { path: filePath };
      }
    } catch (mobileError) {
      console.error("Mobile upload failed:", mobileError);
      throw mobileError;
    }
  }
};

// Cross-platform alert function
const showAlert = (title, message, type = 'default', onPress = null) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      // Create a custom popup for web
      const popup = document.createElement('div');
      popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6B7280'};
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 10000;
        max-width: 450px;
        width: 90%;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: fadeIn 0.3s ease-out;
      `;
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `;
      document.head.appendChild(style);
      
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        backdrop-filter: blur(2px);
      `;
      
      // Add icon based on type
      const icon = document.createElement('div');
      icon.style.cssText = `
        text-align: center;
        font-size: 48px;
        margin-bottom: 16px;
      `;
      
      if (type === 'success') {
        icon.innerHTML = '🎉';
      } else if (type === 'error') {
        icon.innerHTML = '❌';
      } else {
        icon.innerHTML = 'ℹ️';
      }
      
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      titleElement.style.cssText = `
        margin: 0 0 12px 0;
        color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#374151'};
        font-size: 20px;
        font-weight: 700;
        text-align: center;
      `;
      
      const messageElement = document.createElement('p');
      messageElement.innerHTML = message.replace(/\n/g, '<br>');
      messageElement.style.cssText = `
        margin: 0 0 24px 0;
        color: #4B5563;
        line-height: 1.6;
        font-size: 15px;
        text-align: center;
      `;
      
      const button = document.createElement('button');
      button.textContent = 'OK';
      button.style.cssText = `
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6B7280'};
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 600;
        width: 100%;
        transition: all 0.2s ease;
      `;
      
      button.onmouseover = () => {
        button.style.transform = 'translateY(-1px)';
        button.style.opacity = '0.9';
      };
      button.onmouseout = () => {
        button.style.transform = 'translateY(0)';
        button.style.opacity = '1';
      };
      
      const closePopup = () => {
        popup.style.animation = 'fadeOut 0.2s ease-in';
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
          if (document.body.contains(popup)) document.body.removeChild(popup);
          if (document.head.contains(style)) document.head.removeChild(style);
          if (onPress) onPress();
        }, 200);
      };
      
      button.onclick = closePopup;
      overlay.onclick = closePopup;
      
      // Add fadeOut animation
      style.textContent += `
        @keyframes fadeOut {
          from { opacity: 1; transform: translate(-50%, -50%); }
          to { opacity: 0; transform: translate(-50%, -60%); }
        }
      `;
      
      popup.appendChild(icon);
      popup.appendChild(titleElement);
      popup.appendChild(messageElement);
      popup.appendChild(button);
      
      document.body.appendChild(overlay);
      document.body.appendChild(popup);
      
      // Focus the button for accessibility
      button.focus();
    } else {
      console.error(`${title}: ${message}`);
      if (onPress) onPress();
    }
  } else {
    // Use native Alert for mobile
    Alert.alert(title, message, [
      { text: "OK", onPress: onPress || (() => {}) }
    ]);
  }
};

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    barangay: "",
    street: "",
    mailingAddress: "",
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
      barangay,
      street,
      image,
      termsAccepted,
    } = formData;

    if (
      !fullName.trim() ||
      !emailAddress.trim() ||
      !phoneNumber.trim() ||
      !barangay?.trim() ||
      !street?.trim()
    ) {
      showAlert(
        "Missing Information", 
        "Please fill in all required fields to proceed with your registration.",
        "error"
      );
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      showAlert(
        "Invalid Email Address", 
        "Please enter a valid email address format (example@domain.com).",
        "error"
      );
      return false;
    }

    if (!image) {
      showAlert(
        "Missing Valid ID", 
        "Please upload a clear photo of your valid ID (driver's license, passport, etc.).",
        "error"
      );
      return false;
    }

    if (!termsAccepted) {
      showAlert(
        "Terms & Conditions Required",
        "Please read and agree to our terms and conditions to complete your registration.",
        "error"
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
        showAlert(
          "No Internet Connection",
          "Please check your internet connection and try again. A stable connection is required for registration.",
          "error"
        );
        return;
      }

      // Test Supabase connection
      const supabaseConnected = await testSupabaseConnection();
      if (!supabaseConnected) {
        showAlert(
          "Server Connection Error",
          "Unable to connect to our servers. Please check your internet connection and try again in a few moments.",
          "error"
        );
        return;
      }

      let validIdUrl = null;

      // Image upload section with cross-platform handling
      if (formData.image) {
        try {
          console.log("=== STARTING IMAGE UPLOAD PROCESS ===");
          
          // Compress image using cross-platform method
          const compressedImageUri = await compressImage(formData.image);
          console.log("Using compressed image URI:", compressedImageUri);

          // Create a unique filename
          const timestamp = Date.now();
          const filename = `${timestamp}_${formData.fullName.replace(/\s+/g, "_")}.jpg`;
          const filePath = `valid-ids/${filename}`;

          // Upload using cross-platform method
          const uploadResult = await uploadImageToSupabase(compressedImageUri, filePath);
          console.log("Image uploaded successfully:", uploadResult);

          // Get the public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('registrant-images')
            .getPublicUrl(filePath);

          validIdUrl = urlData.publicUrl;
          console.log("Image URL generated:", validIdUrl);

        } catch (imageError) {
          console.error("Image upload error details:", imageError);
          
          // More specific error messages
          let errorMessage = "Failed to upload your ID image. ";
          
          if (imageError.message.includes('Network request failed')) {
            errorMessage += "Please check your internet connection and try again.";
          } else if (imageError.message.includes('413') || imageError.message.includes('too large')) {
            errorMessage += "The image file is too large. Please try with a smaller image (under 5MB).";
          } else if (imageError.message.includes('401') || imageError.message.includes('403')) {
            errorMessage += "Authentication error. Please restart the app and try again.";
          } else if (imageError.message.includes('bucket') || imageError.message.includes('not found')) {
            errorMessage += "Storage configuration error. Please contact support.";
          } else if (imageError.message.includes('file not found')) {
            errorMessage += "Selected image file not found. Please select the image again.";
          } else if (imageError.message.includes('expo-file-system')) {
            errorMessage += "Platform compatibility issue. Please try again or contact support.";
          } else {
            errorMessage += `Please try again. Error: ${imageError.message}`;
          }
          
          showAlert("Upload Failed", errorMessage, "error");
          return;
        }
      }
      
      // Create the data object to insert
      const registrantData = {
        fullName: formData.fullName.trim(),
        emailAddress: formData.emailAddress.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.mailingAddress.trim(),
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

          // Show success message with navigation callback
          showAlert(
            "Congratulations! 🎉", 
            "Your registration has been successfully submitted!\n\nYour account is now pending admin approval. You will receive a notification once your registration is reviewed and approved.\n\nThank you for registering with us!",
            "success",
            () => navigation.navigate("LoginScreen")
          );

          // Clear form
          setFormData({
            fullName: "",
            emailAddress: "",
            phoneNumber: "",
            barangay: "",
            street: "",
            mailingAddress: "",
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

      let errorMessage = "An unexpected error occurred during registration. Please try again.";

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
          "This email address is already registered. Please use a different email address or try logging in.";
      } else if (error.message) {
        errorMessage = `Registration failed: ${error.message}`;
      }

      showAlert("Registration Failed", errorMessage, "error");
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