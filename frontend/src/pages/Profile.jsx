import React, { useState, useEffect, useRef } from "react";
import { Trip, TripLike, Follow, User } from "@/api/entities";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Edit,
  Users,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import UserAvatar from "../components/common/UserAvatar";
import TripCard from "../components/home/TripCard";
import { updateUserKPIs } from "../components/utils/kpiManager";
import { useFavorites } from "../components/hooks/useFavorites";
import FavoriteCard from "../components/profile/FavoriteCard";
import UserListItem from "../components/profile/UserListItem";
import PlaceModal from "../components/city/PlaceModal";
import ProfileTripFilters from "../components/profile/ProfileTripFilters";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl, createProfileUrl } from "@/utils";
import EditProfilePanel from "../components/profile/EditProfilePanel";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user: currentUser, openLoginModal } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlUserId || urlParams.get("userId");
  const profileUserEmail = urlParams.get("email");

  const isEmailInUserId = profileUserId?.includes("@");
  const targetUserEmail =
    profileUserEmail || (isEmailInUserId ? profileUserId : null);
  const targetUserId = !isEmailInUserId && profileUserId ? profileUserId : null;

  const [activeView, setActiveView] = useState("trips");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [tripFilter, setTripFilter] = useState(null);

  const isViewingOwnProfileWithoutParams = !targetUserEmail && !targetUserId;

  // Helper to try getting full user data when authenticated
  const tryGetFullUserData = async (email, id) => {
    try {
      if (email) {
        const users = await User.filter({ email });
        if (users.length > 0) return users[0];
      }
      if (id) {
        const user = await User.get(id);
        if (user) return user;
      }
    } catch (error) {
      console.warn(
        "[Profile] Authenticated full user data fetch failed:",
        error.message
      );
    }
    return {}; // Return an empty object if not found or error
  };

  // Fetch profile user - IMPROVED with better error handling for public access
  const {
    data: profileUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["profileUser", targetUserId, targetUserEmail, currentUser?.id],
    queryFn: async () => {
      // If no params and no current user, show login prompt
      if (!targetUserEmail && !targetUserId) {
        if (currentUser) {
          return currentUser;
        }
        return null;
      }

      let userFromPublicData = null;

      // Priority 1: Try to get user data from publicly available trips if email is known
      if (targetUserEmail) {
        try {
          // Get all trips (public)
          const allTrips = await Trip.list();

          // Find trips by this user
          const userTripsByEmail = allTrips.filter(
            (t) => t.author_email === targetUserEmail
          );

          if (userTripsByEmail.length > 0) {
            const firstTrip = userTripsByEmail[0];
            userFromPublicData = {
              email: targetUserEmail,
              // Use author_name from trip, fallback to "Traveler" if not present
              full_name: firstTrip.author_name || "Traveler",
              preferred_name: firstTrip.author_name?.split(" ")[0],
              photo_url: firstTrip.author_photo,
              created_date: firstTrip.created_date,
              // Basic placeholder fields if not fully authenticated
              id: null, // ID will be filled if authenticated below
              bio: null,
              city: null,
              country: null,
              instagram_username: null,
            };
          }
        } catch (error) {
          console.error(
            "[Profile] Error searching by trips for public profile:",
            error
          );
        }
      }

      // Priority 2: If authenticated, try direct User entity access for full data
      let userFromAuthenticatedSource = null;
      if (currentUser) {
        try {
          if (targetUserEmail) {
            const users = await User.filter({ email: targetUserEmail });
            if (users.length > 0) {
              userFromAuthenticatedSource = users[0];
            }
          }

          if (
            !userFromAuthenticatedSource &&
            targetUserId &&
            !targetUserId.includes("@")
          ) {
            const user = await User.get(targetUserId);
            if (user) {
              userFromAuthenticatedSource = user;
            }
          }
        } catch (error) {
          console.warn(
            "[Profile] Authenticated direct user access failed, potentially due to permissions or user not found:",
            error.message
          );
        }
      }

      if (userFromAuthenticatedSource) {
        return userFromAuthenticatedSource; // Full user data takes precedence if available
      } else if (userFromPublicData) {
        return userFromPublicData; // Fallback to public trip data if not authenticated or direct access failed
      }

      console.error(
        "[Profile] User not found with any method (public or authenticated)."
      );
      return null;
    },
    enabled: true, // Always enabled to check public data
    retry: 0, // We handle retry logic and fallbacks within the queryFn
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  });

  const isOwnProfile =
    currentUser?.id === profileUser?.id ||
    currentUser?.email === profileUser?.email;

  const { data: userTrips = [], isLoading: isLoadingTrips } = useQuery({
    queryKey: ["userTrips", profileUser?.email],
    queryFn: async () => {
      if (!profileUser?.email) return [];

      const allTrips = await Trip.list({ sortBy: "created_at", order: "desc" }); // Trips are public
      const userTrips = allTrips.filter(
        (trip) => trip.author_email === profileUser.email
      );

      return userTrips;
    },
    enabled: !!profileUser?.email,
    initialData: [],
  });

  const filteredTrips = React.useMemo(() => {
    if (!tripFilter) return userTrips;

    return userTrips.filter((trip) => {
      if (typeof tripFilter === "string") {
        const city = trip.destination?.split(",")[0]?.trim();
        return city === tripFilter;
      }

      if (typeof tripFilter === "number") {
        const year = trip.start_date
          ? new Date(trip.start_date).getFullYear()
          : null;
        return year === tripFilter;
      }

      return true;
    });
  }, [userTrips, tripFilter]);

  // Only fetch follow status if authenticated and profileUser has an ID
  const { data: followStatus } = useQuery({
    queryKey: ["followStatus", profileUser?.id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !profileUser || !profileUser.id || isOwnProfile)
        return null; // Needs profileUser.id for follow

      const cached = sessionStorage.getItem(
        `followStatus_${profileUser.id}_${currentUser.id}`
      );
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          return parsed.data;
        }
      }

      try {
        const status = await Follow.check(profileUser.id);

        sessionStorage.setItem(
          `followStatus_${profileUser.id}_${currentUser.id}`,
          JSON.stringify({ data: status, timestamp: Date.now() })
        );

        return status;
      } catch (error) {
        console.warn(
          "[Follow] Error checking status (might not be authenticated for follow entity):",
          error.message
        );
        return null;
      }
    },
    enabled: !!currentUser && !!profileUser?.id && !isOwnProfile, // Enable only if authenticated AND profileUser has an ID
    retry: 0,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: userLikes = [], isLoading: isLoadingUserLikes } = useQuery({
    queryKey: ["userLikes", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      try {
        return await TripLike.filter({ liker_id: currentUser.id });
      } catch (error) {
        console.error("[Likes] Error fetching user likes:", error);
        return [];
      }
    },
    enabled: !!currentUser,
    initialData: [],
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const userLikedTripIds = React.useMemo(() => {
    return new Set(userLikes.map((like) => like.trip_id));
  }, [userLikes]);

  const invalidateUserLikes = () => {
    if (currentUser?.id) {
      queryClient.invalidateQueries(["userLikes", currentUser.id]);
    }
  };

  // useFavorites hook uses currentUser, will be empty if not logged in
  const { favorites: userFavorites, isLoading: isLoadingFavorites } =
    useFavorites(profileUser);

  const USERS_PAGE_SIZE = 10; // Define page size for infinite scroll

  const fetchFollowRecords = async ({ pageParam = 0, type, userId }) => {
    // Follow records require authentication and user IDs
    if (!userId || !currentUser) {
      return { data: [], nextPage: undefined, total: 0 };
    }

    try {
      const options = {
        page: pageParam + 1, // Backend uses 1-based page numbers
        limit: USERS_PAGE_SIZE,
      };

      // Use the correct Follow methods - they now return full response with pagination
      const response = type === "followers" 
        ? await Follow.getFollowers(userId, options)
        : await Follow.getFollowing(userId, options);

      const users = response?.data || [];
      const total = response?.pagination?.total || 0;

      return {
        data: users,
        total,
        nextPage: users.length === USERS_PAGE_SIZE ? pageParam + 1 : undefined,
      };
    } catch (error) {
      console.error(
        "[Profile] Error fetching follow records (requires authentication):",
        error
      );
      return { data: [], nextPage: undefined, total: 0 };
    }
  };

  const {
    data: followersPages,
    fetchNextPage: fetchNextFollowersPage,
    hasNextPage: hasNextFollowersPage,
    isFetchingNextPage: isFetchingNextFollowersPage,
    isLoading: isLoadingFollowers,
  } = useInfiniteQuery({
    queryKey: ["profileFollowers", profileUser?.id],
    queryFn: ({ pageParam }) =>
      fetchFollowRecords({
        pageParam,
        type: "followers",
        userId: profileUser?.id,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!profileUser?.id && !!currentUser && activeView === "followers", // Only enabled when followers view is active AND authenticated
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  const followers = followersPages?.pages?.flatMap((page) => page.data) || [];
  const actualFollowersCount = followersPages?.pages?.[0]?.total ?? null;

  const {
    data: followingPages,
    fetchNextPage: fetchNextFollowingPage,
    hasNextPage: hasNextFollowingPage,
    isFetchingNextPage: isFetchingNextFollowingPage,
    isLoading: isLoadingFollowing,
  } = useInfiniteQuery({
    queryKey: ["profileFollowing", profileUser?.id],
    queryFn: ({ pageParam }) =>
      fetchFollowRecords({
        pageParam,
        type: "following",
        userId: profileUser?.id,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!profileUser?.id && !!currentUser && activeView === "following", // Only enabled when following view is active AND authenticated
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  const following = followingPages?.pages?.flatMap((page) => page.data) || [];
  const actualFollowingCount = followingPages?.pages?.[0]?.total ?? null;

  // Fetch follower/following counts separately for accurate stats display
  const { data: followerCountData } = useQuery({
    queryKey: ["followerCount", profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id || !currentUser) return 0;
      try {
        const response = await Follow.getFollowers(profileUser.id, { page: 1, limit: 1 });
        return response?.pagination?.total || 0;
      } catch (error) {
        console.error("[Profile] Error fetching follower count:", error);
        return 0;
      }
    },
    enabled: !!profileUser?.id && !!currentUser,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const { data: followingCountData } = useQuery({
    queryKey: ["followingCount", profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id || !currentUser) return 0;
      try {
        const response = await Follow.getFollowing(profileUser.id, { page: 1, limit: 1 });
        return response?.pagination?.total || 0;
      } catch (error) {
        console.error("[Profile] Error fetching following count:", error);
        return 0;
      }
    },
    enabled: !!profileUser?.id && !!currentUser,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const isFollowing = !!followStatus;

  const totalTrips = userTrips.length;
  const totalPlaces = userTrips.reduce((sum, trip) => {
    return (
      sum +
      (trip.itinerary?.reduce((daySum, day) => {
        return daySum + (day.places?.length || 0);
      }, 0) || 0)
    );
  }, 0);

  const uniqueCountries = new Set(
    userTrips
      .map((trip) => trip.destination?.split(",").pop()?.trim())
      .filter(Boolean)
  ).size;

  const loadMoreRef = useRef(null);

  useEffect(() => {
    // Only set up observer if current user is logged in
    if (!loadMoreRef.current || !currentUser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (
            activeView === "followers" &&
            hasNextFollowersPage &&
            !isFetchingNextFollowersPage
          ) {
            fetchNextFollowersPage();
          } else if (
            activeView === "following" &&
            hasNextFollowingPage &&
            !isFetchingNextFollowingPage
          ) {
            fetchNextFollowingPage();
          }
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [
    activeView,
    hasNextFollowersPage,
    isFetchingNextFollowersPage,
    fetchNextFollowersPage,
    hasNextFollowingPage,
    isFetchingNextFollowingPage,
    fetchNextFollowingPage,
    currentUser, // Add currentUser to dependencies
  ]);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !profileUser || !profileUser.id)
        throw new Error("Not authenticated or profile user ID missing.");

      // Follow.create expects a single `followeeId` string in the body
      return await Follow.create(profileUser.id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries([
        "followStatus",
        profileUser?.id,
        currentUser?.id,
      ]);
      await queryClient.cancelQueries(["profileUser", profileUser?.id]);

      const previousFollow = queryClient.getQueryData([
        "followStatus",
        profileUser?.id,
        currentUser?.id,
      ]);
      const previousUser = queryClient.getQueryData([
        "profileUser",
        profileUser?.id,
      ]);

      const optimisticFollow = {
        id: "optimistic-follow",
        following: true,
        followee_id: profileUser.id,
        follower_id: currentUser.id,
      };

      queryClient.setQueryData(
        ["followStatus", profileUser?.id, currentUser?.id],
        optimisticFollow
      );
      sessionStorage.setItem(
        `followStatus_${profileUser.id}_${currentUser.id}`,
        JSON.stringify({
          data: optimisticFollow,
          timestamp: Date.now(),
        })
      );

      return { previousFollow, previousUser };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["followStatus", profileUser?.id, currentUser?.id],
        context.previousFollow
      );
      queryClient.setQueryData(
        ["profileUser", profileUser?.id],
        context.previousUser
      );
      alert("Couldn't follow now. Please try again.");
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(
        ["followStatus", profileUser?.id, currentUser?.id],
        data
      );
      sessionStorage.setItem(
        `followStatus_${profileUser.id}_${currentUser.id}`,
        JSON.stringify({
          data: data,
          timestamp: Date.now(),
        })
      );

      // Invalidate count queries to refresh with new data
      queryClient.invalidateQueries(["followerCount", profileUser.id]);
      queryClient.invalidateQueries(["followingCount", currentUser.id]);
      queryClient.invalidateQueries(["profileFollowers", profileUser.id]);
      queryClient.invalidateQueries(["profileFollowing", currentUser.id]);
    },
    onSettled: () => {
      followActionRef.current = false;
    },
  });

  const followActionRef = useRef(false);

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!profileUser || !currentUser) throw new Error("Not authenticated");
      if (!followStatus) throw new Error("Not following");
      return await Follow.unfollow(profileUser.id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries([
        "followStatus",
        profileUser?.id,
        currentUser?.id,
      ]);
      await queryClient.cancelQueries(["profileUser", profileUser?.id]);

      const previousFollow = queryClient.getQueryData([
        "followStatus",
        profileUser?.id,
        currentUser?.id,
      ]);
      const previousUser = queryClient.getQueryData([
        "profileUser",
        profileUser?.id,
      ]);

      queryClient.setQueryData(
        ["followStatus", profileUser?.id, currentUser?.id],
        null
      );
      sessionStorage.setItem(
        `followStatus_${profileUser.id}_${currentUser.id}`,
        JSON.stringify({
          data: null,
          timestamp: Date.now(),
        })
      );

      return { previousFollow, previousUser };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["followStatus", profileUser?.id, currentUser?.id],
        context.previousFollow
      );
      queryClient.setQueryData(
        ["profileUser", profileUser?.id],
        context.previousUser
      );
      alert("Couldn't unfollow now. Please try again.");
    },
    onSuccess: async () => {
      queryClient.setQueryData(
        ["followStatus", profileUser?.id, currentUser?.id],
        null
      );
      sessionStorage.setItem(
        `followStatus_${profileUser.id}_${currentUser.id}`,
        JSON.stringify({
          data: null,
          timestamp: Date.now(),
        })
      );

      // Invalidate count queries to refresh with new data
      queryClient.invalidateQueries(["followerCount", profileUser.id]);
      queryClient.invalidateQueries(["followingCount", currentUser.id]);
      queryClient.invalidateQueries(["profileFollowers", profileUser.id]);
      queryClient.invalidateQueries(["profileFollowing", currentUser.id]);
    },
  });

  const handleFollowClick = () => {
    // Cannot follow a user if their ID is not known (i.e., profile was built only from public trip data)
    if (!profileUser?.id) {
      alert(
        "Cannot follow this user as their full profile information is not available."
      );
      return;
    }

    if (
      followMutation.isPending ||
      unfollowMutation.isPending ||
      followActionRef.current
    )
      return;

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followActionRef.current = true;
      followMutation.mutate();
    }
    // If not authenticated, the API call will trigger 401 and show login modal
  };

  const handleRestrictedAction = () => {
    // No-op: 401 interceptor will handle showing login modal
  };

  const scrollToTrips = () => {
    setActiveView("trips");
  };

  const showFavorites = () => {
    setActiveView("favorites");
    // If not authenticated, subsequent API calls will trigger 401 and show login modal
  };

  const showFollowers = () => {
    setActiveView("followers");
    // If not authenticated, subsequent API calls will trigger 401 and show login modal
  };

  const showFollowing = () => {
    setActiveView("following");
    // If not authenticated, subsequent API calls will trigger 401 and show login modal
  };

  const handlePlaceClick = (placeData) => {
    setSelectedPlace(placeData);
    setIsPlaceModalOpen(true);
  };

  const closePlaceModal = () => {
    setIsPlaceModalOpen(false);
    setSelectedPlace(null);
  };

  const handleEditProfile = () => {
    setActiveView("edit");
  };

  const handleCloseEdit = () => {
    setActiveView("trips");
  };

  const handleSaveProfile = async () => {
    // Trigger refetch before closing
    await queryClient.refetchQueries(["profileUser", profileUser?.id]);
    await queryClient.refetchQueries(["currentUser"]);

    // Small delay to ensure UI updates
    await new Promise((resolve) => setTimeout(resolve, 200));

    setActiveView("trips");
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!profileUser) {
    if (isViewingOwnProfileWithoutParams) {
      return (
        <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Please log in
            </h1>
            <p className="text-gray-400 mb-4">
              You need to be logged in to view your profile.
            </p>
            <Button
              onClick={openLoginModal}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log in
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">User not found</h1>
          <p className="text-gray-400 mb-4">
            This user hasn't created any trips yet or doesn't exist.
            {targetUserEmail && (
              <>
                <br />
                <span className="text-xs">Searched for: {targetUserEmail}</span>
              </>
            )}
            {targetUserId && (
              <>
                <br />
                <span className="text-xs">ID: {targetUserId}</span>
              </>
            )}
          </p>
          <Button
            onClick={() => (window.location.href = createPageUrl("Home"))}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const firstName =
    profileUser.preferred_name ||
    profileUser.full_name?.split(" ")[0] ||
    "Traveler";
  const myTrips = totalTrips; // Use actual fetched trips count
  // Use actual counts from queries
  const followersCount = followerCountData ?? actualFollowersCount ?? 0;
  const followingCount = followingCountData ?? actualFollowingCount ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0B0F] pt-16">
      <style>{`
        .walvee-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .walvee-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .walvee-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3B82F6 0%, #8B5CF6 100%);
          border-radius: 8px;
        }
        
        .walvee-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #60A5FA 0%, #A78BFA 100%);
          box-shadow: 0 0 8px rgba(59,130,246,0.5);
        }
        
        .walvee-scroll {
          scrollbar-width: thin;
          scrollbar-color: #3B82F6 transparent;
        }
      `}</style>

      {/* Fixed Sidebar - Compact and no gap */}
      <aside className="hidden lg:block fixed left-0 top-16 w-[320px] xl:w-[360px] h-[calc(100vh-4rem)] overflow-y-auto walvee-scroll py-6 px-4">
        <div className="bg-[#1A1B23] rounded-2xl p-5 border border-[#2A2B35]">
          {/* Avatar + Name - Compact */}
          <div className="flex flex-col items-center mb-4">
            <UserAvatar
              src={profileUser.photo_url || profileUser.picture}
              name={profileUser.preferred_name || profileUser.full_name}
              size="lg"
              ring={true}
              className="ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20 mb-3"
            />

            <h1 className="text-lg font-bold text-white text-center mb-1">
              {profileUser.preferred_name ||
                profileUser.full_name ||
                "Traveler"}
            </h1>

            <p className="text-xs text-gray-400 text-center leading-relaxed line-clamp-2 mb-3">
              {profileUser.bio ||
                `I'm from ${
                  profileUser.city || "somewhere"
                } and a person who loves to travel and explore the natural world.`}
            </p>

            {/* Instagram Link */}
            {profileUser.instagram_username && (
              <a
                href={`https://instagram.com/${profileUser.instagram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-400 transition-colors group mb-2"
              >
                <Instagram className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>@{profileUser.instagram_username}</span>
              </a>
            )}
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={scrollToTrips}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {myTrips}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">My Trips</div>
            </button>

            <button
              onClick={showFollowers}
              disabled={!currentUser || followersCount === 0}
              className={`text-center transition-opacity ${
                !currentUser || followersCount === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-80"
              }`}
            >
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {followersCount}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Followers</div>
            </button>

            <button
              onClick={showFollowing}
              disabled={!currentUser}
              className={`text-center transition-opacity ${
                !currentUser
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-80"
              }`}
            >
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {followingCount}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Following</div>
            </button>
          </div>

          {/* Location & Join Date - Inline compact */}
          <div className="space-y-2 mb-4 pb-4 border-b border-[#2A2B35]">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">
                {profileUser.city && profileUser.country ? (
                  <>
                    {profileUser.city},{" "}
                    {profileUser.country.includes("-")
                      ? profileUser.country.split("-")[1].trim()
                      : profileUser.country}
                  </>
                ) : (
                  profileUser.city || "Location not set"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3 text-blue-400 shrink-0" />
              <span>
                {profileUser.created_date
                  ? format(new Date(profileUser.created_date), "MMM yyyy")
                  : "Recently"}
              </span>
            </div>
          </div>

          {/* Trips/Places/Countries Stats - Compact */}
          <div className="bg-[#0D0D0D] rounded-lg p-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{totalTrips}</div>
                <div className="text-[10px] text-gray-500">trips</div>
              </div>

              <div className="text-center border-x border-[#2A2B35]">
                <div className="text-lg font-bold text-white">
                  {totalPlaces}
                </div>
                <div className="text-[10px] text-gray-500">places</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {uniqueCountries}
                </div>
                <div className="text-[10px] text-gray-500">countries</div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Compact */}
          <div className="space-y-2 mb-4">
            <button
              onClick={scrollToTrips}
              disabled={totalTrips === 0}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                totalTrips === 0
                  ? "bg-[#0D0D0D] opacity-50 cursor-not-allowed"
                  : activeView === "trips"
                  ? "bg-blue-600 text-white"
                  : "bg-[#0D0D0D] hover:bg-[#2A2B35]"
              }`}
            >
              <span className="text-xs font-medium text-white">
                {isOwnProfile ? "My trips" : `${firstName}'s trips`}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] ${
                    totalTrips === 0
                      ? "text-gray-600"
                      : activeView === "trips"
                      ? "text-white"
                      : "text-blue-400"
                  }`}
                >
                  {totalTrips}
                </span>
                <ArrowRight
                  className={`w-3 h-3 ${
                    totalTrips === 0
                      ? "text-gray-600"
                      : activeView === "trips"
                      ? "text-white"
                      : "text-blue-400"
                  }`}
                />
              </div>
            </button>

            <button
              onClick={showFavorites}
              disabled={!currentUser || userFavorites.length === 0}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                !currentUser || userFavorites.length === 0
                  ? "bg-[#0D0D0D] opacity-50 cursor-not-allowed"
                  : activeView === "favorites"
                  ? "bg-blue-600 text-white"
                  : "bg-[#0D0D0D] hover:bg-[#2A2B35]"
              }`}
            >
              <span className="text-xs font-medium text-white">
                {isOwnProfile ? "My favorites" : `${firstName}'s favorites`}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] ${
                    !currentUser || userFavorites.length === 0
                      ? "text-gray-600"
                      : activeView === "favorites"
                      ? "text-white"
                      : "text-blue-400"
                  }`}
                >
                  {userFavorites.length}
                </span>
                <ArrowRight
                  className={`w-3 h-3 ${
                    !currentUser || userFavorites.length === 0
                      ? "text-gray-600"
                      : activeView === "favorites"
                      ? "text-white"
                      : "text-blue-400"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Action Button */}
          {isOwnProfile ? (
            <Button
              onClick={handleEditProfile}
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={handleFollowClick}
              disabled={
                !currentUser ||
                followMutation.isPending ||
                unfollowMutation.isPending ||
                !profileUser.id
              }
              className={`w-full h-10 font-semibold text-sm rounded-xl transition-all ${
                isFollowing
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-blue-500/25"
              } ${
                !currentUser || !profileUser.id
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {followMutation.isPending || unfollowMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isFollowing
                    ? `Unfollow ${firstName}`
                    : `Follow ${firstName}`}
                </>
              )}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content - No gap with sidebar */}
      <div className="lg:ml-[320px] xl:ml-[360px]">
        <div className="py-8 px-6">
          <main>
            {activeView === "edit" && isOwnProfile && (
              <div className="bg-[#1A1B23] rounded-2xl border border-[#2A2B35] overflow-hidden">
                <EditProfilePanel
                  user={profileUser}
                  onClose={handleCloseEdit}
                  onSave={handleSaveProfile}
                />
              </div>
            )}

            {activeView === "trips" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isOwnProfile ? "My Trips" : `${firstName}'s Trips`}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {filteredTrips.length}{" "}
                    {filteredTrips.length === 1 ? "trip" : "trips"}
                    {tripFilter && ` (filtered)`}
                  </p>
                </div>

                {userTrips.length > 0 && (
                  <ProfileTripFilters
                    trips={userTrips}
                    activeFilter={tripFilter}
                    onFilterChange={setTripFilter}
                  />
                )}

                {isLoadingTrips ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                  </div>
                ) : filteredTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        isLoggedIn={!!currentUser}
                        onRestrictedAction={handleRestrictedAction}
                        onFavoriteToggle={invalidateUserLikes}
                        currentUserId={currentUser?.id}
                        userLikedTripIds={userLikedTripIds}
                        isLoadingLikes={isLoadingUserLikes}
                      />
                    ))}
                  </div>
                ) : tripFilter ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                      <MapPin className="w-10 h-10 text-blue-400/60" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No trips found with this filter
                    </h3>
                    <Button
                      onClick={() => setTripFilter(null)}
                      variant="outline"
                      className="mt-4 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      Clear filter
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                      <MapPin className="w-10 h-10 text-blue-400/60" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {isOwnProfile
                        ? "You haven't shared any trips yet"
                        : "This traveler hasn't shared any trips yet"}
                    </h3>
                    {isOwnProfile && (
                      <>
                        <p className="text-gray-400 mb-6 max-w-md">
                          Start creating your personalized trips with AI and
                          share your adventures with the world.
                        </p>
                        <Button
                          onClick={() =>
                            navigate(createPageUrl("InspirePrompt"))
                          }
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25"
                        >
                          Create your first trip
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {(activeView === "favorites" ||
              activeView === "followers" ||
              activeView === "following") &&
            !currentUser ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-blue-400/60" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Login required
                </h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  You need to be logged in to view this content.
                </p>
                <Button
                  onClick={openLoginModal}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  Log in to continue
                </Button>
              </div>
            ) : (
              <>
                {activeView === "favorites" && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {isOwnProfile
                          ? "My Favorites"
                          : `${firstName}'s Favorites`}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {userFavorites.length}{" "}
                        {userFavorites.length === 1 ? "place" : "places"} saved
                      </p>
                    </div>

                    {isLoadingFavorites ? (
                      <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent" />
                      </div>
                    ) : userFavorites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userFavorites.map((favorite) => (
                          <FavoriteCard
                            key={favorite.id}
                            favorite={favorite}
                            currentUser={currentUser}
                            isOwnProfile={isOwnProfile}
                            onPlaceClick={handlePlaceClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                          <MapPin className="w-10 h-10 text-pink-400/60" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {isOwnProfile
                            ? "No favorites yet"
                            : `${firstName} hasn't saved any favorites yet`}
                        </h3>
                        {isOwnProfile && (
                          <p className="text-gray-400 mb-6 max-w-md">
                            Start exploring destinations and save your favorite
                            places to find them easily later!
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeView === "followers" && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {isOwnProfile
                          ? "My Followers"
                          : `${firstName}'s Followers`}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {followersCount}{" "}
                        {followersCount === 1 ? "follower" : "followers"}
                      </p>
                    </div>

                    {isLoadingFollowers && followers.length === 0 ? (
                      <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                      </div>
                    ) : followers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {followers.map((follower) => (
                          <UserListItem
                            key={follower.id}
                            user={follower}
                            currentUser={currentUser}
                          />
                        ))}
                        <div ref={loadMoreRef} className="col-span-full">
                          {isFetchingNextFollowersPage &&
                            hasNextFollowersPage && (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                          <Users className="w-10 h-10 text-blue-400/60" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {isOwnProfile
                            ? "No followers yet"
                            : `${firstName} has no followers yet`}
                        </h3>
                        {isOwnProfile && (
                          <p className="text-gray-400 max-w-md">
                            Share your trips and connect with other travelers to
                            grow your community!
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeView === "following" && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {isOwnProfile
                          ? "Following"
                          : `${firstName} is Following`}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {followingCount}{" "}
                        {followingCount === 1 ? "person" : "people"}
                      </p>
                    </div>

                    {isLoadingFollowing && following.length === 0 ? (
                      <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                      </div>
                    ) : following.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {following.map((followedUser) => (
                          <UserListItem
                            key={followedUser.id}
                            user={followedUser}
                            currentUser={currentUser}
                          />
                        ))}
                        <div ref={loadMoreRef} className="col-span-full">
                          {isFetchingNextFollowingPage &&
                            hasNextFollowingPage && (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mb-6">
                          <Users className="w-10 h-10 text-purple-400/60" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {isOwnProfile
                            ? "Not following anyone yet"
                            : `${firstName} isn't following anyone yet`}
                        </h3>
                        {isOwnProfile && (
                          <p className="text-gray-400 max-w-md">
                            Discover travelers and follow them to see their
                            latest trips and recommendations!
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {selectedPlace && (
        <PlaceModal
          place={selectedPlace}
          trip={{
            destination: `${selectedPlace.city}, ${selectedPlace.country}`,
          }}
          isOpen={isPlaceModalOpen}
          onClose={closePlaceModal}
          user={currentUser}
          openLoginModal={openLoginModal}
        />
      )}
    </div>
  );
}
