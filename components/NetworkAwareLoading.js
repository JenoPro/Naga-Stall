import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";

const NetworkAwareLoading = ({ visible, onLoadingComplete }) => {
  const [networkSpeed, setNetworkSpeed] = useState("normal");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const checkNetworkSpeed = async () => {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        setNetworkSpeed("offline");
      } else if (netInfo.type === "cellular") {
        if (netInfo.details?.cellularGeneration) {
          switch (netInfo.details.cellularGeneration) {
            case "2g":
              setNetworkSpeed("very-slow");
              break;
            case "3g":
              setNetworkSpeed("slow");
              break;
            case "4g":
              setNetworkSpeed("normal");
              break;
            case "5g":
              setNetworkSpeed("fast");
              break;
            default:
              setNetworkSpeed("normal");
          }
        }
      } else if (netInfo.type === "wifi") {
        setNetworkSpeed("fast");
      } else {
        setNetworkSpeed("normal");
      }
    };

    if (visible) {
      checkNetworkSpeed();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setLoadingProgress(0);
      return;
    }

    let duration;
    switch (networkSpeed) {
      case "offline":
        duration = 10000;
        break;
      case "very-slow":
        duration = 5000;
        break;
      case "slow":
        duration = 3000;
        break;
      case "normal":
        duration = 1500;
        break;
      case "fast":
        duration = 800;
        break;
      default:
        duration = 1500;
    }

    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setLoadingProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible, networkSpeed, onLoadingComplete]);

  if (!visible) return null;

  const getLoadingMessage = () => {
    if (networkSpeed === "offline") {
      return "You appear to be offline. Attempting to load...";
    } else if (networkSpeed === "very-slow" || networkSpeed === "slow") {
      return "Slow connection detected. Please wait...";
    }
    return "Loading...";
  };

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.loadingText}>{getLoadingMessage()}</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  progressBarContainer: {
    height: 4,
    width: "70%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: 15,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
  },
});

export default NetworkAwareLoading;
