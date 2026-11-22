import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Copy,
  HardDrive,
  Link2,
  Loader2,
  Settings,
  Share2,
  Unlink,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  buildStudentShareUrl,
  testGasConnection,
} from '../services/storageService';

interface GasSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGasUrl: string;
  onSaveGasUrl: (url: string) => void;
}

export function GasSettingsModal({
  isOpen,
  onClose,
  currentGasUrl,
  onSaveGasUrl,
}: GasSettingsModalProps) {
  const [urlInput, setUrlInput] = useState(currentGasUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentGasUrl);
      setTestResult(null);
      setCopied(false);
      setShareCopied(false);
    }
  }, [isOpen, currentGasUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConnected = Boolean(currentGasUrl.trim());

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGasConnection(urlInput);
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (trimmed && !trimmed.startsWith('https://script.google.com/')) {
      setTestResult({
        ok: false,
        message: 'https://script.google.com/ 으로 시작하는 배포된 웹 앱 URL을 입력해 주세요.',
      });
      return;
    }
    onSaveGasUrl(trimmed);
    onClose();
  };

  const handleDisconnect = () => {
    setUrlInput('');
    onSaveGasUrl('');
    setTestResult({
      ok: true,
      message: '연결을 해제했습니다. 이제 브라우저 임시 저장소(localStorage)를 사용합니다.',
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy via temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = GOOGLE_APPS_SCRIPT_CODE;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyShareLink = async () => {
    const shareUrl = buildStudentShareUrl(urlInput);
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gas-settings-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#ECFDF5] border-b border-emerald-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="gas-settings-title" className="text-base font-bold text-slate-900">
                구글 시트 연동 설정 및 설치 가이드
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                로그인 없이 Google Apps Script 웹 앱 URL만으로 학급 기획서를 함께 모을 수 있어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="설정창 닫기"
            className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto soft-scroll p-6 space-y-6">
          {/* Current Mode Banner */}
          <div
            className={`rounded-xl border px-4 py-3.5 flex items-start gap-3 ${
              isConnected
                ? 'bg-[#ECFDF5]/80 border-emerald-200 text-emerald-950'
                : 'bg-[#FFFBEB] border-amber-200 text-amber-950'
            }`}
          >
            {isConnected ? (
              <Cloud className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <HardDrive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-bold">
                {isConnected
                  ? '현재 상태: 구글 시트(Google Apps Script) 연동됨'
                  : '현재 상태: 브라우저 임시 저장 모드 (localStorage)'}
              </p>
              <p className="text-xs opacity-85 mt-0.5">
                {isConnected
                  ? '저장하기 및 불러오기 시 연결된 구글 시트에 실시간으로 기록됩니다.'
                  : '구글 시트 URL을 연결하지 않아도 이 기기 브라우저에 임시 저장·불러오기·수정을 바로 테스트할 수 있습니다.'}
              </p>
            </div>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleApplyUrl} className="space-y-3">
            <label
              htmlFor="gas-url-input"
              className="flex items-center gap-1.5 text-sm font-bold text-slate-900"
            >
              <Link2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
              Google Apps Script 웹 앱 URL
            </label>
            <input
              id="gas-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
            />

            {testResult && (
              <div
                className={`rounded-xl px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 border ${
                  testResult.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors whitespace-nowrap"
              >
                URL 저장하고 적용하기
              </button>

              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !urlInput.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap"
              >
                {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                연결 테스트
              </button>

              {urlInput.trim().startsWith('https://script.google.com/') && (
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap ${
                    shareCopied
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-[#ECFDF5] text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      학생용 링크 복사 완료!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      학생용 공유 링크 복사
                    </>
                  )}
                </button>
              )}

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors whitespace-nowrap ml-auto"
                >
                  <Unlink className="w-3.5 h-3.5" aria-hidden="true" />
                  연결 해제 (임시 저장으로 전환)
                </button>
              )}
            </div>
          </form>

          <hr className="border-slate-100" />

          {/* Step-by-step Teacher Setup Guide */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              구글 시트 연결 방법 (선생님용 5단계 안내)
            </h3>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  1
                </span>
                <span>
                  새 <strong>구글 스프레드시트</strong>를 만들고 상단 메뉴에서{' '}
                  <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  2
                </span>
                <span>
                  편집기에 들어 있는 기본 코드를 모두 지우고, 아래의{' '}
                  <strong>Google Apps Script 전체 코드</strong>를 복사해 붙여넣은 뒤 저장(Ctrl+S)합니다.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  3
                </span>
                <span>
                  우측 상단 <strong>[배포] → [새 배포]</strong>를 누르고, 유형 선택(톱니바퀴)에서{' '}
                  <strong>[웹 앱]</strong>을 고릅니다.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  4
                </span>
                <span>
                  실행 주체는 <strong>&ldquo;나&rdquo;</strong>, 액세스 권한은{' '}
                  <strong>&ldquo;모든 사용자&rdquo;</strong>로 설정한 뒤 <strong>[배포]</strong>를 누르고 권한을 승인합니다.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  5
                </span>
                <span>
                  발급된 <strong>웹 앱 URL (.../exec)</strong>을 복사해 위 입력칸에 붙여넣고 저장하면 완료됩니다!
                </span>
              </li>
            </ol>
          </div>

          {/* Copyable GAS Script Box */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">
                  구글 시트 Apps Script 전체 코드 (Code.gs)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    코드 복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    코드 복사하기
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed overflow-x-auto max-h-72 soft-scroll select-all">
              <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>시트 첫 행(고유 ID ~ 작동 방법)은 스크립트가 자동으로 생성합니다.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 whitespace-nowrap ml-4"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
