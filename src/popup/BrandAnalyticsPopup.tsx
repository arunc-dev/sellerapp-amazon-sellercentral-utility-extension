import { FC, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Avatar,
} from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  GlobalOutlined,
  BulbOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { GeoHeader } from "../components/GeoHeader";
import { AppFooter } from "../components/AppFooter";
import { GeoMapsModel } from "../constants/geo-constants";

import "./Popup.css";

const { Content } = Layout;
const { Title, Text, Link } = Typography;

type BrandAnalyticsPopupProps = {
  onOpenAsqp?: () => void;
  onOpenTopSearchTerms?: () => void;
  onOpenSearchCatalog?: () => void;
  onOpenCouponReport?: () => void;
  onGeoChange?: (geoDetails: GeoMapsModel) => void;
};

const BrandAnalyticsPopup: FC<BrandAnalyticsPopupProps> = ({
  onOpenAsqp,
  onOpenTopSearchTerms,
  onOpenSearchCatalog,
  onOpenCouponReport,
  onGeoChange,
}) => {
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<GeoMapsModel>();

  const handleFetchMetadata = () => {
    setLoadingMetadata(true);
    chrome.runtime.sendMessage(
      {
        type: "GET_CUSTOMER_JOURNEY_METADATA",
        selectedCountries: ["us"],
      },
      (response) => {
        setLoadingMetadata(false);
        if (chrome.runtime.lastError) {
          console.error("Metadata error:", chrome.runtime.lastError.message);
          return;
        }
        if (response?.error) {
          console.error("Metadata error:", response.error);
        } else {
          console.log("Metadata response:", response.data);
        }
      }
    );
  };

  const cards = [
    {
      key: "asqp",
      title: "Amazon's Search Query Performance",
      variant: "primary" as const,
    },
    {
      key: "top-search",
      title: "Top Search Terms",
      variant: "primary" as const,
    },
    {
      key: "catalog",
      title: "Search Catalog Performance",
      variant: "primary" as const,
    },
    {
      key: "coupon",
      title: "Coupon Performance Report",
      variant: "primary" as const,
    },
  ];

  return (
    <Layout className="ba-layout">
      <GeoHeader
        onGeoChange={(geoDetails: GeoMapsModel) => {
          setSelectedGeo(geoDetails);
          if (onGeoChange) {
            onGeoChange(geoDetails);
          }
        }}
      />

      <Content className="ba-content">
        <Row gutter={[12, 12]} className="ba-card-grid">
          {cards.map((card) => {
            const isAsqp = card.key === "asqp";
            const isTopSearch = card.key === "top-search";
            const isCatalog = card.key === "catalog";
            const isCoupon = card.key === "coupon";

            return (
              <Col key={card.key} span={12}>
                <Card
                  hoverable
                  className={`ba-card ba-card-${card.variant} ba-card-${card.key} ${
                    isAsqp || isTopSearch || isCatalog || isCoupon
                      ? "ba-card-clickable"
                      : ""
                  }`}
                  bordered={false}
                  bodyStyle={{ padding: 14, height: 110, display: "flex" }}
                  onClick={
                    isAsqp && onOpenAsqp
                      ? () => onOpenAsqp()
                      : isTopSearch && onOpenTopSearchTerms
                        ? () => onOpenTopSearchTerms()
                        : isCatalog && onOpenSearchCatalog
                          ? () => onOpenSearchCatalog()
                          : isCoupon && onOpenCouponReport
                            ? () => onOpenCouponReport()
                            : undefined
                  }
                >
                  <div className="ba-card-body">
                    <Text className="ba-card-title">{card.title}</Text>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ArrowRightOutlined />}
                      className="ba-card-cta"
                      size="small"
                    />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default BrandAnalyticsPopup;
