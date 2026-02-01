import { useState, useMemo } from "react";
import { Card, Segmented, Spin, Empty } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardChart = ({ chartData, loading }) => {
  const [timeRange, setTimeRange] = useState("week"); // 'week' | 'month' | 'year'

  // 1. Bảo vệ dữ liệu đầu vào (tránh crash nếu chartData null)
  const safeChartData = chartData || { week: [], month: [], year: [] };

  // 2. Lấy data tương ứng với tab đang chọn (Tuần/Tháng/Năm)
  const currentData = useMemo(() => {
    return safeChartData[timeRange] || [];
  }, [timeRange, safeChartData]);

  // 3. Render nội dung chính của biểu đồ
  const renderChartContent = () => {
    // Trường hợp 1: Đang tải
    if (loading) {
      return (
        <div className="flex justify-center items-center h-87.5">
          <Spin size="large" tip="Đang tải biểu đồ..." />
        </div>
      );
    }

    // Trường hợp 2: Không có dữ liệu
    if (!currentData || currentData.length === 0) {
      return (
        <div className="flex justify-center items-center h-87.5">
          <Empty description="Chưa có dữ liệu thống kê trong khoảng thời gian này" />
        </div>
      );
    }

    // Trường hợp 3: Có dữ liệu -> Vẽ biểu đồ
    return (
      <div className="h-64 md:h-87.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c8c8c", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c8c8c", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />

            <Legend wrapperStyle={{ paddingTop: 20 }} />

            {/* Đường User (Màu Xanh lá) */}
            <Line
              type="monotone" // 'monotone' giúp đường cong mềm mại hơn 'linear'
              dataKey="users"
              name="Người dùng mới"
              stroke="#3f8600"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3f8600", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />

            {/* Đường Báo cáo (Màu Đỏ) */}
            <Line
              type="monotone"
              dataKey="reports"
              name="Báo cáo tài chính"
              stroke="#cf1322"
              strokeWidth={3}
              dot={{ r: 4, fill: "#cf1322", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card
      bordered={false} // AntD v5 dùng bordered={false} thay vì variant="borderless"
      className="shadow-sm rounded-lg"
      title={
        <span className="font-bold text-gray-700">Thống kê tăng trưởng</span>
      }
      extra={
        <Segmented
          options={[
            { label: "Tuần", value: "week" },
            { label: "Tháng", value: "month", disabled: true }, // Tạm disable nếu chưa làm logic tháng
            { label: "Năm", value: "year", disabled: true }, // Tạm disable nếu chưa làm logic năm
          ]}
          value={timeRange}
          onChange={setTimeRange}
          disabled={loading} // Không cho bấm khi đang tải
        />
      }
    >
      {renderChartContent()}
    </Card>
  );
};

export default DashboardChart;
