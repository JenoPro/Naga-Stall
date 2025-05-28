import supabase from "../config/supabaseClient";

// Get image URL from Supabase storage
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  try {
    // Make sure we're using the correct bucket name
    const { data } = supabase.storage
      .from("stall-image") // Ensure this matches your bucket name exactly
      .getPublicUrl(imagePath);

    console.log("Image URL generated:", data?.publicUrl);
    return data?.publicUrl;
  } catch (error) {
    console.log("❌ Error getting image URL:", error);
    return null;
  }
};

// Fetch stalls from Supabase
export const fetchStalls = async () => {
  try {
    // Fetch stalls data from the Stall table
    const { data: stallsData, error } = await supabase
      .from("Stall")
      .select("*");

    if (error) {
      console.log("❌ Supabase error fetching stalls:", error);
      throw new Error("Failed to fetch stalls data");
    }

    console.log("✅ Fetched stalls:", stallsData);

    if (!stallsData || stallsData.length === 0) {
      console.log("No stalls data returned from Supabase");
      return [];
    }

    // Map database field names to component field names and get image URLs
    const mappedStalls = stallsData.map((stall) => {
      // Get image URL with proper path handling
      let imagePath = stall.stallImage;
      
      // Handle potential path inconsistencies
      // If the path doesn't start with "stall/", add it (assuming images are in a "stall" folder)
      if (imagePath && !imagePath.startsWith("stalls/")) {
        imagePath = `stalls/${imagePath}`;
      }
      
      const imageUrl = getImageUrl(imagePath);

      return {
        id: stall.stallId,
        stall_number: stall.stallNo,
        location: stall.stallLocation,
        size: stall.size,
        price: stall.rentalPrice,
        status: stall.status || "available", // Set default status if not provided
        about: stall.stallAbout,
        imageUrl: imageUrl,
        originalImagePath: stall.stallImage,
        created_at: stall.created_at,
        raffle_date: stall.raffleDate,
      };
    });

    console.log("✅ Stalls with images:", mappedStalls);
    return mappedStalls;
  } catch (error) {
    console.log("❌ Error in fetchStalls:", error);
    throw error;
  }
};

// Function to check if user has already applied for any stall
export const checkUserApplications = async (stalls, setStalls, setUserStallNumber, userEmail) => {
  try {
    if (!userEmail) return;

    console.log("Checking applications for email:", userEmail);

    // Check if the user has any stall applications
    const { data, error } = await supabase
      .from("StallApplication")
      .select("stallNo, status")
      .eq("applicant_email", userEmail);

    if (error) {
      console.log("❌ Error checking applications:", error);
      return;
    }

    console.log("✅ User applications data:", data);

    // If user has applications, update the stalls status accordingly
    if (data && data.length > 0) {
      setStalls((currentStalls) => {
        return currentStalls.map((stall) => {
          const application = data.find(
            (app) => app.stallNo === stall.stall_number
          );
          if (application) {
            // If the application is approved, update user's stall number
            if (application.status === "approved") {
              setUserStallNumber(stall.stall_number);
            }
            return {
              ...stall,
              status:
                application.status === "approved" ? "approved" : "applied",
            };
          }
          return stall;
        });
      });
    }
  } catch (error) {
    console.log("❌ Error in checkUserApplications:", error);
  }
};