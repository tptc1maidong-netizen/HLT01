import React, { useState, useMemo } from 'react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export function AuditLogView({ logs }: AuditLogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.ipAddress.includes(searchTerm) ||
        l.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || l.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['Mã log', 'Thời gian', 'Cán bộ', 'Hành động', 'Đối tượng', 'IP', 'Trạng thái', 'Chi tiết'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.action,
      l.entityId,
      l.ipAddress,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nhat_ky_kiem_toan_CAND_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
            NHẬT KÝ KIỂM TOÁN & GIÁM SÁT AN NINH (AUDIT TRAIL)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi vết bất biến mọi hành vi nghiệp vụ, tuân thủ tiêu chuẩn ISO/IEC 27001 và Luật An ninh mạng 2025
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          XUẤT TỆP KIỂM TOÁN CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tìm kiếm bản ghi
            </label>
            <input
              type="text"
              placeholder="Nhập mã log, tên cán bộ, hành động, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:outline-none focus:border-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Trạng thái kiểm tra
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:outline-none focus:border-slate-800 focus:bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="WARNING">Cảnh báo (WARNING)</option>
              <option value="DENIED">Từ chối truy cập (DENIED)</option>
            </select>
          </div>

        </div>

        <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-100 flex items-center justify-between">
          <span>Tìm thấy <strong className="font-mono text-slate-900">{filteredLogs.length}</strong> bản ghi sự kiện</span>
          <span className="font-mono text-slate-400">Thuật toán băm lưu vết: SHA-256</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-44">THỜI GIAN (ISO 8601)</th>
                <th className="py-3 px-4 w-48">CÁN BỘ THỰC HIỆN</th>
                <th className="py-3 px-4 w-44">HÀNH ĐỘNG NGHIỆP VỤ</th>
                <th className="py-3 px-4 w-32">ĐỊA CHỈ IP</th>
                <th className="py-3 px-4 w-28">KẾT QUẢ</th>
                <th className="py-3 px-4">CHI TIẾT THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="py-3 px-4 align-top font-mono text-[11px] text-slate-600 tabular-nums">
                    <div>{new Date(log.timestamp).toLocaleDateString('vi-VN')}</div>
                    <div className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</div>
                  </td>

                  {/* Officer */}
                  <td className="py-3 px-4 align-top font-medium text-slate-900">
                    <div>{log.userName}</div>
                    <div className="font-mono text-[11px] text-slate-400">{log.userId}</div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 align-top">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {log.action}
                    </span>
                    {log.entityId && (
                      <div className="font-mono text-[10px] text-slate-500">
                        {log.entityId}
                      </div>
                    )}
                  </td>

                  {/* IP */}
                  <td className="py-3 px-4 align-top font-mono text-slate-600">
                    {log.ipAddress}
                  </td>

                  {/* Result */}
                  <td className="py-3 px-4 align-top font-mono font-semibold text-[11px]">
                    <span
                      className={
                        log.status === 'SUCCESS'
                          ? 'text-emerald-700'
                          : log.status === 'WARNING'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }
                    >
                      {log.status}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="py-3 px-4 align-top text-slate-600 text-[11px] leading-relaxed">
                    {log.details}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
