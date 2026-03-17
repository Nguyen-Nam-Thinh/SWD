import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const AddNewButton = ({
  onClick,
  children,
  label = "Thêm mới",
  size,
  className,
  block,
  disabled,
}) => {
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={onClick}
      size={size}
      className={className}
      block={block}
      disabled={disabled}
    >
      {children || label}
    </Button>
  );
};

export default AddNewButton;
