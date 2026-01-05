import { FC } from "react";
import { Layout, Typography } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

type AppFooterProps = {
  className?: string;
};

export const AppFooter: FC<AppFooterProps> = ({ className = "ba-footer" }) => {
  return (
    <Footer className={className}>
      <Text type="secondary" className="ba-powered-by">
        Powered by <span className="ba-brand">sellerapp</span>
      </Text>
    </Footer>
  );
};
