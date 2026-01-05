import { FC, useCallback } from "react";
import { Layout, Row, Typography } from "antd";
import { ReviewGeoDropdown } from "./ReviewGeoDropdown";
import { GeoMapsModel } from "../constants/geo-constants";

const { Header } = Layout;
const { Title } = Typography;

type GeoHeaderProps = {
  skipInitialCallback?: boolean;
  onGeoChange?: (geoDetails: GeoMapsModel) => void;
  className?: string;
};

export const GeoHeader: FC<GeoHeaderProps> = ({
  skipInitialCallback = true,
  onGeoChange,
  className = "ba-header",
}) => {
  const handleGeoSelect = useCallback(
    (geoDetails: GeoMapsModel) => {
      console.log("Selected geo:", geoDetails);
      if (onGeoChange) {
        onGeoChange(geoDetails);
      }
    },
    [onGeoChange]
  );

  return (
    <Header className={className} style={{ marginBottom: "20px" }}>
      <Row justify="space-between" align="middle" style={{ padding: "8px" }}>
        <Title level={4} className="ba-title" style={{ margin: 0 }}>
          Brand Analytics Report
        </Title>
        <ReviewGeoDropdown
          skipInitialCallback={skipInitialCallback}
          selectedGeo={handleGeoSelect}
        />
      </Row>
    </Header>
  );
};
