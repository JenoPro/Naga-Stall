import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import ImageUpload from "./ImageUpload";
import TermsCheckbox from "./TermsCheckbox";

export default function RegistrationForm({ 
  formData, 
  updateFormData, 
  onRegister, 
  isLoading, 
  isConnected 
}) {
  const { fullName, emailAddress, phoneNumber, address, image, termsAccepted } = formData;
  
  const isFormValid = fullName && emailAddress && phoneNumber && address && image && termsAccepted;
  const isButtonDisabled = isLoading || !isConnected || !isFormValid;

  return (
    <View style={styles.formContainer}>
      <Text style={styles.fieldLabel}>Full Name*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={(value) => updateFormData('fullName', value)}
      />

      <Text style={styles.fieldLabel}>Email Address*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={emailAddress}
        onChangeText={(value) => updateFormData('emailAddress', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.fieldLabel}>Phone Number*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={(value) => updateFormData('phoneNumber', value)}
        keyboardType="phone-pad"
      />

      <Text style={styles.fieldLabel}>Address*</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your address"
        value={address}
        onChangeText={(value) => updateFormData('address', value)}
        multiline={true}
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Valid ID*</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
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