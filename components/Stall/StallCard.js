import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import OverlayApplicationForm from "./ApplicationForm/OverlayApplicationForm";

const StallCard = ({
  item,
  handleViewImage,
  onApplicationSuccess,
  isWebLayout = false,
  screenWidth = 350,
}) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleApplyNow = () => {
    setShowApplicationForm(true);
  };

  const handleCloseForm = () => {
    setShowApplicationForm(false);
  };

  const handleApplicationSubmitted = () => {
    setShowApplicationForm(false);

    if (onApplicationSuccess) {
      onApplicationSuccess();
    }
  };

  const renderStatusButton = () => {
    if (item.hasUserApplied) {
      return (
        <TouchableOpacity
          style={[styles.appliedButton, isWebLayout && styles.webButton]}
          disabled
        >
          <Text
            style={[styles.appliedText, isWebLayout && styles.webButtonText]}
          >
            ALREADY APPLIED
          </Text>
        </TouchableOpacity>
      );
    }

    const status = item.status?.toLowerCase();

    switch (status) {
      case "available":
        return (
          <TouchableOpacity
            style={[styles.applyButton, isWebLayout && styles.webButton]}
            onPress={handleApplyNow}
          >
            <Text
              style={[styles.applyText, isWebLayout && styles.webButtonText]}
            >
              APPLY NOW!
            </Text>
          </TouchableOpacity>
        );
      case "countdown":
        return (
          <TouchableOpacity
            style={[styles.lockButton, isWebLayout && styles.webButton]}
            disabled
          >
            <Text
              style={[styles.lockText, isWebLayout && styles.webButtonText]}
            >
              🔒 COUNTDOWN
            </Text>
          </TouchableOpacity>
        );
      case "raffle":
        return (
          <TouchableOpacity
            style={[styles.raffleButton, isWebLayout && styles.webButton]}
            disabled
          >
            <Text
              style={[styles.raffleText, isWebLayout && styles.webButtonText]}
            >
              🎲 RAFFLE ONGOING
            </Text>
          </TouchableOpacity>
        );
      case "occupied":
      case "taken":
        return (
          <TouchableOpacity
            style={[styles.occupiedButton, isWebLayout && styles.webButton]}
            disabled
          >
            <Text
              style={[styles.occupiedText, isWebLayout && styles.webButtonText]}
            >
              OCCUPIED
            </Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.unknownButton, isWebLayout && styles.webButton]}
            disabled
          >
            <Text
              style={[styles.unknownText, isWebLayout && styles.webButtonText]}
            >
              {item.status ? item.status.toUpperCase() : "UNKNOWN STATUS"}
            </Text>
          </TouchableOpacity>
        );
    }
  };

  const getStatusBadgeStyle = () => {
    if (item.hasUserApplied) {
      return { backgroundColor: "#aaa" };
    }

    const status = item.status?.toLowerCase();
    switch (status) {
      case "available":
        return { backgroundColor: "#1cbb1c" };
      case "countdown":
        return { backgroundColor: "#f0ad4e" };
      case "raffle":
        return { backgroundColor: "#2563eb" };
      case "occupied":
      case "taken":
        return { backgroundColor: "#dc2626" };
      default:
        return { backgroundColor: "#6c757d" };
    }
  };

  const getStatusText = () => {
    if (item.hasUserApplied) return "APPLIED";
    return item.status ? item.status.toUpperCase() : "UNKNOWN";
  };

  const getCardWidth = () => {
    if (!isWebLayout) return "100%";

    const availableWidth = screenWidth - 80 - 40;

    if (availableWidth >= 1400) {
      return availableWidth / 4 - 16;
    } else if (availableWidth >= 1200) {
      return availableWidth / 3 - 16;
    } else if (availableWidth >= 900) {
      return availableWidth / 2 - 16;
    }

    return availableWidth - 16;
  };

  const getImageHeight = () => {
    if (!isWebLayout) return 180;

    const cardWidth = getCardWidth();
    return Math.min(160, cardWidth * 0.55);
  };

  const cardStyles = isWebLayout
    ? [
        styles.card,
        styles.webCard,
        {
          width: getCardWidth(),
          marginHorizontal: 8,
          marginBottom: 16,
        },
      ]
    : [styles.card];

  const imageStyles = [
    styles.image,
    { height: getImageHeight() },
    isWebLayout && styles.webImage,
  ];

  return (
    <>
      <View style={cardStyles}>
        {/* Stall Image */}
        <TouchableOpacity
          onPress={() =>
            item.originalImagePath && handleViewImage(item.originalImagePath)
          }
          style={isWebLayout && styles.webImageContainer}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={imageStyles}
              onError={(e) => {
                console.log(
                  `❌ Error loading image for stall #${item.stall_number}:`,
                  e.nativeEvent.error
                );
              }}
            />
          ) : (
            <Image
              source={require("../../assets/stall.png")}
              style={imageStyles}
              onError={(e) => {
                console.log(
                  `❌ Error loading default image for stall #${item.stall_number}:`,
                  e.nativeEvent.error
                );
              }}
            />
          )}

          {/* Status Badge Overlay */}
          <View
            style={[
              styles.statusBadge,
              getStatusBadgeStyle(),
              isWebLayout && styles.webStatusBadge,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isWebLayout && styles.webStatusBadgeText,
              ]}
            >
              {getStatusText()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Stall Information */}
        <View style={[styles.info, isWebLayout && styles.webInfo]}>
          <View style={styles.headerRow}>
            <Text
              style={[styles.stallName, isWebLayout && styles.webStallName]}
            >
              STALL# {item.stall_number}
            </Text>
            <Text style={[styles.price, isWebLayout && styles.webPrice]}>
              ₱{item.price} / Monthly
            </Text>
          </View>
          <Text style={[styles.details, isWebLayout && styles.webDetails]}>
            {item.location}
          </Text>
          <Text style={[styles.details, isWebLayout && styles.webDetails]}>
            {item.size}
          </Text>
          <View
            style={[
              styles.statusContainer,
              isWebLayout && styles.webStatusContainer,
            ]}
          >
            {renderStatusButton()}
          </View>
        </View>
      </View>

      {/* Overlay Application Form */}
      <OverlayApplicationForm
        visible={showApplicationForm}
        onClose={handleCloseForm}
        onApplicationSubmitted={handleApplicationSubmitted}
        stallInfo={item}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },

  webCard: {
    marginBottom: 16,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: "#e0e0e0",
    transition: Platform.OS === "web" ? "all 0.2s ease" : undefined,
    ":hover":
      Platform.OS === "web"
        ? {
            shadowOpacity: 0.18,
            shadowRadius: 8,
            transform: [{ translateY: -2 }],
          }
        : undefined,
  },

  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  webImage: {
    objectFit: "cover",
  },

  webImageContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },

  webStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  statusBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  webStatusBadgeText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },

  info: {
    padding: 15,
  },

  webInfo: {
    padding: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stallName: {
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },

  webStallName: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },

  price: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#2563eb",
  },

  webPrice: {
    fontSize: 14,
  },

  details: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },

  webDetails: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  statusContainer: {
    marginTop: 10,
  },

  webStatusContainer: {
    marginTop: 12,
  },

  applyButton: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  webButton: {
    paddingVertical: 10,
    borderRadius: 6,
    minHeight: 40,
    justifyContent: "center",
  },

  applyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  webButtonText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },

  lockButton: {
    backgroundColor: "#f0ad4e",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  lockText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  raffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  appliedButton: {
    backgroundColor: "#aaa",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  appliedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  occupiedButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  occupiedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  unknownButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },

  unknownText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default StallCard;
