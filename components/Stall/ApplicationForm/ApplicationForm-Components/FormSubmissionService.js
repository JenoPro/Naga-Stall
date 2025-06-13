import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../../../../config/supabaseClient";

const showAlert = (title, message, type = "default") => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      const popup = document.createElement("div");
      popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid ${
          type === "success"
            ? "#10B981"
            : type === "error"
            ? "#EF4444"
            : "#6B7280"
        };
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        width: 90%;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
      `;

      const titleElement = document.createElement("h3");
      titleElement.textContent = title;
      titleElement.style.cssText = `
        margin: 0 0 10px 0;
        color: ${
          type === "success"
            ? "#10B981"
            : type === "error"
            ? "#EF4444"
            : "#374151"
        };
        font-size: 18px;
        font-weight: 600;
      `;

      const messageElement = document.createElement("p");
      messageElement.textContent = message;
      messageElement.style.cssText = `
        margin: 0 0 20px 0;
        color: #374151;
        line-height: 1.5;
      `;

      const button = document.createElement("button");
      button.textContent = "OK";
      button.style.cssText = `
        background: ${
          type === "success"
            ? "#10B981"
            : type === "error"
            ? "#EF4444"
            : "#6B7280"
        };
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        float: right;
      `;

      button.onmouseover = () => {
        button.style.opacity = "0.8";
      };
      button.onmouseout = () => {
        button.style.opacity = "1";
      };

      button.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
      };

      overlay.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
      };

      popup.appendChild(titleElement);
      popup.appendChild(messageElement);
      popup.appendChild(button);

      document.body.appendChild(overlay);
      document.body.appendChild(popup);
    } else {
      console.error(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message);
  }
};

const getCurrentUserRegistrationId = async (applicantFullName) => {
  try {
    console.log("Getting current user registration ID by name matching...");
    console.log("Applicant Full Name:", applicantFullName);

    const storedUserData = await AsyncStorage.getItem("userData");

    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log("Found stored user data:", userData);

        if (userData.fullName && userData.email) {
          console.log("Using stored user data - Full Name:", userData.fullName);

          const { data: registrantData, error: registrantError } =
            await supabase
              .from("Registrant")
              .select("*")
              .eq("fullName", userData.fullName.trim())
              .single();

          if (registrantData && !registrantError) {
            console.log(
              "Found matching registrant by stored name:",
              registrantData
            );
            return {
              success: true,
              registrationId: registrantData.registrationId,
              userInfo: {
                fullName: registrantData.fullName,
                email: registrantData.emailAddress,
              },
            };
          } else {
            console.log(
              "No registrant found with stored name:",
              userData.fullName
            );
            console.log("Registrant error:", registrantError);
          }
        }
      } catch (parseError) {
        console.warn("Could not parse stored userData:", parseError);
      }
    }

    if (applicantFullName && applicantFullName.trim()) {
      console.log(
        "Trying to find registrant by applicant name:",
        applicantFullName
      );

      const { data: registrantData, error: registrantError } = await supabase
        .from("Registrant")
        .select("*")
        .eq("fullName", applicantFullName.trim())
        .single();

      if (registrantData && !registrantError) {
        console.log(
          "Found matching registrant by applicant name:",
          registrantData
        );

        const updatedUserData = {
          fullName: registrantData.fullName,
          email: registrantData.emailAddress,
          registrationId: registrantData.registrationId,
        };

        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        await AsyncStorage.setItem(
          "registrationId",
          registrantData.registrationId.toString()
        );

        return {
          success: true,
          registrationId: registrantData.registrationId,
          userInfo: {
            fullName: registrantData.fullName,
            email: registrantData.emailAddress,
          },
        };
      } else {
        console.log(
          "No registrant found with applicant name:",
          applicantFullName
        );
        console.log("Registrant error:", registrantError);
      }
    }

    console.log("Trying AsyncStorage registration ID fallback...");
    const storedRegistrationId = await AsyncStorage.getItem("registrationId");

    if (storedRegistrationId) {
      console.log("Found stored registration ID:", storedRegistrationId);

      const { data: registrantData, error: registrantError } = await supabase
        .from("Registrant")
        .select("*")
        .eq("registrationId", parseInt(storedRegistrationId))
        .single();

      if (registrantData && !registrantError) {
        console.log("Verified stored registration ID in database");
        return {
          success: true,
          registrationId: registrantData.registrationId,
          userInfo: {
            fullName: registrantData.fullName,
            email: registrantData.emailAddress,
          },
        };
      } else {
        console.log("Stored registration ID not found in database");
      }
    }

    return {
      success: false,
      error: "No matching registrant found for this name",
      shouldRelogin: true,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return {
      success: false,
      error: "Failed to get current user: " + error.message,
      shouldRelogin: true,
    };
  }
};

export const submitApplicationForm = async (formData, stallInfo) => {
  try {
    console.log("=== Starting Application Submission ===");

    const requiredFields = [
      "fullName",
      "age",
      "contactNo",
      "mailingAddress",
      "businessType",
      "capitalization",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field]?.toString().trim()
    );

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      showAlert(
        "Missing Information",
        `Please fill in: ${missingFields.join(", ")}`,
        "error"
      );
      return { success: false, error: "Missing required fields" };
    }

    console.log("Form validation passed");
    console.log("Form Data:", formData);
    console.log("Stall Info:", stallInfo);

    console.log("Getting user registration ID by name matching...");
    const userResult = await getCurrentUserRegistrationId(formData.fullName);

    if (!userResult.success) {
      console.log("Failed to get user registration ID:", userResult.error);
      showAlert(
        "Registration Not Found",
        `No registration found for "${formData.fullName}". Please make sure you are registered first or check your name spelling.`,
        "error"
      );
      return {
        success: false,
        error: userResult.error,
        shouldRelogin: true,
      };
    }

    const { registrationId, userInfo } = userResult;
    console.log("Successfully got user info:");
    console.log("- Registration ID:", registrationId);
    console.log("- User Info:", userInfo);

    console.log("Testing database connection...");
    const { error: connectionError } = await supabase
      .from("Application")
      .select("ApplicationId")
      .limit(1);

    if (connectionError) {
      console.error("Database connection failed:", connectionError);
      showAlert(
        "Connection Error",
        "Cannot connect to database. Please check your internet connection.",
        "error"
      );
      return { success: false, error: connectionError };
    }

    console.log("Database connection successful");

    console.log("Checking for existing applications...");
    const { data: existingApplications, error: checkError } = await supabase
      .from("Application")
      .select("ApplicationId, status")
      .eq("registrationId", registrationId)
      .in("status", ["applied", "approved", "pending"]);

    if (checkError) {
      console.warn("Could not check existing applications:", checkError);
    } else if (existingApplications && existingApplications.length > 0) {
      console.log("Found existing applications:", existingApplications);
      const statusList = existingApplications
        .map((app) => app.status)
        .join(", ");
      showAlert(
        "Application Already Exists",
        `You already have an application with status: ${statusList}. Please wait for processing or contact administrator.`,
        "error"
      );
      return {
        success: false,
        error: "Application already exists",
        existingApplications: existingApplications,
      };
    }

    const applicationData = {
      Applicants_Name: formData.fullName.trim(),
      Applicants_Age: parseInt(formData.age) || null,
      Applicants_ContactNo: parseInt(formData.contactNo) || null,
      Applicants_MailingAddress: formData.mailingAddress.trim(),
      Applicants_ProposeType: formData.businessType.trim(),
      Applicants_Capitalization: parseFloat(formData.capitalization) || null,
      status: "applied",
      registrationId: registrationId,
    };

    if (formData.highestEducation?.trim()) {
      applicationData.Applicants_HighestEducationalAttainment =
        formData.highestEducation.trim();
    }
    if (formData.civilStatus?.trim()) {
      applicationData.Applicants_CivilStatus = formData.civilStatus.trim();
    }
    if (formData.capitalSource?.trim()) {
      applicationData.Applicants_SourceOfCapital =
        formData.capitalSource.trim();
    }
    if (formData.previousExperience?.trim()) {
      applicationData.Applicants_PreviousBusinessExperience =
        formData.previousExperience.trim();
    }
    if (formData.relativeStallOwner?.trim()) {
      applicationData.Applicants_RelativeStallOwner =
        formData.relativeStallOwner.trim();
    }
    if (formData.houseLocation?.trim()) {
      applicationData.Applicants_HouseLocation = formData.houseLocation.trim();
    }
    if (stallInfo?.stallId || stallInfo?.id) {
      applicationData.stallNo = stallInfo.stallId || stallInfo.id;
    }

    console.log("Prepared application data:", applicationData);

    console.log("Inserting application into database...");
    const { data: applicationResult, error: applicationError } = await supabase
      .from("Application")
      .insert([applicationData])
      .select("*");

    if (applicationError) {
      console.error("Application insertion failed:", applicationError);

      let errorMessage = "Failed to submit application. ";
      if (applicationError.message) {
        errorMessage += applicationError.message;
      } else {
        errorMessage += "Database error occurred.";
      }

      showAlert("Submission Error", errorMessage, "error");
      return { success: false, error: applicationError };
    }

    if (!applicationResult || applicationResult.length === 0) {
      console.error("No application data returned after insertion");
      showAlert(
        "Error",
        "Application submission failed - no data returned",
        "error"
      );
      return { success: false, error: "No application data returned" };
    }

    const insertedApplication = applicationResult[0];
    const applicationId = insertedApplication.ApplicationId;

    console.log("Application inserted successfully!");
    console.log("Application ID:", applicationId);
    console.log("Inserted data:", insertedApplication);

    if (formData.spouseName?.trim() && applicationId) {
      console.log("Inserting spouse information...");

      const spouseData = {
        spouse_FullName: formData.spouseName.trim(),
        ApplicationId: applicationId,
      };

      if (formData.spouseEducation?.trim()) {
        spouseData.spouse_EducationalAttainment =
          formData.spouseEducation.trim();
      }
      if (formData.spouseOccupation?.trim()) {
        spouseData.spouse_Occupation = formData.spouseOccupation.trim();
      }
      if (formData.spouseAge?.trim()) {
        spouseData.spouse_Age = parseInt(formData.spouseAge) || null;
      }
      if (formData.childrenNames?.trim()) {
        spouseData.namesOfChildren = formData.childrenNames.trim();
      }

      const { error: spouseError } = await supabase
        .from("SpouseInformation")
        .insert([spouseData]);

      if (spouseError) {
        console.warn("Spouse information could not be saved:", spouseError);
      } else {
        console.log("Spouse information saved successfully");
      }
    }

    try {
      const updatedUserData = {
        registrationId: registrationId,
        fullName: userInfo.fullName,
        email: userInfo.email,
        lastApplicationId: applicationId,
        lastApplicationDate: new Date().toISOString(),
      };

      await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
      await AsyncStorage.setItem("registrationId", registrationId.toString());

      console.log("Updated local storage with confirmed user data");
    } catch (storageError) {
      console.warn("Could not update local storage:", storageError);
    }

    console.log("=== Application Submission Completed Successfully ===");

    showAlert(
      "Congratulations! 🎉",
      "Your application form has been successfully submitted! Please wait for admin approval to be listed in the raffle. You will be notified once your application is processed.",
      "success"
    );

    return {
      success: true,
      applicationId: applicationId,
      userData: {
        fullName: userInfo.fullName,
        email: userInfo.email,
        registrationId: registrationId,
      },
      applicationData: insertedApplication,
    };
  } catch (error) {
    console.error("=== Application Submission Error ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    let errorMessage = "Failed to submit application. ";

    if (error.message?.includes("JSON")) {
      errorMessage += "Data format error.";
    } else if (
      error.message?.includes("network") ||
      error.message?.includes("fetch")
    ) {
      errorMessage += "Network connection error.";
    } else if (error.message?.includes("permission")) {
      errorMessage += "Database permission error.";
    } else if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage += "Unknown error occurred.";
    }

    showAlert("Error", errorMessage, "error");
    return { success: false, error: error.message || error };
  }
};
