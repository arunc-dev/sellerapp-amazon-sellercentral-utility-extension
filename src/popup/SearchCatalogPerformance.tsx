import { FC, useState } from "react";
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
import { useSearchCatalogPerformanceMetadata } from "./useSearchCatalogPerformanceMetadata";
import { ReviewGeoDropdown } from "../components/ReviewGeoDropdown";
import { GeoMapsModel } from "../constants/geo-constants";

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;
const { TextArea } = Input;

type SearchCatalogPerformanceProps = {
  onBack?: () => void;
};

const SearchCatalogPerformance: FC<SearchCatalogPerformanceProps> = ({
  onBack,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    undefined
  );
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
  const [fetching, setFetching] = useState(false);

  const {
    loading,
    brandOptions,
    reportingRangeOptions,
    selectedRange,
    selectedRangeChild,
    setSelectedRangeChild,
    handleSelectRange: handleSelectRangeFromHook,
    childLabel,
    childOptions,
  } = useSearchCatalogPerformanceMetadata();

  // For monthly/quarterly range, extract year and month/quarter options from nested metadata
  let yearOptions: { value: string; label: string }[] = [];
  let monthOptions: { value: string; label: string }[] = [];
  let quarterOptions: { value: string; label: string }[] = [];
  let categoryOptions: { value: string; label: string }[] = [];

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

  // Get category options from selected brand
  if (selectedBrand) {
    const brand = brandOptions.find((b: any) => b.value === selectedBrand);
    if (brand?.categories) {
      categoryOptions = brand.categories.map((c: any) => ({
        value: c.value,
        label: c.label,
      }));
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

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedCategory(undefined);
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
      }

      // Add optional filters
      if (selectedBrand) {
        filterSelections.push({
          id: "brand",
          value: selectedBrand,
          valueType: null,
        });

        // Add category filter with format "{brandId}-category"
        if (selectedCategory) {
          filterSelections.push({
            id: `${selectedBrand}-category`,
            value: selectedCategory,
            valueType: "brand-category",
          });
        }
      }

      if (topClickedProducts.trim()) {
        filterSelections.push({
          id: "asins",
          value: topClickedProducts.trim(),
          valueType: "ASIN",
        });
      }

      const response: any = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "DOWNLOAD_SEARCH_CATALOG_PERFORMANCE",
            viewId: "brand-catalog-performance-default-view",
            reportId: "brand-catalog-performance-report-table",
            filterSelections,
            selectedCountries: ["us"],
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
        console.error(
          "Error fetching Search Catalog Performance:",
          response.error
        );
        alert("Failed to fetch Search Catalog Performance report");
        setFetching(false);
        return;
      }

      if (!response?.rows || response.rows.length === 0) {
        alert("No data found for the selected filters");
        setFetching(false);
        return;
      }

      // Export to CSV
      exportSearchCatalogPerformanceCSV(response.rows);
      setFetching(false);
    } catch (error) {
      console.error("Error fetching Search Catalog Performance:", error);
      alert("Failed to fetch Search Catalog Performance report");
      setFetching(false);
    }
  };

  // CSV export function for Search Catalog Performance
  const exportSearchCatalogPerformanceCSV = (rows: any[]) => {
    const headers = [
      "ASIN Title",
      "ASIN",
      "Category",
      "Impressions",
      "Impression Price (Median)",
      "Same Day Shipping Impressions",
      "1D Shipping Speed Impressions",
      "2D Shipping Speed Impressions",
      "Clicks",
      "Click Rate (CTR)",
      "Click Price (Median)",
      "Same Day Shipping Clicks",
      "1D Shipping Speed Clicks",
      "2D Shipping Speed Clicks",
      "Cart Adds",
      "Cart Adds Price (Median)",
      "Same Day Shipping Cart Adds",
      "1D Shipping Speed Cart Adds",
      "2D Shipping Speed Cart Adds",
      "Purchases",
      "Search Traffic Sales",
      "Conversion Rate",
      "Purchase Price (Median)",
      "Same Day Shipping Purchases",
      "1D Shipping Speed Purchases",
      "2D Shipping Speed Purchases",
    ];

    const csvRows = rows.map((row) => [
      row["asin-title"] || "",
      row["asin"] || "",
      row["category"] || "",
      row["impressions-count"] || "",
      row["impression-price"] || "",
      row["same-day-shipping-impressions"] || "",
      row["one-day-shipping-impressions"] || "",
      row["two-day-shipping-impressions"] || "",
      row["clicks"] || "",
      row["ctr-clicks"] || "",
      row["click-price"] || "",
      row["same-day-shipping-clicks"] || "",
      row["one-day-shipping-clicks"] || "",
      row["two-day-shipping-clicks"] || "",
      row["cart-adds-count"] || "",
      row["cart-adds-price"] || "",
      row["same-day-shipping-cart-adds"] || "",
      row["one-day-shipping-cart-adds"] || "",
      row["two-day-shipping-cart-adds"] || "",
      row["purchases-count"] || "",
      row["total-sales-purchases"] || "",
      row["conversion-rate"] || "",
      row["purchase-price"] || "",
      row["same-day-shipping-purchases"] || "",
      row["one-day-shipping-purchases"] || "",
      row["two-day-shipping-purchases"] || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `search_catalog_performance_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout className="ba-layout">
      <Header className="ba-header">
        <Row justify="end" align="middle">
          <ReviewGeoDropdown
            selectedGeo={(geoDetails: GeoMapsModel) => {
              console.log("Selected geo:", geoDetails);
            }}
          />
        </Row>
      </Header>

      <Content className="ba-content">
        <Row justify="space-between" align="middle" className="ba-title-row">
          <Space size={8} align="center">
            <Button
              type="text"
              icon={<LeftOutlined />}
              className="ba-back-btn"
              onClick={onBack}
            />
            <Title level={4} className="ba-title">
              Search Catalog Performance
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

        <Row gutter={[0, 16]} className="ba-filters">
          <Col span={24}>
            <div className="ba-filter-field">
              <Text className="ba-filter-label">CSV Grouping</Text>
              <Select
                defaultValue="One file for all date ranges"
                className="ba-select-full ba-select-accent"
                options={[
                  {
                    value: "all-date-ranges",
                    label: "One file for all date ranges",
                  },
                ]}
              />
            </div>
          </Col>

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

          {/* Weekly: direct week selection */}
          {selectedRange === "weekly" && (
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

          {/* Monthly: year -> month selection */}
          {selectedRange === "monthly" && (
            <>
              <Col span={24}>
                <div className="ba-filter-field">
                  <Select
                    loading={loading}
                    placeholder="Select year"
                    className="ba-select-full"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={setSelectedYear}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="ba-filter-field">
                  <Select
                    disabled={!selectedYear || !monthOptions.length}
                    loading={loading}
                    placeholder="Select month"
                    className="ba-select-full"
                    options={monthOptions}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                  />
                </div>
              </Col>
            </>
          )}

          {/* Quarterly: year -> quarter selection */}
          {selectedRange === "quarterly" && (
            <>
              <Col span={24}>
                <div className="ba-filter-field">
                  <Select
                    loading={loading}
                    placeholder="Select year"
                    className="ba-select-full"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={setSelectedYear}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="ba-filter-field">
                  <Select
                    disabled={!selectedYear || !quarterOptions.length}
                    loading={loading}
                    placeholder="Select quarter"
                    className="ba-select-full"
                    options={quarterOptions}
                    value={selectedQuarter}
                    onChange={setSelectedQuarter}
                  />
                </div>
              </Col>
            </>
          )}
        </Row>

        <div className="ba-input-block ba-input-large">
          <TextArea
            rows={4}
            placeholder="Top clicked products (optional)"
            className="ba-textarea-muted"
            value={topClickedProducts}
            onChange={(e) => setTopClickedProducts(e.target.value)}
          />
        </div>

        <div className="ba-input-block ba-input-marketplace">
          <Select
            loading={loading}
            placeholder="Brands"
            className="ba-select-full"
            options={brandOptions.map((b: any) => ({
              value: b.value,
              label: b.label,
            }))}
            value={selectedBrand}
            onChange={handleBrandChange}
          />
        </div>

        {/* Category selector - shown when brand is selected and has categories */}
        {selectedBrand && categoryOptions.length > 0 && (
          <div className="ba-input-block ba-input-marketplace">
            <Select
              loading={loading}
              placeholder="Categories"
              className="ba-select-full"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        )}

        <Row justify="end" className="ba-actions-row">
          <Col>
            <Button
              type="primary"
              onClick={handleFetch}
              loading={fetching}
              disabled={!selectedRange || fetching}
            >
              Fetch
            </Button>
          </Col>
        </Row>
      </Content>

      <Footer className="ba-footer">
        <Text type="secondary" className="ba-powered-by">
          Powered by <span className="ba-brand">sellerapp</span>
        </Text>
      </Footer>
    </Layout>
  );
};

export default SearchCatalogPerformance;
