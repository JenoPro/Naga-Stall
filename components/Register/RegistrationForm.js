import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import ImageUpload from "./ImageUpload";
import TermsCheckbox from "./TermsCheckbox";
import DropdownPicker from "../Stall/ApplicationForm/ApplicationForm-Components/DropdownPicker";
import { barangayOptions, getStreetOptions } from "../Stall/ApplicationForm/ApplicationForm-Components/FormConstants";

export default function RegistrationForm({ 
  formData, 
  updateFormData, 
  onRegister, 
  isLoading, 
  isConnected 
}) {
  const { 
    fullName, 
    emailAddress, 
    phoneNumber, 
    barangay, 
    street, 
    mailingAddress, 
    image, 
    termsAccepted 
  } = formData;
  
  // State for managing dropdown visibility
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Get street options based on selected barangay
  const streetOptions = getStreetOptions(barangay || "");

  // Handle dropdown open/close
  const handleDropdownOpen = (dropdownId) => {
    setActiveDropdown(dropdownId);
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  // Handle barangay selection
  const handleBarangayChange = (value) => {
    updateFormData('barangay', value);
    // Clear street selection when barangay changes
    updateFormData('street', "");
    // Update mailing address
    updateMailingAddress(value, "");
  };

  // Handle street selection
  const handleStreetChange = (value) => {
    updateFormData('street', value);
    // Update mailing address
    updateMailingAddress(barangay, value);
  };

  // Update mailing address helper function
  const updateMailingAddress = (selectedBarangay, selectedStreet) => {
    if (selectedBarangay && selectedStreet) {
      const fullAddress = `${selectedStreet}, Barangay ${selectedBarangay}, Naga City, Camarines Sur`;
      updateFormData("mailingAddress", fullAddress);
    } else if (selectedBarangay) {
      const partialAddress = `Barangay ${selectedBarangay}, Naga City, Camarines Sur`;
      updateFormData("mailingAddress", partialAddress);
    } else {
      updateFormData("mailingAddress", "");
    }
  };
  
  // Update form validation to use new address fields
  const isFormValid = fullName && emailAddress && phoneNumber && barangay && street && image && termsAccepted;
  const isButtonDisabled = isLoading || !isConnected || !isFormValid;

  return (
    <View style={styles.formContainer}>
      <Text style={styles.fieldLabel}>Full Name*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={(value) => updateFormData('fullName', value)}
        onFocus={closeAllDropdowns}
      />

      <Text style={styles.fieldLabel}>Email Address*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={emailAddress}
        onChangeText={(value) => updateFormData('emailAddress', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={closeAllDropdowns}
      />

      <Text style={styles.fieldLabel}>Phone Number*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={(value) => updateFormData('phoneNumber', value)}
        keyboardType="phone-pad"
        onFocus={closeAllDropdowns}
      />

      {/* Address Section */}
      <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
        Complete Address (Naga City, Camarines Sur)
      </Text>

      {/* Barangay Dropdown */}
      <Text style={styles.subLabel}>Barangay</Text>
      <DropdownPicker
        placeholder="Select Barangay"
        value={barangay || ""}
        onValueChange={handleBarangayChange}
        options={barangayOptions}
        zIndex={3000}
        isOpen={activeDropdown === "barangay"}
        onOpen={() => handleDropdownOpen("barangay")}
        onClose={closeAllDropdowns}
        searchable={true}
        searchPlaceholder="Search barangay..."
        style={styles.dropdown}
        // Add scrollable properties for mobile
        maxHeight={200}
        scrollViewProps={{
          nestedScrollEnabled: true,
          showsVerticalScrollIndicator: true,
        }}
        listMode="SCROLLVIEW"
        dropDownDirection="AUTO"
      />

      {/* Street Dropdown - Only show if barangay is selected */}
      {barangay && (
        <>
          <Text style={styles.subLabel}>Street</Text>
          <DropdownPicker
            placeholder="Select Street"
            value={street || ""}
            onValueChange={handleStreetChange}
            options={streetOptions}
            zIndex={2000}
            isOpen={activeDropdown === "street"}
            onOpen={() => handleDropdownOpen("street")}
            onClose={closeAllDropdowns}
            searchable={true}
            searchPlaceholder="Search street..."
            style={styles.dropdown}
            // Add scrollable properties for mobile
            maxHeight={200}
            scrollViewProps={{
              nestedScrollEnabled: true,
              showsVerticalScrollIndicator: true,
            }}
            listMode="SCROLLVIEW"
            dropDownDirection="AUTO"
          />
        </>
      )}

      {/* Display formatted address */}
      {mailingAddress && (
        <View style={styles.addressDisplay}>
          <Text style={styles.addressLabel}>Complete Address:</Text>
          <Text style={styles.addressText}>{mailingAddress}</Text>
        </View>
      )}

      <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Valid ID*</Text>
      <ImageUpload
        image={image}
        onImageSelected={(uri) => updateFormData('image', uri)}
      />

      <TermsCheckbox
        isChecked={termsAccepted}
        onToggle={(checked) => updateFormData('termsAccepted', checked)}
      />

      <TouchableOpacity
        style={[
          styles.registerButton,
          isButtonDisabled && styles.registerButtonDisabled,
        ]}
        onPress={onRegister}
        disabled={isButtonDisabled}
      >
        <Text style={styles.registerText}>
          {isLoading ? "Submitting..." : "Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  subLabel: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
    marginTop: 10,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  dropdown: {
    marginBottom: 10,
    // Ensure dropdown container has proper styling for mobile
    minHeight: 50,
  },
  addressDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
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
});