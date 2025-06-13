import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import supabase from "../config/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Checkbox } from "react-native-paper";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Update screen dimensions on change
  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // Determine if we should use web layout
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = screenData.width > 768;
  const useWebLayout = isWeb && isLargeScreen;

  // Load saved credentials on component mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("savedUsername");
        const savedPassword = await AsyncStorage.getItem("savedPassword");
        const savedRememberMe = await AsyncStorage.getItem("rememberMe");
        
        if (savedUsername && savedPassword && savedRememberMe === "true") {
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    // Validate input fields
    if (!username.trim() || !password.trim()) {
      Alert.alert("Login Failed", "Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("Registrant")
        .select("*")
        .contains("userName", [username])
        .contains("password", [password])
        .eq("status", "approved"); // Only allow approved users

      if (error) {
        console.error("❌ Supabase error:", error);
        Alert.alert("Login Failed", "An error occurred. Please try again.");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert("Login Failed", "Incorrect username or password.");
        return;
      }

      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        await AsyncStorage.setItem("savedUsername", username);
        await AsyncStorage.setItem("savedPassword", password);
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        await AsyncStorage.removeItem("savedUsername");
        await AsyncStorage.removeItem("savedPassword");
        await AsyncStorage.removeItem("rememberMe");
      }

      // ✅ Login success
      await AsyncStorage.setItem("userEmail", data[0].emailAddress); // Save email
      await AsyncStorage.setItem("userFullName", data[0].fullName); // Save full name
      navigation.navigate("StallScreen");
    } catch (err) {
      console.error("❌ Login error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("RegisterScreen");
  };

  const renderMobileLayout = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Naga City Stall</Text>

      <View style={styles.boxWrapper}>
        <View style={styles.greenBar} />

        <View style={styles.blueBox}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={rememberMe ? "checked" : "unchecked"}
              onPress={() => setRememberMe(!rememberMe)}
              color="#fff"
            />
            <Text style={styles.checkboxLabel}>Remember Me</Text>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.link}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.greenBar} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Naga Stall © 2024–2025</Text>
        <Text style={styles.footerText}>University of Nueva Caceres</Text>
        <Text style={styles.footerText}>
          Market Enterprise and Promotions Office
        </Text>
      </View>
    </ScrollView>
  );

  const renderWebLayout = () => (
    <View style={styles.webContainer}>
      {/* Header */}
      <View style={styles.webHeader}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.webLogo}
          resizeMode="contain"
        />
        <Text style={styles.webTitle}>Naga City Stall</Text>
      </View>

      <View style={styles.webGreenBar} />

      {/* Form Container */}
      <View style={styles.webFormContainer}>
        <View style={styles.webFormWrapper}>
          <Text style={styles.webLabel}>Username</Text>
          <TextInput
            style={styles.webInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
          />

          <Text style={styles.webLabel}>Password</Text>
          <TextInput
            style={styles.webInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />

          <View style={styles.webCheckboxContainer}>
            <Checkbox
              status={rememberMe ? "checked" : "unchecked"}
              onPress={() => setRememberMe(!rememberMe)}
              color="#fff"
            />
            <Text style={styles.webCheckboxLabel}>Remember Me</Text>
          </View>

          <TouchableOpacity 
            style={styles.webLoginButton} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.webLoginButtonText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.webLinkContainer}
            onPress={handleRegister}
          >
            <Text style={styles.webLink}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.webLinkContainer}>
            <Text style={styles.webLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webGreenBar} />

      {/* Footer */}
      <View style={styles.webFooter}>
        <Text style={styles.webFooterText}>Naga Stall © 2024-2025</Text>
        <Text style={styles.webFooterText}>University of Nueva Caceres</Text>
        <Text style={styles.webFooterText}>
          Market Enterprise and Promotions Office
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={useWebLayout ? styles.webSafeArea : styles.container}>
        {useWebLayout ? renderWebLayout() : renderMobileLayout()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  // Mobile styles (original)
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { alignItems: "center", paddingVertical: 20 },
  logo: { width: 150, height: 150, resizeMode: "contain", marginTop: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0c1c60",
    marginVertical: 10,
  },
  boxWrapper: { width: "100%", marginVertical: 20 },
  greenBar: { height: 15, backgroundColor: "#0f9d00" },
  blueBox: {
    backgroundColor: "#2f54eb",
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  checkboxLabel: {
    color: "#fff",
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: "#0f9d00",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  loginText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: {
    color: "#fff",
    textDecorationLine: "underline",
    marginTop: 10,
  },
  footer: { alignItems: "center", marginTop: 30, padding: 10 },
  footerText: { fontSize: 12, color: "#6B7280" },

  // Web styles (AdminLoginScreen layout)
  webSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  webLogo: {
    width: 120,
    height: 120,
  },
  webTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A2463',
    marginTop: 10,
  },
  webGreenBar: {
    height: 15,
    backgroundColor: '#4CAF50',
  },
  webFormContainer: {
    flex: 1,
    backgroundColor: '#3B6FE2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  webFormWrapper: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  webLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  webInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  webCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  webCheckboxLabel: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  webLoginButton: {
    backgroundColor: '#4CAF50',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  webLoginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webLinkContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  webLink: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  webFooter: {
    padding: 15,
    alignItems: 'center',
  },
  webFooterText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
});

export default LoginScreen;