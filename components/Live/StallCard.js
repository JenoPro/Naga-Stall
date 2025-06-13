import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import LiveRaffle from "./LiveRaffle";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isLargeScreen = screenWidth >= 768;

const StallCard = ({
  item,

  userRole = "viewer",
  userFullName = "Anonymous",
  userEmail = "",
  participants = [],
  timerRunning = false,
  timerPaused = false,
  getImageUrl = null,
}) => {
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showLiveRaffle, setShowLiveRaffle] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [imageError, setImageError] = useState(false);

  const shouldUseWebLayout = isWeb && isLargeScreen;

  const getCardWidth = () => {
    if (!shouldUseWebLayout) return "100%";

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
    if (!shouldUseWebLayout) return 120;

    const cardWidth = getCardWidth();
    return Math.min(140, cardWidth * 0.5);
  };

  useEffect(() => {
    if (showCountdownModal && item.status === "countdown" && item.endTime) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const endTime = new Date(item.endTime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          let timeString = "";
          if (days > 0) timeString += `${days}d `;
          if (hours > 0) timeString += `${hours}h `;
          if (minutes > 0) timeString += `${minutes}m `;
          timeString += `${seconds}s`;

          setTimeLeft(timeString);
        } else {
          setTimeLeft("Raffle Started!");
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }
  }, [showCountdownModal, item.status, item.endTime]);

  const handleCountdownPress = () => {
    if (item.status === "countdown") {
      setShowCountdownModal(true);
    }
  };

  const handleRafflePress = () => {
    if (item.status === "raffle") {
      setShowLiveRaffle(true);
    }
  };

  const handleImageError = (error) => {
    console.log(
      `❌ Error loading image for stall ${item.name}:`,
      error.nativeEvent?.error || "Unknown error"
    );
    setImageError(true);
  };

  const renderStatusButton = (status) => {
    switch (status) {
      case "raffle":
        return (
          <TouchableOpacity
            style={[
              styles.raffleButton,
              shouldUseWebLayout && styles.webButton,
            ]}
            onPress={handleRafflePress}
          >
            <Text
              style={[
                styles.raffleText,
                shouldUseWebLayout && styles.webButtonText,
              ]}
            >
              RAFFLE ONGOING
            </Text>
          </TouchableOpacity>
        );
      case "countdown":
        return (
          <TouchableOpacity
            style={[
              styles.countdownButton,
              shouldUseWebLayout && styles.webButton,
            ]}
            onPress={handleCountdownPress}
          >
            <Text
              style={[
                styles.countdownText,
                shouldUseWebLayout && styles.webButtonText,
              ]}
            >
              COUNTDOWN
            </Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const CountdownModal = () => (
    <Modal
      visible={showCountdownModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCountdownModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Countdown Timer</Text>
          <Text style={styles.stallNameModal}>{item.name}</Text>

          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Time Remaining:</Text>
            <View style={styles.countdownTimeContainer}>
              <Text style={styles.countdownTime}>
                {timeLeft || "Loading..."}
              </Text>
            </View>
          </View>

          {item.raffleDate && (
            <View style={styles.raffleInfo}>
              <Text style={styles.raffleLabel}>Raffle Date:</Text>
              <Text style={styles.raffleDate}>
                {new Date(item.raffleDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.stallInfo}>
            <Text style={styles.infoLabel}>Location: {item.location}</Text>
            <Text style={styles.infoLabel}>Size: {item.size}</Text>
            {item.rentalPrice && (
              <Text style={styles.infoLabel}>
                Rental Price: ₱{item.rentalPrice}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCountdownModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderImage = () => {
    const imageContainerStyle = [
      styles.imageContainer,
      shouldUseWebLayout && [
        styles.webImageContainer,
        { height: getImageHeight() },
      ],
    ];

    const imageStyle = [styles.image, shouldUseWebLayout && styles.webImage];

    if (imageError || !item.imageUrl) {
      return (
        <View style={imageContainerStyle}>
          <Image
            source={require("../../assets/stall.png")}
            style={imageStyle}
            onError={(e) => {
              console.log(
                `❌ Error loading default image for stall ${item.name}:`,
                e.nativeEvent?.error || "Unknown error"
              );
            }}
          />
          {!item.imageUrl && (
            <View style={styles.noImageOverlay}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={imageContainerStyle}>
        <Image
          source={{ uri: item.imageUrl }}
          style={imageStyle}
          onError={handleImageError}
          onLoad={() => {
            console.log(`✅ Successfully loaded image for stall ${item.name}`);
          }}
        />
      </View>
    );
  };

  const cardStyles = shouldUseWebLayout
    ? [
        styles.card,
        styles.webCard,
        {
          width: getCardWidth(),
          marginHorizontal: 8,
          marginBottom: 16,
        },
      ]
    : [styles.card, styles.mobileCard];

  return (
    <View style={cardStyles}>
      {/* Status badges */}
      {item.status === "raffle" && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>Live</Text>
        </View>
      )}
      {item.status === "countdown" && (
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownBadgeText}>Countdown</Text>
        </View>
      )}

      {/* Stall Image */}
      {renderImage()}

      <View
        style={[
          styles.infoContainer,
          shouldUseWebLayout && styles.webInfoContainer,
        ]}
      >
        {/* Content Container - Fixed height area for consistent layout */}
        <View
          style={[
            styles.contentContainer,
            shouldUseWebLayout && styles.webContentContainer,
          ]}
        >
          <View style={styles.stallNameContainer}>
            <Text
              style={[
                styles.stallName,
                shouldUseWebLayout && styles.webStallName,
              ]}
            >
              {item.name}
            </Text>
          </View>
          <Text
            style={[styles.details, shouldUseWebLayout && styles.webDetails]}
          >
            {item.location}
          </Text>
          {item.rentalPrice && (
            <Text
              style={[styles.details, shouldUseWebLayout && styles.webDetails]}
            >
              ₱{item.rentalPrice}
            </Text>
          )}
        </View>

        {/* Button Area - Always at bottom */}
        <View style={styles.buttonArea}>{renderStatusButton(item.status)}</View>
      </View>

      {/* Modals */}
      <CountdownModal />

      {/* LiveRaffle Modal */}
      <LiveRaffle
        visible={showLiveRaffle}
        onClose={() => setShowLiveRaffle(false)}
        stallData={item}
        stallNo={item.name}
        stallLocation={item.location}
        stallSize={item.size}
        rentalPrice={item.rentalPrice}
        stallImage={item.imageUrl}
        getImageUrl={getImageUrl}
        participants={participants}
        timerRunning={timerRunning}
        timerPaused={timerPaused}
        userRole={userRole}
        userFullName={userFullName}
        userEmail={userEmail}
        stallId={item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
    position: "relative",
  },

  mobileCard: {
    flexDirection: "row",
    height: 120,
    marginBottom: 12,
  },

  webCard: {
    flexDirection: "column",
    minWidth: 240,
    maxWidth: 320,
    height: 300,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: "#e0e0e0",
    transition: Platform.OS === "web" ? "all 0.2s ease" : undefined,
  },

  imageContainer: {
    width: "35%",
    height: "100%",
    position: "relative",
  },

  webImageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  webImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    objectFit: "cover",
  },

  noImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#666",
    fontSize: 10,
    fontStyle: "italic",
  },

  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "red",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    zIndex: 1,
  },
  liveBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
  countdownBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ff6600",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    zIndex: 1,
  },
  countdownBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },

  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },

  webInfoContainer: {
    padding: 14,
    flex: 1,
    justifyContent: "space-between",
  },

  contentContainer: {
    flex: 1,
  },

  webContentContainer: {
    flex: 1,
  },

  buttonArea: {
    marginTop: 4,
  },

  stallNameContainer: {
    backgroundColor: "#f0f8ff",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },

  stallName: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#2563eb",
  },

  webStallName: {
    fontSize: 14,
  },

  details: {
    fontSize: 11,
    color: "#666",
    marginBottom: 3,
  },

  webDetails: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },

  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: "center",
  },

  raffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },

  countdownButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: "center",
  },

  countdownText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },

  webButton: {
    paddingVertical: 10,
    minHeight: 36,
  },

  webButtonText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  stallNameModal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 20,
  },
  countdownContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    width: "100%",
  },
  countdownLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  countdownTime: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6600",
  },
  countdownTimeContainer: {
    minHeight: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  raffleInfo: {
    alignItems: "center",
    marginBottom: 15,
  },
  raffleLabel: {
    fontSize: 14,
    color: "#666",
  },
  raffleDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  stallInfo: {
    width: "100%",
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StallCard;
