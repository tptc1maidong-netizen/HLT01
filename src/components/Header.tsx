import React from 'react';
import { CANDEmblem } from './CANDIcons';
import { User, UserRole, AdministrativeNode } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingSyncCount: number;
  onOpenCreateModal: () => void;
  activeNode?: AdministrativeNode;
  onOpenAuthorModal?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onSelectRole,
  isOffline,
  setIsOffline,
  pendingSyncCount,
  onOpenCreateModal,
  activeNode,
  onOpenAuthorModal
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <CANDEmblem className="w-9 h-9 shrink-0" />
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="text-left font-bold tracking-tight text-base sm:text-lg text-amber-400 whitespace-nowrap hover:text-amber-300 transition-colors"
          >
            QUẢN TRỊ SÁNG KIẾN SỐ CAND
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              activeTab === 'dashboard' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''
            }`}
          >
            BẢNG ĐIỀU KHIỂN
          </button>
          <button
            onClick={() => setActiveTab('initiatives')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              activeTab === 'initiatives' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''
            }`}
          >
            DANH MỤC SÁNG KIẾN
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              activeTab === 'review' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''
            }`}
          >
            THẨM ĐỊNH & PHÊ DUYỆT
          </button>
          <button
            onClick={() => setActiveTab('delegation')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              activeTab === 'delegation' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''
            }`}
          >
            PHÂN QUYỀN ĐƠN VỊ (51)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              activeTab === 'architecture' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''
            }`}
          >
            KIẾN TRÚC & BÁO CÁO
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors ${
              activeTab === 'audit' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''
            }`}
          >
            NHẬT KÝ KIỂM TOÁN
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            ĐĂNG KÝ SÁNG KIẾN
          </button>
        </div>
      </div>

      {/* Sub-bar: Institutional Trust & Security State (RBAC, VNeID, Network State) */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* User Profile with VNeID / Rank */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Cán bộ:</span>
            <span className="font-semibold text-slate-200">
              {[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 truncate max-w-xs">{currentUser.unit}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-mono text-[11px]">VNeID: {currentUser.vneidNumber}</span>
          </div>

          {/* Active Administrative Node Badge */}
          {activeNode && (
            <button
              onClick={() => setActiveTab('delegation')}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] transition-colors cursor-pointer"
              title="Nhấp để đổi đơn vị quản trị trong 51 đầu mối toàn quốc"
            >
              <span className="text-slate-400">Đơn vị:</span>
              <span className="font-mono font-bold text-amber-400">{activeNode.code}</span>
              <span className="text-slate-500">/</span>
              <span className="font-medium text-slate-200 truncate max-w-[150px]">{activeNode.name}</span>
            </button>
          )}

          {/* Software Author Credit Badge */}
          <button
            onClick={onOpenAuthorModal}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/60 rounded text-[11px] text-amber-300 transition-colors cursor-pointer"
            title="Nhấp để xem đầy đủ thông tin tác giả TRẦN NGUYỄN HUY LONG - Học viện An ninh nhân dân (085.668.2005)"
          >
            <span className="text-amber-400 font-semibold">Tác giả phần mềm:</span>
            <span className="font-bold text-amber-200">TRẦN NGUYỄN HUY LONG</span>
            <span className="hidden sm:inline text-amber-500">·</span>
            <span className="hidden sm:inline">085.668.2005</span>
            <span className="hidden lg:inline text-amber-500">·</span>
            <span className="hidden lg:inline text-amber-300 font-medium">Học viện An ninh nhân dân</span>
          </button>

          {/* Interactive Role Switcher & Network Toggle */}
          <div className="flex items-center gap-4">
            {/* RBAC Role Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Vai trò RBAC:</span>
              <select
                value={currentUser.role}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-slate-800 text-amber-300 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
              >
                <option value="can_bo">Cán bộ cơ sở (Tác giả)</option>
                <option value="chuyen_vien">Chuyên viên thẩm định</option>
                <option value="lanh_dao">Lãnh đạo phê duyệt</option>
                <option value="admin">Quản trị viên (A05)</option>
              </select>
            </div>

            {/* Offline/Online Network Simulation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOffline(!isOffline)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
                  isOffline
                    ? 'bg-amber-950/50 border-amber-600 text-amber-400 hover:bg-amber-900/50'
                    : 'bg-emerald-950/50 border-emerald-700 text-emerald-400 hover:bg-emerald-900/50'
                }`}
                title={isOffline ? 'Đang mô phỏng Ngoại tuyến (Offline-First)' : 'Mạng nội bộ chuyên dùng MPLS CAND (Trực tuyến)'}
              >
                <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>{isOffline ? 'Chế độ Ngoại tuyến (Offline)' : 'Mạng MPLS CAND'}</span>
              </button>

              {pendingSyncCount > 0 && (
                <span className="text-[11px] font-mono text-amber-400">
                  {pendingSyncCount} hồ sơ chờ đồng bộ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
