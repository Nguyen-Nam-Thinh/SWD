import { Modal, message, Button, Tag, Space, Input, Table } from "antd";
import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import metricGroupService from "../services/metricGroupService";
import MetricGroupModal from "../components/metricGroup/MetricGroupModal";

const { Search } = Input;

const MetricGroupManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [editingGroup, setEditingGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const loadGroups = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const data = await metricGroupService.getMetricGroups({
                pageNumber: page,
                pageSize: pageSize,
                SearchTerm: search,
            });
            setGroups(data.items || []);
            setPagination({ current: page, pageSize: pageSize, total: data.totalCount });
        } catch (error) {
            message.error("Lỗi khi tải danh sách nhóm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, []);

    const handleTableChange = (newPagination) => {
        loadGroups(newPagination.current, newPagination.pageSize, searchTerm);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: `Xóa nhóm: ${record.groupName}?`,
            okType: "danger",
            onOk: async () => {
                try {
                    await metricGroupService.deleteMetricGroup(record.id);
                    message.success("Đã xóa");
                    loadGroups(pagination.current, pagination.pageSize, searchTerm);
                } catch (error) {
                    message.error("Xóa thất bại");
                }
            },
        });
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (editingGroup) {
                await metricGroupService.updateMetricGroup(editingGroup.id, values);
                message.success("Đã cập nhật");
            } else {
                await metricGroupService.createMetricGroup(values);
                message.success("Đã thêm mới");
            }
            setIsModalOpen(false);
            loadGroups(pagination.current, pagination.pageSize, searchTerm);
        } catch (error) {
            message.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Tên Nhóm",
            dataIndex: "groupName",
            key: "groupName",
            className: "font-semibold"
        },
        {
            title: "Thứ tự hiển thị",
            dataIndex: "displayOrder",
            key: "displayOrder",
            width: 150,
            align: 'center',
            render: val => <Tag color="purple">{val}</Tag>
        },
        {
            title: <div className="text-center">Hành động</div>,
            key: "action",
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} className="text-blue-600" onClick={() => { setEditingGroup(record); setIsModalOpen(true); }} />
                    <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
                </Space>
            ),
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Nhóm Chỉ Số (Metric Groups)</h2>
                <div className="flex gap-4">
                    <Search
                        placeholder="Tìm tên nhóm..."
                        onSearch={val => { setSearchTerm(val); loadGroups(1, pagination.pageSize, val); }}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}>
                        Thêm Nhóm
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={groups}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <MetricGroupModal
                open={isModalOpen}
                editingGroup={editingGroup}
                onSubmit={handleSubmit}
                onCancel={() => { setIsModalOpen(false); setEditingGroup(null); }}
                loading={loading}
            />
        </div>
    );
};

export default MetricGroupManagement;