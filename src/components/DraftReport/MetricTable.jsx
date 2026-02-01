import React from "react";
import { List, InputNumber, Progress, Tooltip, Typography } from "antd";
import {
  ArrowRightOutlined,
  RobotOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const MetricTable = ({
  data,
  loading,
  onValueChange,
  onMetricFocus,
  readOnly = false,
}) => {
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const handleMetricClick = (item) => {
    if (item.boundingBox && item.pageNumber) {
      onMetricFocus(item.boundingBox, item.pageNumber);
    }
  };

  return (
    <List
      loading={loading}
      dataSource={data}
      className="bg-white"
      renderItem={(item) => {
        const percent = Math.round(item.confidence * 100);
        const isChanged = item.aiValue !== item.finalValue;
        const rawMsg = item.validationMessage;
        const isRealError = rawMsg && rawMsg.trim().toLowerCase() !== "ok";
        const showRedBox = isRealError && !isChanged;
        const progressColor =
          percent >= 90 ? "#52c41a" : percent >= 70 ? "#faad14" : "#ff4d4f";
        const hasBoundingBox = !!item.boundingBox && !!item.pageNumber;

        return (
          <List.Item
            className={`border-b border-gray-100 p-2 md:p-4 transition-all hover:bg-slate-50 ${showRedBox ? "bg-red-50/40" : isChanged ? "bg-orange-50/40" : ""}`}
          >
            <div className="w-full flex flex-col gap-1 md:gap-2">
              {/* Header */}
              <div className="flex justify-between items-end mb-0.5 md:mb-1">
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-gray-800 text-xs md:text-base leading-tight">
                    {item.metricName}
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-400 font-mono mt-0.5">
                    {item.metricCode}
                  </span>
                </div>
                <div className="flex flex-col items-end w-20 md:w-35 shrink-0">
                  <div className="flex items-center gap-1 mb-1 text-[10px] md:text-xs text-gray-500">
                    <span className="hidden md:inline">Độ tin cậy:</span>
                    <span style={{ color: progressColor, fontWeight: "bold" }}>
                      {percent}%
                    </span>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={progressColor}
                    strokeWidth={4}
                    className="m-0 w-full md:strokeWidth-6"
                  />
                </div>
              </div>

              {/* Body */}
              <div
                className={`flex items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border shadow-sm transition-all duration-300 relative ${showRedBox ? "bg-red-50 border-red-400" : isChanged ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"}`}
              >
                {/* AI Value Box - Clickable */}
                <div
                  className={`flex flex-col w-24 md:w-35 shrink-0 border-r border-gray-200 pr-1 md:pr-2 group transition-all duration-200 ${hasBoundingBox ? "cursor-pointer hover:bg-blue-50 hover:text-blue-600 rounded-l px-0.5 md:px-1 -ml-0.5 md:-ml-1 active:scale-95" : "opacity-50 cursor-not-allowed"}`}
                  onClick={() => hasBoundingBox && handleMetricClick(item)}
                  title={
                    hasBoundingBox
                      ? `Xem vị trí (Trang ${item.pageNumber})`
                      : "Không có vị trí"
                  }
                >
                  <div className="flex items-center justify-between text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5 group-hover:text-blue-500">
                    <span className="flex items-center gap-0.5 md:gap-1">
                      <RobotOutlined className="text-[10px] md:text-xs" />{" "}
                      <span className="hidden md:inline">AI Gợi ý</span>
                    </span>
                    {hasBoundingBox && (
                      <AimOutlined className="opacity-0 group-hover:opacity-100 transition-opacity text-sm md:text-lg" />
                    )}
                  </div>
                  <Tooltip title={formatNumber(item.aiValue)}>
                    <Text
                      className="text-gray-500 font-medium truncate text-xs md:text-sm group-hover:text-blue-700"
                      delete={isChanged}
                    >
                      {formatNumber(item.aiValue)}
                    </Text>
                  </Tooltip>
                  {hasBoundingBox && (
                    <span className="text-[8px] md:text-[9px] text-gray-400 mt-0.5 group-hover:text-blue-500">
                      Tr {item.pageNumber}
                    </span>
                  )}
                </div>

                <div className="text-gray-300 shrink-0 text-[10px] md:text-xs">
                  <ArrowRightOutlined />
                </div>

                {/* Input Value */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between mb-0.5">
                    <div
                      className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 md:gap-1 ${showRedBox ? "text-red-600" : isChanged ? "text-amber-700" : "text-blue-600"}`}
                    >
                      {showRedBox ? (
                        <>
                          <ExclamationCircleOutlined className="text-[10px] md:text-xs" />
                          <span className="hidden md:inline">Sai logic!</span>
                        </>
                      ) : isChanged ? (
                        <>
                          <EditOutlined className="text-[10px] md:text-xs" />
                          <span className="hidden md:inline">Đã sửa</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleOutlined className="text-[10px] md:text-xs" />
                          <span className="hidden md:inline">Chốt</span>
                        </>
                      )}
                    </div>
                  </div>
                  <InputNumber
                    style={{ width: "100%" }}
                    className={`font-bold h-8 md:h-10 py-0.5 md:py-1 text-sm md:text-base ${showRedBox ? "bg-white border-red-500 text-red-700" : isChanged ? "bg-white border-amber-500 text-amber-900" : "bg-gray-50 border-gray-300 text-gray-700"}`}
                    value={item.finalValue}
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
                <div className="text-[10px] md:text-xs text-red-500 mt-1 pl-1 flex items-start gap-1">
                  <ExclamationCircleOutlined className="mt-0.5 text-[10px] md:text-xs" />
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
