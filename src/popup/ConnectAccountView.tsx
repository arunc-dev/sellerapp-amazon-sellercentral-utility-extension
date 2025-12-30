import { FC } from "react";
import { Layout, Row, Col, Card, Typography, Button, Space, Alert } from "antd";
import {
  LinkOutlined,
  ArrowRightOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { ReviewGeoDropdown } from "../components/ReviewGeoDropdown";
import { GeoMapsModel } from "../constants/geo-constants";

import "./Popup.css";

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;

type ConnectAccountViewProps = {
  onConnect?: () => void;
};

const ConnectAccountView: FC<ConnectAccountViewProps> = ({ onConnect }) => {
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
    // TODO: Implement actual authentication logic
    if (onConnect) {
      onConnect();
    }
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
          <Title level={4} className="ba-title">
            Brand Analytics Report
          </Title>
          <Link href="#" className="ba-tutorial-link">
            Tutorial video <ExportOutlined />
          </Link>
        </Row>

        <Alert
          message={
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space align="start" size={8}>
                <LinkOutlined style={{ fontSize: 20, color: "#d32f2f" }} />
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
                style={{ width: 180 }}
                icon={<ExportOutlined />}
                iconPlacement="end"
                onClick={handleConnect}
                block
              >
                Connect Account
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
                  className="ba-card ba-card-primary ba-card-disabled"
                  bordered={false}
                  bodyStyle={{ padding: 14, height: 110, display: "flex" }}
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
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

      <Footer className="ba-footer">
        <Text type="secondary" className="ba-powered-by">
          Powered by <span className="ba-brand">sellerapp</span>
        </Text>
      </Footer>
    </Layout>
  );
};

export default ConnectAccountView;
