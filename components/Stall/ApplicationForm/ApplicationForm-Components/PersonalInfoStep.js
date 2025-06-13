import React from "react";
import { View, Text, TextInput } from "react-native";
import DropdownPicker from "./DropdownPicker";
import { barangayOptions, getStreetOptions } from "./FormConstants";
import styles from "../../../../styles/ApplicationFormStyles";

const PersonalInfoStep = ({
  formData,
  updateFormData,
  activeDropdown,
  handleDropdownOpen,
  closeAllDropdowns,
  educationOptions,
  civilStatusOptions,
}) => {
  const selectedBarangay = formData.barangay || "";
  const selectedStreet = formData.street || "";

  const streetOptions = getStreetOptions(selectedBarangay);

  const handleBarangayChange = (value) => {
    updateFormData("barangay", value);

    updateFormData("street", "");

    updateMailingAddress(value, "");
  };

  const handleStreetChange = (value) => {
    updateFormData("street", value);

    updateMailingAddress(selectedBarangay, value);
  };

  const updateMailingAddress = (barangay, street) => {
    if (barangay && street) {
      const fullAddress = `${street}, Barangay ${barangay}, Naga City, Camarines Sur`;
      updateFormData("mailingAddress", fullAddress);
    } else if (barangay) {
      const partialAddress = `Barangay ${barangay}, Naga City, Camarines Sur`;
      updateFormData("mailingAddress", partialAddress);
    } else {
      updateFormData("mailingAddress", "");
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(text) => updateFormData("fullName", text)}
        onFocus={closeAllDropdowns}
      />

      <DropdownPicker
        placeholder="Highest Educational Attainment"
        value={formData.highestEducation}
        onValueChange={(value) => updateFormData("highestEducation", value)}
        options={educationOptions}
        zIndex={5000}
        isOpen={activeDropdown === "education1"}
        onOpen={() => handleDropdownOpen("education1")}
        onClose={closeAllDropdowns}
      />

      <DropdownPicker
        placeholder="Civil Status"
        value={formData.civilStatus}
        onValueChange={(value) => updateFormData("civilStatus", value)}
        options={civilStatusOptions}
        zIndex={4000}
        isOpen={activeDropdown === "civilStatus"}
        onOpen={() => handleDropdownOpen("civilStatus")}
        onClose={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={formData.age}
        onChangeText={(text) => updateFormData("age", text)}
        keyboardType="numeric"
        onFocus={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={formData.contactNo}
        onChangeText={(text) => updateFormData("contactNo", text)}
        keyboardType="phone-pad"
        onFocus={closeAllDropdowns}
      />

      {/* Address Section */}
      <Text
        style={[
          styles.stepTitle,
          { fontSize: 16, marginTop: 20, marginBottom: 10 },
        ]}
      >
        Complete Mailing Address (Naga City, Camarines Sur)
      </Text>

      {/* Barangay Dropdown */}
      <DropdownPicker
        placeholder="Select Barangay"
        value={selectedBarangay}
        onValueChange={handleBarangayChange}
        options={barangayOptions}
        zIndex={3000}
        isOpen={activeDropdown === "barangay"}
        onOpen={() => handleDropdownOpen("barangay")}
        onClose={closeAllDropdowns}
        searchable={true}
        searchPlaceholder="Search barangay..."
      />

      {/* Street Dropdown - Only show if barangay is selected */}
      {selectedBarangay && (
        <DropdownPicker
          placeholder="Select Street"
          value={selectedStreet}
          onValueChange={handleStreetChange}
          options={streetOptions}
          zIndex={2000}
          isOpen={activeDropdown === "street"}
          onOpen={() => handleDropdownOpen("street")}
          onClose={closeAllDropdowns}
          searchable={true}
          searchPlaceholder="Search street..."
        />
      )}

      {/* Display formatted address */}
      {formData.mailingAddress && (
        <View
          style={[
            styles.input,
            { backgroundColor: "#f5f5f5", paddingVertical: 15 },
          ]}
        >
          <Text style={{ color: "#666", fontSize: 14 }}>
            {formData.mailingAddress}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PersonalInfoStep;
