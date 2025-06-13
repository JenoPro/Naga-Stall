import React from "react";
import { View, Text } from "react-native";
import LocationSelector from "../FinalDetailsStep/Location";
import styles from "../../../../styles/ApplicationFormStyles";

const FinalDetailsStep = ({
  formData,
  updateFormData,
  closeAllDropdowns,
  userId, 
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Final Details</Text>

      {/* Location Section */}
      <LocationSelector
        formData={formData}
        updateFormData={updateFormData}
      />
    </View>
  );
};

export default FinalDetailsStep;