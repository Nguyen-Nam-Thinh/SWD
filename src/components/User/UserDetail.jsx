import { useEffect, useState } from "react";
import { Drawer, Descriptions, Tag, Spin, message } from "antd";
import userService from "../../services/userService";
import dayjs from "dayjs";

const UserDetail = ({ open, onCancel, userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const data = await userService.getUserById(userId);
          setUser(data);
        } catch (error) {
          message.error("Không thể tải thông tin chi tiết!");
          onCancel();
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [open, userId]);

  return (
    <Drawer
      title="Chi tiết người dùng"
      placement="right"
      onClose={onCancel}
      open={open}
      size={500}
    >
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      ) : user ? (
        <Descriptions column={1} bordered layout="vertical">
          <Descriptions.Item label="ID Hệ thống">
            <span className="text-gray-400 text-xs">{user.id}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Tên đăng nhập">
            <span className="font-bold text-lg">{user.username}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Họ và tên">
            {user.fullName}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </Descriptions.Item>

          <Descriptions.Item label="Vai trò">
            <Tag color={user.role === "Admin" ? "geekblue" : "green"}>
              {user.role}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={user.isActive ? "success" : "error"}>
              {user.isActive ? "Đang hoạt động" : "Đã khóa"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {user.createdAt
              ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")
              : "-"}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Không có dữ liệu</p>
      )}
    </Drawer>
  );
};

export default UserDetail;
