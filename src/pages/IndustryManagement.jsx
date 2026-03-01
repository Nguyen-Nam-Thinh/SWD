import { Modal, message, Button, Tag, Space, Input, Table } from "antd";
import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import industryService from "../services/industryService";
import IndustryModal from "../components/industry/IndustryModal";
import authService from "../services/authService"; // THÊM IMPORT NÀY

const { Search } = Input;

const IndustryManagement = () => {
    // Lấy thông tin user để phân quyền
    const user = authService.getUserData();
    const isAdmin = user?.role === "Admin"; // Kiểm tra xem có phải Admin không

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [industries, setIndustries] = useState([]);
    const [editingIndustry, setEditingIndustry] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const loadIndustries = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const data = await industryService.getIndustries({
                pageNumber: page,
                pageSize: pageSize,
                SearchTerm: search,
            });
            setIndustries(data.items || []);
            setPagination({ current: page, pageSize: pageSize, total: data.totalCount });
        } catch (error) {
            message.error("Lỗi khi tải danh sách ngành");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIndustries();
    }, []);

    const handleSearch = (value) => {
        setSearchTerm(value);
        loadIndustries(1, pagination.pageSize, value);
    };

    const handleTableChange = (newPagination) => {
        loadIndustries(newPagination.current, newPagination.pageSize, searchTerm);
    };

    const handleEdit = async (record) => {
        try {
            const detail = await industryService.getIndustryById(record.id);
            setEditingIndustry(detail);
            setIsModalOpen(true);
        } catch (error) {
            message.error("Không thể tải thông tin");
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc muốn xóa ngành ${record.code}?`,
            okText: "Xóa",
            okType: "danger",
            onOk: async () => {
                try {
                    await industryService.deleteIndustry(record.id);
                    message.success("Xóa thành công");
                    loadIndustries(pagination.current, pagination.pageSize, searchTerm);
                } catch (error) {
                    message.error("Xóa thất bại");
                }
            },
        });
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (editingIndustry) {
                await industryService.updateIndustry(editingIndustry.id, values);
                message.success("Cập nhật thành công");
            } else {
                await industryService.createIndustry(values);
                message.success("Thêm mới thành công");
            }
            setIsModalOpen(false);
            loadIndustries(pagination.current, pagination.pageSize, searchTerm);
        } catch (error) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    // Khai báo cột mặc định
    let columns = [
        {
            title: "Mã Ngành",
            dataIndex: "code",
            key: "code",
            width: 150,
            render: text => <Tag color="blue" className="font-bold">{text}</Tag>
        },
        {
            title: "Tên Tiếng Việt",
            dataIndex: "nameVi",
            key: "nameVi",
            className: "font-semibold"
        },
        {
            title: "Tên Tiếng Anh",
            dataIndex: "nameEn",
            key: "nameEn",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true
        }
    ];

    // Nếu là Admin thì Push thêm cột Hành động vào cuối mảng
    if (isAdmin) {
        columns.push({
            title: <div className="text-center">Hành động</div>,
            key: "action",
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} className="text-blue-600" onClick={() => handleEdit(record)} />
                    <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
                </Space>
            ),
        });
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Quản lý Ngành (Industry)</h2>
                <div className="flex gap-4">
                    <Search
                        placeholder="Tìm mã, tên ngành..."
                        onSearch={handleSearch}
                        style={{ width: 250 }}
                        allowClear
                    />

                    {/* Chỉ hiện nút Thêm nếu là Admin */}
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingIndustry(null); setIsModalOpen(true); }}>
                            Thêm Ngành
                        </Button>
                    )}
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={industries}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <IndustryModal
                open={isModalOpen}
                editingIndustry={editingIndustry}
                onSubmit={handleSubmit}
                onCancel={() => { setIsModalOpen(false); setEditingIndustry(null); }}
                loading={loading}
            />
        </div>
    );
};

export default IndustryManagement;