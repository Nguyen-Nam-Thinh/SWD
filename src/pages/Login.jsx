import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Alert,
  message,
  Typography,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import authService from "../services/authService";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Gọi API Login
      const userData = await authService.login(
        values.username,
        values.password,
      );

      // 2. Lưu token
      authService.saveUserData(userData);

      // 3. Ghi nhớ username
      if (values.remember) {
        localStorage.setItem("remember_user", values.username);
      }

      message.success("Đăng nhập thành công!");

      // 4. Logic điều hướng theo Role
      const currentUser = authService.getUserData();
      const role = currentUser?.role;

      if (role === "User") {
        navigate("/");
      } else if (["Admin", "Staff"].includes(role)) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Tài khoản hoặc mật khẩu không chính xác.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      {/* LEFT SIDE: Intro / Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#001529] relative flex-col justify-between p-16 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-3xl font-bold mb-6">
            <SafetyCertificateOutlined className="text-[#1890ff]" />
            <span>UNICA FINANCE</span>
          </div>
          <p className="text-gray-400 text-lg max-w-md">
            Hệ thống quản trị tài chính tập trung, bảo mật và hiệu quả dành cho
            doanh nghiệp.
          </p>
        </div>

        <div className="relative z-10">
          <img
            src="https://gw.alipayobjects.com/zos/rmsportal/gVAKqIsuJCdbWQvYhvNM.png"
            alt="Finance Illustration"
            className="w-3/4 mx-auto drop-shadow-2xl"
          />
        </div>

        <div className="relative z-10 text-gray-400 text-sm">
          © 2024 Unica Finance Corp. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card
          className="w-full max-w-100 shadow-lg border-gray-100"
          // --- SỬA Ở ĐÂY ---
          // Thay bordered={false} bằng variant="borderless"
          variant="borderless"
        >
          <div className="text-center mb-8">
            <Title level={3} style={{ color: "#001529", marginBottom: 5 }}>
              Đăng Nhập
            </Title>
            <Text type="secondary">Chào mừng quay trở lại hệ thống</Text>
          </div>

          {errorMsg && (
            <Alert
              message="Đăng nhập thất bại"
              description={errorMsg}
              type="error"
              showIcon
              className="mb-6"
            />
          )}

          <Form
            name="login_form"
            initialValues={{
              remember: true,
              username: localStorage.getItem("remember_user") || "",
            }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập Username!" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Username hoặc Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <Link
                className="text-[#1890ff] hover:underline font-medium"
                to="/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-10 font-semibold bg-[#1890ff]"
                loading={loading}
              >
                ĐĂNG NHẬP
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Text type="secondary">Bạn chưa có tài khoản? </Text>
              <Link to="/register" className="font-semibold text-[#1890ff]">
                Đăng ký ngay
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
