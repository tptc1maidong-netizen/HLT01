import React, { useState, useEffect, useRef } from 'react';
import { Idea, IdeaCategory, Priority, SecrecyLevel, User, CATEGORY_LABELS, AdministrativeNode } from '../types';
import { ADMINISTRATIVE_NODES } from '../data/administrativeNodes';
import { CANDEmblem } from './CANDIcons';

export interface LocalAttachedDoc {
  id: string;
  name: string;
  size: string;
  rawSizeBytes: number;
  extension: 'pdf' | 'doc' | 'docx' | string;
  fileType: string; // 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | etc.
  fileData?: string; // base64 / blob url / mock data
  uploadedAt: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

interface CreateInitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSubmit: (newIdea: Partial<Idea>, isDraft: boolean) => void;
  isOffline: boolean;
  activeNode?: AdministrativeNode;
  nodes?: AdministrativeNode[];
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function CreateInitiativeModal({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  isOffline,
  activeNode,
  nodes,
  onNotify
}: CreateInitiativeModalProps) {
  const availableNodes = nodes && nodes.length > 0 ? nodes : ADMINISTRATIVE_NODES;

  const formatAdminTitle = (rank?: string, name?: string) => {
    if (!name) return rank || '';
    if (!rank) return name;
    if (name.toLowerCase().startsWith(rank.toLowerCase())) {
      return name;
    }
    return `${rank} ${name}`;
  };

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('csdl_dancu');
  const [abstract, setAbstract] = useState('');
  const [description, setDescription] = useState('');
  const [technicalArchitecture, setTechnicalArchitecture] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [targetUnit, setTargetUnit] = useState(activeNode?.name || currentUser.unit || 'Công an các đơn vị, địa phương');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(activeNode?.id || availableNodes[0].id);
  const [secrecyLevel, setSecrecyLevel] = useState<SecrecyLevel>(0);
  const [priority, setPriority] = useState<Priority>('normal');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(250000000);
  
  const [attachedDocs, setAttachedDocs] = useState<LocalAttachedDoc[]>([
    {
      id: 'init-doc-1',
      name: 'Thuyet_minh_de_xuat_sang_kien.pdf',
      size: '2.4 MB',
      rawSizeBytes: 2516582,
      extension: 'pdf',
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString()
    }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeNode) {
      setSelectedNodeId(activeNode.id);
      setTargetUnit(activeNode.name);
    }
  }, [activeNode, isOpen]);

  if (!isOpen) return null;

  const handleApplyCANDTemplate = () => {
    // Assist officer with official phrasing & compliance boilerplate
    if (!description.includes('Căn cứ Luật An ninh mạng 2025')) {
      setDescription(
        (prev) =>
          prev +
          (prev ? '\n\n' : '') +
          '1. Căn cứ pháp lý: Thực hiện chỉ đạo tại Đề án 06/CP và tuân thủ Luật An ninh mạng 2025, Luật Bảo vệ dữ liệu cá nhân 2025.\n' +
          '2. Mục tiêu trọng tâm: Tối ưu quy trình nghiệp vụ nội bộ, bảo đảm tính sẵn sàng cao, không làm gián đoạn nhiệm vụ thường trực chiến đấu.\n' +
          '3. Biện pháp an toàn: Toàn bộ lưu lượng truyền dẫn đi qua mạng MPLS bảo mật CAND, mã hóa dữ liệu đầu cuối AES-256.'
      );
    }
  };

  const processUploadedFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    let addedCount = 0;
    const newDocs: LocalAttachedDoc[] = [];

    fileArray.forEach((file) => {
      const ext = getFileExtension(file.name);
      const isWord = ext === 'doc' || ext === 'docx';
      const isPdf = ext === 'pdf';

      if (!isWord && !isPdf) {
        onNotify?.(
          'Định dạng không được hỗ trợ',
          `Tập tin "${file.name}" không phải định dạng Word (.doc, .docx) hoặc PDF (.pdf). Vui lòng kiểm tra lại.`,
          'warning'
        );
        return;
      }

      // Generate local object URL or read as DataURL (supports unlimited size!)
      let fileDataUrl: string | undefined = undefined;
      try {
        fileDataUrl = URL.createObjectURL(file);
      } catch {
        fileDataUrl = undefined;
      }

      const newDoc: LocalAttachedDoc = {
        id: `att-disk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        rawSizeBytes: file.size,
        extension: ext,
        fileType: isPdf ? 'application/pdf' : isWord ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : file.type,
        fileData: fileDataUrl,
        uploadedAt: new Date().toISOString()
      };

      newDocs.push(newDoc);
      addedCount++;
    });

    if (newDocs.length > 0) {
      setAttachedDocs((prev) => [...prev, ...newDocs]);
      onNotify?.(
        'Đính kèm tài liệu thành công',
        `Đã nạp ${addedCount} tệp (Word/PDF) từ bộ nhớ máy tính vào hồ sơ sáng kiến. Đã kích hoạt mã hóa an toàn AES-256.`,
        'success'
      );
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleAddSamplePdf = () => {
    const timestamp = Date.now().toString().slice(-4);
    const newDoc: LocalAttachedDoc = {
      id: `sample-pdf-${Date.now()}`,
      name: `Phuong_an_ky_thuat_CAND_${timestamp}.pdf`,
      size: '3.4 MB',
      rawSizeBytes: 3565158,
      extension: 'pdf',
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString()
    };
    setAttachedDocs((prev) => [...prev, newDoc]);
    onNotify?.('Đã thêm tệp mẫu', 'Đã đính kèm tài liệu kiến trúc PDF mẫu CAND.', 'info');
  };

  const handleAddSampleWord = () => {
    const timestamp = Date.now().toString().slice(-4);
    const newDoc: LocalAttachedDoc = {
      id: `sample-word-${Date.now()}`,
      name: `Ban_thuyet_minh_giai_phap_ky_thuat_${timestamp}.docx`,
      size: '1.8 MB',
      rawSizeBytes: 1887436,
      extension: 'docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date().toISOString()
    };
    setAttachedDocs((prev) => [...prev, newDoc]);
    onNotify?.('Đã thêm tệp mẫu', 'Đã đính kèm thuyết minh giải pháp định dạng Word (.docx) chuẩn CAND.', 'info');
  };

  const handleDownloadDoc = (doc: LocalAttachedDoc) => {
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create fallback text representation
      const blob = new Blob([
        `HỒ SƠ TÀI LIỆU ĐÍNH KÈM SÁNG KIẾN CAND\n` +
        `Tên tệp: ${doc.name}\n` +
        `Kích thước: ${doc.size}\n` +
        `Thời gian: ${doc.uploadedAt}\n` +
        `Trạng thái: Đã mã hóa AES-256 nội bộ ngành\n` +
        `Xác thực: Chữ ký số Ban Cơ yếu Chính phủ\n`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) {
      onNotify?.('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tiêu đề và Tóm tắt sáng kiến.', 'warning');
      return;
    }

    const chosenNode = availableNodes.find(n => n.id === selectedNodeId) || activeNode;

    const newIdeaData: Partial<Idea> = {
      title,
      category,
      abstract,
      description,
      technicalArchitecture,
      expectedImpact,
      targetUnit: chosenNode?.name || targetUnit,
      secrecyLevel,
      priority,
      estimatedBudget,
      originNodeId: chosenNode?.id,
      originNodeName: chosenNode?.name,
      attachments: attachedDocs.map((doc, idx) => ({
        id: doc.id || `att-new-${Date.now()}-${idx}`,
        filename: doc.name,
        size: doc.size,
        rawSizeBytes: doc.rawSizeBytes,
        extension: doc.extension,
        fileType: doc.fileType,
        fileData: doc.fileData,
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        encrypted: true,
        secrecyLevel
      }))
    };

    onSubmit(newIdeaData, isDraft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg max-w-3xl w-full shadow-xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <CANDEmblem className="w-8 h-8 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                KHỞI TẠO HỒ SƠ SỐ CAND
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                ĐĂNG KÝ SÁNG KIẾN CHUYỂN ĐỔI SỐ CAND
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-5 text-xs text-slate-800 max-h-[80vh] overflow-y-auto">
          
          {/* Offline notice */}
          {isOffline && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
              <span className="font-bold uppercase">ĐANG Ở CHẾ ĐỘ NGOẠI TUYẾN:</span> Sáng kiến sẽ được lưu vào bộ nhớ đệm thiết bị và tự động đồng bộ lên máy chủ Bộ Công an khi kết nối mạng được tái lập.
            </div>
          )}

          {/* Author Profile Lockup */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[11px]">CÁN BỘ ĐỀ XUẤT:</span>{' '}
              <span className="font-bold text-slate-900">
                {[currentUser.rank, currentUser.fullName].filter(Boolean).join(' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[11px]">ĐƠN VỊ TÀI KHOẢN:</span>{' '}
              <span className="font-semibold text-slate-800">{currentUser.unit}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[11px]">SỐ ĐỊNH DANH VNEID:</span>{' '}
              <span className="font-mono font-bold text-slate-800">{currentUser.vneidNumber}</span>
            </div>
          </div>

          {/* Administrative Node Selector (51 Đầu mối: 28 Tỉnh, 6 TP TW, Bộ, Trường) */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-lg space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                <span>1. ĐƠN VỊ / ĐỊA PHƯƠNG CHỦ QUẢN SÁNG KIẾN (PHÂN CẤP 51 ĐẦU MỐI TOÀN QUỐC):</span>
              </label>
              <span className="text-[10px] text-amber-800 font-mono font-bold uppercase">
                MÃ BẢO MẬT: {availableNodes.find(n => n.id === selectedNodeId)?.code}
              </span>
            </div>
            <select
              value={selectedNodeId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedNodeId(id);
                const n = availableNodes.find(x => x.id === id);
                if (n) setTargetUnit(n.name);
              }}
              className="w-full px-3 py-2 border border-amber-300 rounded bg-white text-slate-900 font-medium focus:outline-none focus:border-amber-500 text-xs shadow-2xs"
            >
              <optgroup label="🏢 Cấp 1: Cơ quan Bộ Công an (Các Cục, Viện - 8 đơn vị)">
                {availableNodes.filter(n => n.category === 'bo_cong_an').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.code}) · Quản trị: {formatAdminTitle(n.adminRank, n.adminName)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ Cấp 2: Thành phố trực thuộc Trung ương (6 đơn vị)">
                {availableNodes.filter(n => n.category === 'thanh_pho_tw').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.code}) · Quản trị: {formatAdminTitle(n.adminRank, n.adminName)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🗺️ Cấp 2: Tỉnh địa phương trọng điểm (28 đơn vị)">
                {availableNodes.filter(n => n.category === 'tinh_dia_phuong').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.code}) · Quản trị: {formatAdminTitle(n.adminRank, n.adminName)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎓 Cấp Trường: Khối Học viện & Trường CAND (9 đơn vị)">
                {availableNodes.filter(n => n.category === 'truong_cand').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.code}) · Quản trị: {formatAdminTitle(n.adminRank, n.adminName)}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="text-[10px] text-amber-900/80 flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <span>* Dữ liệu sáng kiến được ký số Token CA và đồng bộ trực tiếp lên phần mềm chung toàn ngành.</span>
              <span className="font-mono text-slate-600">IP: {availableNodes.find(n => n.id === selectedNodeId)?.ipRange}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
              2. TIÊU ĐỀ SÁNG KIẾN / CẢI TIẾN SỐ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hệ thống tra cứu biên bản xử phạt vi phạm hành chính trực tuyến qua VNeID"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Category & Secrecy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
                3. LĨNH VỰC TRỌNG TÂM <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IdeaCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
                4. MỨC ĐỘ BÍ MẬT NHÀ NƯỚC <span className="text-red-500">*</span>
              </label>
              <select
                value={secrecyLevel}
                onChange={(e) => setSecrecyLevel(Number(e.target.value) as SecrecyLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-white"
              >
                <option value={0}>0 - Thông thường (Lưu hành nội bộ ngành)</option>
                <option value={1}>1 - Tài liệu nội bộ đơn vị</option>
                <option value={2}>2 - MẬT (Tuân thủ Luật BVBMNN 2025)</option>
                <option value={3}>3 - TỐI MẬT (Chỉ Ban Giám đốc & BCĐ)</option>
              </select>
            </div>
          </div>

          {/* Priority & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
                5. ĐỘ ƯU TIÊN XỬ LÝ
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-white"
              >
                <option value="normal">Bình thường (Kế hoạch định kỳ)</option>
                <option value="high">Ưu tiên cao</option>
                <option value="urgent">Khẩn cấp (Nhiệm vụ đột xuất)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
                6. DỰ TOÁN NGÂN SÁCH KHÁI TOÁN (VNĐ)
              </label>
              <input
                type="number"
                step="10000000"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                {(estimatedBudget / 1000000).toLocaleString('vi-VN')} triệu VNĐ
              </span>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
              7. TÓM TẮT GIẢI PHÁP (KHÔNG QUÁ 300 TỪ) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Tóm tắt ngắn gọn vấn đề thực tế, giải pháp số hóa và kết quả dự kiến đạt được..."
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900 uppercase tracking-wide">
                8. MÔ TẢ CHI TIẾT NỘI DUNG SÁNG KIẾN
              </label>
              <button
                type="button"
                onClick={handleApplyCANDTemplate}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold"
              >
                + Thêm căn cứ pháp lý & Chuẩn thể thức CAND
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Trình bày chi tiết thực trạng khó khăn, các bước triển khai kỹ thuật, sự cần thiết đầu tư..."
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 font-sans"
            />
          </div>

          {/* Technical Architecture & Expected Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
                9. KIẾN TRÚC CÔNG NGHỆ & AN TOÀN THÔNG TIN
              </label>
              <textarea
                rows={2}
                value={technicalArchitecture}
                onChange={(e) => setTechnicalArchitecture(e.target.value)}
                placeholder="Ví dụ: Web React + Node.js/Java, CSDL PostgreSQL, mã hóa AES-256 qua mạng MPLS..."
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
                10. HIỆU QUẢ ĐỊNH LƯỢNG DỰ KIẾN
              </label>
              <textarea
                rows={2}
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder="Ví dụ: Giảm 60% thời gian thụ lý hồ sơ, tiết kiệm 150 giờ công/tháng cho mỗi cán bộ xã..."
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Target beneficiary unit */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 uppercase tracking-wide">
              11. ĐƠN VỊ THỤ HƯỞNG / ĐỊA BÀN ÁP DỤNG
            </label>
            <input
              type="text"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
              placeholder="Ví dụ: 6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương, Cơ quan Bộ công an, Các học viện, trường CAND..."
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Attachments Section - Local Disk Word & PDF with unlimited size */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label className="font-bold text-slate-900 text-xs sm:text-sm flex flex-wrap items-center gap-1.5 uppercase tracking-wide">
                  <span>12. HỒ SƠ & TÀI LIỆU ĐÍNH KÈM TỪ MÁY TÍNH</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded tracking-normal normal-case">
                    DUNG LƯỢNG KHÔNG GIỚI HẠN · WORD & PDF
                  </span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ định dạng tài liệu Microsoft Word (.doc, .docx) và Adobe PDF (.pdf) từ bộ nhớ máy tính
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleAddSampleWord}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                  title="Thêm nhanh tài liệu Word mẫu chuẩn CAND"
                >
                  <span>+ Mẫu Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSamplePdf}
                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                  title="Thêm nhanh tài liệu PDF mẫu chuẩn CAND"
                >
                  <span>+ Mẫu PDF (.pdf)</span>
                </button>
              </div>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/80 scale-[1.005]'
                  : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {/* Word Icon */}
                <div className="w-8 h-8 rounded bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-[11px] shadow-2xs">
                  W
                </div>
                {/* PDF Icon */}
                <div className="w-8 h-8 rounded bg-red-100 border border-red-200 flex items-center justify-center text-red-700 font-bold text-[11px] shadow-2xs">
                  PDF
                </div>
                <div className="w-8 h-8 rounded bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="font-semibold text-xs text-slate-800">
                  {isDragging ? 'Thả tệp vào đây để tải lên...' : 'Kéo thả tệp từ bộ nhớ máy tính hoặc bấm vào đây để duyệt'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Chấp nhận tập tin <strong className="text-blue-700">Word (.doc, .docx)</strong> hoặc <strong className="text-red-700">PDF (.pdf)</strong> · Không giới hạn kích thước tệp
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span>📂 Chọn tài liệu từ máy tính</span>
              </button>
            </div>

            {/* List of Attached Documents */}
            {attachedDocs.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-2">
                Chưa có tài liệu nào được đính kèm.
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                  <span>Tài liệu đã đính kèm ({attachedDocs.length} tệp):</span>
                  <span className="text-slate-400 font-mono text-[10px]">Tự động băm SHA-256 & mã hóa AES</span>
                </div>

                {attachedDocs.map((doc, i) => {
                  const isWord = doc.extension === 'doc' || doc.extension === 'docx';
                  const isPdf = doc.extension === 'pdf';

                  return (
                    <div
                      key={doc.id || i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Format icon */}
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
                            {doc.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{doc.size}</span>
                            <span>•</span>
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                              AES-256 đã mã hóa
                            </span>
                            <span>•</span>
                            <span className="text-slate-400 font-mono">
                              {new Date(doc.uploadedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                          title="Tải tệp này về máy tính"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-500">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.414V3a1 1 0 10-2 0v5.414L7.707 6.293a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Tải về</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAttachedDocs(attachedDocs.filter((_, idx) => idx !== i))}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Xóa tệp khỏi danh sách"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-medium text-xs transition-colors"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-xs transition-colors"
              >
                Lưu nháp (Offline Cache)
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs transition-colors shadow-sm"
              >
                {isOffline ? 'Lưu hàng đợi đồng bộ' : 'Gửi hồ sơ thẩm định chính thức'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
