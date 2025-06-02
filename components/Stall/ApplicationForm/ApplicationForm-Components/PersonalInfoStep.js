import React from "react";
import { View, Text, TextInput } from "react-native";
import DropdownPicker from "./DropdownPicker";
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

      <TextInput
        style={styles.input}
        placeholder="Complete Mailing Address"
        value={formData.mailingAddress}
        onChangeText={(text) => updateFormData("mailingAddress", text)}
        multiline
        numberOfLines={3}
        onFocus={closeAllDropdowns}
      />
    </View>
  );
};

export default PersonalInfoStep;
