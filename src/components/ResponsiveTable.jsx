import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

/**
 * ResponsiveTable - Component bảng responsive cho mobile/tablet
 *
 * @param {Array} columns - Mảng cấu hình cột: [{ key: string, label: string, render?: function }]
 * @param {Array} data - Mảng dữ liệu để hiển thị
 * @param {number} itemsPerPage - Số item mỗi trang (mặc định: 10)
 * @param {boolean} searchable - Cho phép tìm kiếm (mặc định: true)
 * @param {string} searchPlaceholder - Placeholder cho ô tìm kiếm
 * @param {function} onRowClick - Callback khi click vào hàng
 * @param {function} renderActions - Function render actions riêng cho mobile (nhận record làm tham số)
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  itemsPerPage = 10,
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  onRowClick = null,
  renderActions = null,
  loading = false,
  pagination = null,
  onPaginationChange = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((col) => {
      const value = row[col.key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4 flex items-center bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearch}
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700"
          />
        </div>
      )}

      {/* Desktop Table View - Ẩn trên mobile */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row)}
                  className={`hover:bg-slate-50 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-slate-700"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View - Chỉ hiện trên mobile */}
      <div className="md:hidden space-y-3">
        {currentData.length > 0 ? (
          currentData.map((row, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
            >
              {/* Card content - clickable area */}
              <div
                onClick={() => handleRowClick(row)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {columns
                  .filter((col) => col.key !== "action") // Loại bỏ cột action khỏi card content
                  .map((col) => (
                    <div
                      key={col.key}
                      className="flex justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-xs font-semibold text-slate-600 uppercase">
                        {col.label}
                      </span>
                      <span className="text-sm text-slate-800 text-right ml-4">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Actions - separate area, no onClick propagation */}
              {renderActions && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {renderActions(row)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            Không có dữ liệu
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {/* Info */}
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, filteredData.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{filteredData.length}</span>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Chỉ hiển thị 5 trang gần nhất
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-[#1890ff] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                },
              )}
            </div>

            {/* Mobile: Chỉ hiện số trang hiện tại */}
            <div className="sm:hidden text-sm text-slate-600 font-medium">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;
