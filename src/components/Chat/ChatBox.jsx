import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Spin,
  Avatar,
  Tooltip,
  Select,
  message as antMessage,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  MinusOutlined,
  UserOutlined,
  RobotOutlined,
  DeleteOutlined,
  LinkOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined as DashOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import chatService from "../../services/chatService";
import { useCurrentUser } from "../../hooks/useAuth";

const { TextArea } = Input;
const { Option } = Select;

// Tên key lưu trữ trong trình duyệt
const CHAT_STORAGE_KEY = "chatbox_history_unified_v1";

const Chatbox = ({ companies = [] }) => {
  // --- STATE QUẢN LÝ ---
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const messagesEndRef = useRef(null);
  const currentUser = useCurrentUser();

  // --- LOCAL STORAGE LOGIC (MỚI THÊM) ---

  // 1. Load dữ liệu khi component được mount (F5 lại trang)
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử chat:", error);
    }
  }, []);

  // 2. Tự động lưu dữ liệu mỗi khi messages thay đổi
  useEffect(() => {
    // Chỉ lưu nếu có tin nhắn để tránh ghi đè mảng rỗng khi khởi tạo
    if (messages.length > 0) {
      // Giới hạn lưu 100 tin nhắn gần nhất để tối ưu bộ nhớ
      const recentMessages = messages.slice(-100);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(recentMessages));
    }
  }, [messages]);

  // --- LOGIC PARSER V5 (GIỮ NGUYÊN) ---

  const isTableLine = (line) => {
    const clean = line.trim();
    if (!clean) return false;
    if (clean.startsWith("|") && clean.endsWith("|")) return true;
    if (/^\s*[\*\-]\s+\*\*.+\*\*[:]?\s*$/.test(clean)) return true;
    if (/^\s*[\*\-]\s+.+[:]\s+[\d,.]+\s+VNĐ/.test(clean)) return true;
    if (/^\s*[\*\-]\s+.*xu hướng.*[:]/i.test(clean)) return true;
    if (/[\*\-]\s+(.+?)\s+\((.+?)\):\s+([\d,.]+)\s+VNĐ/i.test(clean))
      return true;
    return false;
  };

  const processTableChunk = (lines) => {
    const textChunk = lines.join("\n");
    const markdownRows = lines.filter((l) => l.trim().startsWith("|"));
    if (markdownRows.length >= 3) {
      const headers = markdownRows[0]
        .split("|")
        .filter((i) => i.trim())
        .map((h) => h.trim().replace(/\*\*/g, ""));
      const dataRows = markdownRows.slice(2);
      const dataSource = dataRows.map((row, index) => {
        const cols = row
          .split("|")
          .filter((i) => i.trim())
          .map((c) => c.trim().replace(/\*\*/g, ""));
        let rowData = { key: index };
        headers.forEach((header, i) => {
          if (header.toLowerCase().includes("xu hướng"))
            rowData["trend"] = cols[i];
          else rowData[`col_${i}`] = cols[i];
        });
        return rowData;
      });
      return { type: "comparison_table", headers, dataSource };
    }

    const structData = [];
    const detectedHeaders = new Set();
    let currentItem = null;

    const trendRegex = /^\s*[\*\-]\s+.*xu hướng.*[:]\s*(.*)$/i;
    const valueRegex = /^\s*[\*\-]\s+(.+?)[:]\s+([\d,.]+)\s+VNĐ/;
    const indicatorRegex = /^\s*[\*\-]\s+(.+?)[:]?\s*$/;

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      const trendMatch = cleanLine.match(trendRegex);
      if (trendMatch && currentItem) {
        currentItem.trend = trendMatch[1].replace(/\*\*/g, "").trim();
        return;
      }

      const valMatch = cleanLine.match(valueRegex);
      if (valMatch && currentItem) {
        const rawHeader = valMatch[1]
          .replace(/\*\*/g, "")
          .replace(/:/g, "")
          .trim();
        detectedHeaders.add(rawHeader);
        currentItem.values[rawHeader] = valMatch[2].trim();
        return;
      }

      if (
        !cleanLine.startsWith("#") &&
        !valMatch &&
        !trendRegex.test(cleanLine)
      ) {
        const indMatch = cleanLine.match(indicatorRegex);
        if (indMatch) {
          const rawName = indMatch[1].replace(/\*\*/g, "").trim();
          if (currentItem && Object.keys(currentItem.values).length > 0)
            structData.push(currentItem);
          currentItem = { key: structData.length, name: rawName, values: {} };
        }
      }
    });
    if (currentItem && Object.keys(currentItem.values).length > 0)
      structData.push(currentItem);

    if (structData.length > 0) {
      const sortedHeaders = Array.from(detectedHeaders).sort();
      const headersList = ["Chỉ số", ...sortedHeaders, "Xu hướng"];
      const dataSource = structData.map((item, idx) => {
        let row = { key: idx, col_0: item.name, trend: item.trend };
        sortedHeaders.forEach(
          (header, i) => (row[`col_${i + 1}`] = item.values[header] || "-"),
        );
        return row;
      });
      return { type: "comparison_table", headers: headersList, dataSource };
    }

    const simpleRegex = /[\*\-]\s+(.+?)\s+\((.+?)\):\s+([\d,.]+)\s+VNĐ/i;
    const simpleTableData = [];
    lines.forEach((line) => {
      const match = line.replace(/\*\*/g, "").trim().match(simpleRegex);
      if (match)
        simpleTableData.push({
          key: match[2],
          name: match[1].trim(),
          value: match[3].trim(),
        });
    });
    if (simpleTableData.length > 0)
      return { type: "simple_table", dataSource: simpleTableData };

    return { type: "text", content: textChunk };
  };

  const parseMessageContent = (text) => {
    if (!text) return { segments: [{ type: "text", content: text }] };

    const lines = text.split("\n");
    const tableLineIndices = [];

    lines.forEach((line, idx) => {
      if (isTableLine(line)) tableLineIndices.push(idx);
    });

    if (tableLineIndices.length === 0)
      return { segments: [{ type: "text", content: text }] };

    const startIdx = tableLineIndices[0];
    const endIdx = tableLineIndices[tableLineIndices.length - 1];

    const preText = lines.slice(0, startIdx).join("\n").trim();
    const tableLines = lines.slice(startIdx, endIdx + 1);
    const postText = lines
      .slice(endIdx + 1)
      .join("\n")
      .trim();

    const segments = [];
    if (preText) segments.push({ type: "text", content: preText });
    segments.push(processTableChunk(tableLines));
    if (postText) segments.push({ type: "text", content: postText });

    return { segments };
  };

  const renderMessageContent = (msg) => {
    if (msg.sender === "user" || msg.isError)
      return <p className="text-sm whitespace-pre-wrap">{msg.text}</p>;

    const { segments } = parseMessageContent(msg.text);
    const tableScrollY = isExpanded ? "65vh" : 300;

    return (
      <div className="flex flex-col gap-2">
        {segments.map((seg, index) => {
          if (seg.type === "text") {
            return (
              <p key={index} className="text-sm whitespace-pre-wrap">
                {seg.content}
              </p>
            );
          }
          if (seg.type === "simple_table") {
            return (
              <div
                key={index}
                className="my-2 bg-white rounded border overflow-hidden"
              >
                <Table
                  dataSource={seg.dataSource}
                  columns={simpleColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: tableScrollY }}
                  bordered
                />
              </div>
            );
          }
          if (seg.type === "comparison_table") {
            return (
              <div
                key={index}
                className="my-2 bg-white rounded border overflow-hidden shadow-sm"
              >
                <Table
                  dataSource={seg.dataSource}
                  columns={getComparisonColumns(seg.headers)}
                  pagination={false}
                  size="small"
                  scroll={{ x: "max-content", y: tableScrollY }}
                  bordered
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const getComparisonColumns = (headers) => {
    return headers.map((header, index) => {
      if (header.toLowerCase().includes("xu hướng")) {
        return {
          title: header,
          dataIndex: "trend",
          key: "trend",
          align: "center",
          width: 110,
          render: (text) => {
            const t = text ? text.toLowerCase() : "";
            let color = "default";
            let icon = <DashOutlined />;
            if (t.includes("tăng")) {
              color = "green";
              icon = <ArrowUpOutlined />;
            } else if (t.includes("giảm")) {
              color = "red";
              icon = <ArrowDownOutlined />;
            }
            return (
              <Tag color={color} icon={icon}>
                {text
                  ? text.length > 20
                    ? text.substring(0, 20) + "..."
                    : text
                  : "-"}
              </Tag>
            );
          },
        };
      }
      if (index === 0) {
        return {
          title: header,
          dataIndex: `col_${index}`,
          key: `col_${index}`,
          width: 180,
          fixed: "left",
          render: (text) => (
            <span className="font-semibold text-xs text-gray-800">{text}</span>
          ),
        };
      }
      return {
        title: header,
        dataIndex: `col_${index}`,
        key: `col_${index}`,
        align: "right",
        width: 140,
        render: (text) => (
          <span className="text-xs font-mono text-blue-600 font-medium">
            {text}
          </span>
        ),
      };
    });
  };

  const simpleColumns = [
    {
      title: "Chỉ tiêu",
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (t) => <span className="text-xs font-medium">{t}</span>,
    },
    {
      title: "Giá trị (VNĐ)",
      dataIndex: "value",
      key: "value",
      align: "right",
      render: (t) => (
        <span className="text-xs text-blue-600 font-bold">{t}</span>
      ),
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized, isExpanded]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    try {
      const response = await chatService.askQuestion(
        inputMessage,
        selectedCompanyId,
      );
      const responseText =
        response.answer ||
        response.message ||
        (typeof response === "string" ? response : JSON.stringify(response));
      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: response.sources || [],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, hệ thống đang bận.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- SỬA NÚT XÓA ---
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY); // Xóa trong Storage
    antMessage.success("Đã xóa toàn bộ hội thoại và dữ liệu lưu trữ");
  };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setIsExpanded(false);
    }
  };
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setIsMinimized(false);
  };

  // --- STYLE CONTAINER ---
  const containerStyle = isExpanded
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        borderRadius: 0,
      }
    : {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "400px",
        height: "500px",
        zIndex: 9999,
      };

  if (isMinimized && isOpen) {
    containerStyle.height = "56px";
    containerStyle.width = "300px";
    containerStyle.borderRadius = "8px 8px 0 0";
    if (isExpanded) {
      containerStyle.top = undefined;
      containerStyle.left = undefined;
      containerStyle.bottom = "0px";
      containerStyle.right = "24px";
    }
  }

  return (
    <>
      {!isOpen && (
        <Tooltip title="Trợ lý AI Financial" placement="left">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={toggleChatbox}
            className="w-14 h-14 shadow-lg hover:scale-110 transition-transform"
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 9999,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />
        </Tooltip>
      )}

      {isOpen && (
        <div
          className={`bg-white shadow-2xl transition-all flex flex-col ${!isExpanded && !isMinimized ? "rounded-lg" : ""}`}
          style={containerStyle}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: isExpanded ? 0 : "8px 8px 0 0",
            }}
          >
            <div className="flex items-center gap-2">
              <RobotOutlined className="text-xl" />
              <span className="font-semibold">Trợ lý Tài chính AI</span>
            </div>
            <div className="flex gap-1">
              <Tooltip title="Xóa lịch sử">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleClearChat}
                  className="text-white hover:bg-white/20"
                />
              </Tooltip>

              <Tooltip title={isExpanded ? "Thu nhỏ" : "Phóng to"}>
                <Button
                  type="text"
                  size="small"
                  icon={
                    isExpanded ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )
                  }
                  onClick={toggleExpand}
                  className="text-white hover:bg-white/20"
                />
              </Tooltip>

              <Tooltip title="Thu xuống">
                <Button
                  type="text"
                  size="small"
                  icon={<MinusOutlined />}
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                    if (isExpanded) setIsExpanded(false);
                  }}
                  className="text-white hover:bg-white/20"
                />
              </Tooltip>

              <Tooltip title="Đóng">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={toggleChatbox}
                  className="text-white hover:bg-white/20"
                />
              </Tooltip>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                    <RobotOutlined className="text-5xl mb-3 text-purple-300" />
                    <p>Xin chào! Tôi có thể giúp bạn phân tích số liệu.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "bot" && (
                      <Avatar
                        icon={<RobotOutlined />}
                        className="bg-purple-500 shrink-0 mt-1"
                      />
                    )}

                    <div
                      className={`${isExpanded ? "max-w-[80%]" : "max-w-[95%]"} rounded-lg p-3 shadow-sm ${msg.sender === "user" ? "bg-blue-600 text-white" : msg.isError ? "bg-red-50 text-red-800" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      {renderMessageContent(msg)}
                      <span
                        className={`text-[10px] mt-1 block text-right ${msg.sender === "user" ? "text-blue-200" : "text-gray-400"}`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.sender === "user" && (
                      <Avatar
                        icon={<UserOutlined />}
                        className="bg-blue-600 shrink-0 mt-1"
                      />
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 items-center">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="bg-purple-500"
                    />
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <Spin size="small" />
                      <span className="ml-2 text-sm text-gray-500 italic">
                        Đang phân tích...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white shrink-0">
                <div className="flex gap-2">
                  <TextArea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập câu hỏi..."
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    disabled={loading}
                    className="flex-1 text-sm rounded-md"
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    disabled={!inputMessage.trim()}
                    className="self-end h-auto py-1 px-4"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      height: "32px",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbox;
