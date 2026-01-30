import React from "react";

const FinancialChart = () => {
  // Link nhúng của Looker Studio Dashboard
  const embedUrl =
    "https://lookerstudio.google.com/embed/reporting/8f05b604-1e18-47ea-bfaf-f941a5ed22d3/page/rGxmF";

  return (
    <div className="w-full h-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Biểu đồ Phân tích Tài chính
      </h2>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100vh - 250px)",
          minHeight: "600px",
          overflow: "hidden",
        }}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          title="Financial Report Dashboard"
        ></iframe>
      </div>
    </div>
  );
};

export default FinancialChart;
