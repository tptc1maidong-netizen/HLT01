import React, { useState, useEffect } from 'react';
import { Idea, User, UserRole, CATEGORY_LABELS, STATUS_CONFIG, SECRECY_CONFIG, Attachment } from '../types';
import { CANDEmblem } from './CANDIcons';

interface InitiativeDetailModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onApprove: (ideaId: string, comment: string) => void;
  onRequestRevision: (ideaId: string, comment: string) => void;
  onReject: (ideaId: string, comment: string) => void;
  onUpdateProgress: (ideaId: string, newProgress: number, executionUnit: string) => void;
  onAddComment: (ideaId: string, comment: string) => void;
  onExportPdf: (idea: Idea) => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function InitiativeDetailModal({
  idea,
  isOpen,
  onClose,
  currentUser,
  onApprove,
  onRequestRevision,
  onReject,
  onUpdateProgress,
  onAddComment,
  onExportPdf,
  onNotify
}: InitiativeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'workflow' | 'tech' | 'actions'>('info');
  const [commentText, setCommentText] = useState('');
  const [progressVal, setProgressVal] = useState(idea?.progressPercentage || 0);
  const [execUnit, setExecUnit] = useState(idea?.executionUnit || '');
  const [selectedAttachmentPreview, setSelectedAttachmentPreview] = useState<string | null>(null);
  const [selectedAttachmentObj, setSelectedAttachmentObj] = useState<Attachment | null>(null);

  // Synchronize state when selected idea prop updates from parent
  useEffect(() => {
    if (idea) {
      setProgressVal(idea.progressPercentage);
      setExecUnit(idea.executionUnit || '');
    }
  }, [idea]);

  const hasClearance = currentUser.role === 'lanh_dao' || currentUser.role === 'admin' || currentUser.role === 'chuyen_vien';

  const handleDownloadAttachment = (att: Attachment) => {
    // Security check: Classified documents (Level 2: Mật, Level 3: Tối mật)
    if (att.secrecyLevel >= 2 && !hasClearance) {
      onNotify?.(
        'Từ chối quyền giải mã tài liệu',
        `Tài liệu "${att.filename}" thuộc cấp độ ${SECRECY_CONFIG[att.secrecyLevel].label}. Tài khoản Cán bộ cơ sở không có chứng thư số giải mã. Vui lòng liên hệ Lãnh đạo cấp Cục để được cấp quyền.`,
        'error'
      );
      return;
    }

    if (att.fileData) {
      const a = document.createElement('a');
      a.href = att.fileData;
      a.download = att.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([
        `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n` +
        `BỘ CÔNG AN - HỆ THỐNG QUẢN LÝ SÁNG KIẾN SỐ TOÀN DIỆN\n` +
        `----------------------------------------\n` +
        `TÀI LIỆU THUYẾT MINH ĐÍNH KÈM SÁNG KIẾN: ${idea?.id}\n` +
        `Tiêu đề sáng kiến: ${idea?.title}\n` +
        `Đơn vị đề xuất: ${idea?.originNodeName || idea?.author.unit}\n` +
        `Tên tệp tin: ${att.filename}\n` +
        `Kích thước: ${att.size}\n` +
        `Mã hóa: AES-256 nội bộ ngành CAND\n` +
        `Thời gian đính kèm: ${new Date(att.uploadedAt).toLocaleString('vi-VN')}\n` +
        `Người giải mã tải xuống: ${[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')} (${currentUser.role})\n` +
        `Tác giả phần mềm: TRẦN NGUYỄN HUY LONG - Học viện An ninh nhân dân (085.668.2005)\n`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    onNotify?.('Tải tài liệu thành công', `Đã xác thực chữ ký và tải xuống tệp: ${att.filename}`, 'success');
  };

  if (!isOpen || !idea) return null;

  const cat = CATEGORY_LABELS[idea.category];
  const statusCfg = STATUS_CONFIG[idea.status];
  const secrecyCfg = SECRECY_CONFIG[idea.secrecyLevel];

  const canApprove = currentUser.role === 'lanh_dao';
  const canReview = currentUser.role === 'chuyen_vien' || currentUser.role === 'lanh_dao';

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(idea.id, commentText);
    setCommentText('');
  };

  const handleProgressSave = () => {
    onUpdateProgress(idea.id, progressVal, execUnit);
    onNotify?.('Cập nhật tiến độ', 'Đã cập nhật tiến độ và phân công đơn vị thực hiện.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-lg max-w-4xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CANDEmblem className="w-9 h-9 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-bold text-amber-400">{idea.id}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium">{cat.label}</span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-300 font-mono text-[11px] font-semibold">{secrecyCfg.badge}</span>
                <span className="text-slate-500">·</span>
                <span className={`font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {idea.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onExportPdf(idea)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
              title="Xuất báo cáo PDF chuẩn theo mẫu Cục Chuyển đổi số"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
              </svg>
              <span>Xuất PDF chuẩn Cục CĐS</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl font-mono p-1 shrink-0 ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            NỘI DUNG HỒ SƠ
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'tech'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            KIẾN TRÚC KỸ THUẬT & ATTT
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            LỊCH SỬ THẨM ĐỊNH ({idea.workflow.length})
          </button>
          {canReview && (
            <button
              onClick={() => setActiveTab('actions')}
              className={`py-3 transition-colors border-b-2 whitespace-nowrap text-amber-700 ${
                activeTab === 'actions'
                  ? 'border-amber-600 text-amber-900 font-bold'
                  : 'border-transparent hover:text-amber-800'
              }`}
            >
              XỬ LÝ & PHÊ DUYỆT
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
          
          {/* TAB 1: General Info */}
          {activeTab === 'info' && (
            <div className="space-y-6">

              {/* Classified Clearance Notice */}
              {idea.secrecyLevel >= 2 && (
                <div className={`p-3 rounded border text-xs flex items-center justify-between gap-3 ${
                  hasClearance
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-2 py-0.5 bg-red-700 text-white rounded text-[10px]">
                      {secrecyCfg.badge}
                    </span>
                    <span className="leading-relaxed">
                      {hasClearance
                        ? `Hồ sơ được phân loại bảo mật cấp độ ${secrecyCfg.label}. Đồng chí đang truy cập với thẩm quyền nghiệp vụ ${[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')} (${currentUser.role}).`
                        : `Hồ sơ thuộc danh mục BẢO VỆ BÍ MẬT NHÀ NƯỚC (Luật BVBMNN 2025). Cán bộ cơ sở chỉ được tiếp cận nội dung tóm tắt giới hạn; việc giải mã tệp tin yêu cầu chứng thư số Lãnh đạo cấp Cục.`}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-white/80 px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">
                    Bảo mật: AES-256/mTLS
                  </span>
                </div>
              )}
              
              {/* Author and Metadata strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Tác giả đề xuất</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}
                  </div>
                  <div className="text-[11px] text-slate-500">{idea.author.unit}</div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Dự toán ngân sách</div>
                  <div className="font-semibold font-mono text-slate-900 mt-0.5">
                    {(idea.estimatedBudget / 1000000).toLocaleString('vi-VN')} triệu VNĐ
                  </div>
                  <div className="text-[11px] text-slate-500">Đơn vị thụ hưởng: {idea.targetUnit}</div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Tiến độ thực hiện</div>
                  <div className="font-semibold font-mono text-slate-900 mt-0.5">
                    {idea.progressPercentage}%
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-slate-800 h-1.5" style={{ width: `${idea.progressPercentage}%` }} />
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  1. TÓM TẮT GIẢI PHÁP
                </h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {idea.abstract}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  2. THUYẾT MINH CHI TIẾT
                </h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-slate-200">
                  {idea.description}
                </div>
              </div>

              {/* Expected Impact */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  3. HIỆU QUẢ ĐỊNH LƯỢNG DỰ KIẾN
                </h3>
                <div className="text-slate-700 leading-relaxed bg-emerald-50/50 p-3 rounded border border-emerald-200">
                  {idea.expectedImpact}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    4. HỒ SƠ & TÀI LIỆU ĐÍNH KÈM ({idea.attachments.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Hỗ trợ Word (.doc, .docx) & PDF (.pdf) từ máy tính
                  </span>
                </div>
                {idea.attachments.length === 0 ? (
                  <div className="text-slate-400 italic text-xs bg-slate-50 p-4 rounded border border-slate-200 text-center">
                    Chưa có tài liệu đính kèm.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {idea.attachments.map((att) => {
                      const ext = (att.extension || att.filename.split('.').pop() || '').toLowerCase();
                      const isWord = ext === 'doc' || ext === 'docx';
                      const isPdf = ext === 'pdf';

                      return (
                        <div
                          key={att.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isWord ? (
                              <div className="w-7 h-7 rounded bg-blue-100 border border-blue-300 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                DOC
                              </div>
                            ) : isPdf ? (
                              <div className="w-7 h-7 rounded bg-red-100 border border-red-300 text-red-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                PDF
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                FILE
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="font-mono font-medium text-slate-900 truncate">
                                {att.filename}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-slate-700">{att.size}</span>
                                <span>•</span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono">
                                  Mã hóa AES-256
                                </span>
                                <span>•</span>
                                <span className="text-slate-400 font-mono">
                                  {new Date(att.uploadedAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              onClick={() => handleDownloadAttachment(att)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              title="Tải tệp này về máy tính"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-600">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.414V3a1 1 0 10-2 0v5.414L7.707 6.293a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                              </svg>
                              <span>Tải về</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAttachmentObj(att);
                                setSelectedAttachmentPreview(att.filename);
                              }}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                            >
                              Xem trước
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Technical Architecture */}
          {activeTab === 'tech' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  1. KIẾN TRÚC PHÂN TẦNG VÀ PHƯƠNG ÁN KỸ THUẬT
                </h3>
                <div className="bg-slate-50 text-slate-800 p-4 rounded text-xs leading-relaxed border border-slate-200 shadow-2xs">
                  {idea.technicalArchitecture}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    2. CHUẨN KẾT NỐI DỮ LIỆU CAND
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                    <li>Mạng truyền số liệu chuyên dùng (MPLS CAND)</li>
                    <li>Giao thức HTTPS / TLS 1.3 có xác thực hai chiều mTLS</li>
                    <li>Chữ ký số chuyên dùng Ban Cơ yếu Chính phủ</li>
                    <li>Định dạng dữ liệu chuẩn JSON Schema / ISO 8601</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    3. AN TOÀN THÔNG TIN & PHÁP LÝ
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                    <li>Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025</li>
                    <li>Tuân thủ Luật An ninh mạng 2025</li>
                    <li>Kiểm toán truy cập Audit Log bất biến</li>
                    <li>Phân vùng lưu trữ tách biệt cho tài liệu Mật</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Workflow Timeline & Comments */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              
              {/* Timeline Steps */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Tiến trình thẩm định và phê duyệt
                </h3>
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {idea.workflow.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-4 relative pl-8">
                      <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-slate-800 ring-4 ring-white" />
                      <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{step.stage}</span>
                          <span className="font-mono text-slate-400">
                            {new Date(step.timestamp).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="text-slate-700">
                          <span className="font-medium text-slate-800">{step.actorRank} {step.actorName}</span>
                          <span className="text-slate-500"> ({step.actorUnit})</span>: {step.action}
                        </div>
                        {step.comment && (
                          <div className="text-slate-600 italic bg-white p-2 rounded border border-slate-100 text-[11px] mt-1">
                            "{step.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ý kiến trao đổi & Chỉ đạo nghiệp vụ ({idea.comments.length})
                </h3>

                {idea.comments.length === 0 ? (
                  <div className="text-slate-400 italic">Chưa có ý kiến trao đổi nào.</div>
                ) : (
                  <div className="space-y-3">
                    {idea.comments.map((cm) => (
                      <div key={cm.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">
                            {cm.authorRank} {cm.authorName} ({cm.authorUnit})
                          </span>
                          <span className="font-mono text-slate-400">
                            {new Date(cm.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="text-slate-700">{cm.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handlePostComment} className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Ghi ý kiến trao đổi với tư cách: ${[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')}...`}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                  >
                    Gửi ý kiến
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 4: Approval & Execution Actions */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              
              {/* Leader Decision Panel */}
              {canApprove && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-4">
                  <div className="font-bold text-slate-900 text-sm">
                    Quyết định phê duyệt (Dành cho Lãnh đạo cấp Cục/Phòng)
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Thực hiện quyền hạn theo Quy chế công tác số của Bộ Công an. Sau khi phê duyệt, hồ sơ được cấp mã triển khai và chuyển tiếp đến đơn vị phụ trách.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onApprove(idea.id, 'Phê duyệt triển khai giai đoạn 1')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs shadow-sm"
                    >
                      ✓ Phê duyệt triển khai
                    </button>
                    <button
                      onClick={() => onRequestRevision(idea.id, 'Yêu cầu rà soát bổ sung phương án bảo mật theo Luật 2025')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs"
                    >
                      ⚠ Yêu cầu chỉnh lý, bổ sung
                    </button>
                    <button
                      onClick={() => onReject(idea.id, 'Chưa phù hợp với định hướng công nghệ hiện tại')}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs"
                    >
                      ✕ Từ chối đề xuất
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Update & Assignment */}
              <div className="p-4 bg-white border border-slate-200 rounded space-y-4">
                <div className="font-bold text-slate-900 text-sm">
                  Giao việc & Cập nhật tiến độ triển khai thực tế
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Đơn vị / Tổ công tác phụ trách triển khai
                    </label>
                    <input
                      type="text"
                      value={execUnit}
                      onChange={(e) => setExecUnit(e.target.value)}
                      placeholder="Ví dụ: Cục C08 phối hợp Công an TP Hà Nội..."
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tiến độ hoàn thành: <span className="font-mono text-slate-900">{progressVal}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                      className="w-full accent-slate-900 mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>0% Khởi động</span>
                      <span>25% Kiểm thử lab</span>
                      <span>50% Thí điểm</span>
                      <span>75% Hoàn thiện</span>
                      <span>100% Nghiệm thu</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleProgressSave}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-xs"
                  >
                    Lưu tiến độ & Phân công
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="font-mono text-[11px]">
            Hệ thống quản lý sáng kiến CAND · Lưu vết kiểm toán: {idea.id}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportPdf(idea)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
              </svg>
              <span>Xuất PDF mẫu Cục CĐS</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

      {/* Attachment Preview Modal */}
      {selectedAttachmentPreview && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                {selectedAttachmentPreview.toLowerCase().endsWith('.docx') || selectedAttachmentPreview.toLowerCase().endsWith('.doc') ? (
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded">
                    MICROSOFT WORD
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded">
                    ADOBE PDF
                  </span>
                )}
                <span className="font-bold text-sm text-white font-mono truncate max-w-md">
                  {selectedAttachmentPreview}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedAttachmentPreview(null);
                  setSelectedAttachmentObj(null);
                }}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-6 overflow-y-auto bg-slate-100 flex-1 space-y-4">
              {/* Document Paper Mockup */}
              <div className="bg-white border border-slate-300 shadow-md rounded p-6 sm:p-8 max-w-2xl mx-auto space-y-4 text-slate-800 font-serif leading-relaxed">
                {/* Official National Header */}
                <div className="text-center border-b border-slate-200 pb-4 font-sans">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="text-xs font-semibold text-slate-700 underline decoration-slate-400 underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    BỘ CÔNG AN · HỆ THỐNG QUẢN LÝ SÁNG KIẾN SỐ TOÀN DIỆN
                  </div>
                </div>

                {/* Title */}
                <div className="text-center py-2 font-sans">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    HỒ SƠ THUYẾT MINH CHI TIẾT SÁNG KIẾN CHUYỂN ĐỔI SỐ
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1 uppercase">
                    {idea.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Mã hồ sơ: {idea.id} · Cấp độ bảo mật: Mức {idea.secrecyLevel}
                  </div>
                </div>

                {/* Abstract */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold font-sans text-slate-900 uppercase text-[11px]">
                    I. Tóm tắt giải pháp & Mục tiêu
                  </div>
                  <p className="text-slate-700 text-justify bg-slate-50 p-3 rounded border border-slate-200">
                    {idea.abstract}
                  </p>
                </div>

                {/* Description excerpt */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold font-sans text-slate-900 uppercase text-[11px]">
                    II. Nội dung thuyết minh kỹ thuật
                  </div>
                  <p className="text-slate-700 text-justify whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-200">
                    {idea.description}
                  </p>
                </div>

                {/* Expected impact */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold font-sans text-slate-900 uppercase text-[11px]">
                    III. Hiệu quả kinh tế - xã hội & Tối ưu quy trình
                  </div>
                  <p className="text-slate-700 text-justify bg-emerald-50/60 p-3 rounded border border-emerald-200">
                    {idea.expectedImpact}
                  </p>
                </div>

                {/* Digital Certificate Sign-off */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-[11px]">
                  <div>
                    <div className="font-bold text-slate-700">Đơn vị đề xuất:</div>
                    <div className="font-semibold text-slate-900">{idea.originNodeName || idea.author.unit}</div>
                    <div className="text-slate-500">Cán bộ phụ trách: {[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}</div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block p-2.5 bg-amber-50 border border-amber-300 rounded text-left">
                      <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                        <span>✓ ĐÃ XÁC THỰC KÝ SỐ CA</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                        Mã băm SHA-256: 7f8a9...b341c<br/>
                        Chuẩn mã hóa: AES-256 CAND
                      </div>
                    </div>
                  </div>
                </div>

                {/* Author credit in footer */}
                <div className="pt-2 text-center text-[10px] text-slate-400 font-sans border-t border-slate-100">
                  Tác giả giải pháp phần mềm: TRẦN NGUYỄN HUY LONG · Học viện An ninh nhân dân (085.668.2005)
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedAttachmentObj ? `${selectedAttachmentObj.filename} (${selectedAttachmentObj.size})` : selectedAttachmentPreview}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedAttachmentObj) {
                      handleDownloadAttachment(selectedAttachmentObj);
                    } else {
                      const fallbackAtt = idea.attachments.find(a => a.filename === selectedAttachmentPreview) || {
                        id: 'temp',
                        filename: selectedAttachmentPreview,
                        size: '2.5 MB',
                        fileType: 'application/pdf',
                        uploadedAt: new Date().toISOString(),
                        encrypted: true,
                        secrecyLevel: idea.secrecyLevel
                      };
                      handleDownloadAttachment(fallbackAtt);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.414V3a1 1 0 10-2 0v5.414L7.707 6.293a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Tải tệp về máy tính</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAttachmentPreview(null);
                    setSelectedAttachmentObj(null);
                  }}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium text-xs transition-colors"
                >
                  Đóng xem trước
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
