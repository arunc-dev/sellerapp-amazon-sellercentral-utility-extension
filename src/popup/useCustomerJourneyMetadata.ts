import { useEffect, useState, useRef } from "react";

export type BrandOption = {
  label: string;
  value: string;
  isDefault?: boolean;
};

export type AsinOption = {
  label: string;
  value: string;
  isDefault?: boolean;
};

export type RangeChildOption = {
  label: string;
  value: string;
  isDefault?: boolean;
  child?: any; // Preserve nested children for monthly ranges
};

export type ReportingRangeOption = {
  label: string;
  value: string;
  isDefault?: boolean;
  childLabel?: string;
  childOptions?: RangeChildOption[];
  rawChild?: any; // Preserve the raw child structure
};

export type CustomerJourneyMetadataState = {
  loading: boolean;
  error?: string | null;
  brandOptions: BrandOption[];
  asinOptions: AsinOption[];
  reportingRangeOptions: ReportingRangeOption[];
  selectedBrand?: string;
  selectedRange?: string;
  selectedRangeChild?: string;
  setSelectedBrand: (value?: string) => void;
  setSelectedRangeChild: (value?: string) => void;
  handleSelectRange: (value: string) => void;
  childLabel: string;
  childOptions: RangeChildOption[];
};

export const useCustomerJourneyMetadata = (
  selectedCountries: string[] = ["us"],
  baseDomain: string = "sellercentral.amazon.com",
  skip: boolean = false
): CustomerJourneyMetadataState => {
  console.log(
    "Fetching Customer Journey metadata for domain:",
    baseDomain,
    selectedCountries
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [asinOptions, setAsinOptions] = useState<AsinOption[]>([]);
  const [reportingRangeOptions, setReportingRangeOptions] = useState<
    ReportingRangeOption[]
  >([]);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedRange, setSelectedRange] = useState<string | undefined>();
  const [selectedRangeChild, setSelectedRangeChild] = useState<
    string | undefined
  >();
  const lastFetchedDomain = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // // Skip fetching if skip parameter is true
    // if (skip) {
    //   return;
    // }

    // Prevent fetching if already fetching
    if (isFetchingRef.current) {
      return;
    }

    // Prevent fetching the same domain multiple times
    if (lastFetchedDomain.current === baseDomain) {
      return;
    }

    lastFetchedDomain.current = baseDomain;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    console.log(
      "Requesting Customer Journey metadata for domain:",
      baseDomain,
      "and countries:",
      selectedCountries
    );
    chrome.runtime.sendMessage(
      {
        type: "GET_CUSTOMER_JOURNEY_METADATA",
        selectedCountries,
        baseDomain,
      },
      (response) => {
        isFetchingRef.current = false;
        setLoading(false);

        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message ?? "Unknown error");
          return;
        }

        if (!response) {
          setError("No response from background script");
          return;
        }

        if (response.error) {
          setError(String(response.error));
          return;
        }

        const raw = response.data;
        const queryPerfRaw = response.queryPerformanceData;
        const metadata = raw?.metadata;
        const filters = metadata?.viewsRoot?.filters as any[] | undefined;

        if (!Array.isArray(filters)) {
          setError("Invalid metadata format: filters missing");
          return;
        }

        const brandFilter = filters.find((f) => f.id === "brand");
        const reportingFilter = filters.find((f) => f.id === "reporting-range");

        // ASIN filter is in Query Performance metadata
        const queryPerfMetadata = queryPerfRaw?.metadata;
        const queryPerfViews = queryPerfMetadata?.viewsRoot?.views as
          | any[]
          | undefined;
        const asinView = queryPerfViews?.find(
          (v: any) => v.id === "query-performance-asin-view"
        );
        const asinFilter = asinView?.filters?.find((f: any) => f.id === "asin");

        console.log("Query Performance metadata received:", !!queryPerfRaw);
        console.log("ASIN filter found:", !!asinFilter);
        console.log("ASIN values count:", asinFilter?.values?.length);

        const brands: BrandOption[] = (brandFilter?.values ?? []).map(
          (v: any) => ({
            label: v.localizedDisplayValue as string,
            value: String(v.value ?? ""),
            isDefault: Boolean(v.defaultSelection),
          })
        );

        const asins: AsinOption[] = (asinFilter?.values ?? []).map(
          (v: any) => ({
            label: v.displayValue || (v.localizedDisplayValue as string),
            value: String(v.value ?? ""),
            isDefault: Boolean(v.defaultSelection),
          })
        );

        const rawRanges: ReportingRangeOption[] = (
          reportingFilter?.values ?? []
        ).map((v: any) => ({
          label: v.localizedDisplayValue as string,
          value: String(v.value ?? ""),
          isDefault: Boolean(v.defaultSelection),
          childLabel: v.child?.localizedLabel as string | undefined,
          rawChild: v.child, // Preserve the entire raw child structure
          childOptions: (v.child?.values ?? []).map((c: any) => ({
            label: c.localizedDisplayValue as string,
            value: String(c.value ?? ""),
            isDefault: Boolean(c.defaultSelection),
            child: c.child, // Preserve nested children (for monthly -> year -> months)
          })),
        }));

        // No need to override quarterly data anymore - we preserve the nested structure
        const ranges: ReportingRangeOption[] = rawRanges;

        setBrandOptions(brands);
        setAsinOptions(asins);
        setReportingRangeOptions(ranges);

        const defaultBrand =
          brands.find((b) => b.isDefault) ||
          (brands.length ? brands[0] : undefined);
        const defaultRange =
          ranges.find((r) => r.isDefault) ||
          (ranges.length ? ranges[0] : undefined);

        // Only update state if values actually changed to prevent unnecessary re-renders
        const newBrandValue = defaultBrand?.value;
        const newRangeValue = defaultRange?.value;

        if (newBrandValue !== undefined) {
          setSelectedBrand(newBrandValue);
        }
        if (newRangeValue !== undefined) {
          setSelectedRange(newRangeValue);
        }

        const initialChildOptions = defaultRange?.childOptions ?? [];
        const defaultChild =
          initialChildOptions.find((c) => c.isDefault) ||
          initialChildOptions[0];

        if (defaultChild?.value !== undefined) {
          setSelectedRangeChild(defaultChild.value);
        }
      }
    );
  }, [baseDomain, skip]); // Re-run when baseDomain or skip changes

  const handleSelectRange = (value: string) => {
    setSelectedRange(value);
    const range = reportingRangeOptions.find((r) => r.value === value);
    const childOptions = range?.childOptions ?? [];
    const defaultChild =
      childOptions.find((c) => c.isDefault) || childOptions[0];
    setSelectedRangeChild(defaultChild?.value);
  };

  const currentRange = reportingRangeOptions.find(
    (r) => r.value === selectedRange
  );

  const childLabel = currentRange?.childLabel || "Select period";
  const childOptions = currentRange?.childOptions ?? [];

  return {
    loading,
    error,
    brandOptions,
    asinOptions,
    reportingRangeOptions,
    selectedBrand,
    selectedRange,
    selectedRangeChild,
    setSelectedBrand,
    setSelectedRangeChild,
    handleSelectRange,
    childLabel,
    childOptions,
  };
};
