import React, { useState, useEffect, useMemo } from 'react';
import { User, Idea, AuditLog, UserRole, SystemMetrics, AdministrativeNode } from './types';
import { USERS, INITIAL_IDEAS, INITIAL_AUDIT_LOGS, INITIAL_METRICS } from './data/mockData';
import { ADMINISTRATIVE_NODES } from './data/administrativeNodes';
import { Header } from './components/Header';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { DashboardView } from './components/DashboardView';
import { InitiativesListView } from './components/InitiativesListView';
import { ReviewApprovalView } from './components/ReviewApprovalView';
import { UnitDelegationView } from './components/UnitDelegationView';
import { ArchitectureReportView } from './components/ArchitectureReportView';
import { AuditLogView } from './components/AuditLogView';
import { CreateInitiativeModal } from './components/CreateInitiativeModal';
import { InitiativeDetailModal } from './components/InitiativeDetailModal';
import { OfficialPdfReportModal } from './components/OfficialPdfReportModal';
import { AuthorInfoModal } from './components/AuthorInfoModal';
import { ToastContainer, ToastMessage } from './components/Toast';

const STORAGE_IDEAS_KEY = 'cand_initiatives_v2';
const STORAGE_LOGS_KEY = 'cand_auditlogs_v2';
const STORAGE_NODES_KEY = 'cand_nodes_v2';

export default function App() {
  // Initialize state with LocalStorage or Mock data
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_IDEAS_KEY) || localStorage.getItem('cand_initiatives_v1');
      if (saved) {
        const parsed: Idea[] = JSON.parse(saved);
        return parsed.map((item) => {
          if (item?.author?.fullName === 'Nguyễn Văn An' || item?.author?.id === 'usr-001') {
            return {
              ...item,
              author: USERS[0]
            };
          }
          return item;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_IDEAS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY) || localStorage.getItem('cand_auditlogs_v1');
      if (saved) {
        const parsed: AuditLog[] = JSON.parse(saved);
        return parsed.map((log) => {
          if (log.userName?.includes('Nguyễn Văn An')) {
            return {
              ...log,
              userName: 'Trần Nguyễn Huy Long',
              userRank: ''
            };
          }
          return log;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); // Default: Cán bộ cơ sở
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState<boolean>(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const selectedIdeaForDetail = useMemo(() => {
    return ideas.find(i => i.id === selectedIdeaId) || null;
  }, [ideas, selectedIdeaId]);
  const [selectedIdeaForPdf, setSelectedIdeaForPdf] = useState<Idea | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 51 Administrative Hubs state
  const [administrativeNodes, setAdministrativeNodes] = useState<AdministrativeNode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NODES_KEY);
      if (saved) {
        const parsed: AdministrativeNode[] = JSON.parse(saved);
        // Ensure NODE-TRUONG-T01 has canonical updated admin info
        const canonicalT01 = ADMINISTRATIVE_NODES.find(n => n.id === 'NODE-TRUONG-T01');
        if (canonicalT01) {
          const idx = parsed.findIndex(n => n.id === 'NODE-TRUONG-T01');
          if (idx !== -1) {
            parsed[idx] = {
              ...parsed[idx],
              adminName: canonicalT01.adminName,
              adminRank: canonicalT01.adminRank,
              contactPhone: canonicalT01.contactPhone,
              securityToken: canonicalT01.securityToken
            };
          }
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return ADMINISTRATIVE_NODES;
  });

  const [activeNode, setActiveNode] = useState<AdministrativeNode>(() => {
    return ADMINISTRATIVE_NODES.find(n => n.id === 'NODE-TRUONG-T01') || ADMINISTRATIVE_NODES[0];
  });

  const showNotification = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_IDEAS_KEY, JSON.stringify(ideas));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [ideas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('LocalStorage logs error:', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NODES_KEY, JSON.stringify(administrativeNodes));
    } catch (e) {
      console.error('LocalStorage nodes error:', e);
    }
  }, [administrativeNodes]);

  const [unitFilterForInitiatives, setUnitFilterForInitiatives] = useState<string>('all');

  // Dynamic system metrics calculation
  const metrics: SystemMetrics = useMemo(() => {
    const total = ideas.length;
    const approved = ideas.filter(i => i.status === 'approved' || i.status === 'in_progress' || i.status === 'completed').length;
    const inProgress = ideas.filter(i => i.status === 'in_progress').length;
    const completed = ideas.filter(i => i.status === 'completed').length;
    const totalBudgetSaved = ideas.reduce((acc, i) => acc + (i.status === 'completed' || i.status === 'in_progress' ? (i.estimatedBudget / 1000000) * 1.5 : 0), 1200);

    return {
      totalInitiatives: total,
      approvedCount: approved,
      inProgressCount: inProgress,
      completedCount: completed,
      totalBudgetSavedEst: Math.round(totalBudgetSaved),
      avgResolutionDays: INITIAL_METRICS.avgResolutionDays,
      citiesConnected: 6,
      provincesConnected: 28,
      ministryUnitsConnected: 8,
      academiesConnected: 9,
      districtsConnected: 705,
      wardsConnected: 10598
    };
  }, [ideas]);

  // Audit Log helper
  const addAuditLog = (action: string, entityId: string, details: string, status: 'SUCCESS' | 'WARNING' | 'DENIED' = 'SUCCESS') => {
    const formattedUserName = currentUser.rank ? `${currentUser.fullName} (${currentUser.rank})` : currentUser.fullName;
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-8)}`,
      userId: currentUser.id,
      userName: formattedUserName,
      userRank: currentUser.rank || 'Cán bộ',
      action,
      entityId,
      timestamp: new Date().toISOString(),
      ipAddress: `10.${Math.floor(Math.random() * 20 + 1)}.${Math.floor(Math.random() * 50 + 1)}.${Math.floor(Math.random() * 200 + 1)}`,
      status,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Role Switcher
  const handleSelectRole = (role: UserRole) => {
    const targetUser = USERS.find(u => u.role === role) || USERS[0];
    setCurrentUser(targetUser);
    const targetDisplayName = [targetUser.rank, targetUser.fullName].filter(Boolean).join(' ');
    addAuditLog(
      'CHUYỂN_VAI_TRÒ_RBAC',
      targetUser.id,
      `Đã chuyển vai trò người dùng sang: ${targetDisplayName} (${targetUser.role})`
    );
  };

  // Create Initiative handler
  const handleCreateInitiative = (newIdeaData: Partial<Idea>, isDraft: boolean) => {
    const nextNumber = ideas.length + 1;
    const generatedId = `SK-CAND-2026-${String(nextNumber).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const createdIdea: Idea = {
      id: generatedId,
      title: newIdeaData.title || 'Đề xuất sáng kiến mới',
      abstract: newIdeaData.abstract || '',
      description: newIdeaData.description || '',
      technicalArchitecture: newIdeaData.technicalArchitecture || 'Kiến trúc chuẩn CAND theo Luật An ninh mạng 2025',
      expectedImpact: newIdeaData.expectedImpact || 'Nâng cao hiệu quả nghiệp vụ',
      targetUnit: newIdeaData.targetUnit || activeNode.name,
      category: newIdeaData.category || 'csdl_dancu',
      author: currentUser,
      status: isDraft ? 'draft' : 'submitted',
      secrecyLevel: newIdeaData.secrecyLevel ?? 0,
      priority: newIdeaData.priority || 'normal',
      estimatedBudget: newIdeaData.estimatedBudget || 250000000,
      progressPercentage: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      originNodeId: newIdeaData.originNodeId || activeNode.id,
      originNodeName: newIdeaData.originNodeName || activeNode.name,
      attachments: newIdeaData.attachments || [],
      comments: [],
      workflow: [
        {
          id: `wf-${Date.now()}`,
          stage: isDraft ? 'Lưu nháp cục bộ' : 'Đăng ký đề xuất',
          actorName: currentUser.fullName,
          actorRank: currentUser.rank,
          actorUnit: currentUser.unit,
          action: isDraft ? 'Lưu nháp tại máy trạm' : 'Khởi tạo và gửi hồ sơ chính thức',
          timestamp: nowIso
        }
      ],
      isOfflineCached: isOffline
    };

    const targetNodeId = newIdeaData.originNodeId || activeNode.id;
    const targetNodeName = newIdeaData.originNodeName || activeNode.name;

    setIdeas(prev => [createdIdea, ...prev]);

    // Update initiatives count on target administrative node
    setAdministrativeNodes(prev =>
      prev.map(n => n.id === targetNodeId ? { ...n, initiativesCount: n.initiativesCount + 1 } : n)
    );

    if (isOffline) {
      setOfflineQueue(prev => [...prev, generatedId]);
      // Update node sync status to PENDING
      setAdministrativeNodes(prev =>
        prev.map(n => n.id === targetNodeId ? { ...n, syncStatus: 'PENDING' } : n)
      );
      addAuditLog(
        'LƯU_SÁNG_KIẾN_NGOẠI_TUYẾN',
        generatedId,
        `Sáng kiến đã lưu vào bộ đệm thiết bị cục bộ của ${targetNodeName}: ${createdIdea.title}`
      );
    } else {
      addAuditLog(
        'ĐĂNG_KÝ_SÁNG_KIẾN_MỚI',
        generatedId,
        `Tạo mới thành công sáng kiến ${generatedId} tại đơn vị ${targetNodeName}: ${createdIdea.title}`
      );
    }

    showNotification(
      'Đăng ký sáng kiến thành công',
      `Đã khởi tạo hồ sơ ${generatedId} thuộc thẩm quyền quản lý của ${targetNodeName}.`,
      'success'
    );
  };

  // Node synchronization handlers
  const handleSyncNode = (nodeId: string) => {
    const target = administrativeNodes.find(n => n.id === nodeId);
    setAdministrativeNodes(prev =>
      prev.map(node => {
        if (node.id !== nodeId) return node;
        return {
          ...node,
          syncStatus: 'SYNCED',
          lastSyncTime: new Date().toISOString()
        };
      })
    );

    // Sync any cached ideas belonging to this node
    setIdeas(prev =>
      prev.map(idea =>
        idea.originNodeId === nodeId ? { ...idea, isOfflineCached: false } : idea
      )
    );
    setOfflineQueue(prev =>
      prev.filter(id => {
        const found = ideas.find(i => i.id === id);
        return found && found.originNodeId !== nodeId;
      })
    );

    addAuditLog(
      'ĐỒNG_BỘ_NÚT_ĐƠN_VỊ',
      nodeId,
      `Đã đồng bộ dữ liệu sáng kiến từ ${target?.name || nodeId} lên CSDL Trung tâm Bộ Công an`
    );

    showNotification(
      'Đồng bộ hoàn tất',
      `Đã đồng bộ thành công dữ liệu từ ${target?.name || nodeId} lên CSDL chung CAND!`,
      'success'
    );
  };

  const handleSyncAllNodes = () => {
    setAdministrativeNodes(prev =>
      prev.map(node => ({
        ...node,
        syncStatus: 'SYNCED',
        lastSyncTime: new Date().toISOString()
      }))
    );

    // Unmark all cached ideas and clear offline queue
    setIdeas(prev => prev.map(idea => ({ ...idea, isOfflineCached: false })));
    setOfflineQueue([]);

    addAuditLog(
      'ĐỒNG_BỘ_TOÀN_MẠNG_CAND',
      'ALL_51_NODES',
      `Đồng bộ toàn diện 51 đầu mối (6 thành phố trực thuộc Trung Ương, 28 Tỉnh địa phương, Cơ quan Bộ công an, Các học viện, trường CAND) lên CSDL Trung tâm Bộ Công an`
    );

    showNotification(
      'Đồng bộ toàn mạng thành công',
      'Đã hoàn thành đồng bộ dữ liệu toàn bộ 51 đầu mối mạng lưới CAND lên CSDL Trung tâm Bộ Công an!',
      'success'
    );
  };

  const handleRegenerateNodeToken = (nodeId: string) => {
    const target = administrativeNodes.find(n => n.id === nodeId);
    const newToken = `CA-${target?.code || 'NODE'}-${Date.now().toString().slice(-4)}-BCA-SEC`;
    setAdministrativeNodes(prev =>
      prev.map(n => n.id === nodeId ? { ...n, securityToken: newToken, lastSyncTime: new Date().toISOString() } : n)
    );

    addAuditLog(
      'CẤP_LẠI_TOKEN_CA',
      nodeId,
      `Quản trị viên đã cấp mới Chứng thư số CA cho đơn vị ${target?.name || nodeId}: ${newToken}`
    );

    showNotification(
      'Cấp Token CA thành công',
      `Đã cấp mới chứng thư số cho ${target?.name || nodeId}: ${newToken}`,
      'success'
    );
  };

  const handleOpenCreateForNode = (node: AdministrativeNode) => {
    setActiveNode(node);
    setIsCreateModalOpen(true);
  };

  // Approve Initiative
  const handleApprove = (ideaId: string, comment: string) => {
    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        return {
          ...idea,
          status: 'approved',
          updatedAt: new Date().toISOString(),
          workflow: [
            ...idea.workflow,
            {
              id: `wf-${Date.now()}`,
              stage: 'Lãnh đạo phê duyệt',
              actorName: currentUser.fullName,
              actorRank: currentUser.rank,
              actorUnit: currentUser.unit,
              action: 'Phê duyệt triển khai',
              comment,
              timestamp: new Date().toISOString()
            }
          ]
        };
      })
    );

    const approverName = [currentUser.rank, currentUser.fullName].filter(Boolean).join(' ');
    addAuditLog(
      'PHÊ_DUYỆT_SÁNG_KIẾN',
      ideaId,
      `Lãnh đạo ${approverName} đã phê duyệt sáng kiến ${ideaId}. Ghi chú: ${comment}`
    );
  };

  // Request Revision
  const handleRequestRevision = (ideaId: string, comment: string) => {
    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        return {
          ...idea,
          status: 'revision_requested',
          updatedAt: new Date().toISOString(),
          workflow: [
            ...idea.workflow,
            {
              id: `wf-${Date.now()}`,
              stage: 'Thẩm định hồ sơ',
              actorName: currentUser.fullName,
              actorRank: currentUser.rank,
              actorUnit: currentUser.unit,
              action: 'Yêu cầu chỉnh lý, bổ sung',
              comment,
              timestamp: new Date().toISOString()
            }
          ]
        };
      })
    );

    addAuditLog(
      'YÊU_CẦU_CHỈNH_LÝ',
      ideaId,
      `Yêu cầu hoàn thiện hồ sơ ${ideaId}. Nội dung: ${comment}`
    );
  };

  // Reject
  const handleReject = (ideaId: string, comment: string) => {
    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        return {
          ...idea,
          status: 'rejected',
          updatedAt: new Date().toISOString(),
          workflow: [
            ...idea.workflow,
            {
              id: `wf-${Date.now()}`,
              stage: 'Hội đồng thẩm định',
              actorName: currentUser.fullName,
              actorRank: currentUser.rank,
              actorUnit: currentUser.unit,
              action: 'Từ chối đề xuất',
              comment,
              timestamp: new Date().toISOString()
            }
          ]
        };
      })
    );

    addAuditLog(
      'TỪ_CHỐI_SÁNG_KIẾN',
      ideaId,
      `Từ chối sáng kiến ${ideaId}: ${comment}`,
      'WARNING'
    );
  };

  // Update Progress
  const handleUpdateProgress = (ideaId: string, newProgress: number, executionUnit: string) => {
    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : idea.status;
        return {
          ...idea,
          progressPercentage: newProgress,
          executionUnit: executionUnit || idea.executionUnit,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          workflow: [
            ...idea.workflow,
            {
              id: `wf-${Date.now()}`,
              stage: 'Cập nhật tiến độ',
              actorName: currentUser.fullName,
              actorRank: currentUser.rank,
              actorUnit: currentUser.unit,
              action: `Cập nhật tiến độ lên ${newProgress}% (${executionUnit || 'Đơn vị phụ trách'})`,
              timestamp: new Date().toISOString()
            }
          ]
        };
      })
    );

    addAuditLog(
      'CẬP_NHẬT_TIẾN_ĐỘ',
      ideaId,
      `Cập nhật tiến độ sáng kiến ${ideaId} đạt ${newProgress}%`
    );
  };

  // Add Comment
  const handleAddComment = (ideaId: string, content: string) => {
    const newComment = {
      id: `cm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRank: currentUser.rank,
      authorUnit: currentUser.unit,
      role: currentUser.role,
      content,
      timestamp: new Date().toISOString()
    };

    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        return {
          ...idea,
          comments: [...idea.comments, newComment]
        };
      })
    );

    addAuditLog(
      'GỬI_Ý_KIẾN_TRAO_ĐỔI',
      ideaId,
      `Gửi ý kiến vào sáng kiến ${ideaId}: ${content.slice(0, 50)}...`
    );
  };

  // Trigger Sync
  const handleTriggerSync = () => {
    if (offlineQueue.length === 0) return;
    const count = offlineQueue.length;
    const affectedNodeIds = ideas
      .filter(i => offlineQueue.includes(i.id))
      .map(i => i.originNodeId)
      .filter(Boolean);

    setIdeas(prev =>
      prev.map(idea =>
        offlineQueue.includes(idea.id) ? { ...idea, isOfflineCached: false } : idea
      )
    );

    setAdministrativeNodes(prev =>
      prev.map(node =>
        affectedNodeIds.includes(node.id)
          ? { ...node, syncStatus: 'SYNCED', lastSyncTime: new Date().toISOString() }
          : node
      )
    );

    setOfflineQueue([]);
    addAuditLog(
      'ĐỒNG_BỘ_DỮ_LIỆU_TRUNG_TÂM',
      'SYNC_QUEUE',
      `Đã đồng bộ thành công ${count} hồ sơ ngoại tuyến lên Cơ sở dữ liệu Bộ Công an`
    );
    showNotification(
      'Đồng bộ hoàn tất',
      `Đã hoàn thành đồng bộ ${count} hồ sơ ngoại tuyến vào CSDL Trung tâm!`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Primary Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        pendingSyncCount={offlineQueue.length}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        activeNode={activeNode}
        onOpenAuthorModal={() => setIsAuthorModalOpen(true)}
      />

      {/* Offline Sync Status Banner */}
      <OfflineSyncBanner
        isOffline={isOffline}
        pendingSyncCount={offlineQueue.length}
        onTriggerSync={handleTriggerSync}
        onToggleOffline={() => setIsOffline(!isOffline)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            ideas={ideas}
            metrics={metrics}
            nodes={administrativeNodes}
            onSelectIdea={(idea) => setSelectedIdeaId(idea.id)}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            currentUserRole={currentUser.role}
            onNavigateTab={setActiveTab}
            onFilterByUnitCategory={(category) => {
              if (category === 'truong_cand') {
                setUnitFilterForInitiatives('NODE-TRUONG-T01');
              } else if (category === 'bo_cong_an') {
                setUnitFilterForInitiatives('NODE-BCA-C06');
              } else {
                setUnitFilterForInitiatives('NODE-TP-HN');
              }
              setActiveTab('initiatives');
            }}
          />
        )}

        {activeTab === 'initiatives' && (
          <InitiativesListView
            ideas={ideas}
            nodes={administrativeNodes}
            selectedNodeFilter={unitFilterForInitiatives}
            onChangeNodeFilter={setUnitFilterForInitiatives}
            onSelectIdea={(idea) => setSelectedIdeaId(idea.id)}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onExportPdf={(idea) => {
              setSelectedIdeaForPdf(idea);
              setIsPdfModalOpen(true);
            }}
          />
        )}

        {activeTab === 'review' && (
          <ReviewApprovalView
            ideas={ideas}
            currentUser={currentUser}
            onSelectIdea={(idea) => setSelectedIdeaId(idea.id)}
            onApprove={handleApprove}
            onRequestRevision={handleRequestRevision}
            onReject={handleReject}
            onExportPdf={(idea) => {
              setSelectedIdeaForPdf(idea);
              setIsPdfModalOpen(true);
            }}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'delegation' && (
          <UnitDelegationView
            nodes={administrativeNodes}
            activeNode={activeNode}
            ideas={ideas}
            currentUser={currentUser}
            onSelectActiveNode={setActiveNode}
            onSyncNode={handleSyncNode}
            onSyncAllNodes={handleSyncAllNodes}
            onRegenerateToken={handleRegenerateNodeToken}
            onOpenCreateForNode={handleOpenCreateForNode}
            onViewNodeInitiatives={(nodeId) => {
              setUnitFilterForInitiatives(nodeId);
              setActiveTab('initiatives');
            }}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureReportView />
        )}

        {activeTab === 'audit' && (
          <AuditLogView logs={auditLogs} />
        )}
      </main>

      {/* Modals */}
      <CreateInitiativeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreateInitiative}
        isOffline={isOffline}
        activeNode={activeNode}
        nodes={administrativeNodes}
        onNotify={showNotification}
      />

      <InitiativeDetailModal
        idea={selectedIdeaForDetail}
        isOpen={!!selectedIdeaForDetail}
        onClose={() => setSelectedIdeaId(null)}
        currentUser={currentUser}
        onApprove={handleApprove}
        onRequestRevision={handleRequestRevision}
        onReject={handleReject}
        onUpdateProgress={handleUpdateProgress}
        onAddComment={handleAddComment}
        onExportPdf={(idea) => {
          setSelectedIdeaForPdf(idea);
          setIsPdfModalOpen(true);
        }}
        onNotify={showNotification}
      />

      {/* Official PDF Report Export Modal (Cục Chuyển Đổi Số CAND) */}
      <OfficialPdfReportModal
        idea={selectedIdeaForPdf}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onNotify={showNotification}
      />

      {/* Author & Engineering Profile Modal */}
      <AuthorInfoModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        onNotify={showNotification}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <div className="font-bold text-slate-200">
                BỘ CÔNG AN · BAN CHỈ ĐẠO CHUYỂN ĐỔI SỐ
              </div>
              <div className="text-[11px] text-slate-400">
                Hệ thống quản lý sáng kiến, cải tiến số trong lực lượng Công an Nhân dân · Kết nối CSDL Quốc gia về dân cư & Đề án 06
              </div>
            </div>
            <div className="text-center sm:text-right font-mono text-[11px] text-slate-500">
              Tuân thủ Luật An ninh mạng 2025 · Luật BVBMNN 2025 · ISO/IEC 27001
            </div>
          </div>

          {/* Software Author Credit Banner */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider">Tác giả tạo phần mềm:</span>
              <button
                onClick={() => setIsAuthorModalOpen(true)}
                className="font-bold text-white text-xs hover:text-amber-300 underline cursor-pointer"
                title="Xem hồ sơ chi tiết tác giả TRẦN NGUYỄN HUY LONG"
              >
                TRẦN NGUYỄN HUY LONG
              </button>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">Điện thoại:</span>
              <a href="tel:0856682005" className="font-mono font-bold text-amber-300 hover:underline">085.668.2005</a>
              <span className="text-slate-600">·</span>
              <span className="text-amber-200 font-semibold">Học viện An ninh nhân dân</span>
              <button
                onClick={() => setIsAuthorModalOpen(true)}
                className="ml-2 px-2 py-0.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
              >
                Xem chi tiết tác giả
              </button>
            </div>
            <div className="text-slate-500 font-mono text-[10px]">
              Bản quyền phát triển © 2026 Học viện An ninh nhân dân
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
