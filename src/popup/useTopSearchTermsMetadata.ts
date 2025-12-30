import { useEffect, useState } from "react";

export type CategoryOption = {
  label: string;
  value: string;
  isDefault?: boolean;
};

export type RangeChildOption = {
  label: string;
  value: string;
  isDefault?: boolean;
  child?: any;
};

export type ReportingRangeOption = {
  label: string;
  value: string;
  isDefault?: boolean;
  childLabel?: string;
  childOptions?: RangeChildOption[];
  rawChild?: any;
};

export type TopSearchTermsMetadataState = {
  loading: boolean;
  error?: string | null;
  categoryOptions: CategoryOption[];
  reportingRangeOptions: ReportingRangeOption[];
  selectedRange?: string;
  selectedRangeChild?: string;
  setSelectedRangeChild: (value?: string) => void;
  handleSelectRange: (value: string) => void;
  childLabel: string;
  childOptions: RangeChildOption[];
};

export const useTopSearchTermsMetadata = (
  selectedCountries: string[] = ["us"]
): TopSearchTermsMetadataState => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [reportingRangeOptions, setReportingRangeOptions] = useState<
    ReportingRangeOption[]
  >([]);
  const [selectedRange, setSelectedRange] = useState<string | undefined>();
  const [selectedRangeChild, setSelectedRangeChild] = useState<
    string | undefined
  >();

  useEffect(() => {
    console.log('[TopSearchTerms] Fetching metadata...');
    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        type: "GET_TOP_SEARCH_TERMS_METADATA",
        selectedCountries,
      },
      (response) => {
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
        const metadata = raw?.metadata;
        const views = metadata?.viewsRoot?.views as any[] | undefined;
        const defaultView = views?.find((v: any) => v.id === "top-search-terms-default-view");
        const filters = defaultView?.filters as any[] | undefined;

        if (!Array.isArray(filters)) {
          setError("Invalid metadata format: filters missing");
          return;
        }

        const categoryFilter = filters.find((f) => f.id === "category-dropdown");
        const reportingFilter = filters.find((f) => f.id === "reporting-range");

        const categories: CategoryOption[] = (categoryFilter?.values ?? []).map(
          (v: any) => ({
            label: v.localizedDisplayValue as string,
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
          rawChild: v.child,
          childOptions: (v.child?.values ?? []).map((c: any) => ({
            label: c.localizedDisplayValue as string,
            value: String(c.value ?? ""),
            isDefault: Boolean(c.defaultSelection),
            child: c.child,
          })),
        }));

        const ranges: ReportingRangeOption[] = rawRanges;

        setCategoryOptions(categories);
        setReportingRangeOptions(ranges);

        // Auto-select defaults
        const defaultRange = ranges.find((r) => r.isDefault);
        if (defaultRange) {
          setSelectedRange(defaultRange.value);
          const defaultChild = defaultRange.childOptions?.find((c) => c.isDefault);
          if (defaultChild) {
            setSelectedRangeChild(defaultChild.value);
          }
        }
      }
    );
  }, []); // Only fetch once on mount - selectedCountries defaults to ["us"]

  const handleSelectRange = (value: string) => {
    setSelectedRange(value);
    setSelectedRangeChild(undefined);
    
    // Try to auto-select first child if available
    const range = reportingRangeOptions.find((r) => r.value === value);
    if (range?.childOptions?.length) {
      const defaultChild = range.childOptions.find((c) => c.isDefault);
      if (defaultChild) {
        setSelectedRangeChild(defaultChild.value);
      }
    }
  };

  const currentRange = reportingRangeOptions.find(
    (r) => r.value === selectedRange
  );
  const childLabel = currentRange?.childLabel ?? "";
  const childOptions = currentRange?.childOptions ?? [];

  return {
    loading,
    error,
    categoryOptions,
    reportingRangeOptions,
    selectedRange,
    selectedRangeChild,
    setSelectedRangeChild,
    handleSelectRange,
    childLabel,
    childOptions,
  };
};
