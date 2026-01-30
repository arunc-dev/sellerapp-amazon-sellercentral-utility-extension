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
  DatePicker,
  Table,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  MenuOutlined,
  SearchOutlined,
  GlobalOutlined,
  BulbOutlined,
  LeftOutlined,
} from "@ant-design/icons";

import "./Popup.css";
import { useCustomerJourneyMetadata } from "./useCustomerJourneyMetadata";
import { GeoHeader } from "../components/GeoHeader";
import { AppFooter } from "../components/AppFooter";
import { GeoMapsModel, geoMaps } from "../constants/geo-constants";
import { get } from "../helpers/Cache";

// Constant to prevent new array creation on every render
const SELECTED_COUNTRIES = ["us"];

const { Content } = Layout;
const { Title, Text, Link } = Typography;
const { TextArea } = Input;

type CouponPerformanceReportProps = {
  onBack?: () => void;
  onGeoChange?: (geoDetails: GeoMapsModel) => void;
};

const CouponPerformanceReport: FC<CouponPerformanceReportProps> = ({
  onBack,
  onGeoChange,
}) => {
  const [selectedGeo, setSelectedGeo] = useState<GeoMapsModel | null>(null);
  const [geoInitialized, setGeoInitialized] = useState(false);

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
    reportingRangeOptions,
    selectedRange,
    selectedRangeChild,
    setSelectedRangeChild,
    handleSelectRange,
    childLabel,
    childOptions,
  } = useCustomerJourneyMetadata(
    SELECTED_COUNTRIES,
    baseDomain,
    !geoInitialized
  );

  const [searchField, setSearchField] = useState<string>("coupon_title");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [fetching, setFetching] = useState(false);
  const [couponData, setCouponData] = useState<any[]>([]);

  const typeOptions = [
    { label: "Standard", value: "standard" },
    { label: "Subscribe & Save", value: "subscribe_and_save" },
    { label: "Reorder Coupon", value: "reorder_rewards" },
  ];

  const statusOptions = [
    { label: "Running", value: "RUNNING" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Failed", value: "FAILED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Cancelling", value: "CANCELLING" },
    { label: "Upcoming", value: "UPCOMING" },
    { label: "Expiring soon", value: "EXPIRING_SOON" },
  ];

  // CSV export function for Coupon Performance
  const exportCouponPerformanceCSV = (rows: any[]) => {
    const headers = [
      "Title",
      "ASIN Count",
      "Budget",
      "Budget Type",
      "Discount Type",
      "Discount Value",
      "Customer Segment",
      "Coupon Type",
      "Once Per Customer",
      "Status",
      "PSSS Status",
      "Start Date",
      "End Date",
      "Promotion Setup Service ID",
      "Revision ID",
      "Needs Attention",
      "Budget Status",
      "Budget Spent",
      "Budget Utilization (%)",
      "Clip Count",
      "Redemption Count",
      "Sales",
      "Participation Fee Preview",
      "Performance Fee Preview",
      "Fee Cap Preview",
      "Participation Fee Charged",
      "Performance Fee Charged",
      "Currency Code",
      "Fee Cap",
      "Customer ID",
      "Marketplace ID",
      "Obfuscated Promotion ID",
    ];

    const csvRows = rows.map((row) => [
      row.title || "",
      row.asinCount || "",
      row.budget || "",
      row.budgetType || "",
      row.discountType || "",
      row.discountValue || "",
      row.customerSegment || "",
      row.couponType || "",
      row.oncePerCustomer || "",
      row.status || "",
      row.psssStatus || "",
      row.startDate || "",
      row.endDate || "",
      row.promotionSetupServiceId || "",
      row.revisionId || "",
      row.needsAttention || "",
      row.budgetStatus || "",
      row.couponMetrics?.budgetSpent || "",
      row.couponMetrics?.budgetUtilization || "",
      row.couponMetrics?.clipCount || "",
      row.couponMetrics?.redemptionCount || "",
      row.couponMetrics?.sales || "",
      row.couponFee?.feePreview?.participationFee || "",
      row.couponFee?.feePreview?.performanceFee || "",
      row.couponFee?.feePreview?.feeCap || "",
      row.couponFee?.feeCharged?.participationFee || "",
      row.couponFee?.feeCharged?.performanceFee || "",
      row.couponFee?.currencyCode || "",
      row.couponFee?.feeCap || "",
      row.customerId || "",
      row.marketplaceId || "",
      row.obfuscatedPromotionId || "",
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
      `coupon_performance_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Coupon Performance Report
            </Title>
          </Space>
        </Row>

        <Row gutter={[12, 12]} className="ba-filters" align="middle">
          <Col xs={24} sm={24} md={12} lg={10}>
            <div style={{ display: "flex", gap: 8 }}>
              <Select
                value={searchField}
                onChange={(v) => setSearchField(String(v))}
                options={[
                  { value: "coupon_title", label: "Coupon title" },
                  { value: "asin", label: "ASIN" },
                ]}
                style={{ minWidth: 160 }}
              />

              <Input.Search
                placeholder="Search by coupon title"
                enterButton
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(val) => {
                  setSearchQuery(val);
                }}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              mode="multiple"
              placeholder="Type"
              className="ba-select-full"
              options={typeOptions}
              value={typeFilter}
              onChange={(vals) => setTypeFilter(vals as string[])}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              mode="multiple"
              placeholder="Status"
              className="ba-select-full"
              options={statusOptions}
              value={statusFilter}
              onChange={(vals) => setStatusFilter(vals as string[])}
              allowClear
            />
          </Col>

          <Col xs={24} sm={24} md={24} lg={6}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  onClick={() => {
                    setStartDate(dayjs().subtract(30, "day").startOf("day"));
                    setEndDate(dayjs().endOf("day"));
                  }}
                >
                  Last 30 days
                </Button>
                <Button
                  onClick={() => {
                    setStartDate(dayjs().subtract(6, "month").startOf("day"));
                    setEndDate(dayjs().endOf("day"));
                  }}
                >
                  Last 6 months
                </Button>
                <Button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  Clear
                </Button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <DatePicker
                  placeholder="Start date"
                  value={startDate}
                  onChange={(d) =>
                    setStartDate(d ? (d as Dayjs).startOf("day") : null)
                  }
                  style={{ width: "50%" }}
                />
                <DatePicker
                  placeholder="End date"
                  value={endDate}
                  onChange={(d) =>
                    setEndDate(d ? (d as Dayjs).endOf("day") : null)
                  }
                  style={{ width: "50%" }}
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* <Row gutter={[0, 16]} className="ba-filters">
          <Col span={24}>
            <div className="ba-filter-field">
              <Text className="ba-filter-label">{childLabel}</Text>
              <Select
                loading={loading}
                className="ba-select-full ba-select-accent"
                options={reportingRangeOptions.map((r: any) => ({
                  value: r.value,
                  label: r.label,
                }))}
                value={selectedRange}
                onChange={handleSelectRange}
              />
            </div>
          </Col>
        </Row> */}
        <Row justify="end" className="ba-actions-row">
          <Col>
            <Button
              type="primary"
              loading={fetching}
              onClick={async () => {
                try {
                  setFetching(true);
                  const startDateStr = startDate
                    ? startDate.format("YYYY-MM-DDTHH:mm:ss")
                    : "";
                  const endDateStr = endDate
                    ? endDate.format("YYYY-MM-DDTHH:mm:ss")
                    : "";

                  const response: any = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage(
                      {
                        type: "DOWNLOAD_COUPON_PERFORMANCE",
                        startDate: startDateStr,
                        endDate: endDateStr,
                        searchField,
                        searchQuery,
                        typeFilter,
                        statusFilter,
                        baseDomain: baseDomain,
                      },
                      (response) => {
                        if (chrome.runtime.lastError) {
                          console.error(
                            "Chrome runtime error:",
                            chrome.runtime.lastError
                          );
                          reject(new Error(chrome.runtime.lastError.message));
                        } else {
                          resolve(response);
                        }
                      }
                    );
                  });

                  if (response?.error) {
                    console.error(
                      "Error fetching coupon performance:",
                      response.error
                    );
                    alert("Failed to fetch coupon performance report");
                  } else {
                    setCouponData(response.rows || []);
                    // Export to CSV
                    exportCouponPerformanceCSV(response.rows || []);
                  }
                } catch (error) {
                  console.error("Error:", error);
                  alert("Failed to fetch coupon performance report");
                } finally {
                  setFetching(false);
                }
              }}
            >
              {fetching ? "Getting Data..." : "Get Data"}
            </Button>
          </Col>
        </Row>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default CouponPerformanceReport;
