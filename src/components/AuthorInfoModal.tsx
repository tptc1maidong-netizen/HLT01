import React from 'react';
import { CANDEmblem } from './CANDIcons';

interface AuthorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function AuthorInfoModal({ isOpen, onClose, onNotify }: AuthorInfoModalProps) {
  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0856682005');
    onNotify?.('Sao chép thành công', 'Đã sao chép số điện thoại tác giả: 085.668.2005', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in fade-in duration-150">
        
        {/* Header with CAND emblem and official title */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <CANDEmblem className="w-9 h-9 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Bộ Công An · Học Viện An Ninh Nhân Dân
              </div>
              <h2 className="text-base font-bold uppercase tracking-wide text-white">
                THÔNG TIN TÁC GIẢ PHẦN MỀM
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-mono p-1 rounded hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Main Author ID Card Box */}
          <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-lg relative overflow-hidden shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-400/30 text-amber-900 border border-amber-400/50 rounded font-bold text-[10px] uppercase tracking-wider">
                  Chủ nhiệm & Tác giả giải pháp
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  TRẦN NGUYỄN HUY LONG
                </h3>
                <div className="text-slate-700 font-semibold text-xs flex items-center gap-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Học viện An ninh nhân dân (T01)</span>
                </div>
              </div>

              {/* Security Shield badge */}
              <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                <CANDEmblem className="w-10 h-10" />
              </div>
            </div>

            {/* Direct Contact Bar */}
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Điện thoại liên hệ:</span>
                <a
                  href="tel:0856682005"
                  className="font-mono text-sm font-extrabold text-amber-900 hover:text-amber-700 transition-colors"
                >
                  085.668.2005
                </a>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 border border-amber-300 rounded font-semibold text-[11px] shadow-2xs transition-colors"
                >
                  Sao chép SĐT
                </button>
                <a
                  href="tel:0856682005"
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded font-bold text-[11px] shadow-2xs transition-colors"
                >
                  Gọi trực tiếp
                </a>
              </div>
            </div>
          </div>

          {/* Solution & Engineering Profile */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
              Hồ Sơ Bản Quyền & Nền Tảng Kỹ Thuật
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Tên phần mềm</div>
                <div className="font-bold text-slate-900 mt-0.5">Cổng Quản Trị Sáng Kiến Số CAND</div>
                <div className="text-[10px] text-slate-500 mt-1">Phiên bản tổng hợp quốc gia 2026</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Cơ quan bảo trợ</div>
                <div className="font-bold text-slate-900 mt-0.5">Ban Chỉ đạo Chuyển đổi số BCA</div>
                <div className="text-[10px] text-slate-500 mt-1">Phục vụ Đề án 06 Chính phủ</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Quy mô phân cấp</div>
                <div className="font-bold text-slate-900 mt-0.5">51 đầu mối toàn quốc</div>
                <div className="text-[10px] text-slate-500 mt-1">28 Tỉnh · 6 TP TW · Bộ · Các trường</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Tiêu chuẩn bảo mật</div>
                <div className="font-bold text-slate-900 mt-0.5">ISO/IEC 27001 & Luật 2025</div>
                <div className="text-[10px] text-slate-500 mt-1">Mã hóa AES-256 · Chữ ký số Ban Cơ yếu</div>
              </div>
            </div>
          </div>

          {/* Accreditation Note */}
          <div className="p-3 bg-slate-100/80 border border-slate-200/80 rounded text-[11px] text-slate-600 leading-relaxed">
            Phần mềm được nghiên cứu, thiết kế và phát triển bởi tác giả <strong className="text-slate-900">TRẦN NGUYỄN HUY LONG</strong> (Học viện An ninh nhân dân) nhằm đáp ứng nhu cầu cấp bách về quản lý, thẩm định, phê duyệt và liên thông dữ liệu sáng kiến số trong toàn lực lượng Công an Nhân dân từ trung ương đến cơ sở.
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            Học viện An ninh nhân dân © 2026
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
}
