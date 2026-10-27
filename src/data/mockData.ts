import { User, Idea, AuditLog, SystemMetrics, IdeaCategory, SecrecyLevel, IdeaStatus } from '../types';

export const USERS: User[] = [
  {
    id: 'usr-001',
    username: 'trannguyenhuylong',
    fullName: 'Trần Nguyễn Huy Long',
    rank: '',
    unit: 'Học viện An ninh nhân dân (T01)',
    department: 'Khoa An ninh thông tin & Tác chiến mạng',
    vneidNumber: '001205008899',
    role: 'can_bo',
    badgeNumber: 'T01-2005'
  },
  {
    id: 'usr-002',
    username: 'tranductoan.bcdc',
    fullName: 'Trần Đức Toàn',
    rank: 'Thiếu tá',
    unit: 'Cục Viễn thông & Cơ yếu, Bộ Công an',
    department: 'Phòng Thẩm định Công nghệ & An toàn mạng',
    vneidNumber: '036089004519',
    role: 'chuyen_vien',
    badgeNumber: '092-114'
  },
  {
    id: 'usr-003',
    username: 'lehoanglong.lanhdao',
    fullName: 'Lê Hoàng Long',
    rank: 'Đại tá',
    unit: 'Cục Cảnh sát QLHC về TTXH (C06)',
    department: 'Phó Cục trưởng - Trưởng Tiểu ban Ứng dụng Dữ liệu C06',
    vneidNumber: '012075001288',
    role: 'lanh_dao',
    badgeNumber: '003-882'
  },
  {
    id: 'usr-004',
    username: 'vudinhkhoa.admin',
    fullName: 'Vũ Đình Khoa',
    rank: 'Trung tá',
    unit: 'Cục An ninh mạng & PCTP sử dụng CNC (A05)',
    department: 'Trung tâm Quản trị Hạ tầng & Giám sát An ninh',
    vneidNumber: '024082003711',
    role: 'admin',
    badgeNumber: '055-661'
  },
  {
    id: 'usr-author',
    username: 'trannguyenhuylong.t01',
    fullName: 'TRẦN NGUYỄN HUY LONG',
    rank: 'Học viên An ninh',
    unit: 'Học viện An ninh nhân dân (T01)',
    department: 'Tác giả phát triển phần mềm - Điện thoại: 085.668.2005',
    vneidNumber: '001205008899',
    role: 'can_bo',
    badgeNumber: 'T01-2005'
  }
];

export const SYSTEM_AUTHOR = {
  fullName: 'TRẦN NGUYỄN HUY LONG',
  phone: '085.668.2005',
  institution: 'Học viện An ninh nhân dân',
  role: 'Tác giả phát triển phần mềm',
  badge: 'T01-2005'
};

export const INITIAL_IDEAS: Idea[] = [
  {
    id: 'SK-CAND-2026-001',
    title: 'Phần mềm tích hợp VNeID di động phục vụ tuần tra kiểm soát ban đêm của Cảnh sát Cơ động & CSGT',
    abstract: 'Giải pháp ứng dụng thiết bị chuyên dụng mã hóa kết nối trực tiếp CSDL Quốc gia về dân cư qua mạng MPLS bảo mật, tra cứu tức thời thông tin sinh trắc học và lịch sử tư pháp trong 3 giây.',
    description: 'Hiện nay cán bộ tuần tra đêm gặp khó khăn khi kiểm tra giấy tờ nghi vấn vào ban đêm hoặc trường hợp công dân không mang CCCD vật lý. Sáng kiến đề xuất xây dựng ứng dụng di động CAND Offline-First, cài đặt trên thiết bị chuyên dùng ngành. Ứng dụng đọc mã QR/NFC trên thẻ căn cước gắn chip và ứng dụng VNeID, hỗ trợ xác thực vân tay qua cảm biến quang học di động. Khi mất sóng viễn thông, dữ liệu kiểm tra được lưu trữ trong phân vùng mã hóa AES-256 an toàn và tự động đồng bộ về máy chủ Trung tâm chỉ huy ngay khi có kết nối VPN chuyên dụng.',
    technicalArchitecture: 'Frontend: React Native + SQLite Cipher (Offline Cache); API Gateway: Kong/Spring Boot; CSDL: PostgreSQL phân tán Multi-AZ; Tích hợp: CSDLQG Dân cư qua API ký số Ban Cơ yếu Chính phủ.',
    expectedImpact: 'Rút ngắn thời gian tra cứu từ 15 phút xuống dưới 5 giây. Giảm 80% trường hợp phải đưa về trụ sở để xác minh danh tính. Đã triển khai thử nghiệm tại 02 Đội Cảnh sát giao thông - trật tự địa bàn giáp ranh đạt hiệu quả cao.',
    targetUnit: 'Cục C08, Trung đoàn CSCĐ, 6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương',
    category: 'csdl_dancu',
    author: USERS[0],
    status: 'in_progress',
    secrecyLevel: 1,
    priority: 'urgent',
    estimatedBudget: 350000000,
    executionUnit: 'Cục C08 phối hợp Trung tâm Dữ liệu quốc gia về dân cư (C06)',
    progressPercentage: 65,
    originNodeId: 'NODE-BCA-C08',
    originNodeName: 'Cục Cảnh sát Giao thông (C08)',
    createdAt: '2026-08-14T08:30:00Z',
    updatedAt: '2026-10-09T14:20:00Z',
    attachments: [
      {
        id: 'att-01',
        filename: 'Thuyet_minh_giai_phap_VNeID_TuanTra_v2.docx',
        size: '4.2 MB',
        extension: 'docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2026-08-14T08:35:00Z',
        encrypted: true,
        secrecyLevel: 1
      },
      {
        id: 'att-02',
        filename: 'So_do_kien_truc_bao_mat_VPN_MPLS.pdf',
        size: '1.8 MB',
        extension: 'pdf',
        fileType: 'application/pdf',
        uploadedAt: '2026-08-14T08:35:00Z',
        encrypted: true,
        secrecyLevel: 1
      }
    ],
    comments: [
      {
        id: 'cm-01',
        authorId: USERS[1].id,
        authorName: USERS[1].fullName,
        authorRank: USERS[1].rank,
        authorUnit: USERS[1].unit,
        role: 'chuyen_vien',
        content: 'Hồ sơ kỹ thuật đạt yêu cầu an toàn thông tin theo Luật An ninh mạng 2025. Cần bổ sung phương án chống trích xuất bộ nhớ RAM trên thiết bị đầu cuối cầm tay.',
        timestamp: '2026-08-20T10:15:00Z',
        actionTaken: 'Thẩm định kỹ thuật ĐẠT'
      },
      {
        id: 'cm-02',
        authorId: USERS[2].id,
        authorName: USERS[2].fullName,
        authorRank: USERS[2].rank,
        authorUnit: USERS[2].unit,
        role: 'lanh_dao',
        content: 'Đồng ý chủ trương phê duyệt thực hiện giai đoạn 1 tại 02 địa phương trọng điểm. Giao C08 làm đầu mối chỉ đạo, định kỳ báo cáo tiến độ vào ngày 25 hàng tháng.',
        timestamp: '2026-08-25T16:00:00Z',
        actionTaken: 'Phê duyệt triển khai'
      }
    ],
    workflow: [
      {
        id: 'wf-01',
        stage: 'Đăng ký đề xuất',
        actorName: USERS[0].fullName,
        actorRank: USERS[0].rank,
        actorUnit: USERS[0].unit,
        action: 'Khởi tạo hồ sơ sáng kiến số',
        timestamp: '2026-08-14T08:30:00Z'
      },
      {
        id: 'wf-02',
        stage: 'Thẩm định chuyên môn',
        actorName: USERS[1].fullName,
        actorRank: USERS[1].rank,
        actorUnit: USERS[1].unit,
        action: 'Thẩm định kỹ thuật & an ninh mạng: ĐẠT',
        comment: 'Đạt tiêu chuẩn kết nối CSDLQG Dân cư theo quy định Đề án 06',
        timestamp: '2026-08-20T10:15:00Z'
      },
      {
        id: 'wf-03',
        stage: 'Lãnh đạo phê duyệt',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Phê duyệt kế hoạch triển khai',
        comment: 'Cấp mã triển khai thí điểm Q1-2026',
        timestamp: '2026-08-25T16:00:00Z'
      },
      {
        id: 'wf-04',
        stage: 'Giao việc thực hiện',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Giao C08 phối hợp C06 triển khai',
        comment: 'Tiến độ hiện tại: 65% (hoàn thành kiểm thử lab, đang thí điểm hiện trường)',
        timestamp: '2026-09-01T08:00:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-002',
    title: 'Hệ thống giám sát và cảnh báo sớm nguy cơ mất an toàn thông tin tại Công an cấp xã, phường',
    abstract: 'Triển khai giải pháp Agent siêu nhẹ (dưới 15MB RAM) cài đặt trên máy trạm Công an cơ sở, phát hiện xâm nhập USB trái phép, kết nối mạng ngoài trái quy định và gửi cảnh báo tự động về SOC Bộ.',
    description: 'Tại các đơn vị Công an cấp xã/phường, cán bộ thường xuyên thao tác trên máy tính nhập liệu CSDL quốc gia dân cư. Nguy cơ lây nhiễm mã độc qua thiết bị ngoại vi hoặc vô ý kết nối song song mạng Internet công cộng là rủi ro nghiêm trọng. Sáng kiến đề xuất một giải pháp phần mềm giám sát tuân thủ bảo mật nội bộ, tự động cô lập máy vi tính có dấu hiệu vi phạm trong vòng 10 giây và gửi báo cáo về Trung tâm giám sát An ninh mạng A05.',
    technicalArchitecture: 'Agent: Go/Rust tối ưu tài nguyên; Message Queue: Apache Kafka nội bộ; Phân tích log: Elasticsearch + Elastic Security; Quản trị tập trung: Docker Kubernetes tại Trung tâm dữ liệu Bộ.',
    expectedImpact: 'Ngăn chặn 100% việc cắm thiết bị lưu trữ ngoài chưa kiểm định vào máy tính bảo mật. Tăng tốc độ phản ứng với sự cố an ninh mạng tại cấp cơ sở từ 48 giờ xuống dưới 1 phút.',
    targetUnit: '6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương, Cơ quan Bộ công an, Các học viện, trường CAND',
    category: 'anninh_mang',
    author: USERS[3],
    status: 'approved',
    secrecyLevel: 2,
    priority: 'urgent',
    estimatedBudget: 620000000,
    executionUnit: 'Cục An ninh mạng & PCTP sử dụng CNC (A05)',
    progressPercentage: 40,
    originNodeId: 'NODE-BCA-A05',
    originNodeName: 'Cục An ninh mạng & PCTP sử dụng CNC (A05)',
    createdAt: '2026-09-02T09:00:00Z',
    updatedAt: '2026-10-10T11:45:00Z',
    attachments: [
      {
        id: 'att-03',
        filename: 'Phuong_an_an_ninh_A05_GiamSatCapXa.pdf',
        size: '5.6 MB',
        extension: 'pdf',
        fileType: 'application/pdf',
        uploadedAt: '2026-09-02T09:10:00Z',
        encrypted: true,
        secrecyLevel: 2
      },
      {
        id: 'att-03b',
        filename: 'Ban_thuyet_minh_ky_thuat_he_thong_AI.docx',
        size: '3.2 MB',
        extension: 'docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2026-09-02T09:15:00Z',
        encrypted: true,
        secrecyLevel: 2
      }
    ],
    comments: [
      {
        id: 'cm-03',
        authorId: USERS[2].id,
        authorName: USERS[2].fullName,
        authorRank: USERS[2].rank,
        authorUnit: USERS[2].unit,
        role: 'lanh_dao',
        content: 'Đồng ý phê duyệt triển khai thử nghiệm trên 500 xã thuộc 5 tỉnh trọng điểm trước khi đề xuất mở rộng diện rộng.',
        timestamp: '2026-09-18T14:30:00Z',
        actionTaken: 'Phê duyệt chủ trương'
      }
    ],
    workflow: [
      {
        id: 'wf-05',
        stage: 'Đăng ký đề xuất',
        actorName: USERS[3].fullName,
        actorRank: USERS[3].rank,
        actorUnit: USERS[3].unit,
        action: 'Khởi tạo hồ sơ sáng kiến cấp Cục',
        timestamp: '2026-09-02T09:00:00Z'
      },
      {
        id: 'wf-06',
        stage: 'Thẩm định chuyên môn',
        actorName: USERS[1].fullName,
        actorRank: USERS[1].rank,
        actorUnit: USERS[1].unit,
        action: 'Thẩm định: ĐẠT TIÊU CHUẨN CƠ YẾU',
        timestamp: '2026-09-10T10:00:00Z'
      },
      {
        id: 'wf-07',
        stage: 'Lãnh đạo phê duyệt',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Phê duyệt triển khai diện rộng theo lộ trình',
        timestamp: '2026-09-18T14:30:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-003',
    title: 'Trợ lý số nghiệp vụ hướng dẫn giải quyết thủ tục cư trú & đăng ký phương tiện cho Công an xã',
    abstract: 'Xây dựng kho tri thức số hóa và công cụ tìm kiếm ngữ nghĩa theo các Nghị định, Thông tư mới nhất, giúp cán bộ cơ sở giải quyết hồ sơ công dân chuẩn xác, không bị trả lại do sai sót thủ tục.',
    description: 'Sau khi phân cấp đăng ký phương tiện và quản lý cư trú về cấp xã, khối lượng văn bản hướng dẫn và tình huống nghiệp vụ thực tế phát sinh rất lớn. Sáng kiến số hóa toàn bộ hệ thống biểu mẫu, quy trình, các tình huống hỏi đáp điển hình. Cán bộ chỉ cần gõ tình huống bằng ngôn ngữ tự nhiên để nhận được hướng dẫn căn cứ điều khoản cụ thể và mẫu quyết định hành chính chuẩn.',
    technicalArchitecture: 'Frontend: Web SPA React; Backend: Python FastAPI + Vector Database nội bộ (Milvus/pgvector trên mạng nội bộ cách ly hoàn toàn Internet); CSDL: PostgreSQL 15.',
    expectedImpact: 'Giảm 90% thời gian tra cứu văn bản pháp luật của cán bộ xã. Tỷ lệ hồ sơ TTHC giải quyết đúng hạn đạt 99.8%. Tỷ lệ hài lòng của nhân dân tăng trên 15%.',
    targetUnit: 'Cán bộ Công an phụ trách QLHC tại 6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương',
    category: 'dichvu_cong',
    author: USERS[0],
    status: 'completed',
    secrecyLevel: 0,
    priority: 'normal',
    estimatedBudget: 180000000,
    executionUnit: 'Công an TP. Hà Nội phối hợp C06',
    progressPercentage: 100,
    originNodeId: 'NODE-TP-HN',
    originNodeName: 'Công an Thành phố Hà Nội',
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-09-28T16:00:00Z',
    attachments: [
      {
        id: 'att-04',
        filename: 'Bao_cao_tong_ket_trien_khai_thi_diem_HaNoi.pdf',
        size: '8.4 MB',
        fileType: 'application/pdf',
        uploadedAt: '2026-09-28T15:30:00Z',
        encrypted: false,
        secrecyLevel: 0
      }
    ],
    comments: [
      {
        id: 'cm-04',
        authorId: USERS[2].id,
        authorName: USERS[2].fullName,
        authorRank: USERS[2].rank,
        authorUnit: USERS[2].unit,
        role: 'lanh_dao',
        content: 'Đã nghiệm thu thành công. Đề nghị nhân rộng áp dụng trên toàn quốc nhân dịp Ngày Chuyển đổi số Quốc gia.',
        timestamp: '2026-09-28T16:00:00Z',
        actionTaken: 'Nghiệm thu & Nhân rộng toàn quốc'
      }
    ],
    workflow: [
      {
        id: 'wf-08',
        stage: 'Đăng ký',
        actorName: USERS[0].fullName,
        actorRank: USERS[0].rank,
        actorUnit: USERS[0].unit,
        action: 'Tạo đề xuất',
        timestamp: '2026-06-10T08:00:00Z'
      },
      {
        id: 'wf-09',
        stage: 'Nghiệm thu',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Đã hoàn thành xuất sắc & đưa vào vận hành chính thức',
        timestamp: '2026-09-28T16:00:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-004',
    title: 'Hệ thống mô phỏng bài tập tình huống chữa cháy và cứu nạn cứu hộ ứng dụng 3D tương tác',
    abstract: 'Xây dựng các sa bàn ảo mô phỏng các tòa nhà chung cư cao tầng và khu công nghiệp đặc thù, phục vụ huấn luyện chiến thuật chỉ huy chữa cháy trước khi xuất quân.',
    description: 'Hỗ trợ lực lượng Cảnh sát PCCC & CNCH huấn luyện phương án dập lửa, điều động xe thang và cứu người trong không gian khói độc mà không phát sinh chi phí đốt thực tế. Dữ liệu sa bàn được tích hợp với bản đồ quy hoạch hạ tầng cấp nước PCCC của địa phương.',
    technicalArchitecture: 'WebGL 3D Engine (Three.js), Server Stream Node.js, WebSockets độ trễ thấp; Máy chủ đồ họa on-premise tại Trung tâm chỉ huy 114.',
    expectedImpact: 'Tiết kiệm hơn 400 triệu đồng chi phí diễn tập thực địa mỗi quý, tăng khả năng xử lý tình huống thực tế của cán bộ chiến sĩ trẻ.',
    targetUnit: 'Cục C07 và Phòng Cảnh sát PCCC & CNCH tại các thành phố, tỉnh địa phương',
    category: 'thietbi_chuyendung',
    author: USERS[1],
    status: 'reviewing',
    secrecyLevel: 1,
    priority: 'normal',
    estimatedBudget: 420000000,
    progressPercentage: 20,
    originNodeId: 'NODE-BCA-C07',
    originNodeName: 'Cục Cảnh sát PCCC & CNCH (C07)',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-08T09:30:00Z',
    attachments: [
      {
        id: 'att-05',
        filename: 'Thiet_ke_sa_ban_ao_PCCC_v1.pdf',
        size: '12.1 MB',
        fileType: 'application/pdf',
        uploadedAt: '2026-10-01T10:15:00Z',
        encrypted: true,
        secrecyLevel: 1
      }
    ],
    comments: [
      {
        id: 'cm-05',
        authorId: USERS[1].id,
        authorName: USERS[1].fullName,
        authorRank: USERS[1].rank,
        authorUnit: USERS[1].unit,
        role: 'chuyen_vien',
        content: 'Đang tổ chức hội đồng thẩm định độc lập gồm các giảng viên Trường Đại học PCCC và chuyên viên Cục Viễn thông.',
        timestamp: '2026-10-08T09:30:00Z',
        actionTaken: 'Đang thẩm định'
      }
    ],
    workflow: [
      {
        id: 'wf-10',
        stage: 'Đăng ký',
        actorName: USERS[1].fullName,
        actorRank: USERS[1].rank,
        actorUnit: USERS[1].unit,
        action: 'Tạo sáng kiến',
        timestamp: '2026-10-01T10:00:00Z'
      },
      {
        id: 'wf-11',
        stage: 'Thẩm định',
        actorName: USERS[1].fullName,
        actorRank: USERS[1].rank,
        actorUnit: USERS[1].unit,
        action: 'Đang họp hội đồng khoa học thẩm định',
        timestamp: '2026-10-08T09:30:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-005',
    title: 'Hệ thống thẻ số hóa rèn luyện điều lệnh & kiểm tra nhận thức chính trị định kỳ CAND',
    abstract: 'Phần mềm trắc nghiệm trực tuyến bảo mật và theo dõi rèn luyện thể lực, điều lệnh công an nhân dân với thuật toán chống gian lận qua camera nhận diện khuôn mặt.',
    description: 'Chuyển đổi hoàn toàn phương thức kiểm tra chính trị và điều lệnh từ thi trên giấy sang hệ thống thi điện tử tập trung. Tự động chấm điểm, phân loại chất lượng đảng viên và cán bộ chiến sĩ cuối năm, tích hợp trực tiếp hồ sơ cán bộ.',
    technicalArchitecture: 'Frontend: React Responsive; Backend: Java Spring Boot; Database: PostgreSQL; Chấm thi tự động có chữ ký số điện tử cán bộ coi thi.',
    expectedImpact: 'Tiết kiệm hơn 30.000 giờ chấm thi và giấy in mỗi năm trên quy mô toàn lực lượng. Đảm bảo tính trung thực khách quan 100%.',
    targetUnit: 'Cục Công tác Đảng & Công tác Chính trị (X03), Công an toàn quốc',
    category: 'giaoduc_chinhtri',
    author: USERS[0],
    status: 'submitted',
    secrecyLevel: 0,
    priority: 'normal',
    estimatedBudget: 210000000,
    progressPercentage: 5,
    originNodeId: 'NODE-BCA-X03',
    originNodeName: 'Cục Công tác Đảng & Công tác Chính trị (X03)',
    createdAt: '2026-10-10T14:00:00Z',
    updatedAt: '2026-10-10T14:00:00Z',
    attachments: [],
    comments: [],
    workflow: [
      {
        id: 'wf-12',
        stage: 'Đăng ký',
        actorName: USERS[0].fullName,
        actorRank: USERS[0].rank,
        actorUnit: USERS[0].unit,
        action: 'Gửi hồ sơ đăng ký đề xuất mới',
        timestamp: '2026-10-10T14:00:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-006',
    title: 'Mô hình liên thông dữ liệu xử phạt vi phạm giao thông và nộp phạt trực tuyến tích hợp tài khoản VNeID mức 2',
    abstract: 'Tự động hóa hoàn toàn quy trình xử phạt nguội từ trích xuất camera giám sát AI đến khi công dân nhận thông báo trên VNeID và thanh toán qua Cổng DVC Quốc gia.',
    description: 'Loại bỏ hoàn toàn bước gửi giấy báo phạt bằng văn bản giấy qua đường bưu điện đối với các trường hợp đã có tài khoản định danh VNeID mức 2. Cán bộ chỉ cần phê duyệt biên bản điện tử, hệ thống tự động sinh mã nộp phạt kho bạc.',
    technicalArchitecture: 'Microservices kiến trúc sự kiện (Kafka, Docker, Kubernetes); Tích hợp Cổng Dịch vụ công Quốc gia và CSDL xử lý vi phạm hành chính C08.',
    expectedImpact: 'Tiết kiệm hơn 15 tỷ đồng tiền in ấn và cước bưu chính hàng năm. Tăng tỷ lệ tự nguyện nộp phạt trong 10 ngày đầu lên 78%.',
    targetUnit: 'Cục C08, Phòng CSGT Công an các tỉnh, thành phố',
    category: 'csdl_dancu',
    author: USERS[2],
    status: 'approved',
    secrecyLevel: 1,
    priority: 'high',
    estimatedBudget: 550000000,
    executionUnit: 'Cục C08 phối hợp Trung tâm DVC Bộ Công an',
    progressPercentage: 50,
    originNodeId: 'NODE-BCA-C06',
    originNodeName: 'Cục Cảnh sát QLHC về TTXH (C06)',
    createdAt: '2026-07-22T08:00:00Z',
    updatedAt: '2026-10-05T10:00:00Z',
    attachments: [
      {
        id: 'att-06',
        filename: 'Phuong_an_ket_noi_lien_thong_VNeID_KhoBac.pdf',
        size: '6.7 MB',
        fileType: 'application/pdf',
        uploadedAt: '2026-07-22T08:30:00Z',
        encrypted: true,
        secrecyLevel: 1
      }
    ],
    comments: [],
    workflow: [
      {
        id: 'wf-13',
        stage: 'Đăng ký',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Đăng ký sáng kiến liên ngành',
        timestamp: '2026-07-22T08:00:00Z'
      },
      {
        id: 'wf-14',
        stage: 'Lãnh đạo phê duyệt',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Thông qua kế hoạch liên thông toàn diện',
        timestamp: '2026-08-15T14:00:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-007',
    title: 'Nền tảng kiểm định và thẩm định an ninh mạng tự động cho sáng kiến số CAND',
    abstract: 'Công cụ rà quét lỗ hổng mã nguồn, kiểm tra tuân thủ mã hóa AES-256 và giao thức mTLS chuyên dùng trên mạng nội bộ phục vụ hội đồng thẩm định kỹ thuật Bộ Công an.',
    description: 'Được phát triển bởi cán bộ nghiên cứu Học viện An ninh nhân dân, nền tảng cho phép phân tích kiến trúc phần mềm, kiểm tra tiêu chuẩn mã hóa và tính toàn vẹn của hồ sơ đề xuất chuyển đổi số trong lực lượng trước khi trình Lãnh đạo Bộ phê duyệt.',
    technicalArchitecture: 'Frontend: React TypeScript; Backend: Go microservices; Tích hợp SonarQube & OpenSCAP nội bộ trên mạng MPLS CAND cách ly.',
    expectedImpact: 'Rút ngắn thời gian thẩm định kỹ thuật từ 14 ngày xuống dưới 2 ngày, phát hiện 100% các vi phạm kết nối mạng ngoài trái quy định.',
    targetUnit: 'Học viện An ninh nhân dân (T01) và Hội đồng Thẩm định KH&CN Bộ',
    category: 'anninh_mang',
    author: USERS[4], // Tác giả TRẦN NGUYỄN HUY LONG
    status: 'approved',
    secrecyLevel: 2,
    priority: 'urgent',
    estimatedBudget: 380000000,
    executionUnit: 'Học viện An ninh nhân dân (T01) phối hợp A05',
    progressPercentage: 70,
    originNodeId: 'NODE-TRUONG-T01',
    originNodeName: 'Học viện An ninh nhân dân (T01)',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-10-11T15:30:00Z',
    attachments: [
      {
        id: 'att-07',
        filename: 'Thuyet_minh_he_thong_kiem_dinh_T01_Long.pdf',
        size: '4.8 MB',
        extension: 'pdf',
        fileType: 'application/pdf',
        uploadedAt: '2026-08-10T09:15:00Z',
        encrypted: true,
        secrecyLevel: 2
      }
    ],
    comments: [
      {
        id: 'cm-07',
        authorId: USERS[2].id,
        authorName: USERS[2].fullName,
        authorRank: USERS[2].rank,
        authorUnit: USERS[2].unit,
        role: 'lanh_dao',
        content: 'Đánh giá cao công trình sáng tạo của tác giả Trần Nguyễn Huy Long (T01). Đồng ý phê duyệt triển khai thí điểm tại các trường CAND.',
        timestamp: '2026-08-25T11:00:00Z',
        actionTaken: 'Phê duyệt triển khai'
      }
    ],
    workflow: [
      {
        id: 'wf-15',
        stage: 'Đăng ký đề xuất',
        actorName: USERS[4].fullName,
        actorRank: USERS[4].rank,
        actorUnit: USERS[4].unit,
        action: 'Khởi tạo hồ sơ sáng kiến khoa học T01',
        timestamp: '2026-08-10T09:00:00Z'
      },
      {
        id: 'wf-16',
        stage: 'Hội đồng thẩm định',
        actorName: USERS[1].fullName,
        actorRank: USERS[1].rank,
        actorUnit: USERS[1].unit,
        action: 'Thẩm định an toàn an ninh mạng: XUẤT SẮC',
        timestamp: '2026-08-20T14:00:00Z'
      },
      {
        id: 'wf-17',
        stage: 'Lãnh đạo phê duyệt',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Phê duyệt chính thức và cấp kinh phí giai đoạn 1',
        timestamp: '2026-08-25T11:00:00Z'
      }
    ]
  },
  {
    id: 'SK-CAND-2026-008',
    title: 'Hệ sinh thái Camera AI giám sát an ninh trật tự & phân luồng thông minh TP. Hồ Chí Minh',
    abstract: 'Ứng dụng mô hình thị giác máy tính nhận diện biển số và phát hiện tụ tập, ùn tắc giao thông tự động, kết nối trực tiếp Trung tâm chỉ huy Công an TP. Hồ Chí Minh.',
    description: 'Kết nối đồng bộ hơn 1.200 camera giao thông và an ninh tại các giao lộ trọng điểm, tích hợp với CSDL đăng ký phương tiện và nhận diện đối tượng truy nã thời gian thực.',
    technicalArchitecture: 'Edge AI NPU tại camera + DeepStream Kafka trung tâm; CSDL phân tán ScyllaDB + ElasticSearch trên máy chủ nội bộ CATP.',
    expectedImpact: 'Giảm 35% tình trạng ùn tắc kéo dài, tăng 50% hiệu quả trích xuất chứng cứ điều tra phá án hình sự trên địa bàn thành phố.',
    targetUnit: 'Công an Thành phố Hồ Chí Minh (PC08, PC02, PV01)',
    category: 'nghiepvu_coso',
    author: USERS[0],
    status: 'in_progress',
    secrecyLevel: 1,
    priority: 'urgent',
    estimatedBudget: 850000000,
    executionUnit: 'Công an TP. Hồ Chí Minh phối hợp Cục A05',
    progressPercentage: 45,
    originNodeId: 'NODE-TP-HCM',
    originNodeName: 'Công an Thành phố Hồ Chí Minh',
    createdAt: '2026-07-05T08:00:00Z',
    updatedAt: '2026-10-09T16:00:00Z',
    attachments: [
      {
        id: 'att-08',
        filename: 'Phuong_an_trien_khai_CameraAI_TPHCM.pdf',
        size: '14.5 MB',
        extension: 'pdf',
        fileType: 'application/pdf',
        uploadedAt: '2026-07-05T08:20:00Z',
        encrypted: true,
        secrecyLevel: 1
      }
    ],
    comments: [],
    workflow: [
      {
        id: 'wf-18',
        stage: 'Đăng ký',
        actorName: USERS[0].fullName,
        actorRank: USERS[0].rank,
        actorUnit: USERS[0].unit,
        action: 'Khởi tạo hồ sơ đề xuất',
        timestamp: '2026-07-05T08:00:00Z'
      },
      {
        id: 'wf-19',
        stage: 'Lãnh đạo phê duyệt',
        actorName: USERS[2].fullName,
        actorRank: USERS[2].rank,
        actorUnit: USERS[2].unit,
        action: 'Phê duyệt chủ trương trang bị đợt 1',
        timestamp: '2026-07-20T10:00:00Z'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-20261012-0941',
    userId: 'usr-003',
    userName: 'Lê Hoàng Long (Đại tá)',
    userRank: 'Đại tá',
    action: 'PHÊ_DUYỆT_SÁNG_KIẾN',
    entityId: 'SK-CAND-2026-006',
    timestamp: '2026-10-12T04:45:12Z',
    ipAddress: '10.15.2.14',
    status: 'SUCCESS',
    details: 'Phê duyệt chuyển trạng thái sang ĐANG_TRIỂN_KHAI qua Token CA ký số'
  },
  {
    id: 'LOG-20261012-0922',
    userId: 'usr-001',
    userName: 'Trần Nguyễn Huy Long',
    userRank: '',
    action: 'TẠO_MỚI_SÁNG_KIẾN',
    entityId: 'SK-CAND-2026-005',
    timestamp: '2026-10-10T14:00:00Z',
    ipAddress: '10.88.19.201',
    status: 'SUCCESS',
    details: 'Đăng ký đề xuất sáng kiến số: Thẻ số hóa rèn luyện điều lệnh CAND'
  },
  {
    id: 'LOG-20261012-0810',
    userId: 'usr-002',
    userName: 'Trần Đức Toàn (Thiếu tá)',
    userRank: 'Thiếu tá',
    action: 'THẨM_ĐỊNH_HỒ_SƠ',
    entityId: 'SK-CAND-2026-004',
    timestamp: '2026-10-08T09:30:00Z',
    ipAddress: '10.12.8.55',
    status: 'SUCCESS',
    details: 'Hội đồng chuyên môn lập biên bản thẩm định kỹ thuật kiến trúc 3D'
  },
  {
    id: 'LOG-20261011-1640',
    userId: 'usr-004',
    userName: 'Vũ Đình Khoa (Trung tá)',
    userRank: 'Trung tá',
    action: 'QUẢN_TRỊ_BẢO_MẬT_SAO_LƯU',
    entityId: 'SYS_DB_BACKUP',
    timestamp: '2026-10-11T16:00:00Z',
    ipAddress: '10.2.1.8',
    status: 'SUCCESS',
    details: 'Sao lưu tự động CSDL PostgreSQL sang phân vùng lưu trữ Ceph nội bộ'
  },
  {
    id: 'LOG-20261011-1120',
    userId: 'usr-guest',
    userName: 'Không xác định',
    userRank: 'Chưa xác thực',
    action: 'TRUY_CẬP_VÙNG_MẬT',
    entityId: 'SK-CAND-2026-002',
    timestamp: '2026-10-11T11:20:00Z',
    ipAddress: '172.16.89.4',
    status: 'DENIED',
    details: 'Truy cập bị chặn: Yêu cầu chứng thư số CA CAND mức 2 theo Luật An ninh mạng'
  }
];

export const INITIAL_METRICS: SystemMetrics = {
  totalInitiatives: 48,
  approvedCount: 31,
  inProgressCount: 12,
  completedCount: 9,
  totalBudgetSavedEst: 3240, // triệu VNĐ
  avgResolutionDays: 14.2,
  citiesConnected: 6,
  provincesConnected: 28,
  ministryUnitsConnected: 8,
  academiesConnected: 9,
  grassrootsUnitsConnected: 10598, // Cấp 3: 10.598 Công an cấp xã/phường/thị trấn & Đội nghiệp vụ
  wardsConnected: 10598
};

export const CATEGORY_LABELS: Record<IdeaCategory, { label: string; short: string; color: string; desc: string }> = {
  csdl_dancu: {
    label: 'CSDL Dân cư & VNeID (Đề án 06)',
    short: 'Đề án 06 & VNeID',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    desc: 'Tích hợp xác thực căn cước, sinh trắc học và dịch vụ dân cư toàn quốc'
  },
  anninh_mang: {
    label: 'An ninh mạng & Giám sát thông minh',
    short: 'An ninh mạng',
    color: 'text-red-700 bg-red-50 border-red-200',
    desc: 'Bảo vệ hệ thống hạ tầng trọng yếu, ngăn chặn xâm nhập và ứng cứu sự cố'
  },
  dichvu_cong: {
    label: 'Cải cách TTHC & Dịch vụ công trực tuyến',
    short: 'Dịch vụ công',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    desc: 'Số hóa tiếp nhận hồ sơ, thanh toán trực tuyến và cắt giảm thủ tục phiền hà'
  },
  nghiepvu_coso: {
    label: 'Số hóa Nghiệp vụ Cơ sở & Xã/Phường',
    short: 'Nghiệp vụ cơ sở',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    desc: 'Công cụ trực quan phục vụ công an xã/phường bám nắm địa bàn dân cư'
  },
  thietbi_chuyendung: {
    label: 'Hạ tầng số, Thiết bị & Viễn thông Chuyên dụng',
    short: 'Thiết bị & Viễn thông',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    desc: 'Mạng chuyên dùng MPLS CAND, thiết bị tuần tra kiểm soát và thông tin cơ yếu'
  },
  giaoduc_chinhtri: {
    label: 'Giáo dục Chính trị & Huấn luyện số',
    short: 'Đào tạo & Chính trị',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    desc: 'Thi điện tử, tài liệu số hóa, học tập lý luận và rèn luyện điều lệnh CAND'
  }
};

export const STATUS_CONFIG: Record<IdeaStatus, { label: string; color: string; stageOrder: number }> = {
  draft: { label: 'Bản thảo / Offline', color: 'text-slate-600', stageOrder: 0 },
  submitted: { label: 'Chờ tiếp nhận', color: 'text-amber-600', stageOrder: 1 },
  reviewing: { label: 'Đang thẩm định', color: 'text-blue-600', stageOrder: 2 },
  approved: { label: 'Đã phê duyệt', color: 'text-emerald-600', stageOrder: 3 },
  revision_requested: { label: 'Yêu cầu hiệu chỉnh', color: 'text-orange-600', stageOrder: 2 },
  rejected: { label: 'Từ chối phê duyệt', color: 'text-red-600', stageOrder: 3 },
  assigned: { label: 'Đã giao đơn vị', color: 'text-indigo-600', stageOrder: 4 },
  in_progress: { label: 'Đang triển khai', color: 'text-purple-600', stageOrder: 5 },
  completed: { label: 'Đã nghiệm thu', color: 'text-teal-600', stageOrder: 6 }
};

export const SECRECY_CONFIG: Record<SecrecyLevel, { label: string; badge: string; color: string; accessDesc: string }> = {
  0: { label: 'Công khai nội bộ ngành', badge: 'THÔNG THƯỜNG', color: 'text-slate-600', accessDesc: 'Tất cả cán bộ chiến sĩ CAND' },
  1: { label: 'Tài liệu nội bộ đơn vị', badge: 'NỘI BỘ', color: 'text-blue-600', accessDesc: 'Cán bộ thuộc phòng/ban liên quan' },
  2: { label: 'Tài liệu Mật', badge: 'MẬT', color: 'text-amber-600', accessDesc: 'Cán bộ có thẩm quyền & xác thực CA' },
  3: { label: 'Tài liệu Tối mật', badge: 'TỐI MẬT', color: 'text-red-600', accessDesc: 'Chỉ Lãnh đạo cấp Cục và Ban Giám đốc' }
};
