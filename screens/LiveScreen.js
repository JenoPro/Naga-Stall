import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../config/supabaseClient";

// Import components
import BottomNavigation from "../components/BottomNavigation";
import StallCard from "../components/Live/StallCard";
import UserHeader from "../components/UserHeader";
import FilterBar from "../components/FilterBar";
import NotificationPopup from "../components/NotificationPopup";

export default function LiveScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("live");
  const [sortBy, setSortBy] = useState("Live");
  const [notificationStatus, setNotificationStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [userFullname, setUserFullname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [liveStalls, setLiveStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect to automatically close popup after 3 seconds
  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  // Enhanced function to get image URL from Supabase storage
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    try {
      // If it's already a full URL, return it
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // Clean the image path - remove any leading slashes
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      
      // Generate public URL from Supabase storage
      const { data } = supabase.storage
        .from('stall-images') // Make sure this matches your actual bucket name
        .getPublicUrl(cleanPath);
      
      // Log for debugging
      console.log(`🔍 Image path: ${imagePath} -> Clean path: ${cleanPath} -> URL: ${data?.publicUrl}`);
      
      return data?.publicUrl || null;
    } catch (error) {
      console.error('Error generating image URL:', error);
      return null;
    }
  };

  // Enhanced fetch stalls function with better error handling
  const fetchStalls = async () => {
    try {
      setLoading(true);
      
      // First, let's check if the Stall table exists and what columns it has
      const { data: tableInfo, error: tableError } = await supabase
        .from('Stall')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('Table access error:', tableError);
        Alert.alert('Database Error', `Cannot access Stall table: ${tableError.message}`);
        return;
      }

      const { data, error } = await supabase
        .from('Stall')
        .select(`
          stallId,
          stallNo,
          stallLocation,
          size,
          status,
          stallImage,
          rentalPrice,
          stallAbout,
          raffleDate,
          end_time,
          time_running,
          created_at
        `)
        .in('status', ['Countdown', 'Raffle'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stalls:', error);
        Alert.alert('Error', `Failed to fetch stalls data: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No stalls found with Countdown or Raffle status');
        setLiveStalls([]);
        return;
      }

      // Transform data to match your component structure
      const transformedStalls = data.map(stall => {
        const imageUrl = getImageUrl(stall.stallImage);
        
        return {
          id: stall.stallId?.toString() || Math.random().toString(),
          name: stall.stallNo || `Stall ${stall.stallId || 'Unknown'}`,
          location: stall.stallLocation || 'Location not specified',
          size: stall.size || 'Size not specified',
          status: stall.status?.toLowerCase() || 'unknown', // 'Countdown' -> 'countdown'
          imageUrl: imageUrl,
          rentalPrice: stall.rentalPrice,
          about: stall.stallAbout,
          raffleDate: stall.raffleDate,
          endTime: stall.end_time,
          timeRunning: stall.time_running
        };
      });

      console.log(`✅ Successfully fetched ${transformedStalls.length} stalls`);
      setLiveStalls(transformedStalls);
      
    } catch (error) {
      console.error('Error in fetchStalls:', error);
      Alert.alert('Error', 'Something went wrong while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced real-time subscription with better error handling
  useEffect(() => {
    fetchStalls();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('stall_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Stall',
          filter: 'status=in.(Countdown,Raffle)'
        },
        (payload) => {
          console.log('🔄 Real-time update received:', payload.eventType);
          // Add a small delay to avoid rapid successive calls
          setTimeout(() => {
            fetchStalls();
          }, 1000);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ Subscription error:', err);
        } else {
          console.log('✅ Subscription status:', status);
        }
      });

    return () => {
      console.log('🔌 Unsubscribing from real-time updates');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedFullName = await AsyncStorage.getItem("userFullName");
        const storedEmail = await AsyncStorage.getItem("userEmail");

        if (storedFullName && storedEmail) {
          setUserFullname(storedFullName);
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleTabPress = (tabName) => {
    if (tabName === "logout") {
      handleLogout();
    } else {
      setActiveTab(tabName);
      if (tabName === "stall") {
        navigation.navigate("StallScreen");
      } else if (tabName === "documents") {
        navigation.navigate("DocumentsScreen");
      } else if (tabName === "live") {
        navigation.navigate("LiveScreen");
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") },
        { text: "No", onPress: () => console.log("No Pressed") },
        {
          text: "Yes",
          onPress: () => {
            console.log("Yes Pressed");
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleNotificationToggle = () => {
    const newStatus = !notificationStatus;
    setNotificationStatus(newStatus);

    // Show popup message
    setPopupMessage(
      newStatus
        ? "Notifications turned ON for live stalls"
        : "Notifications turned OFF for live stalls"
    );
    setShowPopup(true);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchStalls();
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <UserHeader 
            userFullname={userFullname} 
            userEmail={userEmail} 
          />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading stalls...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <UserHeader 
          userFullname={userFullname} 
          userEmail={userEmail} 
        />

        <FilterBar 
          sortBy={sortBy} 
          notificationStatus={notificationStatus}
          onNotificationToggle={handleNotificationToggle}
        />

        <FlatList
          data={liveStalls}
          renderItem={({ item }) => <StallCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          style={styles.flatList}
          refreshing={loading}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : 'No live stalls available'}
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Notification Popup */}
        <NotificationPopup 
          visible={showPopup}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />

        <BottomNavigation 
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flatList: {
    flex: 1,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});