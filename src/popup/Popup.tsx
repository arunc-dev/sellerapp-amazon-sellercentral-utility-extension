import { useState } from "react";
import BrandAnalyticsPopup from "./BrandAnalyticsPopup";
import AmazonSearchQueryPerformance from "./AmazonSearchQueryPerformance";
import TopSearchTerms from "./TopSearchTerms";
import SearchCatalogPerformance from "./SearchCatalogPerformance";
import CouponPerformanceReport from "./CouponPerformanceReport";

type PopupView = "dashboard" | "asqp" | "topSearch" | "catalog" | "coupon";

export const Popup = () => {
  const [view, setView] = useState<PopupView>("dashboard");

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
