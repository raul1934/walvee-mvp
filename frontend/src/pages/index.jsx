import Layout from "./Layout.jsx";
import { AuthProvider } from "@/contexts/AuthContext";

import Home from "./Home";

import TripDetails from "./TripDetails";

import Onboarding from "./Onboarding";

import PrivacySettings from "./PrivacySettings";

import ResetFollowKPIs from "./ResetFollowKPIs";

import ResetLikes from "./ResetLikes";

import City from "./City";

import Profile from "./Profile";

import EditProfile from "./EditProfile";

import InspirePrompt from "./InspirePrompt";

import AuthCallback from "./AuthCallback";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

const PAGES = {
  Home: Home,

  TripDetails: TripDetails,

  Onboarding: Onboarding,

  PrivacySettings: PrivacySettings,

  ResetFollowKPIs: ResetFollowKPIs,

  ResetLikes: ResetLikes,

  City: City,

  Profile: Profile,

  EditProfile: EditProfile,

  InspirePrompt: InspirePrompt,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <AuthProvider currentPageName={currentPage}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/Home" element={<Home />} />

          <Route path="/TripDetails/:tripId" element={<TripDetails />} />
          <Route path="/tripdetails/:tripId" element={<TripDetails />} />

          <Route path="/Onboarding" element={<Onboarding />} />

          <Route path="/PrivacySettings" element={<PrivacySettings />} />

          <Route path="/ResetFollowKPIs" element={<ResetFollowKPIs />} />

          <Route path="/ResetLikes" element={<ResetLikes />} />

          <Route path="/city/:id/*" element={<City />} />

          <Route path="/Profile" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/followers" element={<Profile />} />
          <Route path="/profile/followees" element={<Profile />} />
          <Route path="/profile/following" element={<Profile />} />
          <Route path="/profile/favorites" element={<Profile />} />
          <Route path="/profile/favourites" element={<Profile />} />

          <Route path="/profile/edit" element={<EditProfile />} />

          <Route path="/EditProfile" element={<EditProfile />} />

          <Route path="/InspirePrompt" element={<InspirePrompt />} />

          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
