import React, { useState, useEffect, useRef } from "react";
import { User, Upload } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { createPageUrl, createProfileUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Search, ArrowLeft } from "lucide-react";
import UserAvatar from "../components/common/UserAvatar";
import { formatCityName } from "@/components/utils/cityFormatter";
import { apiClient, endpoints } from "@/api/apiClient";
import { useNotification } from "@/contexts/NotificationContext";

const MAX_BIO_LENGTH = 200;

export default function EditProfile() {
  const { user, userLoading } = useAuth();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchingCities, setSearchingCities] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    preferred_name: "",
    bio: "",
    city: "",
    country: "",
    photo_url: "",
  });

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = createPageUrl("Home");
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user) {
      // Normalize city fields: support nested `user.city` object or legacy strings
      let cityName = "";
      let countryName = "";
      let cityId = null;

      if (user.city && typeof user.city === "object") {
        cityName = formatCityName(user.city.name);
        countryName = user.city.country || user.country || "";
        cityId = user.city.id || null;
      } else {
        cityName = formatCityName(user.city);
        countryName = user.country || "";
      }

      setFormData({
        full_name: user.full_name || "",
        preferred_name: user.preferred_name || "",
        bio: user.bio || "",
        city: cityName,
        country: countryName,
        city_id: cityId,
        photo_url: user.photo_url || user.picture || "",
      });
      setSelectedCityId(cityId);

      if (cityName || countryName) {
        const display = countryName
          ? `${cityName}${
              user.city?.state ? `, ${user.city.state}` : ""
            }, ${countryName}`
          : cityName;
        setLocationQuery(display);
      }
    }
  }, [user]);

  const handleLocationChange = (value) => {
    setLocationQuery(value);
    setSelectedCityId(null);

    // Simple parsing: assume format is "City, Country"
    const parts = value.split(",").map((p) => p.trim());
    const city = parts[0] || "";
    const country = parts.length > 1 ? parts[parts.length - 1] : "";
    setFormData((prev) => ({ ...prev, city, country, city_id: null }));

    // Debounce and search
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value || value.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingCities(true);
      try {
        const resp = await apiClient.get(endpoints.cities.search, {
          query: value.trim(),
        });
        if (resp && resp.success && resp.data)
          setLocationSuggestions(resp.data);
        else setLocationSuggestions([]);
      } catch (err) {
        console.error("City search failed:", err);
        setLocationSuggestions([]);
      } finally {
        setSearchingCities(false);
      }
    }, 300);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification({
        type: "error",
        title: "Invalid file",
        message: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: "error",
        title: "File too large",
        message: "Image size must be less than 5MB",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const { fileUrl } = await Upload.uploadImage(file);
      setFormData((prev) => ({ ...prev, photo_url: fileUrl }));
    } catch (error) {
      console.error("Error uploading photo:", error);
      showNotification({
        type: "error",
        title: "Upload failed",
        message: "Failed to upload photo. Please try again.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLocationSelect = (city) => {
    const cityName = formatCityName(city.name) || "";
    const countryName = city.country?.name || city.country || "";
    const display = countryName
      ? `${cityName}${city.state ? `, ${city.state}` : ""}, ${countryName}`
      : cityName;

    setSelectedCityId(city.id);
    setLocationQuery(display);
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      country: countryName,
      city_id: city.id,
    }));
    setLocationSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.preferred_name.trim()) {
      showNotification({
        type: "error",
        title: "Validation",
        message: "Please enter your preferred name",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        full_name: formData.full_name.trim(),
        preferred_name: formData.preferred_name.trim(),
        bio: formData.bio.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
      };

      // If a canonical city was selected, send city_id to backend
      if (formData.city_id || selectedCityId) {
        updateData.city_id = formData.city_id || selectedCityId;
      }

      if (formData.photo_url) {
        updateData.photo_url = formData.photo_url;
        updateData.photo_updated_at = new Date().toISOString();
      }

      await User.updateMe(updateData);
      window.location.href = createProfileUrl();
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification({
        type: "error",
        title: "Update failed",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] pt-16">
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-32">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (window.location.href = createPageUrl("Profile"))}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1A1B23] rounded-2xl p-6 border border-[#2A2B35]">
            <h2 className="text-lg font-semibold text-white mb-4">
              Profile Photo
            </h2>

            <div className="flex items-center gap-6">
              <div className="relative">
                <UserAvatar
                  src={formData.photo_url}
                  name={formData.preferred_name || formData.full_name}
                  size="xl"
                  ring={true}
                  className="ring-4 ring-blue-500/30"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors border-2 border-[#1A1B23]"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">
                  Upload a new profile photo
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1B23] rounded-2xl p-6 border border-[#2A2B35] space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Personal Information
            </h2>

            <div>
              <Label htmlFor="full_name" className="text-gray-300 mb-2 block">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="John Doe"
                className="bg-[#0D0D0D] border-gray-700 text-white h-12"
              />
            </div>

            <div>
              <Label
                htmlFor="preferred_name"
                className="text-gray-300 mb-2 block"
              >
                Preferred Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="preferred_name"
                value={formData.preferred_name}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_name: e.target.value })
                }
                placeholder="How would you like to be called?"
                className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                This is the name shown to other travelers
              </p>
            </div>
          </div>

          <div className="bg-[#1A1B23] rounded-2xl p-6 border border-[#2A2B35]">
            <h2 className="text-lg font-semibold text-white mb-4">About You</h2>

            <div>
              <Label htmlFor="bio" className="text-gray-300 mb-2 block">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_BIO_LENGTH) {
                    setFormData({ ...formData, bio: e.target.value });
                  }
                }}
                placeholder="Tell other travelers about yourself..."
                className="bg-[#0D0D0D] border-gray-700 text-white min-h-[120px] resize-none"
                maxLength={MAX_BIO_LENGTH}
              />
              <p className="text-xs text-gray-500 mt-1.5 text-right">
                {formData.bio.length}/{MAX_BIO_LENGTH} characters
              </p>
            </div>
          </div>

          <div className="bg-[#1A1B23] rounded-2xl p-6 border border-[#2A2B35]">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Your Location
            </h2>

            <div className="relative">
              <Label className="text-gray-300 mb-2 block">City & Country</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <Input
                  value={locationQuery}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="e.g., Paris, France"
                  className="bg-[#0D0D0D] border-gray-700 text-white pl-10 h-12"
                />
                {/* Suggestions dropdown */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-[#0B0C0F] border border-[#2A2B35] rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto location-suggestions-scroll">
                    {locationSuggestions.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleLocationSelect(city)}
                        className="w-full text-left px-4 py-2 hover:bg-[#111317] text-sm text-gray-200"
                      >
                        <div className="font-medium">
                          {formatCityName(city.name)}
                          {city.state ? `, ${city.state}` : ""}
                        </div>
                        <div className="text-xs text-gray-400">
                          {city.country?.name || city.country}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => (window.location.href = createProfileUrl())}
              variant="outline"
              className="flex-1 h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
