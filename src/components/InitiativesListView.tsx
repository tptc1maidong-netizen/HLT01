import React, { useState, useMemo } from 'react';
import { Idea, IdeaCategory, IdeaStatus, SecrecyLevel, CATEGORY_LABELS, STATUS_CONFIG, SECRECY_CONFIG, AdministrativeNode, Attachment } from '../types';

interface InitiativesListViewProps {
  ideas: Idea[];
  nodes?: AdministrativeNode[];
  selectedNodeFilter?: string;
  onChangeNodeFilter?: (nodeId: string) => void;
  onSelectIdea: (idea: Idea) => void;
  onOpenCreate: () => void;
  onExportPdf?: (idea: Idea) => void;
}

export function InitiativesListView({
  ideas,
  nodes = [],
  selectedNodeFilter = 'all',
  onChangeNodeFilter,
  onSelectIdea,
  onOpenCreate,
  onExportPdf
}: InitiativesListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [secrecyFilter, setSecrecyFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const activeNodeFilter = selectedNodeFilter;

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchSearch =
        idea.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.author.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.author.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idea.originNodeName && idea.originNodeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (idea.targetUnit && idea.targetUnit.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || idea.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || idea.category === categoryFilter;
      const matchSecrecy = secrecyFilter === 'all' || String(idea.secrecyLevel) === secrecyFilter;

      // Filter by specific unit node
      const matchUnit = activeNodeFilter === 'all' || 
        idea.originNodeId === activeNodeFilter || 
        (activeNodeFilter === 'NODE-TRUONG-T01' && (idea.originNodeId === 'NODE-TRUONG-T01' || idea.author.unit.includes('T01') || idea.author.unit.includes('Học viện An ninh')));

      // Filter by administrative echelon
      let matchTier = true;
      if (tierFilter === 'cap_bo') {
        matchTier = (idea.originNodeId && idea.originNodeId.startsWith('NODE-BCA')) || idea.author.unit.includes('Cục') || idea.author.unit.includes('Bộ Công an');
      } else if (tierFilter === 'cap_tinh_tp') {
        matchTier = (idea.originNodeId && (idea.originNodeId.startsWith('NODE-TP') || idea.originNodeId.startsWith('NODE-TINH'))) || idea.author.unit.includes('Thành phố') || idea.author.unit.includes('tỉnh');
      } else if (tierFilter === 'cap_coso') {
        matchTier = idea.category === 'nghiepvu_coso' || idea.title.toLowerCase().includes('xã') || idea.title.toLowerCase().includes('phường') || idea.title.toLowerCase().includes('đội') || idea.description.toLowerCase().includes('xã, phường') || idea.author.department.toLowerCase().includes('công an xã') || idea.author.department.toLowerCase().includes('đội');
      } else if (tierFilter === 'cap_truong') {
        matchTier = (idea.originNodeId && idea.originNodeId.startsWith('NODE-TRUONG')) || idea.author.unit.includes('Học viện') || idea.author.unit.includes('Trường');
      }

      return matchSearch && matchStatus && matchCategory && matchSecrecy && matchUnit && matchTier;
    });
  }, [ideas, searchTerm, statusFilter, categoryFilter, secrecyFilter, activeNodeFilter, tierFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSecrecyFilter('all');
    setTierFilter('all');
    onChangeNodeFilter?.('all');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
            DANH MỤC SÁNG KIẾN CHUYỂN ĐỔI SỐ CAND
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu, theo dõi tiến độ và quản lý hồ sơ sáng kiến công nghệ toàn lực lượng CAND
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>+ ĐĂNG KÝ SÁNG KIẾN MỚI</span>
        </button>
      </div>

      {/* Active Node Filter Indicator Banner */}
      {activeNodeFilter !== 'all' && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs flex items-center justify-between text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              Lọc theo đơn vị quản trị
            </span>
            <span>
              Đang hiển thị sáng kiến thuộc: <strong>{nodes.find(n => n.id === activeNodeFilter)?.name || activeNodeFilter}</strong>
            </span>
          </div>
          <button
            onClick={() => onChangeNodeFilter?.('all')}
            className="text-xs font-bold text-slate-900 hover:text-amber-800 underline cursor-pointer"
          >
            ✕ Xem tất cả đơn vị
          </button>
        </div>
      )}

      {/* Filter & Search Controls - Zero-pill discipline */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Live Search Input */}
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Nhập mã, từ khóa, tên cán bộ, đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            />
          </div>

          {/* Administrative Echelon Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Cấp hành chính
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            >
              <option value="all">Tất cả cấp quản lý</option>
              <option value="cap_bo">Cấp 1: Cơ quan Bộ Công an</option>
              <option value="cap_tinh_tp">Cấp 2: Tỉnh / TP trực thuộc TW</option>
              <option value="cap_coso">Cấp 3: Cơ sở Xã/Phường & Đội nghiệp vụ</option>
              <option value="cap_truong">Cấp Trường: Khối Học viện & Trường CAND</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Trạng thái xử lý
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="submitted">Chờ tiếp nhận</option>
              <option value="reviewing">Đang thẩm định</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="in_progress">Đang triển khai</option>
              <option value="completed">Đã nghiệm thu</option>
              <option value="revision_requested">Yêu cầu hiệu chỉnh</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lĩnh vực công tác
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            >
              <option value="all">Tất cả lĩnh vực</option>
              <option value="csdl_dancu">Đề án 06 & VNeID</option>
              <option value="anninh_mang">An ninh mạng & Giám sát</option>
              <option value="dichvu_cong">Dịch vụ công & TTHC</option>
              <option value="nghiepvu_coso">Nghiệp vụ cơ sở (Xã/Phường)</option>
              <option value="thietbi_chuyendung">Thiết bị & Viễn thông</option>
              <option value="giaoduc_chinhtri">Đào tạo & Chính trị CAND</option>
            </select>
          </div>

          {/* Secrecy Level Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Mức độ bảo mật
            </label>
            <select
              value={secrecyFilter}
              onChange={(e) => setSecrecyFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            >
              <option value="all">Tất cả cấp độ mật</option>
              <option value="0">Thông thường</option>
              <option value="1">Tài liệu nội bộ</option>
              <option value="2">Mật</option>
              <option value="3">Tối mật</option>
            </select>
          </div>

        </div>

        {/* Filter status summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Hiển thị <span className="font-mono font-semibold text-slate-900">{filteredIdeas.length}</span> / {ideas.length} sáng kiến
          </div>
          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || secrecyFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Initiatives Data Grid */}
      {filteredIdeas.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="text-slate-400 font-mono text-sm">Không tìm thấy sáng kiến phù hợp</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có kết quả nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Bạn có thể xóa bộ lọc hoặc khởi tạo một đề xuất sáng kiến mới.
          </p>
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded mr-2"
            >
              Đặt lại bộ lọc
            </button>
            <button
              onClick={onOpenCreate}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded"
            >
              Tạo đề xuất mới
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4 w-36">MÃ SÁNG KIẾN</th>
                  <th className="py-3 px-4">TÊN ĐỀ XUẤT & NỘI DUNG TÓM LƯỢC</th>
                  <th className="py-3 px-4 w-52">CÁN BỘ ĐỀ XUẤT / ĐƠN VỊ</th>
                  <th className="py-3 px-4 w-44">LĨNH VỰC</th>
                  <th className="py-3 px-4 w-32">TRẠNG THÁI</th>
                  <th className="py-3 px-4 w-28 text-right">TIẾN ĐỘ</th>
                  <th className="py-3 px-4 w-28 text-right">BÁO CÁO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIdeas.map((idea: Idea) => {
                  const cat = CATEGORY_LABELS[idea.category];
                  const statusCfg = STATUS_CONFIG[idea.status];
                  const secrecyCfg = SECRECY_CONFIG[idea.secrecyLevel];

                  return (
                    <tr
                      key={idea.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Code & Secrecy */}
                      <td className="py-3 px-4 align-top cursor-pointer" onClick={() => onSelectIdea(idea)}>
                        <div className="font-mono font-bold text-slate-900">{idea.id}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {secrecyCfg.badge}
                        </div>
                      </td>

                      {/* Title & Abstract */}
                      <td className="py-3 px-4 align-top cursor-pointer" onClick={() => onSelectIdea(idea)}>
                        <div className="font-semibold text-slate-900 leading-snug">
                          {idea.title}
                        </div>
                        <div className="text-slate-500 text-[11px] line-clamp-2 mt-1">
                          {idea.abstract}
                        </div>
                        {idea.attachments.length > 0 && (
                          <div className="text-[11px] mt-1.5 flex flex-wrap items-center gap-1.5 font-mono">
                            <span className="text-slate-500 font-medium">{idea.attachments.length} tệp đính kèm:</span>
                            {idea.attachments.map((a: Attachment, idx: number) => {
                              const ext = (a.extension || a.filename.split('.').pop() || '').toLowerCase();
                              const isWord = ext === 'doc' || ext === 'docx';
                              return (
                                <span
                                  key={idx}
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    isWord
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                      : 'bg-red-100 text-red-700 border border-red-200'
                                  }`}
                                  title={`${a.filename} (${a.size})`}
                                >
                                  {isWord ? 'DOCX' : 'PDF'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Author & Unit */}
                      <td className="py-3 px-4 align-top cursor-pointer" onClick={() => onSelectIdea(idea)}>
                        <div className="font-medium text-slate-900">
                          {[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5" title={idea.originNodeName || idea.author.unit}>
                          {idea.originNodeName || idea.author.unit}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 align-top cursor-pointer" onClick={() => onSelectIdea(idea)}>
                        <div className="text-slate-700 font-medium">
                          {cat.short}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 align-top cursor-pointer" onClick={() => onSelectIdea(idea)}>
                        <div className={`font-semibold ${statusCfg.color}`}>
                          {statusCfg.label}
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4 align-top text-right cursor-pointer" onClick={() => onSelectIdea(idea)}>
                        <div className="font-mono tabular-nums font-semibold text-slate-900">
                          {idea.progressPercentage}%
                        </div>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden ml-auto mt-1">
                          <div
                            className="bg-slate-800 h-1.5 rounded-full"
                            style={{ width: `${idea.progressPercentage}%` }}
                          />
                        </div>
                      </td>

                      {/* Actions: View & Export PDF */}
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onExportPdf?.(idea);
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-bold whitespace-nowrap transition-colors"
                            title="Xuất báo cáo PDF chuẩn mẫu Cục Chuyển đổi số"
                          >
                            Xuất PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
