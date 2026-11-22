import React, { useEffect, useMemo, useState } from 'react';
import {
  Cloud,
  FolderOpen,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { SavedProjectRecord, StorageMode } from '../types/project';

interface LoadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SavedProjectRecord[];
  isLoading: boolean;
  errorMessage: string | null;
  storageMode: StorageMode;
  activeProjectId: string | null;
  onRefresh: () => void;
  onSelectRecord: (record: SavedProjectRecord) => void;
  onDeleteRecord: (id: string) => Promise<void>;
  onUseSampleInstead: () => void;
}

export function LoadProjectModal({
  isOpen,
  onClose,
  records,
  isLoading,
  errorMessage,
  storageMode,
  activeProjectId,
  onRefresh,
  onSelectRecord,
  onDeleteRecord,
  onUseSampleInstead,
}: LoadProjectModalProps) {
  const [query, setQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (item) =>
        item.teamName.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.selectedSensors.some((s) => s.toLowerCase().includes(q)) ||
        item.selectedAiTechs.some((t) => t.toLowerCase().includes(q))
    );
  }, [records, query]);

  if (!isOpen) return null;

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteRecord(id);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="load-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F0F9FF] border-b border-sky-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <FolderOpen className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="load-modal-title" className="text-base font-bold text-slate-900">
                저장된 팀 기획서 불러오기
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                {storageMode === 'gas' ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>구글 시트 연동 저장소 · 총 {records.length}개</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>브라우저 임시 저장소 · 총 {records.length}개</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              새로고침
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3.5 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="팀명, 프로젝트명 또는 사용한 기술로 검색하세요"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto soft-scroll p-6 space-y-3 bg-[#F8FAFC]/60">
          {isLoading ? (
            <div className="py-14 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-7 h-7 text-sky-500 animate-spin" aria-hidden="true" />
              <p className="text-sm font-medium">저장된 기획서 목록을 불러오고 있어요...</p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center space-y-3">
              <p className="text-sm font-semibold text-rose-800">{errorMessage}</p>
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                다시 시도하기
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                {records.length === 0
                  ? '아직 저장된 팀 기획서가 없어요.'
                  : '검색 조건에 맞는 기획서가 없어요.'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {records.length === 0
                  ? '기획서를 작성하고 상단의 [저장하기] 버튼을 누르면 이곳에 팀별 목록이 쌓입니다.'
                  : '다른 팀명이나 프로젝트 이름으로 다시 검색해 보세요.'}
              </p>
              {records.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onUseSampleInstead();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 mt-1 text-xs font-semibold text-sky-700 bg-[#E0F2FE] hover:bg-[#BAE6FD] rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  예시 기획서 채워서 시작해 보기
                </button>
              )}
            </div>
          ) : (
            filtered.map((record) => {
              const isCurrent = activeProjectId === record.id;
              const isConfirmingDelete = confirmDeleteId === record.id;
              const isDeleting = deletingId === record.id;

              return (
                <div
                  key={record.id}
                  className={`rounded-2xl border bg-white p-4 transition-all ${
                    isCurrent
                      ? 'border-sky-300 ring-2 ring-sky-100'
                      : 'border-slate-200/80 hover:border-sky-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-emerald-700">
                          {record.teamName || '팀명 미입력'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{record.updatedAt || '작성일시 없음'}</span>
                        {isCurrent && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-sky-600">현재 수정 중</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {record.projectName || '제목 없는 자율주행 프로젝트'}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        센서 {record.selectedSensors.length}개 · AI {record.selectedAiTechs.length}개
                        {record.triggerInput ? ` · ${record.triggerInput}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isConfirmingDelete ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onSelectRecord(record)}
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors whitespace-nowrap"
                          >
                            불러와서 수정하기
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(record.id)}
                            aria-label={`${record.teamName} 기획서 삭제`}
                            className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1.5">
                          <span className="text-xs font-medium text-rose-700 whitespace-nowrap">
                            삭제할까요?
                          </span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleConfirmDelete(record.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg disabled:opacity-50 whitespace-nowrap"
                          >
                            {isDeleting ? '삭제 중' : '확인'}
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
                          >
                            취소
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>원하는 팀을 선택하면 폼에 내용이 채워지며, 수정 후 덮어쓰기 저장할 수 있어요.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap ml-4"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
