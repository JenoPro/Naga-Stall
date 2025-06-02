import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from "react-native";

const StallCard = ({ item }) => {
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [imageError, setImageError] = useState(false);

  // Calculate time left for countdown
  useEffect(() => {
    if (item.status === 'countdown' && item.endTime) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const endTime = new Date(item.endTime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          let timeString = '';
          if (days > 0) timeString += `${days}d `;
          if (hours > 0) timeString += `${hours}h `;
          if (minutes > 0) timeString += `${minutes}m `;
          timeString += `${seconds}s`;

          setTimeLeft(timeString);
        } else {
          setTimeLeft('Raffle Started!');
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }
  }, [item.status, item.endTime]);

  const handleCountdownPress = () => {
    if (item.status === 'countdown') {
      setShowCountdownModal(true);
    }
  };

  const handleImageError = (error) => {
    console.log(
      `❌ Error loading image for stall ${item.name}:`,
      error.nativeEvent?.error || 'Unknown error'
    );
    setImageError(true);
  };

  const renderStatusButton = (status) => {
    switch (status) {
      case "raffle":
        return (
          <TouchableOpacity style={styles.raffleButton} disabled>
            <Text style={styles.raffleText}>RAFFLE ONGOING</Text>
          </TouchableOpacity>
        );
      case "countdown":
        return (
          <TouchableOpacity 
            style={styles.countdownButton} 
            onPress={handleCountdownPress}
          >
            <Text style={styles.countdownText}>COUNTDOWN</Text>
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
            <Text style={styles.countdownTime}>{timeLeft}</Text>
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

  // Enhanced image rendering with better fallback
  const renderImage = () => {
    // If image error occurred or no imageUrl, show default
    if (imageError || !item.imageUrl) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/stall.png')}
            style={styles.image}
            onError={(e) => {
              console.log(
                `❌ Error loading default image for stall ${item.name}:`,
                e.nativeEvent?.error || 'Unknown error'
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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          onError={handleImageError}
          onLoad={() => {
            console.log(`✅ Successfully loaded image for stall ${item.name}`);
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Stall Image */}
      {renderImage()}
      
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
      
      <View style={styles.infoContainer}>
        <View style={styles.stallNameContainer}>
          <Text style={styles.stallName}>{item.name}</Text>
        </View>
        <Text style={styles.details}>{item.location}</Text>
        <Text style={styles.details}>{item.size}</Text>
        {item.status === 'countdown' && timeLeft && (
          <Text style={styles.timeLeftText}>⏰ {timeLeft}</Text>
        )}
        {renderStatusButton(item.status)}
      </View>
      
      <CountdownModal />
    </View>
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
    overflow: "hidden",
    flexDirection: "row",
    height: 120,
  },
  imageContainer: {
    width: "40%",
    height: "100%",
    position: 'relative',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  noImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "red",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  liveBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  countdownBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ff6600",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  countdownBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  stallNameContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  stallName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  details: {
    fontSize: 12,
    color: "#666",
  },
  timeLeftText: {
    fontSize: 11,
    color: "#ff6600",
    fontWeight: "bold",
  },
  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  raffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  countdownButton: {
    backgroundColor: "red",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  countdownText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  stallNameModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 20,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    width: '100%',
  },
  countdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  countdownTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  raffleInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  raffleLabel: {
    fontSize: 14,
    color: '#666',
  },
  raffleDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stallInfo: {
    width: '100%',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StallCard;