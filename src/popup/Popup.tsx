import { useState, useEffect, useCallback } from "react";
import BrandAnalyticsPopup from "./BrandAnalyticsPopup";
import AmazonSearchQueryPerformance from "./AmazonSearchQueryPerformance";
import TopSearchTerms from "./TopSearchTerms";
import SearchCatalogPerformance from "./SearchCatalogPerformance";
import CouponPerformanceReport from "./CouponPerformanceReport";
import ConnectAccountView from "./ConnectAccountView";
import { Spin } from "antd";
import { GeoMapsModel, geoMaps } from "../constants/geo-constants";
import { get } from "../helpers/Cache";

type PopupView = "dashboard" | "asqp" | "topSearch" | "catalog" | "coupon";

export const Popup = () => {
  const [view, setView] = useState<PopupView>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<GeoMapsModel | null>(null);
  const [hasCheckedOnMount, setHasCheckedOnMount] = useState(false);

  // Check authentication function
  const checkAuthentication = useCallback((geo: GeoMapsModel) => {
    setIsCheckingAuth(true);

    chrome.runtime.sendMessage(
      {
        type: "GET_CUSTOMER_JOURNEY_METADATA",
        selectedCountries: [geo.countryCode],
        baseDomain: geo.baseDomain,
      },
      (response) => {
        setIsCheckingAuth(false);

        if (chrome.runtime.lastError) {
          // Error or redirect - user not authenticated
          setIsAuthenticated(false);
          return;
        }

        if (!response || response.error) {
          // Error response - user not authenticated
          setIsAuthenticated(false);
          return;
        }

        // Successful response - user is authenticated
        setIsAuthenticated(true);
      }
    );
  }, []);

  // Handle geo change
  const handleGeoChange = useCallback(
    (geo: GeoMapsModel) => {
      setSelectedGeo(geo);
      checkAuthentication(geo);
    },
    [checkAuthentication]
  );

  // Check authentication on mount with saved or default geo (only once)
  useEffect(() => {
    if (!hasCheckedOnMount) {
      (async () => {
        // Try to load saved geo from cache
        let geoToUse: GeoMapsModel;
        try {
          const savedGeoKey = (await get("selectedGeo")) as string;
          if (savedGeoKey && geoMaps[savedGeoKey]) {
            geoToUse = geoMaps[savedGeoKey];
          } else {
            // Default to US if no saved geo
            geoToUse = {
              baseDomain: "sellercentral.amazon.com",
              marketPlaceId: "ATVPDKIKX0DER",
              marketPlace: "US",
              marketplaceDisplay: "AMAZON.COM",
              tail: ".com",
              countryCode: "us",
            };
          }
        } catch (error) {
          // Default to US on error
          geoToUse = {
            baseDomain: "sellercentral.amazon.com",
            marketPlaceId: "ATVPDKIKX0DER",
            marketPlace: "US",
            marketplaceDisplay: "AMAZON.COM",
            tail: ".com",
            countryCode: "us",
          };
        }

        setSelectedGeo(geoToUse);
        setHasCheckedOnMount(true);
        checkAuthentication(geoToUse);
      })();
    }
  }, [hasCheckedOnMount, checkAuthentication]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "520px",
          background: "#f5f7fb",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Show connect account view if not authenticated and on dashboard
  if (!isAuthenticated && view === "dashboard") {
    return (
      <ConnectAccountView
        onConnect={() => setIsAuthenticated(true)}
        onGeoChange={handleGeoChange}
      />
    );
  }

  if (view === "asqp") {
    return (
      <AmazonSearchQueryPerformance
        onBack={() => setView("dashboard")}
        onGeoChange={handleGeoChange}
      />
    );
  }

  if (view === "topSearch") {
    return (
      <TopSearchTerms
        onBack={() => setView("dashboard")}
        onGeoChange={handleGeoChange}
      />
    );
  }

  if (view === "catalog") {
    return (
      <SearchCatalogPerformance
        onBack={() => setView("dashboard")}
        onGeoChange={handleGeoChange}
      />
    );
  }

  if (view === "coupon") {
    return (
      <CouponPerformanceReport
        onBack={() => setView("dashboard")}
        onGeoChange={handleGeoChange}
      />
    );
  }

  return (
    <BrandAnalyticsPopup
      onOpenAsqp={() => setView("asqp")}
      onOpenTopSearchTerms={() => setView("topSearch")}
      onOpenSearchCatalog={() => setView("catalog")}
      onOpenCouponReport={() => setView("coupon")}
      onGeoChange={handleGeoChange}
    />
  );
};

export default Popup;
