// Map API keys to user-friendly CSV headers (from screenshot and provided sample)
const CSV_HEADER_MAP: Record<string, string> = {
  'asin': 'ASIN',
  'asinName': 'Product Name',
  'qp-asin-query': 'Search Query',
  'qp-brand-query': 'Search Query',
  'qp-query-rank': 'Search Query Score',
  'qp-asin-query-rank': 'Search Query Score',
  'qp-query-volume': 'Search Query Volume',
  'qp-asin-query-volume': 'Search Query Volume',
  'qp-impressions': 'Impressions Total Count',
  'qp-asin-impressions': 'Impressions Total Count',
  'qp-brand-count-impressions': 'Impressions Brand Count',
  'qp-asin-count-impressions': 'Impressions ASIN Count',
  'qp-brand-share-impressions': 'Impressions Brand Share (%)',
  'qp-asin-share-impressions': 'Impressions ASIN Share (%)',
  'qp-clicks': 'Clicks Total Count',
  'qp-asin-clicks': 'Clicks Total Count',
  'qp-brand-count-clicks': 'Clicks Brand Count',
  'qp-asin-count-clicks': 'Clicks ASIN Count',
  'qp-brand-share-clicks': 'Clicks Brand Share (%)',
  'qp-asin-share-clicks': 'Clicks ASIN Share (%)',
  'qp-clicks-price': 'Clicks Price (Median)',
  'qp-asin-median-query-price-clicks': 'Clicks Price (Median)',
  'qp-clicks-brand-price': 'Clicks Brand Price (Median)',
  'qp-asin-median-price-clicks': 'Clicks ASIN Price (Median)',
  'qp-same-day-shipping-clicks': 'Clicks Same Day Shipping Share',
  'qp-asin-same-day-shipping-clicks': 'Clicks Same Day Shipping Share',
  'qp-two-day-shipping-clicks': 'Clicks 2D Shipping Share',
  'qp-asin-two-day-shipping-clicks': 'Clicks 2D Shipping Share',
  'qp-one-day-shipping-clicks': 'Clicks 1D Shipping Share',
  'qp-asin-one-day-shipping-clicks': 'Clicks 1D Shipping Share',
  'qp-cart-adds': 'Cart Adds Total Count',
  'qp-asin-cart-adds': 'Cart Adds Total Count',
  'qp-cart-adds-brand-count': 'Cart Adds Brand Count',
  'qp-asin-count-cart-adds': 'Cart Adds ASIN Count',
  'qp-cart-adds-brand-share': 'Cart Adds Brand Share (%)',
  'qp-asin-share-cart-adds': 'Cart Adds ASIN Share (%)',
  'qp-cart-adds-price': 'Cart Adds Price (Median)',
  'qp-asin-median-query-price-cart-adds': 'Cart Adds Price (Median)',
  'qp-cart-adds-brand-price': 'Cart Adds Brand Price (Median)',
  'qp-asin-median-price-cart-adds': 'Cart Adds ASIN Price (Median)',
  'qp-same-day-shipping-cart-adds': 'Cart Adds Same Day Shipping Share',
  'qp-asin-same-day-shipping-cart-adds': 'Cart Adds Same Day Shipping Share',
  'qp-two-day-shipping-cart-adds': 'Cart Adds 2D Shipping Share',
  'qp-asin-two-day-shipping-cart-adds': 'Cart Adds 2D Shipping Share',
  'qp-one-day-shipping-cart-adds': 'Cart Adds 1D Shipping Share',
  'qp-asin-one-day-shipping-cart-adds': 'Cart Adds 1D Shipping Share',
  'qp-purchases': 'Purchases Total Count',
  'qp-asin-purchases': 'Purchases Total Count',
  'qp-purchases-brand-count': 'Purchases Brand Count',
  'qp-asin-count-purchases': 'Purchases ASIN Count',
  'qp-purchases-brand-share': 'Purchases Brand Share (%)',
  'qp-asin-share-purchases': 'Purchases ASIN Share (%)',
  'qp-purchase-price': 'Purchases Price (Median)',
  'qp-asin-median-query-price-purchases': 'Purchases Price (Median)',
  'qp-purchases-brand-price': 'Purchases Brand Price (Median)',
  'qp-asin-median-price-purchases': 'Purchases ASIN Price (Median)',
  'qp-same-day-shipping-purchases': 'Purchases Same Day Shipping Share',
  'qp-asin-same-day-shipping-purchases': 'Purchases Same Day Shipping Share',
  'qp-two-day-shipping-purchases': 'Purchases 2D Shipping Share',
  'qp-asin-two-day-shipping-purchases': 'Purchases 2D Shipping Share',
  'qp-one-day-shipping-purchases': 'Purchases 1D Shipping Share',
  'qp-asin-one-day-shipping-purchases': 'Purchases 1D Shipping Share',
  'qp-click-rate': 'Click Rate (%)',
  'qp-asin-click-rate': 'Click Rate (%)',
  'qp-purchase-rate': 'Purchase Rate (%)',
  'qp-asin-purchase-rate': 'Purchase Rate (%)',
  'qp-cart-add-rate': 'Cart Add Rate (%)',
  'qp-asin-cart-add-rate': 'Cart Add Rate (%)',
  // Add any additional mappings as needed
};
// Utility to convert array of objects to CSV, using fixed order from sheet
const CSV_FIELD_ORDER_BRAND = [
  'qp-brand-query',
  'qp-query-rank',
  'qp-query-volume',
  'qp-impressions',
  'qp-brand-count-impressions',
  'qp-brand-share-impressions',
  'qp-clicks',
  'qp-brand-count-clicks',
  'qp-brand-share-clicks',
  'qp-clicks-price',
  'qp-clicks-brand-price',
  'qp-same-day-shipping-clicks',
  'qp-two-day-shipping-clicks',
  'qp-one-day-shipping-clicks',
  'qp-cart-adds',
  'qp-cart-adds-brand-count',
  'qp-cart-adds-brand-share',
  'qp-cart-adds-price',
  'qp-cart-adds-brand-price',
  'qp-same-day-shipping-cart-adds',
  'qp-two-day-shipping-cart-adds',
  'qp-one-day-shipping-cart-adds',
  'qp-purchases',
  'qp-purchases-brand-count',
  'qp-purchases-brand-share',
  'qp-purchase-price',
  'qp-purchases-brand-price',
  'qp-same-day-shipping-purchases',
  'qp-two-day-shipping-purchases',
  'qp-one-day-shipping-purchases',
  'qp-click-rate',
  'qp-purchase-rate',
  'qp-cart-add-rate',
];

const CSV_FIELD_ORDER_ASIN = [
  'asin',
  'asinName',
  'qp-asin-query',
  'qp-asin-query-rank',
  'qp-asin-query-volume',
  'qp-asin-impressions',
  'qp-asin-count-impressions',
  'qp-asin-share-impressions',
  'qp-asin-clicks',
  'qp-asin-count-clicks',
  'qp-asin-share-clicks',
  'qp-asin-median-query-price-clicks',
  'qp-asin-median-price-clicks',
  'qp-asin-same-day-shipping-clicks',
  'qp-asin-two-day-shipping-clicks',
  'qp-asin-one-day-shipping-clicks',
  'qp-asin-cart-adds',
  'qp-asin-count-cart-adds',
  'qp-asin-share-cart-adds',
  'qp-asin-median-query-price-cart-adds',
  'qp-asin-median-price-cart-adds',
  'qp-asin-same-day-shipping-cart-adds',
  'qp-asin-two-day-shipping-cart-adds',
  'qp-asin-one-day-shipping-cart-adds',
  'qp-asin-purchases',
  'qp-asin-count-purchases',
  'qp-asin-share-purchases',
  'qp-asin-median-query-price-purchases',
  'qp-asin-median-price-purchases',
  'qp-asin-same-day-shipping-purchases',
  'qp-asin-two-day-shipping-purchases',
  'qp-asin-one-day-shipping-purchases',
  'qp-click-rate',
  'qp-asin-purchase-rate',
  'qp-asin-cart-add-rate',
];

function arrayToCSV(rows: any[], mode: 'brand' | 'asin' = 'brand'): string {
  if (!rows.length) return '';
  // Only include fields in the fixed order, and map to user-friendly headers
  const headers = mode === 'asin' ? CSV_FIELD_ORDER_ASIN : CSV_FIELD_ORDER_BRAND;
  const mappedHeaders = headers.map(h => CSV_HEADER_MAP[h] || h);
  const escape = (val: any) => {
    let v = val;
    // Remove commas from numbers (e.g., "1,234" -> "1234")
    if (typeof v === 'string' && /^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(v)) {
      v = v.replace(/,/g, '');
    }
    // Always quote fields for safety
    return '"' + String(v).replace(/"/g, '""') + '"';
  };
  const delimiter = ";";
  const csv = [mappedHeaders.map(h => '"' + h.replace(/"/g, '""') + '"').join(delimiter)]
    .concat(
      rows.map(row => headers.map(h => escape(row[h] ?? "")).join(delimiter))
    );
  return csv.join("\n");
}


// Common function to export Brand Analytics data as CSV
export function exportBrandAnalyticsCSV(rows: any[], filename = 'brand-analytics.csv') {
  const csv = arrayToCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
import { FC, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Avatar,
  Segmented,
  Input,
  Select,
} from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  GlobalOutlined,
  BulbOutlined,
  LeftOutlined,
} from "@ant-design/icons";

import "./Popup.css";
import { useCustomerJourneyMetadata } from "./useCustomerJourneyMetadata";

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;
const { TextArea } = Input;

type AmazonSearchQueryPerformanceProps = {
  onBack?: () => void;
};
const AmazonSearchQueryPerformance: FC<AmazonSearchQueryPerformanceProps> = ({
  onBack,
}) => {
  const [mode, setMode] = useState<"ASINs" | "BRANDS">("ASINs");
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>(undefined);
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);
  const isAsins = mode === "ASINs";
  const {
    loading,
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
  } = useCustomerJourneyMetadata();

  // For monthly range, extract year and month options from nested metadata
  let yearOptions: { value: string; label: string }[] = [];
  let monthOptions: { value: string; label: string }[] = [];
  let quarterOptions: { value: string; label: string }[] = [];
  
  if (selectedRange === 'monthly') {
    const monthlyRange = reportingRangeOptions.find((r: any) => r.value === 'monthly');
    
    // Use childOptions which now contain year data with nested child structure preserved
    const yearChildOptions = (monthlyRange as any)?.childOptions;
    
    if (Array.isArray(yearChildOptions) && yearChildOptions.length > 0) {
      // Extract year options
      yearOptions = yearChildOptions.map((yearObj: any) => ({
        value: yearObj.value,
        label: yearObj.label,
      }));
      
      // Extract month options for the selected year
      if (selectedYear) {
        const selectedYearObj = yearChildOptions.find((y: any) => y.value === selectedYear);
        
        if (selectedYearObj?.child?.values) {
          // Access the nested month values
          monthOptions = selectedYearObj.child.values.map((monthObj: any) => ({
            value: monthObj.value,
            label: monthObj.localizedDisplayValue || monthObj.label,
          }));
        }
      }
    }
  } else if (selectedRange === 'quarterly') {
    const quarterlyRange = reportingRangeOptions.find((r: any) => r.value === 'quarterly');
    
    // Use childOptions which now contain year data with nested child structure preserved
    const yearChildOptions = (quarterlyRange as any)?.childOptions;
    
    if (Array.isArray(yearChildOptions) && yearChildOptions.length > 0) {
      // Extract year options
      yearOptions = yearChildOptions.map((yearObj: any) => ({
        value: yearObj.value,
        label: yearObj.label,
      }));
      
      // Extract quarter options for the selected year
      if (selectedYear) {
        const selectedYearObj = yearChildOptions.find((y: any) => y.value === selectedYear);
        
        if (selectedYearObj?.child?.values) {
          // Access the nested quarter values
          quarterOptions = selectedYearObj.child.values.map((quarterObj: any) => ({
            value: quarterObj.value,
            label: quarterObj.localizedDisplayValue || quarterObj.label,
          }));
        }
      }
    }
  }

  // Custom handler to also reset year/month/quarter when range changes
  const handleRangeChange = (value: string) => {
    handleSelectRange(value);
    if (value !== 'monthly' && value !== 'quarterly') {
      setSelectedYear(undefined);
      setSelectedMonth(undefined);
      setSelectedQuarter(undefined);
    } else if (value === 'monthly') {
      setSelectedQuarter(undefined);
    } else if (value === 'quarterly') {
      setSelectedMonth(undefined);
    }
  };

  const handleFetch = async () => {
    if (isAsins) {
      // Handle ASIN mode - fetch data for each selected ASIN
      if (selectedAsins.length === 0) {
        alert("Please select at least one ASIN");
        return;
      }
      
      setDownloading(true);
      
      try {
        const allResults: any[] = [];
        
        // Build filter selections based on reporting range
        const baseFilters: any[] = [
          { id: "reporting-range", value: selectedRange, valueType: null }
        ];
        
        if (selectedRange === 'weekly' && selectedRangeChild) {
          baseFilters.push({ id: "weekly-week", value: selectedRangeChild, valueType: "weekly" });
        } else if (selectedRange === 'monthly' && selectedYear && selectedMonth) {
          baseFilters.push(
            { id: "monthly-year", value: selectedYear, valueType: null },
            { id: `${selectedYear}-month`, value: selectedMonth, valueType: "monthly" }
          );
        } else if (selectedRange === 'quarterly' && selectedYear && selectedQuarter) {
          baseFilters.push(
            { id: "quarterly-year", value: selectedYear, valueType: null },
            { id: `${selectedYear}-quarter`, value: selectedQuarter, valueType: "quarterly" }
          );
        }
        
        // Fetch data for each ASIN
        for (let i = 0; i < selectedAsins.length; i++) {
          const asin = selectedAsins[i];
          const asinInfo = asinOptions.find((opt: any) => opt.value === asin);
          
          console.log(`Fetching data for ASIN ${i + 1}/${selectedAsins.length}: ${asin}`);
          
          const filterSelections = [
            { id: "asin", value: asin, valueType: "ASIN" },
            ...baseFilters
          ];
          
          let response: any;
          try {
            response = await new Promise((resolve, reject) => {
              chrome.runtime.sendMessage(
                {
                  type: "DOWNLOAD_QUERY_PERFORMANCE_ASIN",
                  viewId: "query-performance-asin-view",
                  reportId: "query-performance-asin-report-table",
                  filterSelections,
                  selectedCountries: ["us"],
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(`Chrome runtime error for ASIN ${asin}:`, chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(response);
                  }
                }
              );
            });
            
            console.log(`Response for ASIN ${asin}:`, JSON.stringify(response, null, 2));
          } catch (msgError) {
            console.error(`Message error for ASIN ${asin}:`, msgError);
            continue; // Skip this ASIN and continue with next
          }
          
          if (response?.error) {
            console.error(`Error fetching ASIN ${asin}:`, response.error);
            continue;
          }
          
          // Extract rows from the paginated response
          const rows = response?.rows;
          
          if (rows && rows.length > 0) {
            // Add ASIN info to each row
            rows.forEach((row: any) => {
              allResults.push({
                ...row,
                asin: asin,
                asinName: asinInfo?.label || asin,
              });
            });
            console.log(`Added ${rows.length} rows for ASIN ${asin}`);
          } else {
            console.warn(`No data found for ASIN ${asin}`);
          }
        }
        
        if (allResults.length === 0) {
          alert("No data found for the selected ASINs");
          setDownloading(false);
          return;
        }
        
        // Convert to CSV and download with ASIN mode
        const csv = arrayToCSV(allResults, 'asin');
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ASQP_ASINs_${selectedRange}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        setDownloading(false);
      } catch (error) {
        console.error("Error fetching ASIN reports:", error);
        alert("Failed to fetch ASIN reports");
        setDownloading(false);
      }
      
      return;
    }

    const brand = brandOptions.find((b: any) => b.value === selectedBrand);
    const reportingRange = reportingRangeOptions.find(
      (r: any) => r.value === selectedRange
    );
    
    let period: any = undefined;
    if (selectedRange === 'monthly') {
      // For monthly range, use the selected month option
      period = monthOptions.find((m) => m.value === selectedMonth);
    } else if (selectedRange === 'quarterly') {
      // For quarterly range, use the selected quarter option
      period = quarterOptions.find((q) => q.value === selectedQuarter);
    } else {
      // For other ranges, use the standard child option
      period = childOptions.find((c: any) => c.value === selectedRangeChild);
    }

    setFetching(true);
    chrome.runtime.sendMessage(
      {
        type: "DOWNLOAD_QUERY_PERFORMANCE_BRAND",
        brand,
        reportingRange,
        period,
        selectedCountries: ["us"],
      },
      (response) => {
        setFetching(false);
        if (chrome.runtime.lastError) {
          console.error(
            "Brand query performance download error:",
            chrome.runtime.lastError.message
          );
          return;
        }
        if (response?.error) {
          console.error(
            "Brand query performance download error:",
            response.error
          );
        } else if (response?.rows && Array.isArray(response.rows)) {
          exportBrandAnalyticsCSV(response.rows);
        } else {
          console.log("Brand query performance final data:", response);
        }
      }
    );
  };

  return (
    <Layout className="ba-layout">
      <Header className="ba-header">
        <Row justify="space-between" align="middle">
          <Space size="middle">
            <Button type="text" icon={<MenuOutlined />} />
            <Button type="text" icon={<SearchOutlined />} />
          </Space>

          <Space size="middle" align="center">
            <Button
              className="ba-lang-btn"
              icon={<GlobalOutlined />}
              shape="round"
            >
              <span className="ba-lang-code">US</span>
            </Button>
            <Button type="text" icon={<BulbOutlined />} />
            <Avatar size={28} className="ba-avatar">
              SA
            </Avatar>
          </Space>
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
              Brand Analytics Report
            </Title>
          </Space>
          <Link className="ba-tutorial" href="#">
            Tutorial video ↗
          </Link>
        </Row>

        <div className="ba-tabs-wrapper">
          <Segmented
            options={["BRANDS", "ASINs"]}
            value={mode}
            onChange={(val) => setMode(val as "ASINs" | "BRANDS")}
            className="ba-tabs"
          />
        </div>

        {isAsins ? (
          <>
            <div className="ba-input-block ba-input-asins">
              <Select
                mode="tags"
                placeholder="Enter ASIN(s)"
                className="ba-select-full"
                value={selectedAsins}
                onChange={setSelectedAsins}
                options={asinOptions.map((a: any) => ({
                  value: a.value,
                  label: a.label,
                }))}
                loading={loading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

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
                    defaultValue="One file for all ASINs - aggregated"
                    className="ba-select-full ba-select-accent"
                    options={[
                      {
                        value: "aggregated",
                        label: "One file for all ASINs - aggregated",
                      },
                      {
                        value: "per-asin",
                        label: "One file per ASIN",
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
                    options={reportingRangeOptions.map((r) => ({
                      value: r.value,
                      label: r.label,
                    }))}
                    value={selectedRange}
                    onChange={handleRangeChange}
                  />
                </div>
              </Col>

              {/* For monthly range, show year and month dropdowns */}
              {selectedRange === 'monthly' ? (
                <>
                  <Col span={24}>
                    <div className="ba-filter-field">
                      <Select
                        placeholder="Select Year"
                        className="ba-select-full"
                        options={yearOptions}
                        value={selectedYear}
                        onChange={value => {
                          setSelectedYear(value);
                          setSelectedMonth(undefined); // Reset month when year changes
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
              ) : selectedRange === 'quarterly' ? (
                <>
                  <Col span={24}>
                    <div className="ba-filter-field">
                      <Select
                        placeholder="Select Year"
                        className="ba-select-full"
                        options={yearOptions}
                        value={selectedYear}
                        onChange={value => {
                          setSelectedYear(value);
                          setSelectedQuarter(undefined); // Reset quarter when year changes
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
                      options={childOptions.map((c) => ({
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
          </>
        ) : (
          <>
            <div className="ba-input-block ba-input-marketplace">
              <Select
                placeholder="Brands"
                className="ba-select-full"
                loading={loading}
                options={brandOptions.map((b) => ({
                  value: b.value,
                  label: b.label,
                }))}
                value={selectedBrand}
                onChange={setSelectedBrand}
              />
            </div>

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
                    defaultValue="One file for all brand - aggregated"
                    className="ba-select-full ba-select-accent"
                    options={[
                      {
                        value: "aggregated",
                        label: "One file for all brand - aggregated",
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
                    options={reportingRangeOptions.map((r) => ({
                      value: r.value,
                      label: r.label,
                    }))}
                    value={selectedRange}
                    onChange={handleRangeChange}
                  />
                </div>
              </Col>

              {/* For monthly range, show year and month dropdowns */}
              {selectedRange === 'monthly' ? (
                <>
                  <Col span={24}>
                    <div className="ba-filter-field">
                      <Select
                        placeholder="Select Year"
                        className="ba-select-full"
                        options={yearOptions}
                        value={selectedYear}
                        onChange={value => {
                          setSelectedYear(value);
                          setSelectedMonth(undefined); // Reset month when year changes
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
              ) : selectedRange === 'quarterly' ? (
                <>
                  <Col span={24}>
                    <div className="ba-filter-field">
                      <Select
                        placeholder="Select Year"
                        className="ba-select-full"
                        options={yearOptions}
                        value={selectedYear}
                        onChange={value => {
                          setSelectedYear(value);
                          setSelectedQuarter(undefined); // Reset quarter when year changes
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
                      options={childOptions.map((c) => ({
                        value: c.value,
                        label: c.label,
                      }))}
                      value={selectedRangeChild}
                      onChange={setSelectedRangeChild}
                    />
                  </div>
                </Col>
              )}

              <Col span={24}>
                <div className="ba-filter-field">
                  <Text className="ba-filter-label">
                    Choose data destination
                  </Text>
                  <Select
                    defaultValue="Download CSV to computer"
                    className="ba-select-full ba-select-accent"
                    options={[
                      {
                        value: "download",
                        label: "Download CSV to computer",
                      },
                    ]}
                  />
                </div>
              </Col>
            </Row>
          </>
        )}

        <Row justify="end" className="ba-actions-row">
          <Col>
            <Button type="primary" onClick={handleFetch} loading={fetching}>
              {fetching ? "Fetching..." : "Fetch"}
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

export default AmazonSearchQueryPerformance;
