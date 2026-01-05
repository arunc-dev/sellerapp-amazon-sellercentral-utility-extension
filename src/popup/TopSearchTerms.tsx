import { FC, useState, useEffect, useMemo, useCallback } from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Avatar,
  Select,
  Input,
} from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  GlobalOutlined,
  BulbOutlined,
  LeftOutlined,
} from "@ant-design/icons";

import "./Popup.css";
import { useTopSearchTermsMetadata } from "./useTopSearchTermsMetadata";
import { GeoHeader } from "../components/GeoHeader";
import { AppFooter } from "../components/AppFooter";
import { GeoMapsModel, geoMaps } from "../constants/geo-constants";
import { get } from "../helpers/Cache";

// Constant to prevent new array creation on every render
const SELECTED_COUNTRIES = ["us"];

const { Content } = Layout;
const { Title, Text, Link } = Typography;
const { TextArea } = Input;

type TopSearchTermsProps = {
  onBack?: () => void;
  onGeoChange?: (geoDetails: GeoMapsModel) => void;
};

const TopSearchTerms: FC<TopSearchTermsProps> = ({ onBack, onGeoChange }) => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedGeo, setSelectedGeo] = useState<GeoMapsModel | null>(null);
  const [geoInitialized, setGeoInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    undefined
  );
  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>(
    undefined
  );
  const [topClickedProducts, setTopClickedProducts] = useState<string>("");
  const [topClickedBrands, setTopClickedBrands] = useState<string>("");
  const [fetching, setFetching] = useState(false);

  // Load initial geo from cache on mount
  useEffect(() => {
    (async () => {
      try {
        const savedGeoKey = (await get("selectedGeo")) as string;
        if (savedGeoKey && geoMaps[savedGeoKey]) {
          setSelectedGeo(geoMaps[savedGeoKey]);
        } else {
          setSelectedGeo(geoMaps.AMAZON_US);
        }
      } catch {
        setSelectedGeo(geoMaps.AMAZON_US);
      } finally {
        setGeoInitialized(true);
      }
    })();
  }, []);

  // Use useMemo to ensure baseDomain is stable across renders
  const baseDomain = useMemo(
    () => selectedGeo?.baseDomain || "sellercentral.amazon.com",
    [selectedGeo?.baseDomain]
  );

  // Memoize the geo change handler
  const handleGeoChange = useCallback(
    (geoDetails: GeoMapsModel) => {
      setSelectedGeo(geoDetails);
      if (onGeoChange) {
        onGeoChange(geoDetails);
      }
    },
    [onGeoChange]
  );

  const {
    loading,
    categoryOptions,
    reportingRangeOptions,
    selectedRange,
    selectedRangeChild,
    setSelectedRangeChild,
    handleSelectRange: handleSelectRangeFromHook,
    childLabel,
    childOptions,
  } = useTopSearchTermsMetadata(
    SELECTED_COUNTRIES,
    baseDomain,
    !geoInitialized
  );

  // Show loading state while geo is being initialized
  if (!geoInitialized) {
    return (
      <Layout className="ba-layout">
        <Content
          className="ba-content"
          style={{ textAlign: "center", padding: "50px" }}
        >
          Loading...
        </Content>
      </Layout>
    );
  }

  // For monthly range, extract year and month options from nested metadata
  let yearOptions: { value: string; label: string }[] = [];
  let monthOptions: { value: string; label: string }[] = [];
  let quarterOptions: { value: string; label: string }[] = [];

  if (selectedRange === "monthly") {
    const monthlyRange = reportingRangeOptions.find(
      (r: any) => r.value === "monthly"
    );
    const yearChildOptions = (monthlyRange as any)?.childOptions;

    if (Array.isArray(yearChildOptions) && yearChildOptions.length > 0) {
      yearOptions = yearChildOptions.map((yearObj: any) => ({
        value: yearObj.value,
        label: yearObj.label,
      }));

      if (selectedYear) {
        const selectedYearObj = yearChildOptions.find(
          (y: any) => y.value === selectedYear
        );
        if (selectedYearObj?.child?.values) {
          monthOptions = selectedYearObj.child.values.map((monthObj: any) => ({
            value: monthObj.value,
            label: monthObj.localizedDisplayValue || monthObj.label,
          }));
        }
      }
    }
  } else if (selectedRange === "quarterly") {
    const quarterlyRange = reportingRangeOptions.find(
      (r: any) => r.value === "quarterly"
    );
    const yearChildOptions = (quarterlyRange as any)?.childOptions;

    if (Array.isArray(yearChildOptions) && yearChildOptions.length > 0) {
      yearOptions = yearChildOptions.map((yearObj: any) => ({
        value: yearObj.value,
        label: yearObj.label,
      }));

      if (selectedYear) {
        const selectedYearObj = yearChildOptions.find(
          (y: any) => y.value === selectedYear
        );
        if (selectedYearObj?.child?.values) {
          quarterOptions = selectedYearObj.child.values.map(
            (quarterObj: any) => ({
              value: quarterObj.value,
              label: quarterObj.localizedDisplayValue || quarterObj.label,
            })
          );
        }
      }
    }
  }

  const handleRangeChange = (value: string) => {
    handleSelectRangeFromHook(value);
    if (value !== "monthly" && value !== "quarterly") {
      setSelectedYear(undefined);
      setSelectedMonth(undefined);
      setSelectedQuarter(undefined);
    } else if (value === "monthly") {
      setSelectedQuarter(undefined);
    } else if (value === "quarterly") {
      setSelectedMonth(undefined);
    }
  };

  const handleFetch = async () => {
    setFetching(true);

    try {
      // Build filter selections based on reporting range
      const filterSelections: any[] = [
        { id: "reporting-range", value: selectedRange, valueType: null },
      ];

      if (selectedRange === "weekly" && selectedRangeChild) {
        filterSelections.push({
          id: "weekly-week",
          value: selectedRangeChild,
          valueType: "weekly",
        });
      } else if (selectedRange === "monthly" && selectedYear && selectedMonth) {
        filterSelections.push(
          { id: "monthly-year", value: selectedYear, valueType: null },
          {
            id: `${selectedYear}-month`,
            value: selectedMonth,
            valueType: "monthly",
          }
        );
      } else if (
        selectedRange === "quarterly" &&
        selectedYear &&
        selectedQuarter
      ) {
        filterSelections.push(
          { id: "quarterly-year", value: selectedYear, valueType: null },
          {
            id: `${selectedYear}-quarter`,
            value: selectedQuarter,
            valueType: "quarterly",
          }
        );
      } else if (selectedRange === "daily" && selectedRangeChild) {
        filterSelections.push({
          id: "day",
          value: selectedRangeChild,
          valueType: "daily",
        });
      }

      // Add optional filters
      if (selectedCategory) {
        filterSelections.push({
          id: "category-dropdown",
          value: selectedCategory,
          valueType: null,
        });
      }

      if (topClickedProducts.trim()) {
        filterSelections.push({
          id: "asins",
          value: topClickedProducts.trim(),
          valueType: "ASIN",
        });
      }

      if (topClickedBrands.trim()) {
        filterSelections.push({
          id: "brand-freeform",
          value: topClickedBrands.trim(),
          valueType: "BRAND",
        });
      }

      if (searchKeyword.trim()) {
        filterSelections.push({
          id: "search-term-freeform",
          value: searchKeyword.trim(),
          valueType: "SEARCH_TERM",
        });
      }

      const response: any = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "DOWNLOAD_TOP_SEARCH_TERMS",
            viewId: "top-search-terms-default-view",
            reportId: "top-search-terms-report-table",
            filterSelections,
            selectedCountries: ["us"],
            baseDomain: selectedGeo?.baseDomain || "sellercentral.amazon.com",
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Chrome runtime error:", chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      if (response?.error) {
        console.error("Error fetching Top Search Terms:", response.error);
        alert("Failed to fetch Top Search Terms report");
        setFetching(false);
        return;
      }

      if (!response?.rows || response.rows.length === 0) {
        alert("No data found for the selected filters");
        setFetching(false);
        return;
      }

      // Export to CSV
      exportTopSearchTermsCSV(response.rows);
      setFetching(false);
    } catch (error) {
      console.error("Error fetching Top Search Terms:", error);
      alert("Failed to fetch Top Search Terms report");
      setFetching(false);
    }
  };

  // CSV export function for Top Search Terms
  const exportTopSearchTermsCSV = (rows: any[]) => {
    const headers = [
      "Search Term",
      "Search Frequency Rank",
      "Top Brand #1",
      "Top Brand #2",
      "Top Brand #3",
      "Top Category #1",
      "Top Category #2",
      "Top Category #3",
      "#1 Clicked ASIN",
      "#1 Product Title",
      "#1 Click Share",
      "#1 Conversion Share",
      "#2 Clicked ASIN",
      "#2 Product Title",
      "#2 Click Share",
      "#2 Conversion Share",
      "#3 Clicked ASIN",
      "#3 Product Title",
      "#3 Click Share",
      "#3 Conversion Share",
    ];

    const escape = (val: any) => {
      return '"' + String(val ?? "").replace(/"/g, '""') + '"';
    };

    const csvRows = rows.map((row) =>
      [
        escape(row["st-search-term"]),
        escape(row["st-search-frequency"]),
        escape(row["st-top-brand-1"]),
        escape(row["st-top-brand-2"]),
        escape(row["st-top-brand-3"]),
        escape(row["st-top-category-1"]),
        escape(row["st-top-category-2"]),
        escape(row["st-top-category-3"]),
        escape(row["st-top-asin-1"]),
        escape(row["st-top-asin-title-1"]),
        escape(row["st-top-asin-click-share-1"]),
        escape(row["st-top-asin-conversion-share-1"]),
        escape(row["st-top-asin-2"]),
        escape(row["st-top-asin-title-2"]),
        escape(row["st-top-asin-click-share-2"]),
        escape(row["st-top-asin-conversion-share-2"]),
        escape(row["st-top-asin-3"]),
        escape(row["st-top-asin-title-3"]),
        escape(row["st-top-asin-click-share-3"]),
        escape(row["st-top-asin-conversion-share-3"]),
      ].join(";")
    );

    const csv = [headers.map((h) => escape(h)).join(";"), ...csvRows].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TopSearchTerms_${selectedRange}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Layout className="ba-layout">
      <GeoHeader skipInitialCallback={true} onGeoChange={handleGeoChange} />

      <Content className="ba-content">
        <Row justify="space-between" align="middle" className="ba-title-row">
          <Space size={8} align="center">
            <Button
              type="text"
              icon={<LeftOutlined />}
              className="ba-back-btn"
              onClick={onBack}
            />
            <Title level={5} className="ba-title" style={{ margin: 1 }}>
              Top Search Terms
            </Title>
          </Space>
        </Row>

        <div className="ba-input-block ba-input-marketplace">
          <Select
            defaultValue="USA"
            className="ba-select-full"
            options={[{ value: "USA", label: "USA" }]}
          />
        </div>

        <div className="ba-input-block ba-input-large">
          <TextArea
            rows={3}
            placeholder="Search by keyword (optional)"
            className="ba-textarea-muted"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div
          className="ba-input-block ba-input-marketplace"
          style={{ marginTop: 16 }}
        >
          <Select
            placeholder="Top Clicked Category (optional)"
            className="ba-select-full"
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
          />
        </div>

        <Row gutter={[0, 16]} className="ba-filters">
          <Col span={24}>
            <div className="ba-filter-field">
              <Text className="ba-filter-label">Reporting Range</Text>
              <Select
                loading={loading}
                className="ba-select-full ba-select-accent"
                options={reportingRangeOptions.map((r: any) => ({
                  value: r.value,
                  label: r.label,
                }))}
                value={selectedRange}
                onChange={handleRangeChange}
              />
            </div>
          </Col>

          {selectedRange === "monthly" ? (
            <>
              <Col span={24}>
                <div className="ba-filter-field">
                  <Select
                    placeholder="Select Year"
                    className="ba-select-full"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={(value) => {
                      setSelectedYear(value);
                      setSelectedMonth(undefined);
                    }}
                  />
                </div>
              </Col>
              {selectedYear && monthOptions.length > 0 && (
                <Col span={24}>
                  <div className="ba-filter-field">
                    <Select
                      placeholder="Select Month"
                      className="ba-select-full"
                      options={monthOptions}
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                    />
                  </div>
                </Col>
              )}
            </>
          ) : selectedRange === "quarterly" ? (
            <>
              <Col span={24}>
                <div className="ba-filter-field">
                  <Select
                    placeholder="Select Year"
                    className="ba-select-full"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={(value) => {
                      setSelectedYear(value);
                      setSelectedQuarter(undefined);
                    }}
                  />
                </div>
              </Col>
              {selectedYear && quarterOptions.length > 0 && (
                <Col span={24}>
                  <div className="ba-filter-field">
                    <Select
                      placeholder="Select Quarter"
                      className="ba-select-full"
                      options={quarterOptions}
                      value={selectedQuarter}
                      onChange={setSelectedQuarter}
                    />
                  </div>
                </Col>
              )}
            </>
          ) : (
            <Col span={24}>
              <div className="ba-filter-field">
                <Select
                  disabled={!childOptions.length}
                  loading={loading}
                  placeholder={childLabel}
                  className="ba-select-full"
                  options={childOptions.map((c: any) => ({
                    value: c.value,
                    label: c.label,
                  }))}
                  value={selectedRangeChild}
                  onChange={setSelectedRangeChild}
                />
              </div>
            </Col>
          )}
        </Row>

        <div
          className="ba-input-block ba-input-large"
          style={{ marginTop: 16 }}
        >
          <TextArea
            rows={4}
            placeholder="Top clicked products (optional)"
            className="ba-textarea-muted"
            value={topClickedProducts}
            onChange={(e) => setTopClickedProducts(e.target.value)}
          />
        </div>

        <div className="ba-input-block ba-input-large">
          <TextArea
            rows={4}
            placeholder="Top clicked brands (optional)"
            className="ba-textarea-muted"
            value={topClickedBrands}
            onChange={(e) => setTopClickedBrands(e.target.value)}
          />
        </div>

        <Row justify="end" className="ba-actions-row">
          <Col>
            <Button type="primary" onClick={handleFetch} loading={fetching}>
              {fetching ? "Getting Data..." : "Get Data"}
            </Button>
          </Col>
        </Row>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default TopSearchTerms;
