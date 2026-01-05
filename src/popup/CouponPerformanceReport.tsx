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
            placeholder="Enter Coupon name(s) (optional)"
            className="ba-textarea-muted"
          />
        </div>

        <Row gutter={[0, 16]} className="ba-filters">
          <Col span={24}>
            <div className="ba-filter-field">
              <Select
                placeholder="Coupon Type"
                className="ba-select-full"
                options={[{ value: "any", label: "Coupon Type" }]}
              />
            </div>
          </Col>

          <Col span={24}>
            <div className="ba-filter-field">
              <Select
                placeholder="Status"
                className="ba-select-full"
                options={[{ value: "any", label: "Status" }]}
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[0, 16]} className="ba-filters">
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

          <Col span={24}>
            <div className="ba-filter-field">
              <Text className="ba-filter-label">CSV Grouping</Text>
              <Select
                disabled={!childOptions.length}
                loading={loading}
                className="ba-select-full ba-select-accent"
                options={childOptions.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                value={selectedRangeChild}
                onChange={setSelectedRangeChild}
              />
            </div>
          </Col>
        </Row>
        <Row justify="end" className="ba-actions-row">
          <Col>
            <Button
              type="primary"
              onClick={() => {
                // TODO: replace with Coupon Performance fetch API call
                console.log("Fetch Coupon Performance report");
              }}
            >
              Get Data
            </Button>
          </Col>
        </Row>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default CouponPerformanceReport;
