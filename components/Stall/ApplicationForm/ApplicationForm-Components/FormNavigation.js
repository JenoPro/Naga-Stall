import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../../../styles/ApplicationFormStyles";

const FormNavigation = ({
  currentStep,
  handlePrevious,
  handleNext,
  handleSubmit,
}) => {
  return (
    <View style={styles.navigation}>
      <TouchableOpacity
        style={[
          styles.navButton,
          currentStep === 1 && styles.disabledButton,
        ]}
        onPress={handlePrevious}
        disabled={currentStep === 1}
      >
        <Text style={styles.navButtonText}>Previous</Text>
      </TouchableOpacity>

      <Text style={styles.stepIndicator}>{currentStep} / 4</Text>

      {currentStep < 4 ? (
        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FormNavigation;