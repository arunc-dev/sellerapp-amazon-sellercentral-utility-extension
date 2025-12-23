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

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;
const { TextArea } = Input;

type TopSearchTermsProps = {
  onBack?: () => void;
};

const TopSearchTerms: FC<TopSearchTermsProps> = ({ onBack }) => {
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
              Top Search Terms
            </Title>
          </Space>
          <Link className="ba-tutorial" href="#">
            Tutorial video ↗
          </Link>
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
              <Text className="ba-filter-label">Reporting Range</Text>
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
        </Row>

        <div className="ba-input-block ba-input-large">
          <TextArea
            rows={4}
            placeholder="Top clicked products (optional)"
            className="ba-textarea-muted"
          />
        </div>

        <div className="ba-input-block ba-input-large">
          <TextArea
            rows={4}
            placeholder="Top clicked brands (optional)"
            className="ba-textarea-muted"
          />
        </div>

        <Row justify="end" className="ba-actions-row">
          <Col>
            <Button
              type="primary"
              onClick={() => {
                // TODO: replace with Top Search Terms fetch API call
                console.log("Fetch Top Search Terms report");
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

export default TopSearchTerms;
