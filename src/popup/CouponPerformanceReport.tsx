import { FC } from "react";
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
import { ReviewGeoDropdown } from "../components/ReviewGeoDropdown";
import { GeoMapsModel } from "../constants/geo-constants";

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;
const { TextArea } = Input;

type CouponPerformanceReportProps = {
  onBack?: () => void;
};

const CouponPerformanceReport: FC<CouponPerformanceReportProps> = ({
  onBack,
}) => {
  const {
    loading,
    reportingRangeOptions,
    selectedRange,
    selectedRangeChild,
    setSelectedRangeChild,
    handleSelectRange,
    childLabel,
    childOptions,
  } = useCustomerJourneyMetadata();
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

export default CouponPerformanceReport;
