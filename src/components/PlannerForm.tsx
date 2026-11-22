import React, { useState } from 'react';
import {
  ArrowDown,
  Bot,
  Check,
  Cpu,
  FileText,
  Lightbulb,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  ENTRY_AI_PRESETS,
  HARDWARE_SENSOR_PRESETS,
  ProjectPlan,
} from '../types/project';

interface PlannerFormProps {
  plan: ProjectPlan;
  onChange: (updated: ProjectPlan) => void;
  onFillSample: () => void;
  onResetForm: () => void;
  onCancelEditMode: () => void;
  onSaveProject: () => void;
  isSaving: boolean;
}

export function PlannerForm({
  plan,
  onChange,
  onFillSample,
  onResetForm,
  onCancelEditMode,
  onSaveProject,
  isSaving,
}: PlannerFormProps) {
  const [customSensor, setCustomSensor] = useState('');
  const [customAiTech, setCustomAiTech] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleSensor = (item: string) => {
    const exists = plan.selectedSensors.includes(item);
    const next = exists
      ? plan.selectedSensors.filter((s) => s !== item)
      : [...plan.selectedSensors, item];
    onChange({ ...plan, selectedSensors: next });
  };

  const toggleAiTech = (item: string) => {
    const exists = plan.selectedAiTechs.includes(item);
    const next = exists
      ? plan.selectedAiTechs.filter((t) => t !== item)
      : [...plan.selectedAiTechs, item];
    onChange({ ...plan, selectedAiTechs: next });
  };

  const handleAddCustomSensor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSensor.trim();
    if (!trimmed) return;
    if (!plan.selectedSensors.includes(trimmed)) {
      onChange({
        ...plan,
        selectedSensors: [...plan.selectedSensors, trimmed],
      });
    }
    setCustomSensor('');
  };

  const handleAddCustomAiTech = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customAiTech.trim();
    if (!trimmed) return;
    if (!plan.selectedAiTechs.includes(trimmed)) {
      onChange({
        ...plan,
        selectedAiTechs: [...plan.selectedAiTechs, trimmed],
      });
    }
    setCustomAiTech('');
  };

  const customAddedSensors = plan.selectedSensors.filter(
    (s) => !HARDWARE_SENSOR_PRESETS.includes(s)
  );
  const customAddedAiTechs = plan.selectedAiTechs.filter(
    (t) => !ENTRY_AI_PRESETS.includes(t)
  );

  return (
    <div className="space-y-6">
      {/* Editing Existing Project Banner */}
      {plan.id && (
        <div className="rounded-2xl border border-amber-200 bg-[#FFFBEB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              불러온 기획서를 수정하고 있어요
            </p>
            <p className="text-xs text-amber-800/80 mt-0.5 truncate">
              {plan.teamName || '팀명 미입력'} · {plan.projectName || '프로젝트명 미입력'}
              {plan.updatedAt ? ` · 마지막 저장 ${plan.updatedAt}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSaveProject}
              disabled={isSaving}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              {isSaving ? '저장 중...' : '수정 내용 저장'}
            </button>
            <button
              type="button"
              onClick={onCancelEditMode}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-amber-300 bg-white text-amber-900 hover:bg-amber-50 transition-colors whitespace-nowrap shrink-0"
            >
              새 기획서로 전환
            </button>
          </div>
        </div>
      )}

      {/* Workspace Quick Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-balance">
            자율주행 프로젝트 기획서 작성
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            왼쪽에 내용을 적으면 오른쪽 A4 기획서에 실시간으로 반영돼요.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onFillSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-[#E0F2FE]/80 hover:bg-[#BAE6FD]/80 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            예시 채워보기
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              비우기
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1.5">
              <span className="text-xs font-medium text-rose-700 whitespace-nowrap">
                모두 지울까요?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetForm();
                  setConfirmReset(false);
                }}
                className="px-2 py-1 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors whitespace-nowrap"
              >
                지우기
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 1 & 2: Team Name & Project Name */}
      <section className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-[#F0F9FF] border-b border-sky-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                팀명과 프로젝트 이름
              </h2>
              <p className="text-xs text-slate-500">
                우리 팀을 멋지게 소개하고 자동차의 이름을 지어 주세요.
              </p>
            </div>
          </div>
          <Users className="w-5 h-5 text-sky-500/80 shrink-0" aria-hidden="true" />
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="team-name-input"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                팀명
              </label>
              <input
                id="team-name-input"
                type="text"
                value={plan.teamName}
                onChange={(e) => onChange({ ...plan, teamName: e.target.value })}
                placeholder="예: 미래채움 1팀"
                maxLength={40}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="created-date-input"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                작성일
              </label>
              <input
                id="created-date-input"
                type="date"
                value={plan.createdDate}
                onChange={(e) => onChange({ ...plan, createdDate: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/40 text-sm text-slate-900 tabular-nums focus:outline-none focus:bg-white focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="project-name-input"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              프로젝트명
            </label>
            <input
              id="project-name-input"
              type="text"
              value={plan.projectName}
              onChange={(e) => onChange({ ...plan, projectName: e.target.value })}
              placeholder="예: 내 기분을 알아주는 안전 지킴이 자율주행차"
              maxLength={80}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Step 3: Used Technologies (Hardware/Sensors + Entry AI) */}
      <section className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-[#ECFDF5] border-b border-emerald-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                사용한 기술 고르기
              </h2>
              <p className="text-xs text-slate-500">
                센서와 인공지능 기술을 여러 개 누르거나 직접 추가할 수 있어요.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-800 tabular-nums whitespace-nowrap shrink-0">
            센서 {plan.selectedSensors.length}개 · AI {plan.selectedAiTechs.length}개
          </span>
        </div>

        <div className="p-5 space-y-6">
          {/* 3-A: Hardware & Sensor Technology */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">
                  하드웨어 &amp; 센서 기술
                </h3>
                <span className="text-xs text-slate-400">· 1~2차시 학습</span>
              </div>
              <span className="text-xs text-slate-500 tabular-nums">
                {plan.selectedSensors.length}개 선택됨
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {HARDWARE_SENSOR_PRESETS.map((sensor) => {
                const selected = plan.selectedSensors.includes(sensor);
                return (
                  <button
                    key={sensor}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSensor(sensor)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 text-left ${
                      selected
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-[#ECFDF5]/60'
                    }`}
                  >
                    {selected ? (
                      <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    )}
                    <span>{sensor}</span>
                  </button>
                );
              })}

              {customAddedSensors.map((sensor) => (
                <button
                  key={sensor}
                  type="button"
                  aria-pressed={true}
                  onClick={() => toggleSensor(sensor)}
                  title="클릭하여 선택 해제"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 transition-colors text-left"
                >
                  <span>{sensor}</span>
                  <X className="w-3.5 h-3.5 shrink-0 opacity-90" aria-hidden="true" />
                </button>
              ))}
            </div>

            <form onSubmit={handleAddCustomSensor} className="mt-3 flex gap-2">
              <input
                type="text"
                value={customSensor}
                onChange={(e) => setCustomSensor(e.target.value)}
                placeholder="다른 센서나 부품을 직접 입력해 추가하세요 (예: 빛 센서, 초음파 센서)"
                maxLength={50}
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100 transition-all"
              />
              <button
                type="submit"
                disabled={!customSensor.trim()}
                className="inline-flex items-center gap-1 px-3.5 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-45 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                추가
              </button>
            </form>
          </div>

          <hr className="border-slate-100" />

          {/* 3-B: Entry AI Technology */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">
                  엔트리 인공지능 기술
                </h3>
                <span className="text-xs text-slate-400">· 1~4차시 학습</span>
              </div>
              <span className="text-xs text-slate-500 tabular-nums">
                {plan.selectedAiTechs.length}개 선택됨
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {ENTRY_AI_PRESETS.map((tech) => {
                const selected = plan.selectedAiTechs.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAiTech(tech)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 text-left ${
                      selected
                        ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                        : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-[#F0F9FF]'
                    }`}
                  >
                    {selected ? (
                      <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    )}
                    <span>{tech}</span>
                  </button>
                );
              })}

              {customAddedAiTechs.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  aria-pressed={true}
                  onClick={() => toggleAiTech(tech)}
                  title="클릭하여 선택 해제"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border bg-sky-600 text-white border-sky-700 hover:bg-sky-700 transition-colors text-left"
                >
                  <span>{tech}</span>
                  <X className="w-3.5 h-3.5 shrink-0 opacity-90" aria-hidden="true" />
                </button>
              ))}
            </div>

            <form onSubmit={handleAddCustomAiTech} className="mt-3 flex gap-2">
              <input
                type="text"
                value={customAiTech}
                onChange={(e) => setCustomAiTech(e.target.value)}
                placeholder="다른 인공지능 기능을 직접 입력해 추가하세요 (예: 포즈 인식, 신호등 분류)"
                maxLength={60}
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
              />
              <button
                type="submit"
                disabled={!customAiTech.trim()}
                className="inline-flex items-center gap-1 px-3.5 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 disabled:opacity-45 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                추가
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Step 4: How It Works (Structured Scenario) */}
      <section className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-[#FFFBEB] border-b border-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                작동 방법 설계하기
              </h2>
              <p className="text-xs text-slate-500">
                &ldquo;무엇을 감지하면(입력) → 어떻게 움직일까(출력)&rdquo; 순서대로 정리해 보세요.
              </p>
            </div>
          </div>
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
        </div>

        <div className="p-5 space-y-4">
          {/* Input Trigger */}
          <div>
            <label
              htmlFor="trigger-input"
              className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-1"
            >
              <span>상황 (입력) — 어떤 센서나 AI가 무엇을 감지하나요?</span>
            </label>
            <textarea
              id="trigger-input"
              rows={3}
              value={plan.triggerInput}
              onChange={(e) => onChange({ ...plan, triggerInput: e.target.value })}
              placeholder="예: 카메라가 운전자의 '분노' 표정을 인식하거나, 음성으로 '주차'라고 말하면"
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC]/70 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed resize-y focus:outline-none focus:bg-white focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="flex items-center justify-center text-xs font-medium text-slate-400 gap-1.5 py-0.5">
            <ArrowDown className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>감지한 정보를 바탕으로 햄스터봇이 판단하고 행동해요</span>
          </div>

          {/* Output Action */}
          <div>
            <label
              htmlFor="action-output"
              className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-1"
            >
              <span>판단 및 행동 (출력) — 햄스터봇이 어떻게 움직이고 반응하나요?</span>
            </label>
            <textarea
              id="action-output"
              rows={3}
              value={plan.actionOutput}
              onChange={(e) => onChange({ ...plan, actionOutput: e.target.value })}
              placeholder='예: 빨간색 LED를 켜고 "안전운전 하세요"라고 말하며 천천히 주행한다'
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-[#FFFBEB]/40 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed resize-y focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all"
            />
          </div>

          <hr className="border-slate-100 my-1" />

          {/* Detailed Free-form Sequence */}
          <div>
            <label
              htmlFor="detailed-flow"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-1"
            >
              <FileText className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>자유 상세 설명 — 전체적인 작동 순서를 자세히 적어 보세요</span>
            </label>
            <textarea
              id="detailed-flow"
              rows={5}
              value={plan.detailedFlow}
              onChange={(e) => onChange({ ...plan, detailedFlow: e.target.value })}
              placeholder={
                '1단계: 출발하면 바닥 센서로 차선을 따라 달린다.\n2단계: ...\n3단계: ...'
              }
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed resize-y focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100 transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
