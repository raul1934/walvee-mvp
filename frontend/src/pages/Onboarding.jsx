import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/api/authService";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar,
  User as UserIcon,
  Shield,
  Search,
  Lock,
  X,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";

export default function Onboarding() {
  const { user: userProp, userLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [searchingCities, setSearchingCities] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    preferred_name: "",
    city_id: null,
    birth_date: "",
    gender: "",
    terms_accepted: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Use user from AuthContext
        if (userProp) {
          setUser(userProp);

          // Pre-fill form data
          setFormData((prev) => ({
            ...prev,
            preferred_name:
              userProp.preferred_name ||
              userProp.full_name?.split(" ")[0] ||
              "",
            city_id: userProp.city_id || null,
            birth_date: userProp.birth_date || "",
            gender: userProp.gender || "",
          }));

          // If user has a city, fetch it from the API to display
          if (userProp.city_id) {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/cities/${userProp.city_id}`
              );
              if (response.data.success && response.data.data) {
                const city = response.data.data;
                const displayText = city.country?.name
                  ? `${city.name}, ${city.state ? city.state + ", " : ""}${
                      city.country.name
                    }`
                  : city.name;
                setLocationQuery(displayText);
                setSelectedLocation({
                  city: city.name,
                  country: city.country?.name || "",
                  city_id: city.id,
                });
              }
            } catch (error) {
              console.error("Error fetching user's city:", error);
            }
          }

          if (userProp.onboarding_completed) {
            navigate(createPageUrl("Home"));
          }
        } else if (!userLoading) {
          // If no user and not loading, redirect to home
          navigate(createPageUrl("Home"));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, [userProp, userLoading, navigate]);

  const handleLocationSearch = async (query) => {
    setLocationQuery(query);
    setSelectedLocation(null);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingCities(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/cities/search`, {
          params: { query: query.trim() },
        });

        if (response.data.success && response.data.data) {
          setLocationSuggestions(response.data.data);
        } else {
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error("Error searching cities:", error);
        setLocationSuggestions([]);
      } finally {
        setSearchingCities(false);
      }
    }, 300); // 300ms debounce
  };

  const handleLocationSelect = (city) => {
    const cityName = city.name;
    const countryName = city.country?.name || "";
    const displayText = countryName
      ? `${cityName}, ${city.state ? city.state + ", " : ""}${countryName}`
      : cityName;

    setSelectedLocation({
      city: cityName,
      country: countryName,
      city_id: city.id,
    });
    setLocationQuery(displayText);
    setLocationSuggestions([]);

    setFormData((prev) => ({
      ...prev,
      city_id: city.id,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.terms_accepted) {
      alert("You need to accept the terms to continue");
      return;
    }

    setLoading(true);
    try {
      // Use the onboarding endpoint with city_id
      const onboardingData = {
        preferred_name: formData.preferred_name,
        city_id: formData.city_id,
        // include optional demographic fields in the onboarding payload
        ...(formData.birth_date ? { birth_date: formData.birth_date } : {}),
        ...(formData.gender ? { gender: formData.gender } : {}),
      };

      // Add optional Instagram username if user has it
      if (formData.instagram_username) {
        onboardingData.instagram_username = formData.instagram_username;
      }

      // Call the onboarding endpoint
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/users/me/onboarding`, onboardingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Also update additional demographic data if provided
      const updateData = {
        onboarding_completed: true,
        terms_accepted_at: new Date().toISOString(),
        consent_given_at: new Date().toISOString(),
        locale: navigator.language || "en-US",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      let demographicConsentGiven = false;
      if (formData.birth_date) {
        // Expect ISO date YYYY-MM-DD from input[type=date]
        updateData.birth_date = formData.birth_date;
        demographicConsentGiven = true;
      }
      if (formData.gender) {
        updateData.gender = formData.gender;
        demographicConsentGiven = true;
      }
      // We store only the ENUM gender values (no self-describe field)

      updateData.consent_demographics = demographicConsentGiven;
      updateData.consent_location = !!formData.city_id;

      await authService.updateMe(updateData);
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 -mt-16 pt-16">
      {/* Background Image - Step 1 */}
      {step === 1 && (
        <>
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/9cc390dd3_570312_DSC_4674.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-black/60 z-0" />
        </>
      )}

      {/* Background Image - Step 2 */}
      {step === 2 && (
        <>
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/603ed0518_photo-1589801321916-f30314ae2442.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-black/60 z-0" />
        </>
      )}

      {/* Background Image - Step 3 */}
      {step === 3 && (
        <>
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/ba8b363ed_photo-1660076327655-a43e7cadf86d.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-black/60 z-0" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl text-white">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 p-6 shadow-lg shadow-blue-500/30">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/e98bb66bb_LogoWalvee.png"
              alt="Walvee"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Walvee!</h1>
          <p className="text-gray-300">
            Let's personalize your experience in just a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? "w-12 bg-blue-600" : "w-8 bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-[#1A1B23]/95 backdrop-blur-md rounded-2xl p-8 border border-[#2A2B35] shadow-2xl">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <UserIcon className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold">
                  What would you like to be called?
                </h2>
              </div>

              <div>
                <Label
                  htmlFor="preferred_name"
                  className="text-gray-300 mb-2 block"
                >
                  Display name
                </Label>
                <Input
                  id="preferred_name"
                  value={formData.preferred_name}
                  onChange={(e) =>
                    setFormData({ ...formData, preferred_name: e.target.value })
                  }
                  placeholder="e.g. Maria"
                  className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                />
                <p className="text-sm text-gray-400 mt-2">
                  This will be the name shown to other travelers
                </p>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                disabled={!formData.preferred_name}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Let's personalize your experience
                </h2>
                <p className="text-gray-300 text-sm">
                  Tell us a bit about yourself so we can craft better trips and
                  suggestions for you
                </p>
              </div>

              {/* Location Block */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Where do you live?</h3>
                </div>

                <div className="relative">
                  <Label className="text-gray-300 mb-2 block">
                    City & Country{" "}
                    <span className="text-gray-500 text-sm">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <Input
                      value={locationQuery}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      placeholder="Type your city..."
                      className="bg-[#1F1F1F] border-[#2E2E2E] text-white pl-10 h-12"
                    />
                  </div>

                  {(searchingCities || locationSuggestions.length > 0) && (
                    <div className="absolute z-10 w-full mt-2 bg-[#1F1F1F] border border-[#2E2E2E] rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      {searchingCities ? (
                        <div className="px-4 py-3 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mx-auto" />
                          <span className="text-gray-400 text-sm mt-2 block">
                            Searching cities...
                          </span>
                        </div>
                      ) : (
                        locationSuggestions.map((city) => (
                          <button
                            key={city.id}
                            onClick={() => handleLocationSelect(city)}
                            className="w-full text-left px-4 py-3 hover:bg-[#2A2B35] transition-colors border-b border-[#2E2E2E] last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-white text-sm">
                                  {city.name}
                                  {city.state && `, ${city.state}`}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {city.country?.name || "Unknown Country"}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  We'll suggest great deals, local routes, and travelers nearby
                  based on your location
                </p>
              </div>

              {/* About You Block */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">About you</h3>
                </div>

                <div className="grid grid-cols-[150px_1fr] gap-3">
                  {/* Birth date Field */}
                  <div>
                    <Label
                      htmlFor="birth_date"
                      className="text-gray-300 mb-2 block"
                    >
                      Birth date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          birth_date: e.target.value,
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const dob = new Date(value);
                          const now = new Date();
                          const age = now.getFullYear() - dob.getFullYear();
                          const m = now.getMonth() - dob.getMonth();
                          if (
                            m < 0 ||
                            (m === 0 && now.getDate() < dob.getDate())
                          ) {
                            // adjust
                          }
                          // Enforce minimum age 13
                          if (age < 13) {
                            alert(
                              "You must be at least 13 years old to use this service."
                            );
                            setFormData({ ...formData, birth_date: "" });
                          }
                          // clear any previous validation errors
                          setFormErrors((f) => ({
                            ...f,
                            birth_date: undefined,
                          }));
                        }
                      }}
                      placeholder="YYYY-MM-DD"
                      className="bg-[#1F1F1F] border-[#2E2E2E] text-white h-12"
                    />
                    {formErrors.birth_date && (
                      <p className="text-xs text-red-400 mt-1">
                        {formErrors.birth_date}
                      </p>
                    )}
                  </div>

                  {/* Gender Field */}
                  <div>
                    <Label
                      htmlFor="gender"
                      className="text-gray-300 mb-2 block"
                    >
                      Gender <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger className="bg-[#1F1F1F] border-[#2E2E2E] text-white h-12">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gender && (
                      <p className="text-xs text-red-400 mt-1">
                        {formErrors.gender}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Used only for personalized travel insights
                </p>

                {/* No self-describe option: we store enum gender values only */}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="h-12 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    // Validate required fields for this step
                    const errors = {};
                    if (!formData.birth_date)
                      errors.birth_date = "Birth date is required";
                    if (!formData.gender) errors.gender = "Gender is required";
                    setFormErrors(errors);
                    if (Object.keys(errors).length === 0) {
                      setStep(3);
                    }
                  }}
                  className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold">Privacy and Terms</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-950/30 border-2 border-blue-500/50 rounded-lg">
                  <Checkbox
                    id="terms_accepted"
                    checked={formData.terms_accepted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, terms_accepted: checked })
                    }
                    className="mt-0.5 border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor="terms_accepted"
                    className="text-sm cursor-pointer leading-relaxed"
                  >
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveModal("terms");
                      }}
                      className="text-blue-400 underline hover:text-blue-300 transition-colors"
                    >
                      Terms of Use
                    </button>{" "}
                    and the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveModal("privacy");
                      }}
                      className="text-blue-400 underline hover:text-blue-300 transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>

              <div className="bg-[#111827] rounded-lg p-5 mt-4">
                <div className="flex items-start gap-3 mb-3">
                  <Lock className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white font-semibold">
                    Your data is secure
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-gray-400 ml-8">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>You can change or delete your data at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>We never share your data without your consent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>Fully compliant with LGPD and Google policies</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="h-12 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                  disabled={!formData.terms_accepted || loading}
                >
                  {loading ? "Saving..." : "Start my journey"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms of Use Modal */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-[#0D0D0D] rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-[#2A2B35]">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-[#2A2B35] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Terms of Use</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] text-gray-300 space-y-4">
              <p className="text-sm text-gray-400">
                Last updated: January 10, 2025
              </p>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing and using Walvee ("the Service"), you accept and
                  agree to be bound by the terms and provision of this
                  agreement. If you do not agree to these Terms of Use, please
                  do not use the Service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  2. Description of Service
                </h3>
                <p>
                  Walvee provides a platform for travelers to create, share, and
                  discover personalized travel itineraries. Our AI-powered tools
                  help users plan and organize their trips with recommendations
                  from real travelers.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  3. User Accounts
                </h3>
                <p>
                  To use certain features of the Service, you must register for
                  an account. You agree to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  4. User Content
                </h3>
                <p>
                  You retain ownership of content you post on Walvee. By posting
                  content, you grant us a worldwide, non-exclusive, royalty-free
                  license to use, display, and distribute your content on the
                  platform.
                </p>
                <p className="mt-2">You agree not to post content that:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Violates any laws or regulations</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains harmful or offensive material</li>
                  <li>Promotes illegal activities</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  5. Privacy
                </h3>
                <p>
                  Your use of the Service is also governed by our{" "}
                  <button
                    type="button"
                    onClick={() => setActiveModal("privacy")}
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    Privacy Policy
                  </button>
                  . Please review our Privacy Policy to understand our
                  practices.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  6. Termination
                </h3>
                <p>
                  We reserve the right to terminate or suspend your account at
                  any time, with or without notice, for conduct that we believe
                  violates these Terms of Use or is harmful to other users, us,
                  or third parties.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  7. Limitation of Liability
                </h3>
                <p>
                  Walvee is provided "as is" without warranties of any kind. We
                  are not liable for any indirect, incidental, special, or
                  consequential damages arising from your use of the Service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  8. Contact
                </h3>
                <p>
                  If you have any questions about these Terms, please contact us
                  at:{" "}
                  <a
                    href="mailto:legal@walvee.com"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    legal@walvee.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-[#0D0D0D] rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-[#2A2B35]">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-[#2A2B35] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] text-gray-300 space-y-4">
              <p className="text-sm text-gray-400">
                Last updated: January 10, 2025
              </p>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  1. Information We Collect
                </h3>
                <p className="mb-2">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong className="text-white">Account Information:</strong>{" "}
                    Name, email, profile photo (from Google OAuth)
                  </li>
                  <li>
                    <strong className="text-white">
                      Optional Demographics:
                    </strong>{" "}
                    Age, gender (only if you provide them)
                  </li>
                  <li>
                    <strong className="text-white">Location:</strong> City and
                    country (only if you provide them)
                  </li>
                  <li>
                    <strong className="text-white">User Content:</strong> Trip
                    itineraries, photos, comments you post
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  2. How We Use Your Information
                </h3>
                <p className="mb-2">We use the information we collect to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide and improve our services</li>
                  <li>Personalize travel recommendations</li>
                  <li>Communicate with you about updates and features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  3. Data Sharing
                </h3>
                <p>
                  <strong className="text-white">
                    We never sell your personal data.
                  </strong>{" "}
                  We may share your information only in these cases:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    <strong className="text-white">Public Content:</strong> Trip
                    itineraries you choose to make public
                  </li>
                  <li>
                    <strong className="text-white">Service Providers:</strong>{" "}
                    Trusted partners who help us operate (e.g., Google Cloud,
                    authentication)
                  </li>
                  <li>
                    <strong className="text-white">Legal Requirements:</strong>{" "}
                    When required by law or to protect rights and safety
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  4. Your Rights (LGPD Compliance)
                </h3>
                <p className="mb-2">
                  Under Brazil's LGPD, you have the right to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong className="text-white">Access:</strong> Request a
                    copy of your data
                  </li>
                  <li>
                    <strong className="text-white">Correction:</strong> Update
                    inaccurate information
                  </li>
                  <li>
                    <strong className="text-white">Deletion:</strong> Request
                    deletion of your account and data
                  </li>
                  <li>
                    <strong className="text-white">Portability:</strong> Export
                    your data in JSON format
                  </li>
                  <li>
                    <strong className="text-white">Revoke Consent:</strong>{" "}
                    Withdraw consent for data processing
                  </li>
                </ul>
                <p className="mt-2">
                  To exercise these rights, visit your{" "}
                  <strong className="text-white">Privacy Settings</strong> or
                  contact us at{" "}
                  <a
                    href="mailto:privacy@walvee.com"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    privacy@walvee.com
                  </a>
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  5. Data Security
                </h3>
                <p>
                  We implement industry-standard security measures to protect
                  your data, including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Encryption in transit (HTTPS/TLS)</li>
                  <li>Encryption at rest for sensitive data</li>
                  <li>Regular security audits</li>
                  <li>Access controls and authentication</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  6. Google OAuth Integration
                </h3>
                <p>
                  We use Google OAuth for authentication. When you sign in with
                  Google:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    We only access your basic profile (name, email, photo)
                  </li>
                  <li>We comply with Google's API Services User Data Policy</li>
                  <li>
                    We do not access your Google Drive, Gmail, or other services
                  </li>
                  <li>
                    You can revoke access anytime via your{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      Google Account Settings
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  7. Cookies and Tracking
                </h3>
                <p>
                  We use essential cookies for authentication and session
                  management. We do not use third-party advertising or analytics
                  cookies without your consent.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  8. Children's Privacy
                </h3>
                <p>
                  Walvee is not intended for users under 13 years old. We do not
                  knowingly collect data from children. If you believe we have
                  collected data from a child, please contact us immediately.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  9. Changes to This Policy
                </h3>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of significant changes via email or a prominent
                  notice on our platform.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  10. Contact Us
                </h3>
                <p>For privacy-related questions or to exercise your rights:</p>
                <ul className="list-none ml-4 mt-2 space-y-1">
                  <li>
                    <strong className="text-white">Email:</strong>{" "}
                    <a
                      href="mailto:privacy@walvee.com"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      privacy@walvee.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-white">
                      Data Protection Officer:
                    </strong>{" "}
                    <a
                      href="mailto:dpo@walvee.com"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      dpo@walvee.com
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
