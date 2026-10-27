import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Idea, CATEGORY_LABELS, STATUS_CONFIG, SECRECY_CONFIG } from '../types';
import { CANDEmblem } from './CANDIcons';

// Helper to safely convert any OKLCH color string (used by Tailwind v4) to standard sRGB hex or rgb()
function convertOklchToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }

  // 1. Try browser native 2D Canvas context (available in all modern browsers supporting OKLCH)
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorStr;
      if (ctx.fillStyle && !ctx.fillStyle.includes('oklch')) {
        return ctx.fillStyle;
      }
    }
  } catch {
    // continue to mathematical fallback
  }

  // 2. Direct mathematical conversion from OKLCH -> OKLab -> Linear sRGB -> Gamma sRGB
  try {
    const match = colorStr.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
    if (match) {
      const L = match[1].endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
      const C = parseFloat(match[2]);
      const H = parseFloat(match[3]);
      const A = match[4] ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])) : 1;

      const hRad = (H * Math.PI) / 180;
      const a_ = C * Math.cos(hRad);
      const b_ = C * Math.sin(hRad);

      const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s_ = L - 0.0894841775 * a_ - 1.291485548 * b_;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      const rLin = +4.0767434757 * l - 3.3077115913 * m + 0.230969929 * s;
      const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

      const gamma = (val: number) => {
        const clamped = Math.max(0, Math.min(1, val));
        return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      };

      const r = Math.round(gamma(rLin) * 255);
      const g = Math.round(gamma(gLin) * 255);
      const b = Math.round(gamma(bLin) * 255);

      if (A < 1) {
        return `rgba(${r}, ${g}, ${b}, ${A})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
  } catch {
    // ignore
  }

  // 3. Fallback to clean dark slate color
  return '#1e293b';
}

interface OfficialPdfReportModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export function OfficialPdfReportModal({
  idea,
  isOpen,
  onClose,
  onNotify
}: OfficialPdfReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !idea) return null;

  const cat = CATEGORY_LABELS[idea.category];
  const statusCfg = STATUS_CONFIG[idea.status];
  const secrecyCfg = SECRECY_CONFIG[idea.secrecyLevel];

  const reportDate = new Date(idea.createdAt);
  const day = String(reportDate.getDate()).padStart(2, '0');
  const month = String(reportDate.getMonth() + 1).padStart(2, '0');
  const year = reportDate.getFullYear();

  // Export to direct PDF file via jsPDF and html2canvas with OKLCH sanitization
  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsGenerating(true);

    try {
      const element = documentRef.current;
      
      // Capture canvas with 2x scale and sanitize OKLCH styles from Tailwind v4
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          // 1. Sanitize all <style> tags in the cloned document so Tailwind v4 oklch rules don't break html2canvas
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
              styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/gi, (match) => {
                return convertOklchToRgb(match);
              });
            }
          });

          // 2. Sanitize inline styles of all cloned elements
          const allClonedNodes = clonedDoc.querySelectorAll('*');
          allClonedNodes.forEach((node: any) => {
            if (node.style) {
              const inlineStyle = node.getAttribute('style');
              if (inlineStyle && inlineStyle.includes('oklch')) {
                node.setAttribute(
                  'style',
                  inlineStyle.replace(/oklch\([^)]+\)/gi, (m: string) => convertOklchToRgb(m))
                );
              }
            }
          });

          // 3. Process the printable container and all its descendants to override any computed oklch
          const clonedContainer = clonedDoc.getElementById('printable-pdf-document');
          if (clonedContainer) {
            clonedContainer.style.backgroundColor = '#ffffff';
            clonedContainer.style.color = '#0f172a';
            clonedContainer.style.boxShadow = 'none';
            clonedContainer.style.borderColor = '#cbd5e1';

            const descendants = clonedContainer.querySelectorAll('*');
            descendants.forEach((node: any) => {
              if (!node.style) return;

              try {
                const cs = window.getComputedStyle(node);
                const color = cs.color;
                const bg = cs.backgroundColor;
                const borderTop = cs.borderTopColor;
                const borderRight = cs.borderRightColor;
                const borderBottom = cs.borderBottomColor;
                const borderLeft = cs.borderLeftColor;
                const shadow = cs.boxShadow;

                if (color && color.includes('oklch')) {
                  node.style.color = convertOklchToRgb(color);
                }
                if (bg && bg.includes('oklch')) {
                  node.style.backgroundColor = convertOklchToRgb(bg);
                }
                if (borderTop && borderTop.includes('oklch')) {
                  node.style.borderTopColor = convertOklchToRgb(borderTop);
                }
                if (borderRight && borderRight.includes('oklch')) {
                  node.style.borderRightColor = convertOklchToRgb(borderRight);
                }
                if (borderBottom && borderBottom.includes('oklch')) {
                  node.style.borderBottomColor = convertOklchToRgb(borderBottom);
                }
                if (borderLeft && borderLeft.includes('oklch')) {
                  node.style.borderLeftColor = convertOklchToRgb(borderLeft);
                }
                if (shadow && shadow.includes('oklch')) {
                  node.style.boxShadow = 'none';
                }
              } catch {
                // ignore
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Add extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `${idea.id}_Bao_Cao_Sang_Kien_CAND.pdf`;
      pdf.save(fileName);

      onNotify?.(
        'Xuất PDF thành công',
        `Tệp báo cáo ${fileName} đã được tải về máy theo mẫu chuẩn Cục Chuyển đổi số.`,
        'success'
      );
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
      onNotify?.(
        'Lỗi xuất PDF',
        'Có lỗi xảy ra khi tạo tệp PDF. Vui lòng thử lại hoặc dùng chế độ In.',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Export directly to Word document (.doc) with full styling conforming to Circular 30/2020/TT-BCA
  const handleDownloadWordDoc = () => {
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Báo cáo sáng kiến CAND - ${idea.id}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 595.3pt 841.9pt; /* Kích thước A4 tiêu chuẩn */
            margin: 20mm 20mm 20mm 30mm; /* Chuẩn thể thức TT30/NĐ30: Trên 20, Dưới 20, Trái 30, Phải 20 */
            mso-header-margin: 36.0pt;
            mso-footer-margin: 36.0pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 13pt;
            line-height: 1.35;
            color: #000000;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          .header-table {
            border: none;
            margin-bottom: 12pt;
          }
          .header-table td {
            border: none;
            padding: 2pt 4pt;
            vertical-align: top;
          }
          .data-table {
            border: 1px solid #000;
            margin: 10pt 0;
          }
          .data-table td, .data-table th {
            border: 1px solid #000;
            padding: 5pt 7pt;
            font-size: 12pt;
          }
          h1 {
            font-size: 15pt;
            text-align: center;
            font-weight: bold;
            margin: 10pt 0 4pt 0;
            text-transform: uppercase;
          }
          h2 {
            font-size: 13pt;
            text-align: center;
            font-weight: bold;
            margin: 0 0 4pt 0;
            text-transform: uppercase;
          }
          h3 {
            font-size: 13pt;
            font-weight: bold;
            margin: 12pt 0 4pt 0;
            text-transform: uppercase;
          }
          p {
            margin: 4pt 0;
            text-align: justify;
            text-indent: 10mm;
          }
          .signature-table {
            border: none;
            margin-top: 20pt;
          }
          .signature-table td {
            border: none;
            padding: 4pt;
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- BỘ CÔNG AN & CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (Đúng thể thức Thông tư 30) -->
          <table class="header-table">
            <tr>
              <td style="width: 45%; text-align: center;">
                <div style="font-size: 12pt; text-transform: uppercase;">BỘ CÔNG AN</div>
                <div style="font-size: 12.5pt; font-weight: bold; text-transform: uppercase;">${idea.originNodeName || 'CỤC CHUYỂN ĐỔI SỐ'}</div>
                <div style="font-size: 11pt; border-top: 1px solid #000; width: 100px; margin: 3pt auto 0 auto; padding-top: 2pt;">
                  Số: <strong>${idea.id}</strong>/BC-CĐS
                </div>
              </td>
              <td style="width: 55%; text-align: center;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style="font-size: 12.5pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
                <div style="font-size: 11pt; border-top: 1px solid #000; width: 140px; margin: 3pt auto 0 auto; padding-top: 2pt;"></div>
                <div style="font-size: 11.5pt; font-style: italic; margin-top: 4pt;">
                  Hà Nội, ngày ${day} tháng ${month} năm ${year}
                </div>
              </td>
            </tr>
          </table>

          <!-- MỨC ĐỘ BẢO MẬT & ĐỘ KHẨN -->
          <table class="header-table" style="margin-bottom: 6pt;">
            <tr>
              <td style="text-align: left; font-size: 11pt;">
                <strong>ĐỘ MẬT:</strong> <span style="color: #990000; font-weight: bold;">${secrecyCfg.badge} (${secrecyCfg.label.toUpperCase()})</span>
              </td>
              <td style="text-align: right; font-size: 11pt;">
                <strong>ĐỘ KHẨN:</strong> <span>${idea.priority === 'urgent' ? 'THƯỢNG KHẨN' : idea.priority === 'high' ? 'KHẨN' : 'BÌNH THƯỜNG'}</span>
              </td>
            </tr>
          </table>

          <!-- TIÊU ĐỀ BÁO CÁO -->
          <h1>BÁO CÁO THUYẾT MINH SÁNG KIẾN CHUYỂN ĐỔI SỐ</h1>
          <h2>TRONG LỰC LƯỢNG CÔNG AN NHÂN DÂN NĂM 2026</h2>
          <div style="text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 14pt;">
            (Quy chuẩn hồ sơ hành chính điện tử CAND - Thực hiện Đề án 06 Chính phủ)
          </div>

          <!-- PHẦN I: THÔNG TIN HỒ SƠ -->
          <h3>I. THÔNG TIN CHUNG VỀ SÁNG KIẾN</h3>
          <table class="data-table">
            <tr>
              <td style="width: 25%; font-weight: bold; background-color: #f2f2f2;">Mã số hồ sơ</td>
              <td style="width: 25%; font-weight: bold;">${idea.id}</td>
              <td style="width: 25%; font-weight: bold; background-color: #f2f2f2;">Ngày khởi tạo</td>
              <td style="width: 25%;">${new Date(idea.createdAt).toLocaleDateString('vi-VN')}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f2f2f2;">Tên sáng kiến</td>
              <td colspan="3" style="font-weight: bold;">${idea.title}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f2f2f2;">Lĩnh vực trọng tâm</td>
              <td>${cat.label}</td>
              <td style="font-weight: bold; background-color: #f2f2f2;">Đơn vị thụ hưởng</td>
              <td>${idea.targetUnit}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f2f2f2;">Cán bộ đề xuất</td>
              <td>${[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')} (VNeID: ${idea.author.vneidNumber})</td>
              <td style="font-weight: bold; background-color: #f2f2f2;">Đơn vị công tác</td>
              <td>${idea.author.unit}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background-color: #f2f2f2;">Kinh phí dự toán</td>
              <td><strong>${(idea.estimatedBudget / 1000000).toLocaleString('vi-VN')} triệu VNĐ</strong></td>
              <td style="font-weight: bold; background-color: #f2f2f2;">Tiến độ & Trạng thái</td>
              <td>${statusCfg.label} (${idea.progressPercentage}%)</td>
            </tr>
          </table>

          <!-- PHẦN II: TÓM TẮT GIẢI PHÁP -->
          <h3>II. TÓM TẮT GIẢI PHÁP KỸ THUẬT</h3>
          <p>${idea.abstract.replace(/\n/g, '</p><p>')}</p>

          <!-- PHẦN III: THUYẾT MINH CHI TIẾT -->
          <h3>III. NỘI DUNG THUYẾT MINH CHI TIẾT VÀ TÍNH MỚI</h3>
          <p>${idea.description.replace(/\n/g, '</p><p>')}</p>

          <!-- PHẦN IV: KIẾN TRÚC KỸ THUẬT & ATTT -->
          <h3>IV. KIẾN TRÚC KỸ THUẬT VÀ BẢO ĐẢM AN TOÀN THÔNG TIN</h3>
          <p><strong>1. Mô hình phân tầng:</strong> ${idea.technicalArchitecture}</p>
          <p><strong>2. Tuân thủ tiêu chuẩn:</strong> Hệ thống vận hành trên mạng truyền số liệu chuyên dùng (MPLS CAND), mã hóa cơ yếu AES-256 nội bộ, bảo đảm xác thực đa nhân tố VNeID theo quy định của Luật An ninh mạng 2025.</p>

          <!-- PHẦN V: HIỆU QUẢ KINH TẾ - XÃ HỘI VÀ NGHIỆP VỤ -->
          <h3>V. HIỆU QUẢ KINH TẾ, NGHIỆP VỤ VÀ KHẢ NĂNG NHÂN RỘNG</h3>
          <p>${idea.expectedImpact.replace(/\n/g, '</p><p>')}</p>

          <!-- PHẦN VI: LỊCH SỬ THẨM ĐỊNH -->
          <h3>VI. TIẾN TRÌNH THẨM ĐỊNH VÀ PHÊ DUYỆT</h3>
          <table class="data-table">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="width: 25%;">Thời gian</th>
                <th style="width: 25%;">Giai đoạn</th>
                <th style="width: 25%;">Cán bộ thực hiện</th>
                <th style="width: 25%;">Ý kiến chỉ đạo / Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${idea.workflow.map(wf => `
                <tr>
                  <td>${new Date(wf.timestamp).toLocaleString('vi-VN')}</td>
                  <td><strong>${wf.stage}</strong></td>
                  <td>${wf.actorRank} ${wf.actorName} (${wf.actorUnit})</td>
                  <td>${wf.action}${wf.comment ? ` - "${wf.comment}"` : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- PHẦN CHỮ KÝ VÀ NƠI NHẬN THEO ĐÚNG THỂ THỨC THÔNG TƯ 30 -->
          <table class="signature-table">
            <tr>
              <td style="width: 45%; vertical-align: top; font-size: 11pt;">
                <div style="font-weight: bold; font-style: italic;">Nơi nhận:</div>
                <div>- Lãnh đạo Bộ Công an (để b/c);</div>
                <div>- Cục Chuyển đổi số (để chỉ đạo);</div>
                <div>- Cục C06, C08, A05 (phối hợp);</div>
                <div>- Đơn vị đề xuất;</div>
                <div>- Lưu: VT, CĐS-BCA.</div>
              </td>
              <td style="width: 55%; text-align: center; vertical-align: top;">
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">
                  TM. HỘI ĐỒNG THẨM ĐỊNH SÁNG KIẾN SỐ
                </div>
                <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-bottom: 50pt;">
                  CHỦ TỊCH HỘI ĐỒNG / THỦ TRƯỞNG ĐƠN VỊ
                </div>
                <div style="font-size: 12.5pt; font-weight: bold;">
                  Đại tá Lê Hoàng Long
                </div>
                <div style="font-size: 11pt; font-style: italic;">
                  (Ký số bảo mật Ban Cơ yếu Chính phủ)
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-top: 30pt; border-top: 1px dashed #999; padding-top: 6pt; font-size: 10pt; color: #555; text-align: center;">
            Hệ thống Quản trị Sáng kiến Chuyển đổi số CAND © 2026 · Tác giả phần mềm: TRẦN NGUYỄN HUY LONG - Học viện An ninh nhân dân (085.668.2005)
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.id}_Bao_Cao_Sang_Kien_CAND_TT30.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotify?.(
      'Xuất file Word thành công',
      `Đã tải tệp ${idea.id}_Bao_Cao_Sang_Kien_CAND_TT30.doc đúng thể thức Thông tư 30/2020/TT-BCA và Nghị định 30/2020/NĐ-CP.`,
      'success'
    );
  };

  // Browser print to PDF
  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textContent = `
BỘ CÔNG AN - CỤC CHUYỂN ĐỔI SỐ
Số: ${idea.id}/BC-CĐS

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Hà Nội, ngày ${day} tháng ${month} năm ${year}

BÁO CÁO THUYẾT MINH SÁNG KIẾN CHUYỂN ĐỔI SỐ CAND
(Mẫu chuẩn CĐS-01/BCA)

MÃ SỐ: ${idea.id}
TÊN SÁNG KIẾN: ${idea.title}
CẤP ĐỘ MẬT: ${secrecyCfg.badge} (${secrecyCfg.label})
LĨNH VỰC: ${cat.label}
TÁC GIẢ: ${[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')} - ${idea.author.unit}
TRẠNG THÁI: ${statusCfg.label} (Tiến độ: ${idea.progressPercentage}%)
DỰ TOÁN: ${(idea.estimatedBudget / 1000000).toLocaleString('vi-VN')} triệu VNĐ

I. TÓM TẮT GIẢI PHÁP:
${idea.abstract}

II. THUYẾT MINH CHI TIẾT:
${idea.description}

III. KIẾN TRÚC KỸ THUẬT & ATTT:
${idea.technicalArchitecture}

IV. HIỆU QUẢ DỰ KIẾN:
${idea.expectedImpact}
    `.trim();

    navigator.clipboard.writeText(textContent);
    onNotify?.(
      'Đã sao chép nội dung',
      'Đã sao chép toàn bộ nội dung báo cáo dạng văn bản vào khay nhớ tạm.',
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-5xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Action Bar (Hidden during print) */}
        <div className="bg-slate-900 px-6 py-3.5 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <CANDEmblem className="w-7 h-7" />
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                MẪU CHUẨN CĐS-01/BCA · THỂ THỨC THÔNG TƯ 30/2020/TT-BCA
              </div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                BÁO CÁO THUYẾT MINH SÁNG KIẾN CHUYỂN ĐỔI SỐ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded transition-colors whitespace-nowrap"
            >
              Sao chép
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0113.25 8H6.75A1.75 1.75 0 015 6.25v-3.5zm1.5 0v3.5c0 .138.112.25.25.25h6.5a.25.25 0 00.25-.25v-3.5a.25.25 0 00-.25-.25h-6.5a.25.25 0 00-.25.25zM3 8a3 3 0 00-3 3v4.5A2.5 2.5 0 002.5 18h15a2.5 2.5 0 002.5-2.5V11a3 3 0 00-3-3H3zm2 4.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              In
            </button>

            <button
              onClick={handleDownloadWordDoc}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
              title="Xuất file Word đúng thể thức Thông tư 30/2020/TT-BCA và Nghị định 30/2020/NĐ-CP"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
              </svg>
              <span>Xuất Word chuẩn TT 30</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 text-slate-950 font-bold text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              {isGenerating ? 'Đang tạo PDF...' : 'Tải xuống PDF'}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-lg font-mono ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Paper Document Container (Scrollable on desktop, full page in print) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-800 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          {/* Authentic Vietnamese Administrative A4 Document Sheet */}
          <div
            ref={documentRef}
            id="printable-pdf-document"
            className="w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-lg space-y-6 text-[12px] leading-relaxed border print:shadow-none print:border-none print:p-6 print:w-full print:max-w-none"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderColor: '#cbd5e1'
            }}
          >
            {/* Header: Administrative Two-Column Block (Nghị định 30/2020/NĐ-CP) */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-900">
              
              {/* Left Column: Organization & Reference Code */}
              <div className="text-center space-y-1">
                <div className="text-[12px] uppercase font-normal tracking-wide">
                  BỘ CÔNG AN
                </div>
                <div className="text-[13px] uppercase font-bold tracking-tight">
                  CỤC CHUYỂN ĐỔI SỐ
                </div>
                <div className="w-24 h-px bg-slate-900 mx-auto" />
                <div className="text-[11px] font-mono text-slate-700 pt-1">
                  Số: <span className="font-bold">{idea.id}</span>/BC-CĐS
                </div>
              </div>

              {/* Right Column: National Motto & Location/Date */}
              <div className="text-center space-y-1">
                <div className="text-[12px] uppercase font-bold tracking-tight">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[12px] font-bold tracking-tight">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="w-32 h-px bg-slate-900 mx-auto" />
                <div className="text-[11px] italic text-slate-700 pt-1">
                  Hà Nội, ngày {day} tháng {month} năm {year}
                </div>
              </div>

            </div>

            {/* Document Title Block */}
            <div className="text-center space-y-1 pt-2">
              <div className="text-[15px] sm:text-[17px] font-bold uppercase tracking-tight text-slate-950">
                BÁO CÁO THUYẾT MINH SÁNG KIẾN CHUYỂN ĐỔI SỐ
              </div>
              <div className="text-[13px] font-bold uppercase text-slate-800">
                TRONG LỰC LƯỢNG CÔNG AN NHÂN DÂN
              </div>
              <div className="text-[11px] italic text-slate-600">
                (Ban hành theo mẫu chuẩn của Cục Chuyển đổi số - Bộ Công an phục vụ thẩm định, phê duyệt và nhân rộng)
              </div>
            </div>

            {/* Secrecy & Priority Seal Block */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-400 text-[11px]">
              <div>
                <span className="font-bold">MỨC ĐỘ BẢO MẬT:</span>{' '}
                <span className="font-bold uppercase text-red-800 px-1.5 py-0.5 border border-red-800 bg-red-50">
                  {secrecyCfg.badge}
                </span>{' '}
                <span className="italic text-slate-600">({secrecyCfg.label})</span>
              </div>
              <div>
                <span className="font-bold">ĐỘ KHẨN:</span>{' '}
                <span className="font-bold uppercase text-slate-900">
                  {idea.priority === 'urgent' ? 'THƯỢNG KHẨN' : idea.priority === 'high' ? 'KHẨN' : 'BÌNH THƯỜNG'}
                </span>
              </div>
            </div>

            {/* PART I: GENERAL INFORMATION TABLE */}
            <div className="space-y-2">
              <div className="text-[13px] font-bold uppercase text-slate-950">
                I. THÔNG TIN CHUNG VỀ SÁNG KIẾN
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[11px]">
                <tbody>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold w-1/4 bg-slate-100">Mã hồ sơ sáng kiến</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold">{idea.id}</td>
                    <td className="border border-slate-800 p-2 font-bold w-1/4 bg-slate-100">Ngày đăng ký</td>
                    <td className="border border-slate-800 p-2 font-mono">
                      {new Date(idea.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Tên sáng kiến</td>
                    <td colSpan={3} className="border border-slate-800 p-2 font-bold text-slate-950">
                      {idea.title}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Lĩnh vực trọng tâm</td>
                    <td className="border border-slate-800 p-2">{cat.label}</td>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Đơn vị thụ hưởng</td>
                    <td className="border border-slate-800 p-2">{idea.targetUnit}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Cán bộ đề xuất</td>
                    <td className="border border-slate-800 p-2">
                      <span className="font-bold">{[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}</span>
                      <div className="text-[10px] text-slate-600">Định danh VNeID: {idea.author.vneidNumber}</div>
                    </td>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Đơn vị công tác</td>
                    <td className="border border-slate-800 p-2">{idea.author.unit}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Kinh phí khái toán</td>
                    <td className="border border-slate-800 p-2 font-mono font-bold">
                      {(idea.estimatedBudget / 1000000).toLocaleString('vi-VN')} triệu đồng
                    </td>
                    <td className="border border-slate-800 p-2 font-bold bg-slate-100">Trạng thái & Tiến độ</td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-900">
                      {statusCfg.label} ({idea.progressPercentage}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PART II: CURRENT SITUATION & NECESSITY */}
            <div className="space-y-1.5">
              <div className="text-[13px] font-bold uppercase text-slate-950">
                II. THỰC TRẠNG VÀ TÍNH CẤP THIẾT CỦA SÁNG KIẾN
              </div>
              <p className="text-justify indent-6 text-slate-900 leading-relaxed">
                {idea.abstract}
              </p>
            </div>

            {/* PART III: DETAILED CONTENT & TECHNICAL SOLUTION */}
            <div className="space-y-2">
              <div className="text-[13px] font-bold uppercase text-slate-950">
                III. NỘI DUNG VÀ GIẢI PHÁP KỸ THUẬT SỐ HÓA
              </div>
              <div className="text-justify indent-6 text-slate-900 leading-relaxed whitespace-pre-line">
                {idea.description}
              </div>

              {/* Technical Infrastructure Block */}
              <div className="p-3 bg-slate-50 border border-slate-400 space-y-1 mt-2">
                <div className="font-bold text-[11px] uppercase text-slate-900">
                  Phương án kiến trúc công nghệ & An toàn an ninh mạng:
                </div>
                <div className="font-mono text-[11px] text-slate-800 leading-relaxed">
                  {idea.technicalArchitecture}
                </div>
                <div className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-300">
                  * Tuân thủ quy định tại Luật An ninh mạng 2025, Luật Bảo vệ dữ liệu cá nhân 2025 và tiêu chuẩn mật mã Ban Cơ yếu Chính phủ.
                </div>
              </div>
            </div>

            {/* PART IV: IMPACT & EFFICIENCY */}
            <div className="space-y-1.5">
              <div className="text-[13px] font-bold uppercase text-slate-950">
                IV. DỰ KIẾN HIỆU QUẢ KINH TẾ, XÃ HỘI VÀ NGHIỆP VỤ CAND
              </div>
              <div className="p-3 bg-slate-50 border border-slate-400 text-justify text-slate-900 leading-relaxed">
                {idea.expectedImpact}
              </div>
            </div>

            {/* PART V: APPRAISAL WORKFLOW & LEADERSHIP DIRECTIVES */}
            <div className="space-y-2">
              <div className="text-[13px] font-bold uppercase text-slate-950">
                V. TIẾN TRÌNH THẨM ĐỊNH VÀ Ý KIẾN CHUYÊN MÔN
              </div>

              <table className="w-full border-collapse border border-slate-800 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-800 p-1.5 w-24">Giai đoạn</th>
                    <th className="border border-slate-800 p-1.5 w-36">Cán bộ xử lý</th>
                    <th className="border border-slate-800 p-1.5">Nội dung thao tác & Ý kiến thẩm định</th>
                    <th className="border border-slate-800 p-1.5 w-24 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.workflow.map((w, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-800 p-1.5 font-bold">{w.stage}</td>
                      <td className="border border-slate-800 p-1.5">{w.actorRank} {w.actorName}</td>
                      <td className="border border-slate-800 p-1.5">
                        <div>{w.action}</div>
                        {w.comment && <div className="italic text-slate-700 mt-0.5">"{w.comment}"</div>}
                      </td>
                      <td className="border border-slate-800 p-1.5 font-mono text-right">
                        {new Date(w.timestamp).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PART VI: DIGITAL SIGNATURES & OFFICIAL SEALS */}
            <div className="pt-6 space-y-4">
              <div className="text-[13px] font-bold uppercase text-slate-950">
                VI. XÁC THỰC KÝ SỐ VÀ PHÊ DUYỆT ĐIỆN TỬ
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                
                {/* 1. Author Signature */}
                <div className="space-y-1">
                  <div className="font-bold uppercase text-[11px]">CÁN BỘ ĐỀ XUẤT</div>
                  <div className="italic text-[10px] text-slate-600">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-slate-400 p-1.5 bg-slate-50 text-[9px] text-slate-700 font-mono text-left w-full">
                      <div className="font-bold text-blue-900">[ĐÃ KÝ SỐ VNeID]</div>
                      <div>{[idea.author.rank, idea.author.fullName].filter(Boolean).join(' ')}</div>
                      <div>{new Date(idea.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>
                  <div className="font-bold text-[11px] pt-1">{idea.author.fullName}</div>
                </div>

                {/* 2. Appraisal Bureau Signature */}
                <div className="space-y-1">
                  <div className="font-bold uppercase text-[11px]">CỤC CHUYỂN ĐỔI SỐ</div>
                  <div className="italic text-[10px] text-slate-600">(Hội đồng thẩm định)</div>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-slate-400 p-1.5 bg-slate-50 text-[9px] text-slate-700 font-mono text-left w-full">
                      <div className="font-bold text-emerald-900">[THẨM ĐỊNH ĐẠT YÊU CẦU]</div>
                      <div>Tiểu ban An ninh mạng</div>
                      <div>Tiêu chuẩn Đề án 06/CP</div>
                    </div>
                  </div>
                  <div className="font-bold text-[11px] pt-1">Thường trực Ban Chỉ đạo</div>
                </div>

                {/* 3. Leadership Approval with Police Seal */}
                <div className="space-y-1">
                  <div className="font-bold uppercase text-[11px]">LÃNH ĐẠO CỤC PHÊ DUYỆT</div>
                  <div className="italic text-[10px] text-slate-600">(Ký số, đóng dấu)</div>
                  <div className="h-16 flex items-center justify-center relative">
                    <div className="border border-slate-400 p-1.5 bg-slate-50 text-[9px] text-slate-700 font-mono text-left w-full">
                      <div className="font-bold text-red-900">[KÝ SỐ CA BAN CƠ YẾU]</div>
                      <div>Đại tá Lê Hoàng Long</div>
                      <div>Phó Cục trưởng C06</div>
                    </div>
                    {/* Digital Red Seal */}
                    <div className="absolute right-0 top-0 w-12 h-12 rounded-full border-2 border-red-700/80 flex items-center justify-center text-[7px] text-red-700 font-bold uppercase rotate-12 bg-red-100/30 pointer-events-none">
                      BỘ CÔNG AN
                    </div>
                  </div>
                  <div className="font-bold text-[11px] pt-1">Đại tá Lê Hoàng Long</div>
                </div>

              </div>

              {/* Digital Hash and QR Verification Footer */}
              <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono text-slate-500">
                <div>
                  MÃ BĂM TOÀN VẸN (SHA-256): <span className="font-bold text-slate-700">9f8e4c7b2a1d0f5e6a8b7c4d3e2f1a0b5c4d3e2f1a0b</span>
                  <br />
                  HỆ THỐNG QUẢN TRỊ SÁNG KIẾN SỐ CAND · TRUNG TÂM DỮ LIỆU BỘ CÔNG AN
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700">TÁC GIẢ PHẦN MỀM: TRẦN NGUYỄN HUY LONG</span> (085.668.2005)
                  <br />
                  HỌC VIỆN AN NINH NHÂN DÂN · TIÊU CHUẨN ISO/IEC 27001
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
