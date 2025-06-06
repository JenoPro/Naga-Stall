import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import separated components
import PersonalInfoStep  from "./ApplicationForm-Components/PersonalInfoStep";
import SpouseInfoStep  from "./ApplicationForm-Components/SpouseInfoStep";
import BusinessInfoStep  from "./ApplicationForm-Components/BusinessInfoStep";
import FinalDetailsStep  from "./ApplicationForm-Components/FinalDetailsStep";
import FormNavigation  from "./ApplicationForm-Components/FormNavigation";

// Import services and constants
import { submitApplicationForm } from "./ApplicationForm-Components/FormSubmissionService";
import { civilStatusOptions, educationOptions, initialFormData } from "./ApplicationForm-Components/FormConstants";

// Import styles
import  styles  from "../../../styles/ApplicationFormStyles";

const OverlayApplicationForm = ({ visible, onClose, stallInfo, onSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userFullname, setUserFullname] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  // Function to handle dropdown open
  const handleDropdownOpen = (dropdownId) => {
    setActiveDropdown(dropdownId);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    closeAllDropdowns(); // Close dropdowns when navigating
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    closeAllDropdowns(); // Close dropdowns when navigating
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const loadUserData = async () => {
    try {
      const storedFullName = await AsyncStorage.getItem("userFullName");

      if (storedFullName) {
        setUserFullname(storedFullName);
        setFormData((prev) => ({ ...prev, fullName: storedFullName }));
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  useEffect(() => {
    if (visible) {
      loadUserData();
    }
  }, [visible]);

  const handleSubmit = async () => {
    const result = await submitApplicationForm(formData, stallInfo);
    
    if (result.success) {
      // Clear form data after successful submission
      setFormData(initialFormData);
      setCurrentStep(1);

      Alert.alert(
        "Success",
        `Application submitted successfully!`,
        [{ 
          text: "OK", 
          onPress: () => {
            onClose();
            // Call the refresh callback if provided
            if (onSubmitSuccess) {
              onSubmitSuccess();
            }
          }
        }]
      );
    }
    // Error handling is done inside submitApplicationForm
  };

  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      activeDropdown,
      handleDropdownOpen,
      closeAllDropdowns,
    };

    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            {...commonProps}
            educationOptions={educationOptions}
            civilStatusOptions={civilStatusOptions}
          />
        );
      case 2:
        return (
          <SpouseInfoStep
            {...commonProps}
            educationOptions={educationOptions}
          />
        );
      case 3:
        return (
          <BusinessInfoStep
            {...commonProps}
          />
        );
      case 4:
        return (
          <FinalDetailsStep
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      {/* Semi-transparent backdrop */}
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            closeAllDropdowns();
            onClose();
          }}
        />

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Application Form</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                closeAllDropdowns();
                onClose();
              }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content - Fixed ScrollView */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={false}
            bounces={true}
            scrollEnabled={true}
            removeClippedSubviews={false}
            keyboardDismissMode="on-drag"
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={closeAllDropdowns}
              style={styles.touchableContainer}
            >
              {renderCurrentStep()}
            </TouchableOpacity>
          </ScrollView>

          {/* Navigation */}
          <FormNavigation
            currentStep={currentStep}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            handleSubmit={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
};

export default OverlayApplicationForm;