import React, { useState, useMemo } from 'react';
import { Idea, SystemMetrics, CATEGORY_LABELS, STATUS_CONFIG, SECRECY_CONFIG, UserRole, AdministrativeNode } from '../types';
import { ADMINISTRATIVE_NODES } from '../data/administrativeNodes';
import { CANDEmblem } from './CANDIcons';

interface DashboardViewProps {
  ideas: Idea[];
  metrics: SystemMetrics;
  nodes?: AdministrativeNode[];
  onSelectIdea: (idea: Idea) => void;
  onOpenCreate: () => void;
  currentUserRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onFilterByUnitCategory?: (category: 'bo_cong_an' | 'dia_phuong' | 'truong_cand') => void;
}

export function DashboardView({
  ideas,
  metrics,
  nodes,
  onSelectIdea,
  onOpenCreate,
  currentUserRole,
  onNavigateTab,
  onFilterByUnitCategory
}: DashboardViewProps) {
  const [chartMetric, setChartMetric] = useState<'initiatives' | 'approved' | 'users'>('initiatives');
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<'truong_cand' | 'dia_phuong' | 'bo_cong_an' | null>(null);

  const allNodes = nodes && nodes.length > 0 ? nodes : ADMINISTRATIVE_NODES;

  // Group comparative stats
  const groupStats = useMemo(() => {
    // 1. Học viện & Trường CAND (9 units)
    const truongNodes = allNodes.filter(n => n.category === 'truong_cand');
    const truongBase = truongNodes.reduce((acc, n) => acc + n.initiativesCount, 0); // 83
    const truongIdeas = ideas.filter(i => (i.originNodeId && i.originNodeId.startsWith('NODE-TRUONG')) || i.author.unit.includes('Học viện') || i.author.unit.includes('Trường'));
    const truongApproved = truongIdeas.filter(i => i.status === 'approved' || i.status === 'in_progress' || i.status === 'completed').length;
    const truongUsers = truongNodes.reduce((acc, n) => acc + n.activeUsersCount, 0);

    // 2. Công an các Địa phương (6 TP TW + 28 Tỉnh = 34 units)
    const dpNodes = allNodes.filter(n => n.category === 'thanh_pho_tw' || n.category === 'tinh_dia_phuong');
    const dpBase = dpNodes.reduce((acc, n) => acc + n.initiativesCount, 0); // 197
    const dpIdeas = ideas.filter(i => (i.originNodeId && (i.originNodeId.startsWith('NODE-TP') || i.originNodeId.startsWith('NODE-TINH'))) || i.author.unit.includes('Thành phố') || i.author.unit.includes('tỉnh'));
    const dpApproved = dpIdeas.filter(i => i.status === 'approved' || i.status === 'in_progress' || i.status === 'completed').length;
    const dpUsers = dpNodes.reduce((acc, n) => acc + n.activeUsersCount, 0);

    // 3. Cơ quan Bộ Công an (8 Cục, Viện)
    const boNodes = allNodes.filter(n => n.category === 'bo_cong_an');
    const boBase = boNodes.reduce((acc, n) => acc + n.initiativesCount, 0); // 84
    const boIdeas = ideas.filter(i => (i.originNodeId && i.originNodeId.startsWith('NODE-BCA')) || i.author.unit.includes('Cục') || i.author.unit.includes('Bộ Công an'));
    const boApproved = boIdeas.filter(i => i.status === 'approved' || i.status === 'in_progress' || i.status === 'completed').length;
    const boUsers = boNodes.reduce((acc, n) => acc + n.activeUsersCount, 0);

    const totalAll = truongBase + dpBase + boBase; // 364
    const totalUsers = truongUsers + dpUsers + boUsers;

    return {
      truong: {
        id: 'truong_cand' as const,
        name: 'Học viện, Trường CAND',
        shortTitle: 'Khối Học viện & Trường CAND',
        badge: '9 Học viện / Trường',
        unitsCount: 9,
        initiatives: truongBase,
        approved: Math.round(truongBase * 0.88), // 73
        liveIdeas: truongIdeas.length,
        users: truongUsers,
        percent: Number(((truongBase / totalAll) * 100).toFixed(1)),
        leadUnit: 'Học viện An ninh nhân dân (T01)',
        leadCount: 16,
        color: 'emerald',
        barGradient: 'from-emerald-500 via-emerald-600 to-teal-700',
        lightBg: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-700',
        tagBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        focusDesc: 'Nghiên cứu khoa học công nghệ lõi, AI bảo mật, mật mã, sa bàn ảo PCCC, kiểm định ATTT'
      },
      dia_phuong: {
        id: 'dia_phuong' as const,
        name: 'Công an các Địa phương',
        shortTitle: 'Khối Công an Địa phương',
        badge: '34 Tỉnh / Thành phố',
        unitsCount: 34,
        initiatives: dpBase,
        approved: Math.round(dpBase * 0.76), // 150
        liveIdeas: dpIdeas.length,
        users: dpUsers,
        percent: Number(((dpBase / totalAll) * 100).toFixed(1)),
        leadUnit: 'Công an TP. Hồ Chí Minh & TP. Hà Nội',
        leadCount: 32,
        color: 'blue',
        barGradient: 'from-blue-500 via-blue-600 to-indigo-700',
        lightBg: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        tagBg: 'bg-blue-100 text-blue-900 border-blue-300',
        focusDesc: 'Số hóa cơ sở xã/phường, Camera AI giao thông & trật tự, Cải cách thủ tục Dịch vụ công VNeID'
      },
      bo_cong_an: {
        id: 'bo_cong_an' as const,
        name: 'Cơ quan Bộ Công an',
        shortTitle: 'Khối Cơ quan Bộ (Cục, Viện)',
        badge: '8 Cục / Viện nghiệp vụ',
        unitsCount: 8,
        initiatives: boBase,
        approved: Math.round(boBase * 0.82), // 69
        liveIdeas: boIdeas.length,
        users: boUsers,
        percent: Number(((boBase / totalAll) * 100).toFixed(1)),
        leadUnit: 'Cục Cảnh sát QLHC C06 & Cục A05',
        leadCount: 31,
        color: 'red',
        barGradient: 'from-red-500 via-red-600 to-rose-700',
        lightBg: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-700',
        tagBg: 'bg-red-100 text-red-900 border-red-300',
        focusDesc: 'Nền tảng dùng chung Đề án 06, Trung tâm CSDL Dân cư, Mạng MPLS bảo mật & SOC An ninh mạng'
      },
      totalAll,
      totalUsers
    };
  }, [allNodes, ideas]);

  // Category counts
  const categoryCounts = Object.keys(CATEGORY_LABELS).map((catKey) => {
    const key = catKey as keyof typeof CATEGORY_LABELS;
    const count = ideas.filter(i => i.category === key).length;
    return {
      key,
      ...CATEGORY_LABELS[key],
      count,
      percentage: Math.round((count / (ideas.length || 1)) * 100)
    };
  });

  // Action items requiring review
  const urgentQueue = ideas.filter(i => 
    i.status === 'submitted' || i.status === 'reviewing' || i.priority === 'urgent'
  ).slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 max-w-3xl">
            <CANDEmblem className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-md" />
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                Bộ Công An · Ban Chỉ Đạo Chuyển Đổi Số
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                HỆ THỐNG QUẢN TRỊ SÁNG KIẾN CHUYỂN ĐỔI SỐ CAND
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Mô hình tinh gọn lực lượng: Kết nối liên thông Cấp 1 (Cơ quan Bộ), Cấp 2 (Công an 34 Tỉnh/Thành phố TW), Cấp 3 (Cơ sở Xã/Phường/Thị trấn & Đội nghiệp vụ) và Cấp Trường (Học viện, Trường CAND); xóa bỏ cấp trung gian Quận/Huyện; đồng bộ dữ liệu hai chiều tự động theo Đề án 06 và Luật An ninh mạng 2025.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreate}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider text-xs rounded transition-colors whitespace-nowrap shadow"
            >
              + ĐĂNG KÝ SÁNG KIẾN MỚI
            </button>
            <button
              onClick={() => onNavigateTab('architecture')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded transition-colors whitespace-nowrap"
            >
              Báo cáo kỹ thuật & Kiến trúc
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip - Tabular numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Tổng đề xuất số</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics.totalInitiatives}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Toàn quốc năm 2026</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Đã phê duyệt</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {metrics.approvedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đạt {metrics.totalInitiatives > 0 ? ((metrics.approvedCount / metrics.totalInitiatives) * 100).toFixed(1) : 0}% tổng số
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Đang triển khai</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
            {metrics.inProgressCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Thử nghiệm tại địa phương</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Đã nhân rộng</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-600 mt-1">
            {metrics.completedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Áp dụng toàn lực lượng</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Tiết kiệm ngân sách</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
            {(metrics.totalBudgetSavedEst / 1000).toFixed(2)} <span className="text-xs font-normal">tỷ VNĐ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ước tính hiệu quả</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Thời gian xử lý</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics.avgResolutionDays} <span className="text-xs font-normal">ngày</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">-65% so với trước</div>
        </div>
      </div>

      {/* 51 Institutional Hubs Connectivity Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Trạng thái kết nối & Đồng bộ 51 Đầu mối CAND toàn quốc
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              100% Hoạt động
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('delegation')}
            className="text-xs text-amber-300 hover:text-white underline font-medium self-start md:self-auto cursor-pointer"
          >
            Xem chi tiết phân quyền & Chứng thư số (51 đơn vị) →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
          <div 
            onClick={() => onNavigateTab('delegation')} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <div className="text-[11px] text-amber-400 font-semibold">Cấp 1: Cơ quan Bộ</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {metrics.ministryUnitsConnected || 8}/8 <span className="text-[11px] font-normal text-slate-400">Cục/Viện</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">C06, A05, C01, C08, X03...</div>
          </div>

          <div 
            onClick={() => onNavigateTab('delegation')} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <div className="text-[11px] text-amber-400 font-semibold">Cấp 2: 6 TP trực thuộc TW</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {metrics.citiesConnected || 6}/6 <span className="text-[11px] font-normal text-slate-400">TP</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">Hà Nội, TP.HCM, Hải Phòng...</div>
          </div>

          <div 
            onClick={() => onNavigateTab('delegation')} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <div className="text-[11px] text-amber-400 font-semibold">Cấp 2: 28 Tỉnh địa phương</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {metrics.provincesConnected || 28}/28 <span className="text-[11px] font-normal text-slate-400">Tỉnh</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">Quảng Ninh, Nghệ An, Đắk Lắk...</div>
          </div>

          <div 
            onClick={() => onNavigateTab('delegation')} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <div className="text-[11px] text-emerald-400 font-semibold">Cấp 3: Cơ sở Xã/Phường & Đội</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {metrics.grassrootsUnitsConnected || metrics.wardsConnected || 10598} <span className="text-[11px] font-normal text-slate-400">Đơn vị</span>
            </div>
            <div className="text-[10px] text-emerald-300 truncate mt-0.5 font-medium">Đồng bộ trực tiếp Cấp 2 Tỉnh/TP</div>
          </div>

          <div 
            onClick={() => onNavigateTab('delegation')} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <div className="text-[11px] text-amber-300 font-semibold">Cấp Trường: Học viện, Trường</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {metrics.academiesConnected || 9}/9 <span className="text-[11px] font-normal text-slate-400">Trường</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">T01 ANND, T02 CSND, T03...</div>
          </div>

          <div 
            onClick={() => onNavigateTab('delegation')} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
          >
            <div className="text-[11px] text-slate-300 font-semibold">Cơ chế tinh gọn 3 Cấp</div>
            <div className="text-sm font-bold font-mono text-amber-400 mt-1">
              Bỏ Quận/Huyện
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">Đồng bộ dữ liệu hai chiều 100%</div>
          </div>
        </div>
      </div>

      {/* ================= BIỂU ĐỒ CỘT SO SÁNH SỐ LƯỢNG SÁNG KIẾN GIỮA CÁC NHÓM ĐƠN VỊ ================= */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        
        {/* Header & Metric Mode Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>PHÂN TÍCH ĐỐI SÁNH NĂNG LỰC ĐỔI MỚI TOÀN LỰC LƯỢNG</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 mt-0.5">
              SO SÁNH SỐ LƯỢNG SÁNG KIẾN GIỮA CÁC NHÓM ĐƠN VỊ CAND
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối sánh giữa 3 khối: Học viện & Trường CAND · Công an các Địa phương · Cơ quan Bộ Công an (Tổng {groupStats.totalAll} sáng kiến)
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start md:self-auto text-xs">
            <button
              onClick={() => setChartMetric('initiatives')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                chartMetric === 'initiatives'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng số sáng kiến ({groupStats.totalAll})
            </button>
            <button
              onClick={() => setChartMetric('approved')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                chartMetric === 'approved'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã phê duyệt / Triển khai
            </button>
            <button
              onClick={() => setChartMetric('users')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                chartMetric === 'users'
                  ? 'bg-white text-blue-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cán bộ tham gia ({groupStats.totalUsers.toLocaleString('vi-VN')})
            </button>
          </div>
        </div>

        {/* The Visual Bar Chart Canvas */}
        <div className="relative pt-6 pb-2">
          
          {/* Y-Axis Guidelines & Scales */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400 pb-16">
            <div className="border-b border-dashed border-slate-200 flex justify-between pr-2">
              <span>{chartMetric === 'users' ? '7.000 cán bộ' : '200 hồ sơ'}</span>
              <span className="text-[9px] text-slate-300">Ngưỡng tối đa</span>
            </div>
            <div className="border-b border-dashed border-slate-200 flex justify-between pr-2">
              <span>{chartMetric === 'users' ? '5.250 cán bộ' : '150 hồ sơ'}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 flex justify-between pr-2">
              <span>{chartMetric === 'users' ? '3.500 cán bộ' : '100 hồ sơ'}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 flex justify-between pr-2">
              <span>{chartMetric === 'users' ? '1.750 cán bộ' : '50 hồ sơ'}</span>
            </div>
            <div className="border-b border-slate-300 flex justify-between pr-2">
              <span>0</span>
              <span className="text-[9px] text-slate-300">Mốc cơ sở</span>
            </div>
          </div>

          {/* 3 Columns Display */}
          <div className="grid grid-cols-3 gap-4 sm:gap-12 relative z-10 h-72 items-end px-6 sm:px-14 pb-14">
            
            {/* Column 1: Học viện, Trường CAND */}
            {(() => {
              const val = chartMetric === 'initiatives' 
                ? groupStats.truong.initiatives 
                : chartMetric === 'approved' 
                ? groupStats.truong.approved 
                : groupStats.truong.users;
              const maxVal = chartMetric === 'users' ? 7000 : 210;
              const heightPercent = Math.min(Math.max((val / maxVal) * 100, 14), 100);

              return (
                <div 
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  onClick={() => {
                    setSelectedGroupDetail(selectedGroupDetail === 'truong_cand' ? null : 'truong_cand');
                  }}
                >
                  {/* Floating Metric Callout on Top of Bar */}
                  <div className="mb-2 text-center transition-transform duration-200 group-hover:-translate-y-1">
                    <span className="inline-block px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded font-mono font-bold text-xs sm:text-sm shadow-md border border-emerald-700/80">
                      {chartMetric === 'users' ? `${val.toLocaleString('vi-VN')}` : `${val}`}
                      <span className="text-[10px] font-normal ml-1 text-emerald-400">
                        {chartMetric === 'users' ? 'cán bộ' : 'sáng kiến'}
                      </span>
                    </span>
                    <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                      {chartMetric === 'initiatives' && `${groupStats.truong.percent}% toàn quân`}
                      {chartMetric === 'approved' && `Tỷ lệ duyệt 88%`}
                      {chartMetric === 'users' && `9 Cơ sở đào tạo`}
                    </div>
                  </div>

                  {/* Vertical Column Bar */}
                  <div className="w-full max-w-[110px] bg-slate-100 rounded-t-xl overflow-hidden relative shadow-inner border border-b-0 border-emerald-200" style={{ height: `${heightPercent}%` }}>
                    <div className={`w-full h-full bg-linear-to-t ${groupStats.truong.barGradient} transition-all duration-500 relative flex flex-col justify-between p-2`}>
                      {/* Glossy highlight line */}
                      <div className="w-full h-1 bg-white/40 rounded-full" />
                      <div className="text-center">
                        <span className="text-white/90 text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                          {groupStats.truong.unitsCount} ĐƠN VỊ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Category Label */}
                  <div className="text-center mt-3 space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {groupStats.truong.shortTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 hidden sm:block">
                      9 Học viện, Trường CAND
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      Dẫn đầu: T01 Học viện ANND (16)
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Column 2: Công an các Địa phương */}
            {(() => {
              const val = chartMetric === 'initiatives' 
                ? groupStats.dia_phuong.initiatives 
                : chartMetric === 'approved' 
                ? groupStats.dia_phuong.approved 
                : groupStats.dia_phuong.users;
              const maxVal = chartMetric === 'users' ? 7000 : 210;
              const heightPercent = Math.min(Math.max((val / maxVal) * 100, 14), 100);

              return (
                <div 
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  onClick={() => {
                    setSelectedGroupDetail(selectedGroupDetail === 'dia_phuong' ? null : 'dia_phuong');
                  }}
                >
                  {/* Floating Metric Callout on Top of Bar */}
                  <div className="mb-2 text-center transition-transform duration-200 group-hover:-translate-y-1">
                    <span className="inline-block px-2.5 py-1 bg-blue-950 text-blue-300 rounded font-mono font-bold text-xs sm:text-sm shadow-md border border-blue-700/80">
                      {chartMetric === 'users' ? `${val.toLocaleString('vi-VN')}` : `${val}`}
                      <span className="text-[10px] font-normal ml-1 text-blue-400">
                        {chartMetric === 'users' ? 'cán bộ' : 'sáng kiến'}
                      </span>
                    </span>
                    <div className="text-[10px] font-bold text-blue-700 mt-0.5">
                      {chartMetric === 'initiatives' && `${groupStats.dia_phuong.percent}% toàn quân`}
                      {chartMetric === 'approved' && `Tỷ lệ duyệt 76%`}
                      {chartMetric === 'users' && `34 Tỉnh / TP`}
                    </div>
                  </div>

                  {/* Vertical Column Bar */}
                  <div className="w-full max-w-[110px] bg-slate-100 rounded-t-xl overflow-hidden relative shadow-inner border border-b-0 border-blue-200" style={{ height: `${heightPercent}%` }}>
                    <div className={`w-full h-full bg-linear-to-t ${groupStats.dia_phuong.barGradient} transition-all duration-500 relative flex flex-col justify-between p-2`}>
                      {/* Glossy highlight line */}
                      <div className="w-full h-1 bg-white/40 rounded-full" />
                      <div className="text-center">
                        <span className="text-white/90 text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                          {groupStats.dia_phuong.unitsCount} ĐỊA BÀN
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Category Label */}
                  <div className="text-center mt-3 space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      {groupStats.dia_phuong.shortTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 hidden sm:block">
                      6 TP trực thuộc TW + 28 Tỉnh
                    </div>
                    <div className="text-[10px] font-mono text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                      Dẫn đầu: TP.HCM (18) & Hà Nội (14)
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Column 3: Cơ quan Bộ Công an */}
            {(() => {
              const val = chartMetric === 'initiatives' 
                ? groupStats.bo_cong_an.initiatives 
                : chartMetric === 'approved' 
                ? groupStats.bo_cong_an.approved 
                : groupStats.bo_cong_an.users;
              const maxVal = chartMetric === 'users' ? 7000 : 210;
              const heightPercent = Math.min(Math.max((val / maxVal) * 100, 14), 100);

              return (
                <div 
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  onClick={() => {
                    setSelectedGroupDetail(selectedGroupDetail === 'bo_cong_an' ? null : 'bo_cong_an');
                  }}
                >
                  {/* Floating Metric Callout on Top of Bar */}
                  <div className="mb-2 text-center transition-transform duration-200 group-hover:-translate-y-1">
                    <span className="inline-block px-2.5 py-1 bg-rose-950 text-rose-300 rounded font-mono font-bold text-xs sm:text-sm shadow-md border border-rose-700/80">
                      {chartMetric === 'users' ? `${val.toLocaleString('vi-VN')}` : `${val}`}
                      <span className="text-[10px] font-normal ml-1 text-rose-400">
                        {chartMetric === 'users' ? 'cán bộ' : 'sáng kiến'}
                      </span>
                    </span>
                    <div className="text-[10px] font-bold text-rose-700 mt-0.5">
                      {chartMetric === 'initiatives' && `${groupStats.bo_cong_an.percent}% toàn quân`}
                      {chartMetric === 'approved' && `Tỷ lệ duyệt 82%`}
                      {chartMetric === 'users' && `8 Cục / Viện`}
                    </div>
                  </div>

                  {/* Vertical Column Bar */}
                  <div className="w-full max-w-[110px] bg-slate-100 rounded-t-xl overflow-hidden relative shadow-inner border border-b-0 border-rose-200" style={{ height: `${heightPercent}%` }}>
                    <div className={`w-full h-full bg-linear-to-t ${groupStats.bo_cong_an.barGradient} transition-all duration-500 relative flex flex-col justify-between p-2`}>
                      {/* Glossy highlight line */}
                      <div className="w-full h-1 bg-white/40 rounded-full" />
                      <div className="text-center">
                        <span className="text-white/90 text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                          {groupStats.bo_cong_an.unitsCount} ĐẦU MỐI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Category Label */}
                  <div className="text-center mt-3 space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
                      {groupStats.bo_cong_an.shortTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 hidden sm:block">
                      8 Cục & Viện nghiên cứu Bộ
                    </div>
                    <div className="text-[10px] font-mono text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                      Dẫn đầu: Cục C06 (16) & A05 (15)
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* Comparative 3-Card Detailed Breakdown Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Card 1: Học viện, Trường CAND */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3 shadow-2xs hover:border-emerald-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                <span>1. Khối Học viện & Trường CAND</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono text-[10px] font-bold">
                9 Đơn vị
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-emerald-200/60 pb-2">
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-900">
                  {groupStats.truong.initiatives}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Sáng kiến đóng góp ({groupStats.truong.percent}%)</div>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <div>Cán bộ: <strong className="font-mono text-slate-900">{groupStats.truong.users.toLocaleString('vi-VN')}</strong></div>
                <div>Đã duyệt: <strong className="font-mono text-emerald-800">{groupStats.truong.approved}</strong></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Trọng tâm:</strong> {groupStats.truong.focusDesc}.
            </p>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Đơn vị nổi bật: <strong className="text-slate-900">Học viện ANND (T01)</strong></span>
              <button
                onClick={() => {
                  onFilterByUnitCategory?.('truong_cand');
                  onNavigateTab('delegation');
                }}
                className="text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>
          </div>

          {/* Card 2: Công an các Địa phương */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-3 shadow-2xs hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                <span>2. Khối Công an Địa phương</span>
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded font-mono text-[10px] font-bold">
                34 Địa phương
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-blue-200/60 pb-2">
              <div>
                <div className="text-2xl font-bold font-mono text-blue-900">
                  {groupStats.dia_phuong.initiatives}
                </div>
                <div className="text-[11px] text-blue-700 font-medium">Sáng kiến đóng góp ({groupStats.dia_phuong.percent}%)</div>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <div>Cán bộ: <strong className="font-mono text-slate-900">{groupStats.dia_phuong.users.toLocaleString('vi-VN')}</strong></div>
                <div>Đã duyệt: <strong className="font-mono text-blue-800">{groupStats.dia_phuong.approved}</strong></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Trọng tâm:</strong> {groupStats.dia_phuong.focusDesc}.
            </p>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Đơn vị nổi bật: <strong className="text-slate-900">TP.HCM & Hà Nội</strong></span>
              <button
                onClick={() => {
                  onFilterByUnitCategory?.('dia_phuong');
                  onNavigateTab('delegation');
                }}
                className="text-blue-800 hover:text-blue-950 font-bold underline cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>
          </div>

          {/* Card 3: Cơ quan Bộ Công an */}
          <div className="p-4 bg-red-50/70 border border-red-200 rounded-lg space-y-3 shadow-2xs hover:border-red-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                <span>3. Khối Cơ quan Bộ Công an</span>
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded font-mono text-[10px] font-bold">
                8 Cục / Viện
              </span>
            </div>

            <div className="flex items-baseline justify-between border-b border-red-200/60 pb-2">
              <div>
                <div className="text-2xl font-bold font-mono text-red-900">
                  {groupStats.bo_cong_an.initiatives}
                </div>
                <div className="text-[11px] text-red-700 font-medium">Sáng kiến đóng góp ({groupStats.bo_cong_an.percent}%)</div>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <div>Cán bộ: <strong className="font-mono text-slate-900">{groupStats.bo_cong_an.users.toLocaleString('vi-VN')}</strong></div>
                <div>Đã duyệt: <strong className="font-mono text-red-800">{groupStats.bo_cong_an.approved}</strong></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Trọng tâm:</strong> {groupStats.bo_cong_an.focusDesc}.
            </p>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Đơn vị nổi bật: <strong className="text-slate-900">C06 & A05</strong></span>
              <button
                onClick={() => {
                  onFilterByUnitCategory?.('bo_cong_an');
                  onNavigateTab('delegation');
                }}
                className="text-red-800 hover:text-red-950 font-bold underline cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Main Grid: Categories Distribution & Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Domain Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  PHÂN BỐ SÁNG KIẾN THEO LĨNH VỰC TRỌNG ĐIỂM CAND
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Định hướng theo Đề án 06 Chính phủ & Chương trình Chuyển đổi số Bộ Công an
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('initiatives')}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
              >
                Xem tất cả ({ideas.length}) →
              </button>
            </div>

            <div className="space-y-4">
              {categoryCounts.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {item.count} đề xuất ({item.percentage}%)
                    </span>
                  </div>
                  
                  {/* Progress track */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-slate-800 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.max(item.percentage * 2, 5)}%` }}
                    />
                  </div>
                  
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* National Infrastructure & 51-Node Multi-Tenant Hub */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  MẠNG LƯỚI PHÂN QUYỀN QUẢN TRỊ 51 ĐẦU MỐI TOÀN QUÂN
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân cấp cho 28 tỉnh, 6 TP trực thuộc Trung ương, Cơ quan Bộ và các Trường CAND nhập liệu & đồng bộ
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('delegation')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider text-xs rounded transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Mở phân quyền 51 đơn vị →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">TP trực thuộc TW</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  6 / 6 <span className="text-[10px] text-emerald-600 font-semibold">(100%)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hà Nội, TP.HCM, HP, ĐN...</div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Tỉnh trọng điểm</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  28 / 28 <span className="text-[10px] text-emerald-600 font-semibold">(100%)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">QN, NA, TH, HT, ĐL, ĐN...</div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Cơ quan Bộ Công an</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  8 / 8 <span className="text-[10px] text-emerald-600 font-semibold">(100%)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">C06, A05, C08, C07, H08...</div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Học viện & Trường CAND</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  9 / 9 <span className="text-[10px] text-emerald-600 font-semibold">(100%)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">T01 (HV An ninh), T02, T03...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Attention Queue & RBAC actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                HỒ SƠ CẦN XỬ LÝ ({urgentQueue.length})
              </h2>
              <span className="text-xs font-semibold text-amber-700">Ưu tiên xử lý</span>
            </div>

            <div className="space-y-3">
              {urgentQueue.map((idea) => {
                const statusCfg = STATUS_CONFIG[idea.status];
                const secrecyCfg = SECRECY_CONFIG[idea.secrecyLevel];

                return (
                  <div
                    key={idea.id}
                    onClick={() => onSelectIdea(idea)}
                    className="p-3 border border-slate-200 hover:border-slate-400 rounded cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono font-semibold text-slate-800">{idea.id}</span>
                      <span className={`font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 line-clamp-2">
                      {idea.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}</span>
                      <span className="font-mono text-slate-400">{secrecyCfg.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => onNavigateTab('review')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors"
              >
                Mở bàn làm việc thẩm định →
              </button>
            </div>
          </div>

          {/* 51 Administrative Hubs Quick Access Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Phân quyền 51 Đầu mối CAND Toàn quốc</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                28 Tỉnh · 6 TP TW
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Phân cấp quản trị nhập liệu và đồng bộ cho 28 tỉnh, 6 thành phố trực thuộc Trung ương, các Cục/Viện Bộ Công an và các Học viện, Trường CAND.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded">
                <div className="text-slate-500 text-[10px]">6 TP Trung ương</div>
                <div className="font-bold text-slate-800">Hà Nội, TP.HCM, HP...</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-100 rounded">
                <div className="text-slate-500 text-[10px]">28 Tỉnh địa phương</div>
                <div className="font-bold text-slate-800">QN, NA, TH, HT, DL...</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('delegation')}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded transition-colors shadow-2xs"
            >
              Quản trị phân quyền & Đồng bộ (51) →
            </button>
          </div>

          {/* Software Author & Creator Card */}
          <div className="bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Tác giả phát triển phần mềm
              </span>
              <span className="text-[10px] font-mono text-amber-700">HV An ninh nhân dân</span>
            </div>
            <div className="pt-0.5">
              <div className="text-base font-extrabold text-slate-900">
                TRẦN NGUYỄN HUY LONG
              </div>
              <div className="text-[11px] text-slate-700 font-medium">
                Học viện An ninh nhân dân (T01)
              </div>
            </div>
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Điện thoại liên hệ:</span>
              <a href="tel:0856682005" className="font-mono font-bold text-amber-900 hover:underline">
                085.668.2005
              </a>
            </div>
          </div>

          {/* Legal and Compliance Framework Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Khung pháp lý chuyển đổi số CAND</span>
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px] list-disc list-inside">
              <li>Luật Bảo vệ dữ liệu cá nhân 2025</li>
              <li>Luật An ninh mạng 2025</li>
              <li>Luật Bảo vệ bí mật Nhà nước 2025</li>
              <li>Đề án phát triển ứng dụng dữ liệu dân cư (Đề án 06)</li>
            </ul>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              Yêu cầu 100% dữ liệu nhạy cảm mã hóa AES-256 trước khi lưu trữ.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
