import { FC, useState, useEffect } from "react";
import { Layout, Row, Col, Card, Typography, Button, Space, Alert } from "antd";
import {
  LinkOutlined,
  ArrowRightOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { GeoHeader } from "../components/GeoHeader";
import { AppFooter } from "../components/AppFooter";
import { GeoMapsModel, geoMaps } from "../constants/geo-constants";
import { get } from "../helpers/Cache";

import "./Popup.css";

const { Content } = Layout;
const { Title, Text, Link } = Typography;

type ConnectAccountViewProps = {
  onConnect?: () => void;
  onGeoChange?: (geoDetails: GeoMapsModel) => void;
};

const ConnectAccountView: FC<ConnectAccountViewProps> = ({
  onConnect,
  onGeoChange,
}) => {
  const [selectedGeo, setSelectedGeo] = useState<GeoMapsModel>({
    baseDomain: "sellercentral.amazon.com",
    marketPlaceId: "ATVPDKIKX0DER",
    marketPlace: "US",
    marketplaceDisplay: "AMAZON.COM",
    tail: ".com",
    countryCode: "us",
  });

  // Load saved geo from cache on mount
  useEffect(() => {
    (async () => {
      try {
        const savedGeoKey = (await get("selectedGeo")) as string;
        if (savedGeoKey && geoMaps[savedGeoKey]) {
          setSelectedGeo(geoMaps[savedGeoKey]);
        }
      } catch (error) {
        console.error("Error loading saved geo:", error);
      }
    })();
  }, []);

  const cards = [
    {
      key: "asqp",
      title: "Amazon's Search Query Performance",
    },
    {
      key: "top-search",
      title: "Top Search Terms",
    },
    {
      key: "catalog",
      title: "Search Catalog Performance",
    },
    {
      key: "coupon",
      title: "Coupon Performance Report",
    },
  ];

  const handleConnect = () => {
    // Open seller central login page for the selected country
    const sellerCentralUrl = `https://${selectedGeo.baseDomain}/`;
    chrome.tabs.create({ url: sellerCentralUrl });
  };

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
        <Alert
          message={
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space align="start" size={8}>
                <LinkOutlined style={{ fontSize: 20, color: "#C00814" }} />
                <div>
                  <Text style={{ display: "block", fontSize: 14 }}>
                    Login to Your Seller Account
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Unlock full access to all extension features
                  </Text>
                </div>
              </Space>
              <Button
                type="primary"
                danger
                style={{ width: 180, backgroundColor: "#C00814" }}
                icon={<ExportOutlined />}
                iconPlacement="end"
                onClick={handleConnect}
                block
              >
                Login to Account
              </Button>
            </Space>
          }
          type="error"
          showIcon={false}
          style={{
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: "#fff5f5",
            border: "1px solid #ffcdd2",
          }}
        />

        <Row gutter={[12, 12]} className="ba-card-grid">
          {cards.map((card) => {
            return (
              <Col key={card.key} span={12}>
                <Card
                  className={`ba-card ba-card-primary ba-card-disabled ba-card-${card.key}`}
                  bordered={false}
                  bodyStyle={{ padding: 14, height: 110, display: "flex" }}
                  style={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                    pointerEvents: "none",
                    filter: "grayscale(.5)",
                  }}
                >
                  <div className="ba-card-body">
                    <Text className="ba-card-title">{card.title}</Text>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ArrowRightOutlined />}
                      className="ba-card-cta"
                      size="small"
                      disabled
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

export default ConnectAccountView;
