import { useState } from "react";
import BrandAnalyticsPopup from "./BrandAnalyticsPopup";
import AmazonSearchQueryPerformance from "./AmazonSearchQueryPerformance";
import TopSearchTerms from "./TopSearchTerms";
import SearchCatalogPerformance from "./SearchCatalogPerformance";
import CouponPerformanceReport from "./CouponPerformanceReport";
import ConnectAccountView from "./ConnectAccountView";

type PopupView = "dashboard" | "asqp" | "topSearch" | "catalog" | "coupon";

export const Popup = () => {
  const [view, setView] = useState<PopupView>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Set to false for unauthenticated state

  // Show connect account view if not authenticated and on dashboard
  if (!isAuthenticated && view === "dashboard") {
    return <ConnectAccountView onConnect={() => setIsAuthenticated(true)} />;
  }

  if (view === "asqp") {
    return <AmazonSearchQueryPerformance onBack={() => setView("dashboard")} />;
  }

  if (view === "topSearch") {
    return <TopSearchTerms onBack={() => setView("dashboard")} />;
  }

  if (view === "catalog") {
    return <SearchCatalogPerformance onBack={() => setView("dashboard")} />;
  }

  if (view === "coupon") {
    return <CouponPerformanceReport onBack={() => setView("dashboard")} />;
  }

  return (
    <BrandAnalyticsPopup
      onOpenAsqp={() => setView("asqp")}
      onOpenTopSearchTerms={() => setView("topSearch")}
      onOpenSearchCatalog={() => setView("catalog")}
      onOpenCouponReport={() => setView("coupon")}
    />
  );
};

export default Popup;
