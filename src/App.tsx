import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Download,
  Eye,
  FilePlus2,
  FolderOpen,
  HardDrive,
  Info,
  Loader2,
  PenLine,
  Save,
  Settings,
} from 'lucide-react';
import { A4Preview } from './components/A4Preview';
import { GasSettingsModal } from './components/GasSettingsModal';
import { LoadProjectModal } from './components/LoadProjectModal';
import { PlannerForm } from './components/PlannerForm';
import {
  deleteSavedProject,
  fetchSavedProjects,
  getSavedGasUrl,
  loadDraftFromBrowser,
  saveDraftToBrowser,
  saveOrUpdateProject,
  setSavedGasUrl,
} from './services/storageService';
import {
  ProjectPlan,
  SavedProjectRecord,
  StorageMode,
  ToastNotice,
  createEmptyProject,
  createSampleProject,
  getTodayIsoDate,
} from './types/project';
import { exportA4ElementToPdf } from './utils/pdfExport';

export default function App() {
  const [plan, setPlan] = useState<ProjectPlan>(() => {
    return loadDraftFromBrowser() ?? createEmptyProject();
  });
  const [gasUrl, setGasUrl] = useState<string>(() => getSavedGasUrl());
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [savedRecords, setSavedRecords] = useState<SavedProjectRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastNotice | null>(null);

  const a4CaptureRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const storageMode: StorageMode = gasUrl.trim() ? 'gas' : 'local';

  const showToast = useCallback((type: ToastNotice['type'], message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3800);
  }, []);

  // Persist work-in-progress draft automatically so students don't lose work on accidental refresh
  useEffect(() => {
    saveDraftToBrowser(plan);
  }, [plan]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const refreshSavedRecords = useCallback(
    async (targetGasUrl: string = gasUrl) => {
      setIsLoadingRecords(true);
      setLoadError(null);
      try {
        const list = await fetchSavedProjects(targetGasUrl);
        setSavedRecords(list);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : '저장된 기획서 목록을 불러오는 중 오류가 발생했습니다.';
        setLoadError(msg);
      } finally {
        setIsLoadingRecords(false);
      }
    },
    [gasUrl]
  );

  const handleOpenLoadModal = () => {
    setIsLoadModalOpen(true);
    void refreshSavedRecords(gasUrl);
  };

  const handleSaveProject = async () => {
    if (!plan.teamName.trim()) {
      showToast('error', '팀명을 먼저 입력해 주세요.');
      setMobileTab('form');
      return;
    }
    if (!plan.projectName.trim()) {
      showToast('error', '프로젝트명을 먼저 입력해 주세요.');
      setMobileTab('form');
      return;
    }

    setIsSaving(true);
    try {
      const { record, mode } = await saveOrUpdateProject(plan, gasUrl);
      setPlan((prev) => ({
        ...prev,
        id: record.id,
        updatedAt: record.updatedAt,
      }));
      const destination = storageMode === 'gas' ? '구글 시트' : '브라우저 임시 저장소';
      showToast(
        'success',
        mode === 'updated'
          ? `${destination}의 "${record.teamName}" 기획서를 수정 저장했어요.`
          : `${destination}에 "${record.teamName}" 기획서를 저장했어요.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '저장 중 문제가 발생했습니다.';
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectRecord = (record: SavedProjectRecord) => {
    const dateFromTimestamp = record.updatedAt?.slice(0, 10);
    const validDate =
      dateFromTimestamp && /^\d{4}-\d{2}-\d{2}$/.test(dateFromTimestamp)
        ? dateFromTimestamp
        : getTodayIsoDate();

    setPlan({
      id: record.id,
      teamName: record.teamName,
      projectName: record.projectName,
      selectedSensors: record.selectedSensors,
      selectedAiTechs: record.selectedAiTechs,
      triggerInput: record.triggerInput,
      actionOutput: record.actionOutput,
      detailedFlow: record.detailedFlow,
      createdDate: validDate,
      updatedAt: record.updatedAt,
    });
    setIsLoadModalOpen(false);
    setMobileTab('form');
    showToast(
      'info',
      `"${record.teamName}" 팀의 기획서를 불러왔어요. 수정 후 저장할 수 있습니다.`
    );
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteSavedProject(id, gasUrl);
      setSavedRecords((prev) => prev.filter((item) => item.id !== id));
      if (plan.id === id) {
        setPlan((prev) => ({ ...prev, id: null, updatedAt: undefined }));
      }
      showToast('info', '선택한 기획서를 삭제했어요.');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.';
      showToast('error', msg);
    }
  };

  const handleSaveGasUrl = (nextUrl: string) => {
    setSavedGasUrl(nextUrl);
    setGasUrl(nextUrl);
    showToast(
      'success',
      nextUrl
        ? '구글 시트 웹 앱 URL을 저장했어요.'
        : '구글 시트 연결을 해제하고 임시 저장 모드로 전환했어요.'
    );
  };

  const handleStartNewProject = () => {
    setPlan(createEmptyProject());
    setMobileTab('form');
    showToast('info', '새 기획서를 작성할 수 있도록 화면을 비웠어요.');
  };

  const handleFillSample = () => {
    setPlan(createSampleProject());
    showToast('info', '예시 자율주행 프로젝트 내용을 채워 넣었어요.');
  };

  const handleCancelEditMode = () => {
    setPlan((prev) => ({
      ...prev,
      id: null,
      updatedAt: undefined,
    }));
    showToast('info', '새 기획서 작성 모드로 전환했어요. 저장 시 새 항목으로 추가됩니다.');
  };

  const handleExportPdf = async () => {
    // Ensure A4 preview DOM is visible on narrow mobile viewports before capture
    if (mobileTab !== 'preview' && window.innerWidth < 1024) {
      setMobileTab('preview');
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    const target = a4CaptureRef.current;
    if (!target) {
      showToast('error', '미리보기 화면을 찾지 못했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setIsExportingPdf(true);
    try {
      const filename = await exportA4ElementToPdf({
        element: target,
        teamName: plan.teamName,
        projectName: plan.projectName,
      });
      showToast('success', `${filename} 파일이 다운로드되었어요!`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('error', 'PDF 변환 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6FAFC] text-[#1E293B]">
      {/* Clean Single-Row Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Zone */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            햄스터봇 자율주행 기획실
          </a>

          {/* Navigation / Utility Actions Zone */}
          <nav
            aria-label="기획서 작업 메뉴"
            className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={handleStartNewProject}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
              새 기획서
            </button>

            <button
              type="button"
              onClick={handleOpenLoadModal}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              <FolderOpen className="w-4 h-4 text-sky-500" aria-hidden="true" />
              불러오기
            </button>

            <button
              type="button"
              onClick={handleSaveProject}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              )}
              {plan.id ? '수정 저장' : '저장하기'}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="구글 시트 연동 설정"
              title="구글 시트 연동 설정 및 Apps Script 가이드"
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
              시트 설정
            </button>
          </nav>

          {/* Primary Action Zone */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Compact mobile utility buttons */}
            <button
              type="button"
              onClick={handleOpenLoadModal}
              aria-label="불러오기"
              className="md:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center shrink-0"
            >
              <FolderOpen className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSaveProject}
              disabled={isSaving}
              aria-label={plan.id ? '수정 저장' : '저장하기'}
              className="md:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50 flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="구글 시트 연동 설정"
              className="md:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center shrink-0"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{isExportingPdf ? 'PDF 만드는 중...' : 'PDF로 저장하기'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet View Switcher (only shown below lg breakpoint) */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 px-4 py-2.5">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mobileTab === 'form'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
            기획서 작성
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            A4 미리보기
          </button>
        </div>
      </div>

      {/* Main Two-Column Classroom Workspace */}
      <main
        id="top"
        className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Step-by-Step Form */}
          <div
            className={`lg:col-span-6 ${
              mobileTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            <PlannerForm
              plan={plan}
              onChange={setPlan}
              onFillSample={handleFillSample}
              onResetForm={handleStartNewProject}
              onCancelEditMode={handleCancelEditMode}
              onSaveProject={handleSaveProject}
              isSaving={isSaving}
            />

            {/* Bottom Convenient Action Bar under the Form */}
            <div className="mt-6 rounded-2xl bg-white border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {storageMode === 'gas' ? (
                  <>
                    <Cloud className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>구글 시트 연동됨 · 저장 시 학급 시트에 바로 올라가요</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>
                      임시 저장 모드 ·{' '}
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="underline font-semibold text-sky-700 hover:text-sky-800"
                      >
                        구글 시트 연결하기
                      </button>
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {plan.id ? '수정 내용 저장' : '기획서 저장하기'}
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  PDF 저장
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live A4 Document Preview */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-22 ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <A4Preview plan={plan} captureRef={a4CaptureRef} />
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200/70 bg-white/70 mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>햄스터봇과 함께하는 자율주행 AI 모험 · 초등 교육용 프로젝트 기획 도구</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenLoadModal}
              className="hover:text-slate-900 transition-colors"
            >
              저장된 팀 목록
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              구글 시트 연동 가이드
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoadProjectModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        records={savedRecords}
        isLoading={isLoadingRecords}
        errorMessage={loadError}
        storageMode={storageMode}
        activeProjectId={plan.id}
        onRefresh={() => void refreshSavedRecords(gasUrl)}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={handleDeleteRecord}
        onUseSampleInstead={handleFillSample}
      />

      <GasSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentGasUrl={gasUrl}
        onSaveGasUrl={handleSaveGasUrl}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border shadow-lg px-4 py-3 flex items-center gap-2.5 text-sm font-medium bg-white"
          style={{
            borderColor:
              toast.type === 'success'
                ? '#A7F3D0'
                : toast.type === 'error'
                ? '#FECDD3'
                : '#BAE6FD',
          }}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-sky-500 shrink-0" aria-hidden="true" />
          )}
          <span className="text-slate-800 text-xs sm:text-sm leading-snug">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
