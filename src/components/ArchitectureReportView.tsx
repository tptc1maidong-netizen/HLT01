import React, { useState } from 'react';

export function ArchitectureReportView() {
  const [activeSection, setActiveSection] = useState<'architecture' | 'erd' | 'devops' | 'matrix' | 'roadmap' | 'risks'>('architecture');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [showSqlCommands, setShowSqlCommands] = useState(false);
  const [showDevOpsCommands, setShowDevOpsCommands] = useState(false);

  const copyCode = (snippetName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetName);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const sqlCode = `-- CSDL QUẢN TRỊ SÁNG KIẾN SỐ CAND (PostgreSQL 15+)
CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  rank VARCHAR(50) NOT NULL,
  unit VARCHAR(200) NOT NULL,
  vneid_number VARCHAR(12) UNIQUE NOT NULL,
  role_id INT REFERENCES role(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE status (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE idea (
  id VARCHAR(30) PRIMARY KEY, -- SK-CAND-2026-XXXX
  title VARCHAR(255) NOT NULL,
  abstract TEXT NOT NULL,
  description TEXT,
  technical_architecture TEXT,
  expected_impact TEXT,
  target_unit VARCHAR(200),
  author_id INT REFERENCES "user"(id) ON DELETE RESTRICT,
  status_id INT REFERENCES status(id),
  secrecy_level SMALLINT NOT NULL DEFAULT 0, -- 0: Thường, 1: Nội bộ, 2: Mật, 3: Tối mật
  priority VARCHAR(20) DEFAULT 'normal',
  estimated_budget BIGINT DEFAULT 0,
  progress_percentage SMALLINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comment (
  id SERIAL PRIMARY KEY,
  idea_id VARCHAR(30) REFERENCES idea(id) ON DELETE CASCADE,
  user_id INT REFERENCES "user"(id),
  content TEXT NOT NULL,
  action_taken VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE attachment (
  id SERIAL PRIMARY KEY,
  idea_id VARCHAR(30) REFERENCES idea(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  filesize VARCHAR(50),
  is_encrypted BOOLEAN DEFAULT TRUE,
  secrecy_level SMALLINT DEFAULT 0
);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id),
  action VARCHAR(100) NOT NULL,
  entity_id VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip VARCHAR(45) NOT NULL,
  status VARCHAR(20) DEFAULT 'SUCCESS',
  details TEXT
);

-- Index tối ưu tra cứu
CREATE INDEX idx_idea_status ON idea(status_id);
CREATE INDEX idx_idea_author ON idea(author_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);`;

  const k8sCode = `# Kubernetes Deployment & Service Manifest CAND
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cand-idea-service
  namespace: cand-digital
  labels:
    app: cand-idea-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cand-idea-service
  template:
    metadata:
      labels:
        app: cand-idea-service
    spec:
      containers:
      - name: idea-app
        image: cand-registry.bca.vn/digital/idea-service:2026.1
        ports:
        - containerPort: 4000
        resources:
          limits:
            cpu: "2"
            memory: "4Gi"
          requests:
            cpu: "500m"
            memory: "1Gi"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cand-db-secret
              key: connection-string
        - name: CIPHER_KEY_AES256
          valueFrom:
            secretKeyRef:
              name: cand-crypto-keys
              key: aes-master-key
---
apiVersion: v1
kind: Service
metadata:
  name: cand-idea-service
  namespace: cand-digital
spec:
  type: ClusterIP
  ports:
  - port: 4000
    targetPort: 4000
  selector:
    app: cand-idea-service`;

  const terraformCode = `# Terraform Infrastructure as Code (BCA Government Cloud / VPC)
resource "aws_vpc" "cand_digital_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "cand-digital-isolated-vpc"
    Classification = "RESTRICTED-CAND"
  }
}

resource "aws_subnet" "cand_private_subnets" {
  count             = 3
  vpc_id            = aws_vpc.cand_digital_vpc.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = "ap-southeast-1\${element(["a","b","c"], count.index)}"
  tags = { Name = "cand-priv-net-\${count.index}" }
}

resource "aws_db_instance" "cand_postgres_cluster" {
  identifier             = "cand-ideadb-prod"
  allocated_storage      = 200
  max_allocated_storage  = 1000
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.r6g.xlarge"
  multi_az               = true
  storage_encrypted      = true
  kms_key_id             = "arn:aws:kms:ap-southeast-1:bca:key/cand-db-key"
  username               = "cand_admin"
  password               = var.db_master_password
  db_subnet_group_name   = "cand-db-subnet-group"
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  deletion_protection    = true
}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header & Author Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900">
            BÁO CÁO KỸ THUẬT CHUYÊN SÂU & BẢN ĐỒ KIẾN TRÚC HỆ THỐNG
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tài liệu đặc tả kiến trúc phân tầng, cơ sở dữ liệu quan hệ, quy chuẩn an toàn thông tin và phương án triển khai
          </p>
        </div>

        <div className="p-2.5 bg-amber-50 border border-amber-300/80 rounded-lg text-xs shrink-0 space-y-0.5 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-amber-800">TÁC GIẢ GIẢI PHÁP PHẦN MỀM</div>
          <div className="font-extrabold text-slate-900">TRẦN NGUYỄN HUY LONG</div>
          <div className="text-[11px] text-slate-700 font-medium">Học viện An ninh nhân dân · ĐT: 085.668.2005</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-1.5 flex flex-wrap gap-1 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm">
        <button
          onClick={() => setActiveSection('architecture')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSection === 'architecture' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          1. KIẾN TRÚC HỆ THỐNG
        </button>
        <button
          onClick={() => setActiveSection('erd')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSection === 'erd' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          2. SƠ ĐỒ THỰC THỂ DỮ LIỆU (ERD)
        </button>
        <button
          onClick={() => setActiveSection('devops')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSection === 'devops' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          3. PHƯƠNG ÁN HẠ TẦNG K8S & CLOUD
        </button>
        <button
          onClick={() => setActiveSection('matrix')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSection === 'matrix' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          4. MA TRẬN 3 PHƯƠNG ÁN CÔNG NGHỆ
        </button>
        <button
          onClick={() => setActiveSection('roadmap')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSection === 'roadmap' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          5. DỰ TOÁN NGÂN SÁCH & LỘ TRÌNH
        </button>
        <button
          onClick={() => setActiveSection('risks')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeSection === 'risks' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          6. QUẢN TRỊ RỦI RO & PHÁP LÝ
        </button>
      </div>

      {/* SECTION 1: SYSTEM ARCHITECTURE & WORKFLOW */}
      {activeSection === 'architecture' && (
        <div className="space-y-6 text-xs text-slate-800">
          
          {/* Executive Summary Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Tổng quan kiến trúc phân tầng hệ thống (Multi-Tier Architecture)
              </h2>
              <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 px-3 py-1 rounded text-amber-900">
                <span className="font-semibold text-amber-800">Tác giả phần mềm:</span>
                <span className="font-bold">TRẦN NGUYỄN HUY LONG</span>
                <span className="text-amber-400">·</span>
                <span className="font-mono font-medium">085.668.2005</span>
                <span className="text-amber-400">·</span>
                <span className="font-medium">Học viện An ninh nhân dân</span>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Hệ thống được thiết kế theo kiến trúc phân tầng kết hợp hướng dịch vụ (Service-Oriented & Microservices), bảo đảm tính sẵn sàng cao (High Availability), có khả năng mở rộng phục vụ toàn quân và phân vùng cô lập an toàn thông tin theo cấp độ bảo mật của ngành Công an Nhân dân.
            </p>

            {/* Architecture Topology SVG */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-white overflow-x-auto">
              <svg viewBox="0 0 900 420" className="w-full min-w-[700px] h-auto font-sans" fill="none">
                {/* Layer 1: Client Layer */}
                <rect x="20" y="20" width="860" height="60" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <text x="40" y="45" fill="#94A3B8" fontSize="11" fontWeight="bold">TẦNG 1: GIAO DIỆN NGƯỜI DÙNG (MULTI-PLATFORM & OFFLINE-FIRST CLIENTS)</text>
                <text x="40" y="65" fill="#CBD5E1" fontSize="12">Web SPA (React / Tailwind) · Ứng dụng Di động CAND (React Native / Offline Cache) · Máy trạm chuyên dụng</text>

                {/* Arrow down */}
                <line x1="450" y1="80" x2="450" y2="105" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />

                {/* Layer 2: Network & Security Perimeter */}
                <rect x="20" y="110" width="860" height="65" rx="6" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                <text x="40" y="135" fill="#FBBF24" fontSize="11" fontWeight="bold">TẦNG 2: VÀNH ĐAI AN NINH & TRUYỀN SỐ LIỆU CHUYÊN DÙNG (SECURITY PERIMETER)</text>
                <text x="40" y="155" fill="#E2E8F0" fontSize="12">Mạng MPLS CAND · VPN mã hóa Cơ yếu · TLS 1.3 mTLS · Web Application Firewall (WAF) · Hệ thống phòng vệ DDoS</text>

                {/* Arrow down */}
                <line x1="450" y1="175" x2="450" y2="200" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />

                {/* Layer 3: API Gateway & Service Mesh */}
                <rect x="20" y="205" width="860" height="85" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <text x="40" y="230" fill="#60A5FA" fontSize="11" fontWeight="bold">TẦNG 3: API GATEWAY & MICROSERVICES (KUBERNETES CLUSTER ON-PREMISE)</text>
                
                <rect x="40" y="245" width="150" height="32" rx="4" fill="#334155" />
                <text x="115" y="265" fill="#F8FAFC" fontSize="10" textAnchor="middle">User & RBAC Service</text>

                <rect x="205" y="245" width="150" height="32" rx="4" fill="#334155" />
                <text x="280" y="265" fill="#F8FAFC" fontSize="10" textAnchor="middle">Idea Workflow Service</text>

                <rect x="370" y="245" width="150" height="32" rx="4" fill="#334155" />
                <text x="445" y="265" fill="#F8FAFC" fontSize="10" textAnchor="middle">Document Storage</text>

                <rect x="535" y="245" width="150" height="32" rx="4" fill="#334155" />
                <text x="610" y="265" fill="#F8FAFC" fontSize="10" textAnchor="middle">Audit & Log Service</text>

                <rect x="700" y="245" width="160" height="32" rx="4" fill="#0284C7" />
                <text x="780" y="265" fill="#F8FAFC" fontSize="10" textAnchor="middle">CSDLQG Dân cư / VNeID</text>

                {/* Arrow down */}
                <line x1="450" y1="290" x2="450" y2="315" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />

                {/* Layer 4: Storage & Data Tier */}
                <rect x="20" y="320" width="860" height="80" rx="6" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                <text x="40" y="345" fill="#34D399" fontSize="11" fontWeight="bold">TẦNG 4: LƯU TRỮ DỮ LIỆU & KIỂM TOÁN AN TOÀN (AES-256 STORAGE TIER)</text>
                <text x="40" y="365" fill="#E2E8F0" fontSize="12">Cơ sở dữ liệu quan hệ PostgreSQL 15 (Multi-AZ Cluster) · Redis In-memory Cache · Lưu trữ Ceph S3 mã hóa</text>
                <text x="40" y="385" fill="#94A3B8" fontSize="10">Kiểm toán Audit Trail ghi nhận bất biến · Sao lưu định kỳ Multi-DC dự phòng thảm họa</text>
              </svg>
            </div>
          </div>

          {/* User Journey Workflow (Mermaid flow representation) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Quy trình nghiệp vụ xử lý sáng kiến chuyển đổi số (Approval Flowchart)
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto">
              <svg viewBox="0 0 850 160" className="w-full min-w-[700px] h-auto" fill="none">
                {/* Step 1 */}
                <rect x="10" y="55" width="110" height="48" rx="6" fill="#0F172A" />
                <text x="65" y="78" fill="#F8FAFC" fontSize="11" textAnchor="middle" fontWeight="bold">Đăng nhập</text>
                <text x="65" y="93" fill="#94A3B8" fontSize="9" textAnchor="middle">SSO / VNeID / CA</text>

                <line x1="120" y1="79" x2="155" y2="79" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Step 2 */}
                <polygon points="195,50 235,79 195,108 155,79" fill="#1E293B" stroke="#475569" />
                <text x="195" y="82" fill="#F8FAFC" fontSize="10" textAnchor="middle" fontWeight="bold">Xác thực?</text>

                <line x1="235" y1="79" x2="275" y2="79" stroke="#16A34A" strokeWidth="2" />
                <text x="255" y="72" fill="#16A34A" fontSize="9" fontWeight="bold">Hợp lệ</text>

                {/* Step 3 */}
                <rect x="275" y="55" width="120" height="48" rx="6" fill="#0F172A" />
                <text x="335" y="78" fill="#F8FAFC" fontSize="11" textAnchor="middle" fontWeight="bold">Soạn đề xuất</text>
                <text x="335" y="93" fill="#94A3B8" fontSize="9" textAnchor="middle">Online / Offline Cache</text>

                <line x1="395" y1="79" x2="435" y2="79" stroke="#94A3B8" strokeWidth="2" />

                {/* Step 4 */}
                <rect x="435" y="55" width="130" height="48" rx="6" fill="#0F172A" />
                <text x="500" y="78" fill="#F8FAFC" fontSize="11" textAnchor="middle" fontWeight="bold">Thẩm định kỹ thuật</text>
                <text x="500" y="93" fill="#94A3B8" fontSize="9" textAnchor="middle">Tiêu chí ATTT & Đề án 06</text>

                <line x1="565" y1="79" x2="605" y2="79" stroke="#94A3B8" strokeWidth="2" />

                {/* Step 5 */}
                <polygon points="645,50 685,79 645,108 605,79" fill="#1E293B" stroke="#475569" />
                <text x="645" y="82" fill="#F8FAFC" fontSize="10" textAnchor="middle" fontWeight="bold">Lãnh đạo?</text>

                <line x1="685" y1="79" x2="725" y2="79" stroke="#16A34A" strokeWidth="2" />
                <text x="705" y="72" fill="#16A34A" fontSize="9" fontWeight="bold">Duyệt</text>

                {/* Step 6 */}
                <rect x="725" y="55" width="115" height="48" rx="6" fill="#16A34A" />
                <text x="782" y="78" fill="#FFFFFF" fontSize="11" textAnchor="middle" fontWeight="bold">Triển khai</text>
                <text x="782" y="93" fill="#DCFCE7" fontSize="9" textAnchor="middle">Thí điểm & Nhân rộng</text>

                {/* Rejection Loop Back */}
                <path d="M 645 108 L 645 140 L 335 140 L 335 103" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                <text x="490" y="135" fill="#DC2626" fontSize="9" textAnchor="middle">Yêu cầu chỉnh lý bổ sung / Trả lại hồ sơ</text>
              </svg>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: ERD & SQL SCHEMA */}
      {activeSection === 'erd' && (
        <div className="space-y-6 text-xs text-slate-800">
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Sơ đồ thực thể - quan hệ cơ sở dữ liệu (Entity-Relationship Diagram)
            </h2>
            <p className="text-slate-600 text-xs">
              Mô hình dữ liệu quan hệ được chuẩn hóa bậc 3 (3NF), ràng buộc khóa ngoại chặt chẽ và ghi vết kiểm toán toàn diện.
            </p>

            {/* ER Diagram Representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
              
              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: role</div>
                <div>id: SERIAL (PK)</div>
                <div>name: VARCHAR(50) [Can bo, Lanh dao, Admin]</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: user</div>
                <div>id: SERIAL (PK)</div>
                <div>username: VARCHAR(50) UNIQUE</div>
                <div>password_hash: TEXT (bcrypt)</div>
                <div>full_name: VARCHAR(100)</div>
                <div>rank: VARCHAR(50) (Cấp bậc)</div>
                <div>unit: VARCHAR(200) (Đơn vị)</div>
                <div>vneid_number: VARCHAR(12)</div>
                <div>role_id: INT (FK -&gt; role.id)</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: status</div>
                <div>id: SERIAL (PK)</div>
                <div>name: VARCHAR(50) [Moi, Phe duyet, Thuc hien...]</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5 md:col-span-2">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: idea (Trung tâm)</div>
                <div>id: VARCHAR(30) (PK, SK-CAND-2026-XXXX)</div>
                <div>title: VARCHAR(255) NOT NULL</div>
                <div>abstract: TEXT</div>
                <div>description: TEXT</div>
                <div>technical_architecture: TEXT</div>
                <div>expected_impact: TEXT</div>
                <div>author_id: INT (FK -&gt; user.id)</div>
                <div>status_id: INT (FK -&gt; status.id)</div>
                <div>secrecy_level: SMALLINT (0, 1, 2, 3)</div>
                <div>progress_percentage: SMALLINT (0-100)</div>
                <div>created_at / updated_at: TIMESTAMP</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: attachment</div>
                <div>id: SERIAL (PK)</div>
                <div>idea_id: VARCHAR (FK -&gt; idea.id)</div>
                <div>filename: VARCHAR(255)</div>
                <div>filepath: VARCHAR(500)</div>
                <div>is_encrypted: BOOLEAN (AES-256)</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: comment</div>
                <div>id: SERIAL (PK)</div>
                <div>idea_id: VARCHAR (FK -&gt; idea.id)</div>
                <div>user_id: INT (FK -&gt; user.id)</div>
                <div>content: TEXT</div>
                <div>action_taken: VARCHAR(100)</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5 md:col-span-2">
                <div className="font-bold text-slate-900 border-b pb-1">TABLE: audit_log (Bất biến)</div>
                <div>id: BIGSERIAL (PK)</div>
                <div>user_id: INT (FK -&gt; user.id)</div>
                <div>action: VARCHAR(100) [DANG_NHAP, PHE_DUYET...]</div>
                <div>entity_id: VARCHAR(50)</div>
                <div>ip: VARCHAR(45) (Địa chỉ IP nội bộ CAND)</div>
                <div>status: VARCHAR(20) [SUCCESS, DENIED]</div>
                <div>timestamp: TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
              </div>
            </div>
          </div>

          {/* SQL Script / DDL Specification - Hidden by default */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-slate-900 text-xs">
                  Kịch bản DDL Cơ sở dữ liệu quan hệ (PostgreSQL 15+)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                  scripts/schema.sql
                </span>
                <span className="text-[10px] text-slate-500 italic">
                  (Đã ẩn câu lệnh chi tiết)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCode('sql', sqlCode)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded text-xs transition-colors flex items-center gap-1 shadow-2xs"
                  title="Sao chép kịch bản SQL vào khay nhớ tạm"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-500">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  <span>{copiedSnippet === 'sql' ? 'Đã sao chép!' : 'Sao chép mã SQL'}</span>
                </button>

                <button
                  onClick={() => setShowSqlCommands(!showSqlCommands)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded text-xs transition-colors"
                >
                  {showSqlCommands ? 'Ẩn câu lệnh chi tiết' : 'Xem câu lệnh SQL chi tiết'}
                </button>
              </div>
            </div>

            {/* Quick architectural metadata preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Cấu trúc bảng:</span>
                <strong className="text-slate-800">7 Bảng chuẩn hóa 3NF</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Khóa ngoại (FK):</span>
                <strong className="text-slate-800">Ràng buộc toàn vẹn RESTRICT/CASCADE</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Chỉ mục (Index):</span>
                <strong className="text-slate-800">B-Tree tối ưu tra cứu &lt;5ms</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Kiểm toán dữ liệu:</span>
                <strong className="text-slate-800">Audit Log bất biến tự động</strong>
              </div>
            </div>

            {showSqlCommands && (
              <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto p-3 bg-slate-950 rounded max-h-72 animate-in fade-in duration-200">
                {sqlCode}
              </pre>
            )}
          </div>

        </div>
      )}

      {/* SECTION 3: DEVOPS, K8S & TERRAFORM */}
      {activeSection === 'devops' && (
        <div className="space-y-6 text-xs text-slate-800">
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Phương án triển khai hạ tầng kỹ thuật và An toàn thông tin
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Kiến trúc điều phối container Kubernetes On-premise kết hợp hạ tầng đám mây dùng riêng Chính phủ (BCA Cloud).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDevOpsCommands(!showDevOpsCommands)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded text-xs transition-colors whitespace-nowrap"
                >
                  {showDevOpsCommands ? 'Ẩn câu lệnh chi tiết' : 'Xem câu lệnh K8s & Terraform chi tiết'}
                </button>
              </div>
            </div>

            {/* Institutional Infrastructure Specification Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* K8s Architecture Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h3 className="font-bold text-slate-900 text-xs uppercase">
                      Cụm điều phối Kubernetes CAND (K8s Cluster)
                    </h3>
                  </div>
                  <button
                    onClick={() => copyCode('k8s', k8sCode)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                  >
                    {copiedSnippet === 'k8s' ? 'Đã sao chép!' : 'Sao chép tệp YAML'}
                  </button>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Tệp cấu hình:</span>
                    <span className="font-mono font-bold text-slate-800">k8s/idea-deployment.yaml</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Số bản sao Pods (Replicas):</span>
                    <span className="font-semibold text-emerald-800">03 Pods (Cân bằng tải High-Availability)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Không gian tên (Namespace):</span>
                    <span className="font-mono font-semibold text-slate-800">cand-digital</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Giới hạn tài nguyên (Limits):</span>
                    <span className="font-mono text-slate-800">2 CPU / 4GB RAM (định mức tối đa)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Quản trị bí mật (Secrets):</span>
                    <span className="font-semibold text-amber-800">K8s Secret mã hóa khóa AES-256 Ban Cơ yếu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cổng dịch vụ (Service):</span>
                    <span className="font-mono text-slate-800">ClusterIP: Port 4000 (Cô lập mạng nội bộ)</span>
                  </div>
                </div>

                {showDevOpsCommands && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded font-mono text-[11px] overflow-x-auto max-h-72">
                      {k8sCode}
                    </pre>
                  </div>
                )}
              </div>

              {/* Terraform Cloud Architecture Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <h3 className="font-bold text-slate-900 text-xs uppercase">
                      Hạ tầng đám mây dùng riêng (Gov Cloud / VPC)
                    </h3>
                  </div>
                  <button
                    onClick={() => copyCode('tf', terraformCode)}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                  >
                    {copiedSnippet === 'tf' ? 'Đã sao chép!' : 'Sao chép tệp TF'}
                  </button>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Tệp kịch bản IaC:</span>
                    <span className="font-mono font-bold text-slate-800">terraform/main.tf</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Dải mạng nội bộ (VPC CIDR):</span>
                    <span className="font-mono font-bold text-slate-800">10.0.0.0/16 (RESTRICTED-CAND)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Phân vùng mạng phụ (Subnets):</span>
                    <span className="font-semibold text-slate-800">03 Subnets độc lập tại 3 Availability Zones</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Cơ sở dữ liệu đám mây:</span>
                    <span className="font-semibold text-emerald-800">PostgreSQL Multi-AZ (Dung lượng mở rộng 1TB)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Khóa mã hóa KMS chuyên dùng:</span>
                    <span className="font-mono text-amber-800">KMS Key mã hóa lưu trữ cấp độ Nhà nước</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bảo vệ chống xóa nhầm:</span>
                    <span className="font-semibold text-slate-800">Deletion Protection = Enabled</span>
                  </div>
                </div>

                {showDevOpsCommands && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded font-mono text-[11px] overflow-x-auto max-h-72">
                      {terraformCode}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SECTION 4: 3-TIER TECHNOLOGY COMPARISON MATRIX */}
      {activeSection === 'matrix' && (
        <div className="space-y-6 text-xs text-slate-800">
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Ma trận so sánh các phương án công nghệ thay thế
            </h2>
            <p className="text-slate-600 text-xs">
              Đánh giá ưu và nhược điểm giữa 3 phương án: Xây dựng mở (Nguồn mở), Trung cấp (Doanh nghiệp chuẩn) và Cao cấp (Chuyên sâu quy mô lớn).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <th className="p-3 border-r border-slate-200">Thành phần kiến trúc</th>
                    <th className="p-3 border-r border-slate-200 bg-blue-50/60">Phương án 1 (Nguồn mở)</th>
                    <th className="p-3 border-r border-slate-200 bg-amber-50/60">Phương án 2 (Trung cấp - Đề xuất)</th>
                    <th className="p-3 bg-purple-50/60">Phương án 3 (Cao cấp toàn diện)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Giao diện (Frontend)</td>
                    <td className="p-3 border-r border-slate-200">React + Tailwind UI</td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">React + Next.js / PWA Offline-First</td>
                    <td className="p-3">React Microfrontend đa nền tảng</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Dịch vụ nền (Backend)</td>
                    <td className="p-3 border-r border-slate-200">Node.js / Express</td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">Java Spring Boot / Go microservices</td>
                    <td className="p-3">.NET Core / Enterprise Microservices</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Cơ sở dữ liệu (Database)</td>
                    <td className="p-3 border-r border-slate-200">PostgreSQL (Node đơn)</td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">PostgreSQL Multi-AZ Cluster + Redis</td>
                    <td className="p-3">Oracle RAC / PostgreSQL Sharded Distributed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Xác thực & Danh tính</td>
                    <td className="p-3 border-r border-slate-200">JWT + OAuth2 cục bộ</td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">Keycloak OIDC + Tích hợp VNeID/CA CAND</td>
                    <td className="p-3">Cơ chế SSO Trung ương Bộ Công an</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Điều phối cụm máy chủ</td>
                    <td className="p-3 border-r border-slate-200">Docker Compose</td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">Kubernetes On-premise (CAND Cluster)</td>
                    <td className="p-3">Kubernetes Đám mây Chính phủ chuyên dụng</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Ưu điểm</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Chi phí thấp, triển khai nhanh, linh hoạt</td>
                    <td className="p-3 border-r border-slate-200 font-medium text-emerald-800">Độ ổn định cao, bảo mật chặt, tối ưu tài nguyên ngành</td>
                    <td className="p-3 text-slate-600">Đầy đủ công cụ cao cấp, mở rộng không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Nhược điểm</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Khó mở rộng quy mô toàn quân hàng chục nghìn người</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Đòi hỏi đội ngũ kỹ thuật có chuyên môn sâu về an ninh mạng</td>
                    <td className="p-3 text-slate-600">Chi phí đầu tư lớn (&gt;1 tỷ), phụ thuộc bản quyền thương mại</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 5: BUDGET & ROADMAP */}
      {activeSection === 'roadmap' && (
        <div className="space-y-6 text-xs text-slate-800">
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Dự toán ngân sách đầu tư theo 3 gói quy mô
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gói 1: Thấp (MVP thí điểm)</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">200 - 300 <span className="text-xs font-normal">triệu VNĐ</span></div>
                <div className="text-slate-600 space-y-1 pt-2 border-t text-[11px]">
                  <div>Thời gian: 6 - 9 tháng</div>
                  <div>Phạm vi: Giai đoạn 1 + 2 (Thiết kế & MVP)</div>
                  <div>Áp dụng thử nghiệm tại 1 Cục hoặc 1-2 Công an tỉnh</div>
                </div>
              </div>

              <div className="p-4 border-2 border-slate-900 rounded-lg space-y-2 bg-slate-50">
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Gói 2: Trung bình (Khuyến nghị)</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">500 - 800 <span className="text-xs font-normal">triệu VNĐ</span></div>
                <div className="text-slate-600 space-y-1 pt-2 border-t text-[11px]">
                  <div>Thời gian: 9 - 12 tháng</div>
                  <div>Phạm vi: Trọn vẹn 4 giai đoạn & tích hợp VNeID/CSDL</div>
                  <div>Triển khai chính thức toàn lực lượng (6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương, Cơ quan Bộ công an, Các học viện, trường CAND)</div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gói 3: Cao (Mở rộng toàn diện)</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">&gt; 1.0 <span className="text-xs font-normal">tỷ VNĐ</span></div>
                <div className="text-slate-600 space-y-1 pt-2 border-t text-[11px]">
                  <div>Thời gian: 12 - 18 tháng</div>
                  <div>Phạm vi: Tích hợp AI phân tích dữ liệu, SOC giám sát tự động</div>
                  <div>Dự phòng thảm họa Multi-Datacenter toàn ngành</div>
                </div>
              </div>

            </div>

            {/* Implementation Gantt Timeline */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Lộ trình triển khai dự án qua 4 giai đoạn (Gantt Schedule)
              </h3>
              
              <div className="space-y-3">
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">Giai đoạn 1: Khảo sát, Thu thập yêu cầu & Thiết kế UI/UX</span>
                    <div className="text-slate-500 text-[11px]">Tài liệu đặc tả yêu cầu, sơ đồ luồng, phân quyền RBAC, kiểm toán an ninh</div>
                  </div>
                  <div className="font-mono font-semibold text-slate-700 text-right shrink-0">
                    Tháng 1 - Tháng 3 (3 tháng)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">Giai đoạn 2: Phát triển MVP & Tích hợp CSDL Quốc gia Dân cư</span>
                    <div className="text-slate-500 text-[11px]">Xây dựng backend Spring/Node, frontend React, cơ chế mã hóa AES-256, API Gateway</div>
                  </div>
                  <div className="font-mono font-semibold text-slate-700 text-right shrink-0">
                    Tháng 4 - Tháng 9 (6 tháng)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">Giai đoạn 3: Kiểm thử an ninh (Pentest) & Thí điểm tại địa phương</span>
                    <div className="text-slate-500 text-[11px]">Đánh giá lỗ hổng A05, kiểm thử tải, thí điểm tại Công an TP Hà Nội & 01 tỉnh miền núi</div>
                  </div>
                  <div className="font-mono font-semibold text-slate-700 text-right shrink-0">
                    Tháng 10 - Tháng 11 (2 tháng)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">Giai đoạn 4: Nghiệm thu, Ra mắt toàn quốc & Đào tạo cán bộ</span>
                    <div className="text-slate-500 text-[11px]">Nhân rộng tới 6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương, Cơ quan Bộ công an, Các học viện, trường CAND, gắn với Ngày Chuyển đổi số 10/10</div>
                  </div>
                  <div className="font-mono font-semibold text-slate-700 text-right shrink-0">
                    Tháng 12 (2 tháng)
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 6: RISK ANALYSIS & MITIGATION */}
      {activeSection === 'risks' && (
        <div className="space-y-6 text-xs text-slate-800">
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Phân tích 6 nhóm rủi ro trọng yếu & Biện pháp khắc phục
            </h2>
            <p className="text-slate-600 text-xs">
              Tuân thủ quy định quản trị rủi ro công nghệ thông tin trong lực lượng vũ trang và pháp luật hiện hành.
            </p>

            <div className="space-y-3">
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  1. Rủi ro pháp lý & Bảo mật dữ liệu (Luật 2025)
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nguy cơ:</span> Vi phạm Luật Bảo vệ dữ liệu cá nhân 2025, Luật An ninh mạng 2025 hoặc lộ lọt tài liệu bí mật nhà nước.
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-emerald-800">Biện pháp khắc phục:</span> Áp dụng mã hóa AES-256 lớp lưu trữ (TDE), phân vùng dữ liệu Mật riêng biệt, bắt buộc xác thực chữ ký số CA Ban Cơ yếu, ghi vết kiểm toán bất biến (Immutable Audit Trail).
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  2. Rủi ro kỹ thuật (Quá tải hệ thống, tấn công mạng)
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nguy cơ:</span> Tắc nghẽn kết nối trong các đợt cao điểm thi đua hoặc tấn công mạng DDoS, SQL Injection, mã độc.
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-emerald-800">Biện pháp khắc phục:</span> Kiến trúc cụm Kubernetes tự động co giãn (Horizontal Pod Autoscaling), kiểm thử thâm nhập (Pentest) định kỳ của Cục A05, WAF và mạng nội bộ cách ly MPLS CAND.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  3. Rủi ro vận hành & Nhân lực tại cấp cơ sở
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nguy cơ:</span> Cán bộ Công an xã/phường có trình độ công nghệ thông tin không đồng đều, thiếu hụt chuyên gia quản trị mạng tại cơ sở.
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-emerald-800">Biện pháp khắc phục:</span> Thiết kế giao diện tối giản, trực quan ("đơn giản, nhanh, ít thao tác nhất"), hỗ trợ chế độ Offline-First tự đồng bộ, biên soạn video tài liệu tập huấn ngắn gọn.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  4. Rủi ro không tương thích với hệ thống cũ
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nguy cơ:</span> Các phần mềm quản lý văn bản, điều lệnh cũ sử dụng chuẩn dữ liệu phân tán không đồng bộ.
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-emerald-800">Biện pháp khắc phục:</span> Xây dựng API Gateway trung gian với chuẩn kết nối mở RESTful / JSON Schema, tiến hành thí điểm liên thông tại 2 địa phương trước khi triển khai rộng.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  5. Rủi ro về mức độ chấp nhận sử dụng của người dùng
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nguy cơ:</span> Cán bộ e ngại thủ tục rườm rà nếu quy trình duyệt quá nhiều bước.
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-emerald-800">Biện pháp khắc phục:</span> Rút ngắn quy trình duyệt trực tuyến còn tối đa 2 cấp (Chuyên viên thẩm định - Lãnh đạo duyệt), tích hợp thông báo đẩy tức thời trên VNeID/SMS nội bộ.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  6. Rủi ro tài chính & Giải ngân ngân sách
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Nguy cơ:</span> Kinh phí cấp chậm hoặc chưa phân bổ kịp thời theo tiến độ.
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-emerald-800">Biện pháp khắc phục:</span> Phân kỳ đầu tư theo 4 giai đoạn, ưu tiên tận dụng máy chủ và hạ tầng số hiện có của Cục C06/A05 để tiết kiệm tối đa ngân sách nhà nước.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
