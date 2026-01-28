import React from "react";
import { List, InputNumber, Progress, Tooltip, Typography } from "antd";
import {
  ArrowRightOutlined,
  RobotOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// Thêm prop readOnly (mặc định là false)
const MetricTable = ({ data, loading, onValueChange, readOnly = false }) => {
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <List
      loading={loading}
      dataSource={data}
      className="bg-white"
      renderItem={(item) => {
        const percent = Math.round(item.confidence * 100);
        const isChanged = item.aiValue !== item.finalValue;

        // Logic lỗi
        const rawMsg = item.validationMessage;
        const isRealError = rawMsg && rawMsg.trim().toLowerCase() !== "ok";
        const showRedBox = isRealError && !isChanged;

        const progressColor =
          percent >= 90 ? "#52c41a" : percent >= 70 ? "#faad14" : "#ff4d4f";

        return (
          <List.Item
            className={`border-b border-gray-100 p-4 transition-all hover:bg-slate-50 
              ${showRedBox ? "bg-red-50/40" : isChanged ? "bg-orange-50/40" : ""}`}
          >
            <div className="w-full flex flex-col gap-2">
              {/* HEADER (Giữ nguyên) */}
              <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-gray-800 text-base leading-tight">
                    {item.metricName}
                  </span>
                  <span className="text-xs text-gray-400 font-mono mt-0.5">
                    {item.metricCode}
                  </span>
                </div>
                <div className="flex flex-col items-end w-[140px] flex-shrink-0">
                  <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                    <span>Độ tin cậy:</span>
                    <span style={{ color: progressColor, fontWeight: "bold" }}>
                      {percent}%
                    </span>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={progressColor}
                    strokeWidth={6}
                    className="m-0 w-full"
                  />
                </div>
              </div>

              {/* BODY: INPUT */}
              <div
                className={`flex items-center gap-2 p-3 rounded-lg border shadow-sm transition-all duration-300 relative
                  ${
                    showRedBox
                      ? "bg-red-50 border-red-400"
                      : isChanged
                        ? "bg-amber-50 border-amber-300"
                        : "bg-white border-gray-200"
                  }`}
              >
                {/* AI Value */}
                <div className="flex flex-col w-[110px] flex-shrink-0 border-r border-gray-200 pr-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                    <RobotOutlined /> AI Gợi ý
                  </div>
                  <Tooltip title={formatNumber(item.aiValue)}>
                    <Text
                      className="text-gray-500 font-medium truncate text-sm"
                      delete={isChanged}
                    >
                      {formatNumber(item.aiValue)}
                    </Text>
                  </Tooltip>
                </div>

                <div className="text-gray-300 flex-shrink-0 text-xs">
                  <ArrowRightOutlined />
                </div>

                {/* Input Value */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between mb-0.5">
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1
                        ${showRedBox ? "text-red-600" : isChanged ? "text-amber-700" : "text-blue-600"}`}
                    >
                      {showRedBox ? (
                        <>
                          {" "}
                          <ExclamationCircleOutlined />{" "}
                          <span>Sai lệch Logic!</span>{" "}
                        </>
                      ) : isChanged ? (
                        <>
                          {" "}
                          <EditOutlined /> <span>Đã chỉnh sửa</span>{" "}
                        </>
                      ) : (
                        <>
                          {rawMsg && rawMsg.toLowerCase() === "ok" ? (
                            <CheckCircleOutlined className="text-green-500" />
                          ) : null}
                          <span>Giá trị chốt</span>
                        </>
                      )}
                    </div>
                  </div>

                  <InputNumber
                    style={{ width: "100%" }}
                    className={`font-bold h-10 py-1 text-base transition-all duration-300
                          ${showRedBox ? "bg-white border-red-500 text-red-700" : isChanged ? "bg-white border-amber-500 text-amber-900" : "bg-gray-50 border-gray-300 text-gray-700"}`}
                    value={item.finalValue}
                    // NẾU LÀ READONLY THÌ KHÔNG CHO SỬA
                    disabled={readOnly}
                    onChange={
                      readOnly
                        ? null
                        : (val) => onValueChange(val, item.metricCode)
                    }
                    controls={false}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                    status={showRedBox ? "error" : ""}
                  />
                </div>
              </div>

              {isRealError && (
                <div className="text-xs text-red-500 mt-1 pl-1 flex items-start gap-1">
                  <ExclamationCircleOutlined className="mt-0.5" />
                  <span>{item.validationMessage}</span>
                </div>
              )}
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default MetricTable;
