import React from "react";
import { View, Text, TextInput } from "react-native";
import DropdownPicker from "./DropdownPicker";
import styles from "../../../../styles/ApplicationFormStyles";

const SpouseInfoStep = ({
  formData,
  updateFormData,
  activeDropdown,
  handleDropdownOpen,
  closeAllDropdowns,
  educationOptions,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Spouse Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Name of Spouse"
        value={formData.spouseName}
        onChangeText={(text) => updateFormData("spouseName", text)}
        onFocus={closeAllDropdowns}
      />

      <DropdownPicker
        placeholder="Educational Attainment of Spouse"
        value={formData.spouseEducation}
        onValueChange={(value) => updateFormData("spouseEducation", value)}
        options={educationOptions}
        zIndex={4000}
        isOpen={activeDropdown === 'education2'}
        onOpen={() => handleDropdownOpen('education2')}
        onClose={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Age of Spouse"
        value={formData.spouseAge}
        onChangeText={(text) => updateFormData("spouseAge", text)}
        keyboardType="numeric"
        onFocus={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Occupation of Spouse"
        value={formData.spouseOccupation}
        onChangeText={(text) => updateFormData("spouseOccupation", text)}
        onFocus={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Names of Children"
        value={formData.childrenNames}
        onChangeText={(text) => updateFormData("childrenNames", text)}
        multiline
        numberOfLines={3}
        onFocus={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Proposed Type/Nature of Business"
        value={formData.businessType}
        onChangeText={(text) => updateFormData("businessType", text)}
        onFocus={closeAllDropdowns}
      />
    </View>
  );
};

export default SpouseInfoStep;