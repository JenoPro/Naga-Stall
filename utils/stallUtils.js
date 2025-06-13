import supabase from "../config/supabaseClient";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  try {
    const { data } = supabase.storage
      .from("stall-image")
      .getPublicUrl(imagePath);
    console.log("Image URL generated:", data?.publicUrl);
    return data?.publicUrl;
  } catch (error) {
    console.log("❌ Error getting image URL:", error);
    return null;
  }
};

export const fetchStalls = async () => {
  try {
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

    const mappedStalls = stallsData.map((stall) => {
      let imagePath = stall.stallImage;

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
        status: stall.status || "available",
        about: stall.stallAbout,
        imageUrl: imageUrl,
        originalImagePath: stall.stallImage,
        created_at: stall.created_at,
        raffle_date: stall.raffleDate,
        hasUserApplied: false,
      };
    });

    console.log("✅ Mapped stalls:", mappedStalls);
    return mappedStalls;
  } catch (error) {
    console.log("❌ Error in fetchStalls:", error);
    throw error;
  }
};

export const checkUserApplications = async (
  stalls,
  setStalls,
  setUserStallNumber,
  userFullName
) => {
  try {
    if (!userFullName) {
      console.log("❌ No userFullName provided to checkUserApplications");
      return;
    }

    console.log("🔍 Checking applications for user:", userFullName);

    const { data, error } = await supabase
      .from("Application")
      .select("stallNo, status")
      .eq("Applicants_Name", userFullName);

    if (error) {
      console.log("❌ Error checking applications:", error);
      return;
    }

    console.log("✅ User applications data:", data);

    if (data && data.length > 0) {
      console.log("📝 Found applications with stallNo values:");
      data.forEach((app, index) => {
        console.log(
          `   Application ${index + 1}: stallNo = "${app.stallNo}", status = "${
            app.status
          }"`
        );
      });
    }

    setStalls((currentStalls) => {
      console.log("🔍 Comparing with stalls:");
      currentStalls.forEach((stall, index) => {
        console.log(
          `   Stall ${index + 1}: id = "${stall.id}", stall_number = "${
            stall.stall_number
          }"`
        );
      });

      const updatedStalls = currentStalls.map((stall) => {
        const application = data?.find((app) => {
          if (String(app.stallNo) === String(stall.id)) {
            return true;
          }

          if (String(app.stallNo) === String(stall.stall_number)) {
            return true;
          }

          const appStallNum = parseInt(String(app.stallNo));
          const stallId = parseInt(String(stall.id));
          const stallNum = parseInt(String(stall.stall_number));

          if (
            !isNaN(appStallNum) &&
            !isNaN(stallId) &&
            appStallNum === stallId
          ) {
            return true;
          }

          if (
            !isNaN(appStallNum) &&
            !isNaN(stallNum) &&
            appStallNum === stallNum
          ) {
            return true;
          }

          return false;
        });

        if (application) {
          console.log(
            `🎯 Found application for stall ${stall.stall_number} (ID: ${stall.id}): ${application.status}`
          );

          return {
            ...stall,
            hasUserApplied: true,
          };
        }

        return {
          ...stall,
          hasUserApplied: false,
        };
      });

      console.log("✅ Updated stalls with user application status:");
      updatedStalls.forEach((stall) => {
        console.log(
          `   Stall ${stall.stall_number} (ID: ${stall.id}): hasUserApplied = ${stall.hasUserApplied}`
        );
      });

      return updatedStalls;
    });
  } catch (error) {
    console.log("❌ Error in checkUserApplications:", error);
  }
};
