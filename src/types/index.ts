export type UserRole = 'can_bo' | 'chuyen_vien' | 'lanh_dao' | 'admin';

export type UnitCategory = 
  | 'thanh_pho_tw'    // 6 Thành phố trực thuộc Trung ương
  | 'tinh_dia_phuong' // 28 Tỉnh
  | 'bo_cong_an'      // Các Cục, Viện trực thuộc Bộ
  | 'truong_cand';    // Các Học viện & Trường CAND

export interface AdministrativeNode {
  id: string;
  name: string;
  category: UnitCategory;
  code: string;
  adminName: string;
  adminRank: string;
  contactPhone: string;
  initiativesCount: number;
  syncStatus: 'SYNCED' | 'PENDING' | 'OFFLINE';
  lastSyncTime: string;
  securityToken: string;
  activeUsersCount: number;
  ipRange: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  rank: string; // Cấp bậc (e.g. Đại úy, Thiếu tá, Đại tá)
  unit: string; // Đơn vị công tác
  department: string;
  vneidNumber: string; // Số định danh VNeID
  role: UserRole;
  badgeNumber: string;
  nodeId?: string;
}

export type IdeaCategory = 
  | 'csdl_dancu' 
  | 'anninh_mang' 
  | 'dichvu_cong' 
  | 'nghiepvu_coso' 
  | 'thietbi_chuyendung' 
  | 'giaoduc_chinhtri';

export type SecrecyLevel = 0 | 1 | 2 | 3; // 0: Thường, 1: Nội bộ, 2: Mật, 3: Tối mật

export type IdeaStatus = 
  | 'draft' 
  | 'submitted' 
  | 'reviewing' 
  | 'approved' 
  | 'revision_requested' 
  | 'rejected' 
  | 'assigned' 
  | 'in_progress' 
  | 'completed';

export type Priority = 'normal' | 'high' | 'urgent';

export interface Attachment {
  id: string;
  filename: string;
  size: string;
  fileType: string;
  uploadedAt: string;
  encrypted: boolean;
  secrecyLevel: SecrecyLevel;
  fileData?: string; // base64 or object URL for downloading / viewing
  rawSizeBytes?: number;
  extension?: string; // 'pdf' | 'doc' | 'docx'
}

export interface WorkflowComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRank: string;
  authorUnit: string;
  role: UserRole;
  content: string;
  timestamp: string;
  actionTaken?: string;
}

export interface WorkflowHistory {
  id: string;
  stage: string;
  actorName: string;
  actorRank: string;
  actorUnit: string;
  action: string;
  comment?: string;
  timestamp: string;
}

export interface Idea {
  id: string; // SK-CAND-2026-XXXX
  title: string;
  abstract: string;
  description: string;
  technicalArchitecture: string;
  expectedImpact: string;
  targetUnit: string;
  category: IdeaCategory;
  author: User;
  status: IdeaStatus;
  secrecyLevel: SecrecyLevel;
  priority: Priority;
  estimatedBudget: number; // VNĐ
  executionUnit?: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  comments: WorkflowComment[];
  workflow: WorkflowHistory[];
  isOfflineCached?: boolean;
  originNodeId?: string;
  originNodeName?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRank: string;
  action: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  details: string;
}

export interface SystemMetrics {
  totalInitiatives: number;
  approvedCount: number;
  inProgressCount: number;
  completedCount: number;
  totalBudgetSavedEst: number; // triệu VNĐ
  avgResolutionDays: number;
  citiesConnected?: number;
  provincesConnected: number;
  ministryUnitsConnected?: number;
  academiesConnected?: number;
  grassrootsUnitsConnected?: number; // Cấp 3: Xã/phường/thị trấn & Đội nghiệp vụ (đồng bộ trực tiếp Cấp 2 Tỉnh/TP)
  districtsConnected?: number;
  wardsConnected?: number;
}

export { CATEGORY_LABELS, STATUS_CONFIG, SECRECY_CONFIG } from '../data/mockData';

