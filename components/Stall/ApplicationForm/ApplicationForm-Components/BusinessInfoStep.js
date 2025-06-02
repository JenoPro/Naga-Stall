import React from "react";
import { View, Text, TextInput } from "react-native";
import  styles  from "../../../../styles/ApplicationFormStyles";

const BusinessInfoStep = ({
  formData,
  updateFormData,
  closeAllDropdowns,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Business Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Capitalization"
        value={formData.capitalization}
        onChangeText={(text) => updateFormData("capitalization", text)}
        keyboardType="numeric"
        onFocus={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="Source of Capital"
        value={formData.capitalSource}
        onChangeText={(text) => updateFormData("capitalSource", text)}
        onFocus={closeAllDropdowns}
      />

      <Text style={styles.label}>
        Previous Business Experience (If any):
      </Text>
      <TextInput
        style={styles.textArea}
        value={formData.previousExperience}
        onChangeText={(text) => updateFormData("previousExperience", text)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        onFocus={closeAllDropdowns}
      />

      <Text style={styles.label}>
        Relative who is presently a Stall owner @ NCPM (If Any):
      </Text>
      <TextInput
        style={styles.textArea}
        value={formData.relativeStallOwner}
        onChangeText={(text) => updateFormData("relativeStallOwner", text)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        onFocus={closeAllDropdowns}
      />
    </View>
  );
};

export default BusinessInfoStep;