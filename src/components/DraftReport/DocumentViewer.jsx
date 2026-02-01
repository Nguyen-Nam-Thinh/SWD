import { useEffect, useState, useRef } from "react";
import { Spin, Empty } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import reportService from "../../services/reportService";

// Cấu hình worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const DocumentViewer = ({ reportId, activeMetadata }) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);
  const pageRefs = useRef({});

  // 1. Tải PDF
  useEffect(() => {
    if (!reportId) return;
    const fetchPdf = async () => {
      setLoading(true);
      try {
        const blob = await reportService.getReportFile(reportId);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Lỗi tải PDF:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPdf();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [reportId]);

  // 2. Responsive Width
  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width - 32);
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // 3. Auto Scroll
  useEffect(() => {
    if (activeMetadata && activeMetadata.pageNumber) {
      const pageNum = activeMetadata.pageNumber;
      const pageElement = pageRefs.current[pageNum];

      if (pageElement) {
        setTimeout(() => {
          pageElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [activeMetadata]);

  // 4. Component Highlight Box (Đã nâng cấp logic Padding)
  const HighlightBox = ({ bbox }) => {
    if (!bbox) return null;

    try {
      const coords = JSON.parse(bbox);
      if (!Array.isArray(coords) || coords.length !== 4) return null;

      const [ymin, xmin, ymax, xmax] = coords;

      // --- CẤU HÌNH PADDING ---
      // 10 đơn vị trên thang 1000 tương đương 1% kích thước trang.
      // Điều chỉnh số này để ô to hơn hoặc nhỏ hơn.
      const PADDING_X = 10; // Nới rộng chiều ngang
      const PADDING_Y = 5; // Nới rộng chiều dọc

      // Tính toán toạ độ mới có Padding (Không vượt quá giới hạn 0-1000)
      const new_ymin = Math.max(0, ymin - PADDING_Y);
      const new_xmin = Math.max(0, xmin - PADDING_X);
      const new_ymax = Math.min(1000, ymax + PADDING_Y);
      const new_xmax = Math.min(1000, xmax + PADDING_X);

      // Tính % CSS dựa trên toạ độ mới
      const top = (new_ymin / 1000) * 100;
      const left = (new_xmin / 1000) * 100;
      const height = ((new_ymax - new_ymin) / 1000) * 100;
      const width = ((new_xmax - new_xmin) / 1000) * 100;

      const style = {
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        height: `${height}%`,
        width: `${width}%`,

        // Style hiển thị
        backgroundColor: "rgba(255, 255, 0, 0.25)", // Giảm độ đậm để nhìn rõ chữ bên dưới
        border: "2px solid #ff4d4f", // Viền đỏ rõ ràng
        zIndex: 50,
        borderRadius: "3px",
        pointerEvents: "none",
        boxShadow: "0 0 0 1px rgba(255, 77, 79, 0.3)", // Thêm viền mờ bên ngoài cho nổi bật
      };

      return <div className="highlight-box animate-pulse" style={style} />;
    } catch (error) {
      console.error("BBox Error:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!pdfUrl) {
    return <Empty description="Chưa có tài liệu" className="mt-20" />;
  }

  return (
    <div
      className="h-full w-full bg-gray-500 overflow-y-auto p-1 md:p-4"
      ref={containerRef}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Spin />}
        className="flex flex-col items-center gap-2 md:gap-4"
      >
        {numPages &&
          Array.from(new Array(numPages), (el, index) => {
            const pageNumber = index + 1;
            const isTargetPage = activeMetadata?.pageNumber === pageNumber;

            return (
              <div
                key={pageNumber}
                ref={(el) => (pageRefs.current[pageNumber] = el)}
                className="relative shadow-lg"
              >
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={isMobile ? 0.75 : 1.0}
                >
                  {/* Chỉ vẽ Highlight nếu đúng trang */}
                  {isTargetPage && activeMetadata.boundingBox && (
                    <HighlightBox bbox={activeMetadata.boundingBox} />
                  )}
                </Page>

                <div className="absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 bg-black/50 text-white text-[10px] md:text-xs px-1 md:px-2 py-0.5 rounded">
                  Trang {pageNumber}
                </div>
              </div>
            );
          })}
      </Document>
    </div>
  );
};

export default DocumentViewer;
