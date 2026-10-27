import React from 'react';

interface OfflineSyncBannerProps {
  isOffline: boolean;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  onToggleOffline: () => void;
}

export function OfflineSyncBanner({
  isOffline,
  pendingSyncCount,
  onTriggerSync,
  onToggleOffline
}: OfflineSyncBannerProps) {
  if (!isOffline && pendingSyncCount === 0) return null;

  return (
    <aside aria-label="Thông báo trạng thái mạng và đồng bộ" className={`border-b text-xs px-4 py-2.5 transition-colors ${
      isOffline
        ? 'bg-amber-900 text-amber-100 border-amber-800'
        : 'bg-emerald-900 text-emerald-100 border-emerald-800'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold">
            {isOffline ? 'CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE-FIRST):' : 'ĐÃ KẾT NỐI MẠNG CHUYÊN DÙNG CAND:'}
          </span>
          <span>
            {isOffline
              ? 'Dữ liệu được lưu trữ mã hóa cục bộ. Cán bộ tại vùng biên giới/hải đảo vẫn thao tác bình thường.'
              : `Phát hiện có ${pendingSyncCount} hồ sơ sáng kiến chưa đồng bộ lên Trung tâm dữ liệu Bộ.`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {pendingSyncCount > 0 && !isOffline && (
            <button
              onClick={onTriggerSync}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded transition-colors"
            >
              Đồng bộ dữ liệu ({pendingSyncCount}) ngay
            </button>
          )}

          <button
            onClick={onToggleOffline}
            className="text-amber-300 hover:underline text-[11px]"
          >
            {isOffline ? 'Chuyển sang Trực tuyến' : 'Chuyển sang Ngoại tuyến'}
          </button>
        </div>
      </div>
    </aside>
  );
}
