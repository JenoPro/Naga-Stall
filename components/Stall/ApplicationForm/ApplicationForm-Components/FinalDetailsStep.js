import React from "react";
import { View, Text, TextInput } from "react-native";
import  styles  from "../../../../styles/ApplicationFormStyles";

const FinalDetailsStep = ({
  formData,
  updateFormData,
  closeAllDropdowns,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Final Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Name & Signature of Applicant"
        value={formData.applicantSignature}
        onChangeText={(text) => updateFormData("applicantSignature", text)}
        onFocus={closeAllDropdowns}
      />

      <TextInput
        style={styles.input}
        placeholder="House Location"
        value={formData.houseLocation}
        onChangeText={(text) => updateFormData("houseLocation", text)}
        onFocus={closeAllDropdowns}
      />
    </View>
  );
};

export default FinalDetailsStep;