// Toyota/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/hero-section";
import ParticipationSteps from "@/components/participation-steps";
import CitySelector from "@/components/city-selector";
import CityPopup from "@/components/city-popup";
import RegistrationPage from "@/components/registration-page";
import TermsConditionsPage from "@/components/terms-conditions-page";
import GamesPage from "@/components/games-page";
import WinPopup from "@/components/win-popup";
import { type UserGameResult } from "@/lib/storage";
// import { supabase } from "@/lib/supabase"; // Import Supabase client
import { supabase } from "@/lib/supabase-client"
import { CityConfig } from "@/lib/types"; // Import CityConfig type

export type AppPage = "home" | "registration" | "terms" | "games" | "win";

// --- FIX 1: Add 'uid' to this interface ---
export interface RegistrationData {
  uid: string; // <-- ADD THIS
  name: string;
  dob: string;
  occupation: string;
  mobile: string;
  email: string;
  city: string;
  car_model: string;
}

// --- FIX 2: Update Omit to include 'uid' ---
type FormData = Omit<RegistrationData, "city" | "uid">;

export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>("home");
  const [cityPopupOpen, setCityPopupOpen] = useState(false);

  // State for Supabase data
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [selectedCityConfig, setSelectedCityConfig] =
    useState<CityConfig | null>(null);

  // This state holds the *final* submitted data
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);
  const [gameResults, setGameResults] = useState<UserGameResult | null>(null);

  // This state holds the *in-progress* form data
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dob: "",
    occupation: "",
    mobile: "",
    email: "",
    car_model: "",
  });
  // This state holds the terms and conditions checkbox status
  const [termsAccepted, setTermsAccepted] = useState(false);

  // State for user UID and loading
  const [createdUserUID, setCreatedUserUID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cities from Supabase on load
  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("toyota_microsite_city_config")
        .select("*")
        .eq("is_live", true)
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Error fetching cities:", error);
      } else {
        setCities(data || []);
      }
    };

    fetchCities();
  }, []);

  const handleCitySelect = (cityName: string) => {
    const city = cities.find((c) => c.city_name === cityName);
    if (city) {
      setSelectedCityConfig(city);
      setCityPopupOpen(true);
    }
  };

  const handlePlayClick = () => {
    setCityPopupOpen(false);
    setCurrentPage("registration");
  };

  // --- FIX 3: Update function signature and logic ---
  const handleRegistrationSubmit = async (data: Omit<RegistrationData, "uid">) => {
    setIsLoading(true);

    // 1. Insert user into Supabase
    const { data: newUser, error } = await supabase
      .from("toyota_microsite_users")
      .insert({
        name: data.name,
        birthdate: data.dob,
        occupation: data.occupation,
        mobile: data.mobile,
        email: data.email,
        city: data.city,
        car_model: data.car_model,
        is_game_played: false, // Default to false
        // --- ADDED DEFAULTS ---
        email_status: false,
        whatsapp_status: false,
        rsvp_status: false,
        is_attended_event: false,
        // ----------------------
      })
      .select("uid") // Select the 'uid'
      .single(); // Expect a single object back

    setIsLoading(false);

    if (error) {
      console.error("Error saving registration:", error);
      // TODO: Show an error toast to the user
      return;
    }

    // 2. Save data and move to next page
    if (newUser) {
      setCreatedUserUID(newUser.uid); // Save the UID (still useful for handleGamesComplete)
      
      // Create the complete data object including the new UID
      const completeData: RegistrationData = {
        ...data,
        uid: newUser.uid
      };
      
      setRegistrationData(completeData); // <-- SET THE COMPLETE OBJECT (WITH UID)
    } else {
      console.error("No user data returned from Supabase after insert.");
      return;
    }

    // --- FIX: Implement Vijayawada skip logic ---
    // if (selectedCityConfig?.city_name === "Vijayawada") {
    //   setCurrentPage("win"); // Skip to WinPopup
    // } else {
      setCurrentPage("games"); // Go to GamesPage
    // }
    // -------------------------------------------
  };

  const handleViewTerms = () => {
    setCurrentPage("terms");
  };

  const handleBackFromTerms = () => {
    setCurrentPage("registration");
  };

  const handleGamesComplete = async (results: UserGameResult) => {
    setIsLoading(true);

    if (createdUserUID) {
      // 3. Update the user record to show game has been played
      const { error } = await supabase
        .from("toyota_microsite_users")
        .update({ is_game_played: true })
        .eq("uid", createdUserUID);

      if (error) {
        console.error("Error updating game status:", error);
        // Continue to 'win' page even if this fails,
        // but log the error.
      }
    }

    setIsLoading(false);
    setGameResults(results);
    setCurrentPage("win");
  };

  const handleFinish = () => {
    setCurrentPage("home");
    setSelectedCityConfig(null);
    setCityPopupOpen(false);
    setRegistrationData(null);
    setGameResults(null);
    setCreatedUserUID(null);

    // Reset the form state as well
    setFormData({
      name: "",
      dob: "",
      occupation: "",
      mobile: "",
      email: "",
    });
    setTermsAccepted(false);
  };

  // Render different pages based on current state

  if (currentPage === "registration") {
    return (
        <RegistrationPage
          city={selectedCityConfig?.city_name || ""}
          onSubmit={handleRegistrationSubmit}
          onViewTerms={() => setCurrentPage("terms")}
          formData={formData}
          setFormData={setFormData}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          isLoading={isLoading}
        />
    );
  }

  if (currentPage === "terms") {
    return <TermsConditionsPage onBack={handleBackFromTerms} />;
  }

  if (currentPage === "games") {
    return (
      <GamesPage
        registrationData={registrationData}
        onComplete={handleGamesComplete}
      />
    );
  }

  if (currentPage === "win") {
    // --- FIX: Pass city config to WinPopup ---
    return (
      <WinPopup
        city={selectedCityConfig ? { name: selectedCityConfig.city_name } : null}
        registrationData={registrationData} // This object now correctly contains the uid
        gameResults={gameResults!}
        onFinish={handleFinish}
      />
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {cityPopupOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}

      <HeroSection />
      <ParticipationSteps />
      <CitySelector cities={cities} onCitySelect={handleCitySelect} />

      {cityPopupOpen && selectedCityConfig && (
        <CityPopup
          cityConfig={selectedCityConfig}
          onClose={() => setCityPopupOpen(false)}
          onPlay={handlePlayClick}
        />
      )}
    </div>
  );
}