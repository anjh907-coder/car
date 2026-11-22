import {
  ProjectPlan,
  SavedProjectRecord,
  formatTimestamp,
  parseHowItWorks,
  parseTechList,
  serializeHowItWorks,
} from '../types/project';

const GAS_URL_STORAGE_KEY = 'hamsterbot_planner_gas_url_v1';
const LOCAL_PROJECTS_KEY = 'hamsterbot_planner_local_projects_v1';
const DRAFT_STORAGE_KEY = 'hamsterbot_planner_draft_v1';

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * 햄스터봇 자율주행 AI 프로젝트 기획서 - Google Apps Script 웹 앱 백엔드
 *
 * [컬럼 구성]
 * A: 고유 ID | B: 작성일시 | C: 팀명 | D: 프로젝트명 | E: 선택된 센서 | F: 선택된 AI 기술 | G: 작동 방법
 */

const SHEET_NAME = '프로젝트기획서';
const HEADERS = [
  '고유 ID',
  '작성일시',
  '팀명',
  '프로젝트명',
  '선택된 센서',
  '선택된 AI 기술',
  '작동 방법'
];

function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#E0F2FE');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// 조회(GET): ?action=list 또는 ?action=ping
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'list';

    if (action === 'ping') {
      getTargetSheet();
      return createJsonResponse({
        success: true,
        message: '구글 시트 연결이 정상적으로 확인되었습니다.'
      });
    }

    const sheet = getTargetSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const records = values
      .filter(function(row) { return String(row[0]).trim() !== ''; })
      .map(function(row) {
        return {
          id: String(row[0]),
          updatedAt: String(row[1]),
          teamName: String(row[2]),
          projectName: String(row[3]),
          sensors: String(row[4]),
          aiTechs: String(row[5]),
          howItWorks: String(row[6])
        };
      })
      .reverse();

    return createJsonResponse({ success: true, data: records });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.message || '시트 조회 중 오류가 발생했습니다.'
    });
  }
}

// 저장/수정/삭제(POST): CORS 프리플라이트를 피하기 위해 text/plain 본문으로 JSON 수신
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'create';
    const sheet = getTargetSheet();

    if (action === 'create') {
      const id = body.id || ('HB_' + new Date().getTime());
      const rowData = [
        id,
        body.updatedAt || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
        body.teamName || '',
        body.projectName || '',
        body.sensors || '',
        body.aiTechs || '',
        body.howItWorks || ''
      ];
      sheet.appendRow(rowData);
      return createJsonResponse({ success: true, id: id, message: '새 기획서가 저장되었습니다.' });
    }

    if (action === 'update') {
      const targetId = String(body.id || '').trim();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1 && targetId) {
        const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === targetId) {
            const rowIndex = i + 2;
            const updatedRow = [[
              targetId,
              body.updatedAt || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
              body.teamName || '',
              body.projectName || '',
              body.sensors || '',
              body.aiTechs || '',
              body.howItWorks || ''
            ]];
            sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues(updatedRow);
            return createJsonResponse({ success: true, id: targetId, message: '기획서가 수정되었습니다.' });
          }
        }
      }
      // 일치하는 ID가 없으면 새로 추가
      const fallbackId = targetId || ('HB_' + new Date().getTime());
      sheet.appendRow([
        fallbackId,
        body.updatedAt || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
        body.teamName || '',
        body.projectName || '',
        body.sensors || '',
        body.aiTechs || '',
        body.howItWorks || ''
      ]);
      return createJsonResponse({ success: true, id: fallbackId, message: '기획서가 저장되었습니다.' });
    }

    if (action === 'delete') {
      const targetId = String(body.id || '').trim();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1 && targetId) {
        const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === targetId) {
            sheet.deleteRow(i + 2);
            return createJsonResponse({ success: true, id: targetId, message: '기획서가 삭제되었습니다.' });
          }
        }
      }
      return createJsonResponse({ success: false, error: '삭제할 기획서를 찾지 못했습니다.' });
    }

    return createJsonResponse({ success: false, error: '지원하지 않는 요청입니다.' });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.message || '요청 처리 중 오류가 발생했습니다.'
    });
  } finally {
    lock.releaseLock();
  }
}
`;

const GAS_DISCONNECTED_SENTINEL = '__LOCAL_ONLY__';

export function getEnvDefaultGasUrl(): string {
  const envVal = import.meta.env.VITE_GAS_WEB_APP_URL;
  return typeof envVal === 'string' ? envVal.trim() : '';
}

export function getSavedGasUrl(): string {
  // 1) Support teacher-shared student links: ?gas=https://script.google.com/...
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const paramUrl = (params.get('gas') || params.get('sheet') || '').trim();
      if (paramUrl && paramUrl.startsWith('https://script.google.com/')) {
        localStorage.setItem(GAS_URL_STORAGE_KEY, paramUrl);
        params.delete('gas');
        params.delete('sheet');
        const nextSearch = params.toString();
        const cleanUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', cleanUrl);
        return paramUrl;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 2) Check browser localStorage (including explicit disconnect choice)
  try {
    const stored = localStorage.getItem(GAS_URL_STORAGE_KEY);
    if (stored === GAS_DISCONNECTED_SENTINEL) {
      return '';
    }
    if (stored && stored.trim()) {
      return stored.trim();
    }
  } catch {
    // Ignore storage access errors
  }

  // 3) Fallback to build-time environment variable VITE_GAS_WEB_APP_URL
  return getEnvDefaultGasUrl();
}

export function setSavedGasUrl(url: string): void {
  try {
    const trimmed = url.trim();
    if (!trimmed) {
      if (getEnvDefaultGasUrl()) {
        localStorage.setItem(GAS_URL_STORAGE_KEY, GAS_DISCONNECTED_SENTINEL);
      } else {
        localStorage.removeItem(GAS_URL_STORAGE_KEY);
      }
    } else {
      localStorage.setItem(GAS_URL_STORAGE_KEY, trimmed);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function buildStudentShareUrl(gasUrl: string): string {
  const trimmed = gasUrl.trim();
  if (typeof window === 'undefined') return '';
  const base = `${window.location.origin}${window.location.pathname}`;
  if (!trimmed) return base;
  return `${base}?gas=${encodeURIComponent(trimmed)}`;
}

export function saveDraftToBrowser(plan: ProjectPlan): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Ignore storage errors
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

function readLocalRecords(): SavedProjectRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeLocalRecords(records: SavedProjectRecord[]): void {
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(records));
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

export async function testGasConnection(url: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, message: 'Google Apps Script 웹 앱 URL을 입력해 주세요.' };
  }
  if (!trimmed.startsWith('https://script.google.com/')) {
    return {
      ok: false,
      message: '올바른 Google Apps Script 웹 앱 URL(https://script.google.com/...)인지 확인해 주세요.',
    };
  }

  try {
    const separator = trimmed.includes('?') ? '&' : '?';
    const response = await fetch(`${trimmed}${separator}action=ping`, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `연결에 실패했습니다. (HTTP ${response.status}) 웹 앱 배포 권한을 '모든 사용자'로 설정했는지 확인해 주세요.`,
      };
    }

    const result = await response.json();
    if (result && result.success) {
      return {
        ok: true,
        message: result.message || '구글 시트와 정상적으로 연결되었습니다!',
      };
    }

    return {
      ok: false,
      message: result?.error || '응답 형식이 올바르지 않습니다. 스크립트 코드를 다시 확인해 주세요.',
    };
  } catch {
    return {
      ok: false,
      message:
        '구글 시트에 연결할 수 없습니다. 배포 시 액세스 권한을 "모든 사용자"로 설정했는지 확인해 주세요.',
    };
  }
}

export async function fetchSavedProjects(gasUrl: string): Promise<SavedProjectRecord[]> {
  const trimmed = gasUrl.trim();
  if (!trimmed) {
    return readLocalRecords();
  }

  const separator = trimmed.includes('?') ? '&' : '?';
  const response = await fetch(`${trimmed}${separator}action=list`, {
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
  plan: ProjectPlan,
  gasUrl: string
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

  const trimmed = gasUrl.trim();
  if (!trimmed) {
    const existing = readLocalRecords();
    if (isUpdate) {
      const idx = existing.findIndex((item) => item.id === id);
      if (idx >= 0) {
        existing[idx] = record;
      } else {
        existing.unshift(record);
      }
      writeLocalRecords(existing);
      return { record, mode: 'updated' };
    }
    existing.unshift(record);
    writeLocalRecords(existing);
    return { record, mode: 'created' };
  }

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
  const response = await fetch(trimmed, {
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

export async function deleteSavedProject(id: string, gasUrl: string): Promise<void> {
  const trimmed = gasUrl.trim();
  if (!trimmed) {
    const existing = readLocalRecords().filter((item) => item.id !== id);
    writeLocalRecords(existing);
    return;
  }

  const response = await fetch(trimmed, {
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
