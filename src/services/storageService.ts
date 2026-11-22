import {
  ProjectPlan,
  SavedProjectRecord,
  formatTimestamp,
  parseHowItWorks,
  parseTechList,
  serializeHowItWorks,
} from '../types/project';

export const FIXED_GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbx-XhWYUm8YrSW3SBZBZFZmt6-IKgjfLmDBjEy152jYHdkYZzukQSDKJumVqOU3kbmH/exec';

const DRAFT_STORAGE_KEY = 'hamsterbot_planner_draft_v1';

export function saveDraftToBrowser(plan: ProjectPlan): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadDraftFromBrowser(): ProjectPlan | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProjectPlan>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      id: typeof parsed.id === 'string' ? parsed.id : null,
      teamName: typeof parsed.teamName === 'string' ? parsed.teamName : '',
      projectName: typeof parsed.projectName === 'string' ? parsed.projectName : '',
      selectedSensors: Array.isArray(parsed.selectedSensors) ? parsed.selectedSensors : [],
      selectedAiTechs: Array.isArray(parsed.selectedAiTechs) ? parsed.selectedAiTechs : [],
      triggerInput: typeof parsed.triggerInput === 'string' ? parsed.triggerInput : '',
      actionOutput: typeof parsed.actionOutput === 'string' ? parsed.actionOutput : '',
      detailedFlow: typeof parsed.detailedFlow === 'string' ? parsed.detailedFlow : '',
      createdDate:
        typeof parsed.createdDate === 'string' && parsed.createdDate
          ? parsed.createdDate
          : new Date().toISOString().slice(0, 10),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

function generateProjectId(): string {
  const randomSuffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HB_${Date.now()}_${randomSuffix}`;
}

function mapGasRowToRecord(row: Record<string, unknown>): SavedProjectRecord {
  const howItWorksRaw = String(row.howItWorks ?? '');
  const parsedFlow = parseHowItWorks(howItWorksRaw);
  return {
    id: String(row.id ?? ''),
    updatedAt: String(row.updatedAt ?? ''),
    teamName: String(row.teamName ?? ''),
    projectName: String(row.projectName ?? ''),
    selectedSensors: parseTechList(row.sensors),
    selectedAiTechs: parseTechList(row.aiTechs),
    triggerInput: parsedFlow.triggerInput,
    actionOutput: parsedFlow.actionOutput,
    detailedFlow: parsedFlow.detailedFlow,
    howItWorksRaw,
  };
}

export async function fetchSavedProjects(): Promise<SavedProjectRecord[]> {
  const separator = FIXED_GAS_WEB_APP_URL.includes('?') ? '&' : '?';
  const response = await fetch(`${FIXED_GAS_WEB_APP_URL}${separator}action=list`, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`구글 시트 목록을 불러오지 못했습니다. (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (!result || !result.success || !Array.isArray(result.data)) {
    throw new Error(result?.error || '구글 시트 데이터를 해석하는 중 오류가 발생했습니다.');
  }

  return result.data.map((row: Record<string, unknown>) => mapGasRowToRecord(row));
}

export async function saveOrUpdateProject(
  plan: ProjectPlan
): Promise<{ record: SavedProjectRecord; mode: 'created' | 'updated' }> {
  const isUpdate = Boolean(plan.id);
  const id = plan.id || generateProjectId();
  const updatedAt = formatTimestamp(new Date());
  const howItWorksRaw = serializeHowItWorks(
    plan.triggerInput,
    plan.actionOutput,
    plan.detailedFlow
  );

  const record: SavedProjectRecord = {
    id,
    updatedAt,
    teamName: plan.teamName.trim(),
    projectName: plan.projectName.trim(),
    selectedSensors: [...plan.selectedSensors],
    selectedAiTechs: [...plan.selectedAiTechs],
    triggerInput: plan.triggerInput.trim(),
    actionOutput: plan.actionOutput.trim(),
    detailedFlow: plan.detailedFlow.trim(),
    howItWorksRaw,
  };

  const payload = {
    action: isUpdate ? 'update' : 'create',
    id: record.id,
    updatedAt: record.updatedAt,
    teamName: record.teamName,
    projectName: record.projectName,
    sensors: record.selectedSensors.join(', '),
    aiTechs: record.selectedAiTechs.join(', '),
    howItWorks: record.howItWorksRaw,
  };

  // text/plain avoids CORS preflight OPTIONS which Google Apps Script Web Apps do not support
  const response = await fetch(FIXED_GAS_WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`구글 시트 저장에 실패했습니다. (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (!result || !result.success) {
    throw new Error(result?.error || '구글 시트에 저장하지 못했습니다.');
  }

  return {
    record: { ...record, id: result.id || record.id },
    mode: isUpdate ? 'updated' : 'created',
  };
}

export async function deleteSavedProject(id: string): Promise<void> {
  const response = await fetch(FIXED_GAS_WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'delete',
      id,
    }),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`구글 시트에서 삭제하지 못했습니다. (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (!result || !result.success) {
    throw new Error(result?.error || '기획서를 삭제하지 못했습니다.');
  }
}
