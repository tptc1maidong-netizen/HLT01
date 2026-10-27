import React, { useState, useMemo } from 'react';
import { AdministrativeNode, UnitCategory, Idea, User } from '../types';
import { ADMINISTRATIVE_NODES, UNIT_CATEGORY_CONFIG } from '../data/administrativeNodes';

interface UnitDelegationViewProps {
  nodes: AdministrativeNode[];
  activeNode: AdministrativeNode;
  ideas: Idea[];
  currentUser: User;
  onSelectActiveNode: (node: AdministrativeNode) => void;
  onSyncNode: (nodeId: string) => void;
  onSyncAllNodes: () => void;
  onRegenerateToken: (nodeId: string) => void;
  onOpenCreateForNode: (node: AdministrativeNode) => void;
  onViewNodeInitiatives?: (nodeId: string) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function UnitDelegationView({
  nodes,
  activeNode,
  ideas,
  currentUser,
  onSelectActiveNode,
  onSyncNode,
  onSyncAllNodes,
  onRegenerateToken,
  onOpenCreateForNode,
  onViewNodeInitiatives,
  onNotify
}: UnitDelegationViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedNode, setInspectedNode] = useState<AdministrativeNode | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isTokenRevealed, setIsTokenRevealed] = useState(false);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchCat = selectedCategory === 'all' || node.category === selectedCategory;
      const matchSearch =
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.contactPhone.includes(searchTerm);
      return matchCat && matchSearch;
    });
  }, [nodes, selectedCategory, searchTerm]);

  // Aggregate stats
  const totalNodes = nodes.length;
  const syncedCount = nodes.filter(n => n.syncStatus === 'SYNCED').length;
  const pendingCount = nodes.filter(n => n.syncStatus === 'PENDING').length;
  const offlineCount = nodes.filter(n => n.syncStatus === 'OFFLINE').length;
  const totalInitiativesContributed = nodes.reduce((acc, n) => acc + n.initiativesCount, 0);

  const canManageTokens = currentUser.role === 'admin' || currentUser.role === 'lanh_dao';

  const formatAdminTitle = (rank?: string, name?: string) => {
    if (!name) return rank || '';
    if (!rank) return name;
    if (name.toLowerCase().startsWith(rank.toLowerCase())) {
      return name;
    }
    return `${rank} ${name}`;
  };

  const handleCopyToken = (token: string) => {
    if (!canManageTokens) {
      onNotify?.('Hạn chế quyền hạn', 'Chỉ Quản trị viên hệ thống hoặc Lãnh đạo mới có quyền sao chép Khóa CA.', 'warning');
      return;
    }
    navigator.clipboard.writeText(token);
    onNotify?.('Sao chép thành công', 'Đã sao chép Khóa chứng thực số CA của đơn vị.', 'info');
  };

  const handleRegenerateToken = (node: AdministrativeNode) => {
    if (!canManageTokens) {
      onNotify?.('Từ chối quyền hạn (RBAC)', 'Chỉ Quản trị viên hệ thống mới có quyền cấp lại Chứng thư số CA.', 'error');
      return;
    }
    onRegenerateToken(node.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            PHÂN HỆ QUẢN TRỊ PHÂN QUYỀN ĐƠN VỊ & CƠ CHẾ ĐỒNG BỘ TẬP TRUNG
          </div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
            MẠNG LƯỚI PHÂN QUYỀN CAND TOÀN QUỐC (51 ĐẦU MỐI)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô hình tinh gọn: Cấp 1 (Bộ Công an), Cấp 2 (34 Tỉnh/Thành phố TW đồng bộ trực tiếp Cấp 3 cơ sở Xã/Phường/Đội nghiệp vụ) và Cấp Trường (Khối Học viện, Trường CAND)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenCreateForNode(activeNode)}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
          >
            <span>+ NHẬP DỮ LIỆU CHO {activeNode.code}</span>
          </button>

          <button
            onClick={onSyncAllNodes}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.75a.75.75 0 00-.75.75v4.482a.75.75 0 001.5 0v-2.186l.543.543a7 7 0 1010.269-3.444.75.75 0 00-.75-.75z" clipRule="evenodd" />
            </svg>
            <span>ĐỒNG BỘ TOÀN MẠNG ({totalNodes} NÚT)</span>
          </button>
        </div>
      </div>

      {/* Software Author Technical Attribution Banner */}
      <div className="p-3 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-[10px] uppercase rounded">
            Tác giả phần mềm
          </span>
          <span className="font-extrabold text-slate-900 text-xs">
            TRẦN NGUYỄN HUY LONG
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-700 font-semibold">Học viện An ninh nhân dân</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">Điện thoại hỗ trợ kỹ thuật:</span>
          <a href="tel:0856682005" className="font-mono font-bold text-amber-900 hover:underline">
            085.668.2005
          </a>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Phần mềm tổng hợp chuẩn Cục Chuyển đổi số CAND © 2026
        </div>
      </div>

      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Tổng đầu mối CAND</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            {totalNodes} <span className="text-xs font-normal text-slate-500">nút mạng</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">28 Tỉnh · 6 TP · Bộ · Trường</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Trực tuyến / Đã đồng bộ</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
            {syncedCount} / {totalNodes}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">
            {Math.round((syncedCount / totalNodes) * 100)}% sẵn sàng
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Đang chờ đồng bộ</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-600 mt-0.5">
            {pendingCount} <span className="text-xs font-normal text-slate-500">đơn vị</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Có dữ liệu mới tại chỗ</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Tạm ngắt kết nối (Offline)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-red-600 mt-0.5">
            {offlineCount} <span className="text-xs font-normal text-slate-500">địa bàn</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Đang hoạt động lưu đệm</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 md:col-span-1">
          <div className="text-[11px] text-slate-500 font-medium">Sáng kiến đã nhập</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            {totalInitiativesContributed} <span className="text-xs font-normal text-slate-500">hồ sơ</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tổng hợp toàn lực lượng</div>
        </div>
      </div>

      {/* ACTIVE UNIT CONTEXT WORKBENCH */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                Đơn vị đang thực hiện quản trị & nhập liệu:
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px]">
                {activeNode.code}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                activeNode.syncStatus === 'SYNCED'
                  ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800'
                  : activeNode.syncStatus === 'PENDING'
                  ? 'text-amber-300 bg-amber-950/80 border border-amber-800'
                  : 'text-red-300 bg-red-950/80 border border-red-800'
              }`}>
                {activeNode.syncStatus === 'SYNCED' ? 'ĐÃ ĐỒNG BỘ CSDL CHUNG' : activeNode.syncStatus === 'PENDING' ? 'CÓ DỮ LIỆU CHỜ ĐỒNG BỘ' : 'NGOẠI TUYẾN'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {activeNode.name}
            </h2>

            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <span>Quản trị viên: <strong className="text-white">{formatAdminTitle(activeNode.adminRank, activeNode.adminName)}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Điện thoại: <strong className="font-mono text-white">{activeNode.contactPhone}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Dải mạng nội bộ: <strong className="font-mono text-slate-400">{activeNode.ipRange}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Người dùng hoạt động: <strong className="font-mono text-amber-300">{activeNode.activeUsersCount} cán bộ</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenCreateForNode(activeNode)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <span>+ Nhập sáng kiến mới</span>
            </button>

            {(() => {
              const activeNodeIdeasCount = ideas.filter(i => i.originNodeId === activeNode.id).length;
              return (
                <button
                  onClick={() => onViewNodeInitiatives?.(activeNode.id)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-medium text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5"
                  title="Xem tất cả hồ sơ sáng kiến thuộc đơn vị này trong Danh mục"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 014 2.5h12A1.5 1.5 0 0117.5 4v12a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 16V4zm2.5 1a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h10a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5H5zm0 5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h10a.5.5 0 00.5-.5v-4a.5.5 0 00-.5-.5H5z" clipRule="evenodd" />
                  </svg>
                  <span>Xem hồ sơ đơn vị ({activeNodeIdeasCount})</span>
                </button>
              );
            })()}

            <button
              onClick={() => onSyncNode(activeNode.id)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.75a.75.75 0 00-.75.75v4.482a.75.75 0 001.5 0v-2.186l.543.543a7 7 0 1010.269-3.444.75.75 0 00-.75-.75z" clipRule="evenodd" />
              </svg>
              <span>Đồng bộ nút này</span>
            </button>

            <button
              onClick={() => {
                setInspectedNode(activeNode);
                setIsTokenModalOpen(true);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono text-xs rounded transition-colors whitespace-nowrap"
            >
              Quản lý Token CA
            </button>
          </div>
        </div>
      </div>

      {/* SƠ ĐỒ LIÊN KẾT & TỰ ĐỒNG BỘ DỮ LIỆU ĐA TẦNG LỰC LƯỢNG CAND */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              MÔ HÌNH TINH GỌN LỰC LƯỢNG & ĐỒNG BỘ TỰ ĐỘNG
            </div>
            <h3 className="text-sm font-bold uppercase text-slate-900">
              SƠ ĐỒ LIÊN THÔNG DỮ LIỆU ĐỒNG BỘ CÁC CẤP & KHỐI ĐÀO TẠO CAND
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Xóa bỏ hoàn toàn cấp trung gian Quận/Huyện/Thị xã; đồng bộ Cấp cơ sở (Xã/Phường/Thị trấn & Đội nghiệp vụ) trực tiếp vào Cấp 2 (Tỉnh/TP) thành Cấp 3; thiết lập Cấp Trường (Khối Học viện, Trường CAND).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-emerald-700">Đồng bộ tự động 2 chiều (Bidirectional Sync)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Cấp 1 */}
          <div className="p-3.5 bg-slate-900 text-white rounded-lg space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-400">CẤP 1: TRUNG TÂM BỘ</span>
              <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded font-mono text-[10px]">8 Đầu mối</span>
            </div>
            <div className="font-bold text-sm">Cơ quan Bộ Công an</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Các Cục, Viện nghiệp vụ (C06, A05, C08, C07, X03, H08, V01, K02...). Ban hành tiêu chuẩn dữ liệu, kiểm toán ATTT, thẩm định chuyên sâu và nhân rộng toàn quốc.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>CSDL Trung tâm</span>
              <span className="text-emerald-400 font-mono font-bold">Đồng bộ 100%</span>
            </div>
          </div>

          {/* Cấp 2 */}
          <div className="p-3.5 bg-blue-50 text-slate-900 rounded-lg space-y-2 border border-blue-200">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-blue-900">CẤP 2: TỈNH / THÀNH PHỐ TW</span>
              <span className="px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded font-mono text-[10px]">34 Đầu mối</span>
            </div>
            <div className="font-bold text-sm">6 TP trực thuộc TW & 28 Tỉnh</div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Hà Nội, TP.HCM, Hải Phòng, Quảng Ninh, Đà Nẵng... Trực tiếp điều phối kỹ thuật, cấp khóa Token CA và tiếp nhận đồng bộ từ Cấp 3 cơ sở (không qua trung gian).
            </p>
            <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-[10px] text-slate-600">
              <span>Đường truyền MPLS</span>
              <span className="text-blue-700 font-mono font-bold">34/34 Nút mạng</span>
            </div>
          </div>

          {/* Cấp 3 */}
          <div className="p-3.5 bg-emerald-50 text-slate-900 rounded-lg space-y-2 border border-emerald-200">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-900">CẤP 3: CƠ SỞ XÃ/PHƯỜNG & ĐỘI</span>
              <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono text-[10px]">10.598 Đơn vị</span>
            </div>
            <div className="font-bold text-sm">Công an Xã/Phường & Đội nghiệp vụ</div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Đồng bộ dữ liệu trực tiếp vào Cấp 2 Tỉnh/TP (đã xóa bỏ cấp Quận/Huyện). Hỗ trợ nhập liệu Offline-First lưu đệm cục bộ mã hóa AES-256, tự động đẩy CSDL khi có mạng.
            </p>
            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[10px] text-slate-600">
              <span>Đệm Offline-First</span>
              <span className="text-emerald-700 font-mono font-bold">Đồng bộ thẳng Cấp 2</span>
            </div>
          </div>

          {/* Cấp Trường Học viện, Trường */}
          <div className="p-3.5 bg-amber-50 text-slate-900 rounded-lg space-y-2 border border-amber-300">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-900">CẤP TRƯỜNG: HỌC VIỆN, TRƯỜNG CAND</span>
              <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-mono text-[10px]">9 Đầu mối</span>
            </div>
            <div className="font-bold text-sm">Khối Học viện & Trường CAND</div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              T01 (Học viện ANND), T02 (Học viện CSND), T03... Cấp chuyên biệt nghiên cứu lý luận, đào tạo nhân lực số, vườn ươm sáng kiến và chuyển giao công nghệ cho toàn lực lượng.
            </p>
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[10px] text-slate-600">
              <span>Vườn ươm công nghệ</span>
              <span className="text-amber-800 font-mono font-bold">9/9 Cơ sở đào tạo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm text-xs">
        {/* Category Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả ({totalNodes})
          </button>

          <button
            onClick={() => setSelectedCategory('thanh_pho_tw')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedCategory === 'thanh_pho_tw'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cấp 2: 6 Thành phố trực thuộc TW (6)
          </button>

          <button
            onClick={() => setSelectedCategory('tinh_dia_phuong')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedCategory === 'tinh_dia_phuong'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cấp 2: 28 Tỉnh địa phương (28)
          </button>

          <button
            onClick={() => setSelectedCategory('bo_cong_an')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedCategory === 'bo_cong_an'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cấp 1: Cơ quan Bộ Công an (8)
          </button>

          <button
            onClick={() => setSelectedCategory('truong_cand')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedCategory === 'truong_cand'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cấp Trường: Học viện & Trường CAND (9)
          </button>
        </div>

        {/* Live Search and Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tỉnh, mã, quản trị viên, điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            />
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span>Hiển thị <strong className="font-mono text-slate-900">{filteredNodes.length}</strong> đơn vị</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-500">Mã hóa kết nối mTLS & VPN MPLS</span>
          </div>
        </div>
      </div>

      {/* Main Administrative Nodes Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-64">ĐƠN VỊ QUẢN LÝ / ĐỊA PHƯƠNG</th>
                <th className="py-3 px-4 w-48">PHÂN CẤP</th>
                <th className="py-3 px-4 w-60">QUẢN TRỊ VIÊN PHỤ TRÁCH & SĐT</th>
                <th className="py-3 px-4 w-28 text-center">SÁNG KIẾN</th>
                <th className="py-3 px-4 w-32 text-center">CÁN BỘ ACTIVE</th>
                <th className="py-3 px-4 w-36">TRẠNG THÁI ĐỒNG BỘ</th>
                <th className="py-3 px-4 w-44 text-right">THAO TÁC QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNodes.map((node) => {
                const isActive = node.id === activeNode.id;
                const catCfg = UNIT_CATEGORY_CONFIG[node.category];

                return (
                  <tr
                    key={node.id}
                    className={`transition-colors ${
                      isActive ? 'bg-amber-50/70 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Unit Name & Code */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{node.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-bold rounded">
                            ĐANG CHỌN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Mã: {node.code}</span>
                        <span>·</span>
                        <span>IP: {node.ipRange}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-[11px] font-semibold">
                        {node.category === 'thanh_pho_tw' ? (
                          <span className="text-amber-800">Cấp 2: TP trực thuộc TW</span>
                        ) : node.category === 'tinh_dia_phuong' ? (
                          <span className="text-blue-800">Cấp 2: Tỉnh địa phương</span>
                        ) : node.category === 'bo_cong_an' ? (
                          <span className="text-red-800">Cấp 1: Cơ quan Bộ</span>
                        ) : (
                          <span className="text-emerald-800">Cấp Trường: Học viện, Trường</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {node.category === 'bo_cong_an'
                          ? 'Thẩm định & Chỉ đạo TW'
                          : node.category === 'truong_cand'
                          ? 'Vườn ươm công nghệ số'
                          : 'Đồng bộ trực tiếp Cấp 3 cơ sở'}
                      </div>
                    </td>

                    {/* Admin Name & Phone */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-slate-900 font-medium">
                        {formatAdminTitle(node.adminRank, node.adminName)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        <a href={`tel:${node.contactPhone.replace(/[^0-9]/g, '')}`} className="hover:text-blue-700">
                          {node.contactPhone}
                        </a>
                      </div>
                    </td>

                    {/* Initiatives Count */}
                    <td className="py-3 px-4 align-top text-center font-mono tabular-nums">
                      <button
                        onClick={() => onViewNodeInitiatives?.(node.id)}
                        className="hover:underline font-bold text-slate-900 text-xs block mx-auto cursor-pointer"
                        title="Xem sáng kiến thuộc đơn vị này"
                      >
                        {node.initiativesCount}
                      </button>
                      {(() => {
                        const liveCount = ideas.filter(i => i.originNodeId === node.id).length;
                        return (
                          <button
                            onClick={() => onViewNodeInitiatives?.(node.id)}
                            className={`text-[10px] mt-0.5 block mx-auto hover:underline cursor-pointer ${liveCount > 0 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}
                            title="Lọc xem hồ sơ trong danh mục"
                          >
                            {liveCount > 0 ? `(${liveCount} hồ sơ số)` : '(chưa có hồ sơ)'}
                          </button>
                        );
                      })()}
                    </td>

                    {/* Active Users Count */}
                    <td className="py-3 px-4 align-top text-center font-mono text-slate-600 tabular-nums">
                      {node.activeUsersCount}
                    </td>

                    {/* Sync Status */}
                    <td className="py-3 px-4 align-top">
                      <div className={`font-semibold text-[11px] ${
                        node.syncStatus === 'SYNCED'
                          ? 'text-emerald-700'
                          : node.syncStatus === 'PENDING'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}>
                        {node.syncStatus === 'SYNCED'
                          ? 'Đã đồng bộ'
                          : node.syncStatus === 'PENDING'
                          ? 'Chờ đồng bộ'
                          : 'Ngoại tuyến'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {new Date(node.lastSyncTime).toLocaleDateString('vi-VN')} {new Date(node.lastSyncTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isActive ? (
                          <button
                            onClick={() => {
                              onSelectActiveNode(node);
                              onNotify?.(
                                'Chuyển đơn vị quản trị',
                                `Đã chuyển ngữ cảnh quản trị sang: ${node.name}`,
                                'info'
                              );
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                            title="Chọn đơn vị này để nhập liệu và phân quyền"
                          >
                            Chọn quản trị
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenCreateForNode(node)}
                            className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded text-[11px] font-bold transition-colors whitespace-nowrap"
                          >
                            + Nhập liệu
                          </button>
                        )}

                        <button
                          onClick={() => onSyncNode(node.id)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] transition-colors whitespace-nowrap"
                          title="Đồng bộ dữ liệu của nút này lên CSDL Bộ"
                        >
                          Đồng bộ
                        </button>

                        <button
                          onClick={() => {
                            setInspectedNode(node);
                            setIsTokenRevealed(false);
                            setIsTokenModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px] font-mono transition-colors"
                          title="Xem chứng thư số Token CA"
                        >
                          Token
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

      {/* Token CA & Node Delegation Modal */}
      {isTokenModalOpen && inspectedNode && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="text-[11px] font-bold text-amber-600 uppercase">
                  Chứng Thư Số & Phân Quyền Quản Trị Đơn Vị
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  {inspectedNode.name} ({inspectedNode.code})
                </h3>
              </div>
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-mono"
              >
                ✕
              </button>
            </div>

            {/* Token Info */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Mã Token Xác Thực Ban Cơ Yếu (CA Security Token):</span>
                  {canManageTokens ? (
                    <button
                      onClick={() => setIsTokenRevealed(!isTokenRevealed)}
                      className="text-blue-700 hover:text-blue-900 text-[11px] font-semibold underline cursor-pointer"
                    >
                      {isTokenRevealed ? 'Che mã Token' : 'Hiện mã đầy đủ'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-semibold">(Đã che - Cần quyền Admin/Lãnh đạo)</span>
                  )}
                </div>
                <div className="p-2 bg-slate-900 text-amber-300 font-mono text-[11px] rounded break-all select-all flex items-center justify-between gap-2">
                  <span>
                    {isTokenRevealed && canManageTokens
                      ? inspectedNode.securityToken
                      : `CA-${inspectedNode.code}-••••-••••-BCA-SEC`}
                  </span>
                  {canManageTokens && (
                    <button
                      onClick={() => handleCopyToken(inspectedNode.securityToken)}
                      className="text-white hover:text-amber-200 text-xs shrink-0 font-sans font-bold underline"
                    >
                      Sao chép
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  * Dùng để tích hợp phần mềm nội bộ của đơn vị với API Gateway CSDL Quốc gia CAND qua mạng MPLS.
                </p>
              </div>

              {/* Live registered initiatives of this node */}
              {(() => {
                const nodeIdeas = ideas.filter(i => i.originNodeId === inspectedNode.id);
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Hồ sơ sáng kiến số hóa tại đơn vị ({nodeIdeas.length}):</span>
                      <span className="font-normal text-[10px] text-slate-500 font-mono">Đồng bộ CSDL Bộ</span>
                    </div>
                    {nodeIdeas.length === 0 ? (
                      <div className="text-slate-400 italic text-[11px]">Đơn vị chưa có hồ sơ sáng kiến nào được đăng ký trong đợt này.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {nodeIdeas.map(idea => (
                          <div key={idea.id} className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-slate-900 text-[10px] mr-1.5">{idea.id}</span>
                              <span className="truncate text-slate-700">{idea.title}</span>
                            </div>
                            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {idea.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {nodeIdeas.length > 0 && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            setIsTokenModalOpen(false);
                            onViewNodeInitiatives?.(inspectedNode.id);
                          }}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                        >
                          Mở xem tất cả {nodeIdeas.length} hồ sơ trong danh mục →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sub-account delegation details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="font-bold text-slate-900">Cán bộ quản trị và đầu mối liên hệ:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div>Họ tên: <strong className="text-slate-900">{inspectedNode.adminName}</strong></div>
                  <div>Cấp bậc: <strong className="text-slate-900">{inspectedNode.adminRank}</strong></div>
                  <div>Số điện thoại: <strong className="font-mono text-slate-900">{inspectedNode.contactPhone}</strong></div>
                  <div>Dải IP cấp phát: <strong className="font-mono text-slate-900">{inspectedNode.ipRange}</strong></div>
                </div>
              </div>

              {/* Security Policy Reminder */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] space-y-1">
                <div className="font-bold">Quy chế bảo mật thông tin nội bộ:</div>
                <p>
                  Mọi sáng kiến phát sinh tại đơn vị được mã hóa đầu cuối bằng khóa của đơn vị trước khi đồng bộ. Quản trị viên chịu trách nhiệm kiểm tra tính chính xác và phân loại độ mật của hồ sơ.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t flex items-center justify-between">
              <button
                onClick={() => handleRegenerateToken(inspectedNode)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-amber-900 rounded font-semibold text-xs transition-colors"
              >
                Cấp lại Token mới
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectActiveNode(inspectedNode);
                    setIsTokenModalOpen(false);
                    onNotify?.(
                      'Đã chuyển đơn vị quản trị',
                      `Đã kích hoạt quyền quản trị cho ${inspectedNode.name}`,
                      'success'
                    );
                  }}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs"
                >
                  Chọn làm đơn vị hiện tại
                </button>
                <button
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
