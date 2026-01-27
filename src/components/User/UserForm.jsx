import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Button } from "antd";
import userService from "../../services/userService";

const { Option } = Select;

const UserForm = ({ open, onCancel, onSuccess, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Khi modal mở hoặc data thay đổi -> Fill dữ liệu vào form
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Mode: EDIT
        // Reset form và set giá trị cũ
        form.resetFields();
        form.setFieldsValue({
          ...initialData,
          // Lưu ý: Backend thường không trả về password, nên field password để trống
          password: "",
        });
      } else {
        // Mode: CREATE
        form.resetFields();
      }
    }
  }, [initialData, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (initialData) {
        // --- GỌI API UPDATE ---
        // Nếu user không nhập password mới thì xóa field password khỏi payload
        if (!values.password) {
          delete values.password;
        }

        await userService.updateUser(initialData.id, values);
        message.success("Cập nhật thông tin thành công!");
      } else {
        // --- GỌI API CREATE ---
        await userService.createUser(values);
        message.success("Tạo người dùng mới thành công!");
      }

      onSuccess(); // Báo cho trang cha reload lại bảng
      onCancel(); // Đóng modal
    } catch (error) {
      // Lỗi validation form thì AntD tự hiện màu đỏ, không cần làm gì
      // Chỉ handle lỗi từ API
      if (!error.errorFields) {
        message.error(error.response?.data?.message || "Có lỗi xảy ra!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Cập nhật thông tin" : "Thêm người dùng mới"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {initialData ? "Lưu thay đổi" : "Tạo mới"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true, message: "Vui lòng nhập username" }]}
        >
          {/* Khi Edit thường không cho sửa Username */}
          <Input disabled={!!initialData} placeholder="VD: admin123" />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="VD: Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không đúng định dạng" },
          ]}
        >
          <Input placeholder="VD: email@example.com" />
        </Form.Item>

        {!initialData && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên" },
            ]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
        )}
        {initialData && (
          <Form.Item
            name="isActive"
            label="Trạng thái"
            className="flex-1"
            valuePropName="value" // Antd Select dùng value, Checkbox dùng checked
          >
            <Select>
              <Select.Option value={true}>
                <span className="text-green-600 font-semibold">
                  ● Đang hoạt động
                </span>
              </Select.Option>
              <Select.Option value={false}>
                <span className="text-red-500 font-semibold">● Đã khóa</span>
              </Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item name="role" label="Vai trò" initialValue="User">
          <Select>
            <Select.Option value="User">User</Select.Option>
            <Select.Option value="Admin">Admin</Select.Option>
            <Select.Option value="Manager">Manager</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
