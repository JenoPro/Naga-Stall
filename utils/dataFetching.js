// Sample data for live stalls
export const fetchLiveStalls = () => {
  // This is a mock function that simulates fetching data from an API
  // In a real application, this would be an async function that fetches data from a server
  
  return [
    {
      id: "1",
      name: "STALL# 30",
      location: "2nd Floor / Grocery Section",
      size: "3x3 meters",
      image: require("../assets/stall.png"),
      status: "raffle",
    },
    {
      id: "2",
      name: "STALL# 50",
      location: "2nd Floor / Grocery Section",
      size: "3x3 meters",
      image: require("../assets/stall.png"),
      status: "countdown",
    },
  ];
};

// You can add more data fetching utilities here as needed
export const fetchUserStall = async (userId) => {
  // In a real app, this would make an API call to get user's assigned stall
  return null; // Currently returning null for "None"
};

// Add more API functions as needed