import React, { useState } from 'react';
import { Idea, User, UserRole, CATEGORY_LABELS, STATUS_CONFIG, SECRECY_CONFIG } from '../types';

interface ReviewApprovalViewProps {
  ideas: Idea[];
  currentUser: User;
  onSelectIdea: (idea: Idea) => void;
  onApprove: (ideaId: string, comment: string) => void;
  onRequestRevision: (ideaId: string, comment: string) => void;
  onReject: (ideaId: string, comment: string) => void;
  onExportPdf?: (idea: Idea) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function ReviewApprovalView({
  ideas,
  currentUser,
  onSelectIdea,
  onApprove,
  onRequestRevision,
  onReject,
  onExportPdf,
  onNotify
}: ReviewApprovalViewProps) {
  const [selectedQueueIdeaId, setSelectedQueueIdeaId] = useState<string>(
    ideas.find(i => i.status === 'submitted' || i.status === 'reviewing')?.id || ideas[0]?.id || ''
  );
  const [reviewNote, setReviewNote] = useState('');
  const [checklist, setChecklist] = useState({
    networkCompliant: true,
    dataEncryption: true,
    populationDbIntegration: true,
    budgetRealistic: true
  });

  const queueIdeas = ideas.filter(
    i => i.status === 'submitted' || i.status === 'reviewing' || i.status === 'revision_requested'
  );

  const activeIdea = ideas.find(i => i.id === selectedQueueIdeaId) || queueIdeas[0] || ideas[0];

  const canApprove = currentUser.role === 'lanh_dao';
  const canReview = currentUser.role === 'chuyen_vien' || currentUser.role === 'lanh_dao';

  const handleQuickApprove = () => {
    if (!activeIdea) return;
    if (!canApprove) {
      onNotify?.(
        'Từ chối quyền truy cập (RBAC)',
        `Đồng chí ${[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')} (${currentUser.role}) không có thẩm quyền phê duyệt. Chỉ Lãnh đạo cấp Cục/Phòng mới có quyền ban hành quyết định này.`,
        'error'
      );
      return;
    }
    const note = reviewNote.trim() || 'Hội đồng thẩm định nhất trí thông qua hồ sơ đề xuất.';
    onApprove(activeIdea.id, note);
    setReviewNote('');
    onNotify?.('Phê duyệt thành công', `Đã ghi nhận phê duyệt sáng kiến ${activeIdea.id}.`, 'success');
  };

  const handleQuickRevision = () => {
    if (!activeIdea) return;
    if (!canReview) {
      onNotify?.(
        'Từ chối quyền truy cập (RBAC)',
        `Cán bộ không thuộc Hội đồng thẩm định hoặc Ban Lãnh đạo không thể ban hành yêu cầu chỉnh lý.`,
        'error'
      );
      return;
    }
    const note = reviewNote.trim() || 'Yêu cầu hoàn thiện phương án bảo mật theo tiêu chuẩn Bộ Công an.';
    onRequestRevision(activeIdea.id, note);
    setReviewNote('');
    onNotify?.('Yêu cầu hiệu chỉnh', `Đã gửi yêu cầu chỉnh lý tới tác giả sáng kiến ${activeIdea.id}.`, 'warning');
  };

  const handleQuickReject = () => {
    if (!activeIdea) return;
    if (!canApprove) {
      onNotify?.(
        'Từ chối quyền truy cập (RBAC)',
        `Chỉ Lãnh đạo cấp Cục/Phòng mới có thẩm quyền ra quyết định từ chối đề xuất sáng kiến.`,
        'error'
      );
      return;
    }
    const note = reviewNote.trim() || 'Chưa đủ điều kiện triển khai trong giai đoạn hiện nay.';
    onReject(activeIdea.id, note);
    setReviewNote('');
    onNotify?.('Từ chối đề xuất', `Đã ghi nhận từ chối đề xuất ${activeIdea.id}.`, 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
          BÀN LÀM VIỆC THẨM ĐỊNH & PHÊ DUYỆT SÁNG KIẾN
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quy trình thẩm tra kỹ thuật, đánh giá an toàn an ninh mạng và phê duyệt chủ trương triển khai CAND
        </p>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Review Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>HÀNG ĐỢI CẦN XỬ LÝ ({queueIdeas.length})</span>
            <span className="text-slate-400 font-mono font-normal">Phiên làm việc: {[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')}</span>
          </div>

          {queueIdeas.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
              Hiện không có hồ sơ nào đang chờ thẩm định hoặc phê duyệt.
            </div>
          ) : (
            <div className="space-y-2">
              {queueIdeas.map((idea) => {
                const isSelected = idea.id === activeIdea?.id;
                const statusCfg = STATUS_CONFIG[idea.status];
                const secrecyCfg = SECRECY_CONFIG[idea.secrecyLevel];

                return (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedQueueIdeaId(idea.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-colors space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-mono font-bold ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                        {idea.id}
                      </span>
                      <span className={isSelected ? 'text-slate-300' : statusCfg.color}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="font-semibold line-clamp-2 leading-snug">
                      {idea.title}
                    </div>

                    <div className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                      isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                    }`}>
                      <span>{[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}</span>
                      <span className="font-mono">{secrecyCfg.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Active Initiative Workbench */}
        {activeIdea ? (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-sm text-xs">
            
            {/* Header info */}
            <div className="border-b border-slate-200 pb-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">{activeIdea.id}</span>
                <span className={`font-semibold ${STATUS_CONFIG[activeIdea.status].color}`}>
                  {STATUS_CONFIG[activeIdea.status].label}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {activeIdea.title}
              </h2>
              <div className="text-slate-500 text-[11px] flex items-center gap-2">
                <span>Người gửi: {[activeIdea.author.rank, activeIdea.author.fullName].filter(Boolean).join(' ')}</span>
                <span>·</span>
                <span>Đơn vị: {activeIdea.author.unit}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                1. TÓM TẮT GIẢI PHÁP
              </div>
              <p className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                {activeIdea.abstract}
              </p>
            </div>

            {/* Attached Documents */}
            {activeIdea.attachments.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 uppercase text-xs tracking-wider flex items-center justify-between">
                  <span>2. HỒ SƠ TÀI LIỆU ĐÍNH KÈM ({activeIdea.attachments.length} TỆP)</span>
                  <span className="text-slate-400 font-mono text-[10px] normal-case">Word (.docx) & PDF (.pdf)</span>
                </div>
                <div className="space-y-1.5">
                  {activeIdea.attachments.map((att) => {
                    const ext = (att.extension || att.filename.split('.').pop() || '').toLowerCase();
                    const isWord = ext === 'doc' || ext === 'docx';
                    const isPdf = ext === 'pdf';
                    return (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isWord ? 'bg-blue-100 text-blue-700 border border-blue-200' : isPdf ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isWord ? 'DOCX' : isPdf ? 'PDF' : 'FILE'}
                          </span>
                          <span className="font-mono text-slate-800 text-[11px]">{att.filename}</span>
                          <span className="text-slate-400 text-[10px]">({att.size})</span>
                        </div>
                        <button
                          onClick={() => onSelectIdea(activeIdea)}
                          className="text-xs text-blue-700 hover:text-blue-900 font-medium"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Technical Verification Checklist (Mandatory for CAND Appraisal) */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                3. BỘ TIÊU CHÍ THẨM ĐỊNH KỸ THUẬT & PHÁP LÝ BẮT BUỘC:
              </div>
              
              <div className="space-y-2 pt-1 text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.networkCompliant}
                    onChange={(e) => setChecklist({ ...checklist, networkCompliant: e.target.checked })}
                    className="accent-slate-900 rounded"
                  />
                  <span>Tương thích mạng truyền dẫn MPLS và hạ tầng VPN ngành CAND</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.dataEncryption}
                    onChange={(e) => setChecklist({ ...checklist, dataEncryption: e.target.checked })}
                    className="accent-slate-900 rounded"
                  />
                  <span>Mã hóa dữ liệu lưu trữ AES-256 & kiểm soát truy cập theo vai trò (RBAC)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.populationDbIntegration}
                    onChange={(e) => setChecklist({ ...checklist, populationDbIntegration: e.target.checked })}
                    className="accent-slate-900 rounded"
                  />
                  <span>Định danh công dân qua VNeID / CSDL Quốc gia về dân cư an toàn</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.budgetRealistic}
                    onChange={(e) => setChecklist({ ...checklist, budgetRealistic: e.target.checked })}
                    className="accent-slate-900 rounded"
                  />
                  <span>Dự toán kinh phí hợp lý, tiết kiệm và có phương án nhân rộng khả thi</span>
                </label>
              </div>
            </div>

            {/* Appraisal Comments & Decision Notes */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 text-xs uppercase tracking-wide">
                4. Ý KIẾN THẨM ĐỊNH CHUYÊN MÔN / CHỈ ĐẠO CỦA LÃNH ĐẠO:
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Ghi nhận xét đánh giá kỹ thuật, yêu cầu điều chỉnh hoặc ý kiến chỉ đạo triển khai..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-800"
              />
            </div>

            {/* Decision Controls */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              {!canApprove && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-700 shrink-0">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {currentUser.role === 'chuyen_vien'
                        ? 'Đồng chí đang thẩm định với tư cách Chuyên viên. Quyền "Phê duyệt" hoặc "Từ chối" chỉ dành cho Lãnh đạo cấp Cục/Phòng.'
                        : 'Vai trò Cán bộ cơ sở chỉ được theo dõi tiến độ, không có quyền can thiệp Hội đồng thẩm định.'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[10px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 shrink-0">
                    RBAC: {currentUser.role}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectIdea(activeIdea)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Xem toàn bộ hồ sơ chi tiết →
                  </button>
                  <button
                    onClick={() => onExportPdf?.(activeIdea)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1"
                    title="Xuất báo cáo PDF chuẩn theo mẫu Cục Chuyển đổi số"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                    </svg>
                    <span>Xuất PDF mẫu Cục CĐS</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickReject}
                    disabled={!canApprove}
                    className={`px-3.5 py-2 font-semibold rounded transition-colors ${
                      canApprove
                        ? 'bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                    title={!canApprove ? 'Chỉ Lãnh đạo mới có quyền từ chối' : 'Từ chối đề xuất'}
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={handleQuickRevision}
                    disabled={!canReview}
                    className={`px-3.5 py-2 font-semibold rounded transition-colors ${
                      canReview
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                    title={!canReview ? 'Cần quyền thẩm định chuyên môn' : 'Gửi yêu cầu chỉnh lý hồ sơ'}
                  >
                    Yêu cầu chỉnh lý
                  </button>
                  <button
                    onClick={handleQuickApprove}
                    disabled={!canApprove}
                    className={`px-4 py-2 font-bold rounded transition-colors shadow-sm flex items-center gap-1.5 ${
                      canApprove
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                    title={!canApprove ? 'Chỉ Lãnh đạo mới có quyền phê duyệt triển khai' : 'Phê duyệt triển khai sáng kiến'}
                  >
                    <span>✓ Phê duyệt triển khai</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 text-xs">
            Chọn một hồ sơ từ danh sách bên trái để bắt đầu thẩm định.
          </div>
        )}

      </div>
    </div>
  );
}
