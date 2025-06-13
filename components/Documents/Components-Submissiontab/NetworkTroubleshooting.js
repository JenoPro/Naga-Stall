import React from "react";
import { View, Text } from "react-native";
import styles from "../../../styles/DocumentsScreenStyles";

const NetworkTroubleshooting = () => {
  return (
    <View style={styles.troubleshootingBox}>
      <Text style={styles.troubleshootingTitle}>Connection Issues?</Text>
      <Text style={styles.troubleshootingText}>
        • Ensure WiFi/Mobile data is enabled{"\n"}
        • Try switching between WiFi and mobile data{"\n"}
        • Restart your internet connection{"\n"}
        • Check if other apps can access the internet
      </Text>
    </View>
  );
};

export { NetworkTroubleshooting };