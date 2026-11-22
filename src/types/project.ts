export interface ProjectPlan {
  id: string | null;
  teamName: string;
  projectName: string;
  selectedSensors: string[];
  selectedAiTechs: string[];
  triggerInput: string;
  actionOutput: string;
  detailedFlow: string;
  createdDate: string; // YYYY-MM-DD display date on A4 sheet
  updatedAt?: string;
}

export interface SavedProjectRecord {
  id: string;
  updatedAt: string;
  teamName: string;
  projectName: string;
  selectedSensors: string[];
  selectedAiTechs: string[];
  triggerInput: string;
  actionOutput: string;
  detailedFlow: string;
  howItWorksRaw: string;
}

export type StorageMode = 'gas' | 'local';

export interface ToastNotice {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const HARDWARE_SENSOR_PRESETS: readonly string[] = [
  '근접 센서 (앞/장애물 감지)',
  '바닥 센서 (라인/검은선·흰선 감지)',
  '가속도/온도 센서',
  '바퀴 모터 (주행/회전)',
  'LED 불빛 / 버저(소리·멜로디)',
] as const;

export const ENTRY_AI_PRESETS: readonly string[] = [
  '인공지능 모델 학습 (이미지/소리/텍스트 학습 모델로 신호 인식)',
  '오디오 감지 - 음성 인식 (음성 명령 주행 및 주차)',
  '비디오 감지 - 얼굴 인식 (감정/나이/성별 인식)',
  '비디오 감지 - 손 인식 (손가락 좌표 주행 및 손 모양 제스처)',
  '비디오 감지 - 사람/사물 인식',
  '읽어주기 / 번역 (AI 음성 합성 안내)',
] as const;

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatKoreanDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  }
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
  }
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
  }
  return dateStr;
}

export function formatTimestamp(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export function createEmptyProject(): ProjectPlan {
  return {
    id: null,
    teamName: '',
    projectName: '',
    selectedSensors: [],
    selectedAiTechs: [],
    triggerInput: '',
    actionOutput: '',
    detailedFlow: '',
    createdDate: getTodayIsoDate(),
  };
}

export function createSampleProject(): ProjectPlan {
  return {
    id: null,
    teamName: '미래채움 1팀',
    projectName: '내 기분을 알아주는 안전 지킴이 자율주행차',
    selectedSensors: [
      '근접 센서 (앞/장애물 감지)',
      '바닥 센서 (라인/검은선·흰선 감지)',
      '바퀴 모터 (주행/회전)',
      'LED 불빛 / 버저(소리·멜로디)',
    ],
    selectedAiTechs: [
      '비디오 감지 - 얼굴 인식 (감정/나이/성별 인식)',
      '오디오 감지 - 음성 인식 (음성 명령 주행 및 주차)',
      '읽어주기 / 번역 (AI 음성 합성 안내)',
    ],
    triggerInput:
      "카메라가 운전자의 '분노' 표정을 인식하거나, 음성으로 '주차'라고 말하고 앞쪽에 장애물이 감지되면",
    actionOutput:
      '빨간색 LED를 켜고 "안전운전 하세요!"라고 음성으로 안내하며 천천히 주행하고, 장애물 앞에서는 안전하게 멈춘다.',
    detailedFlow:
      '1단계: 바닥 센서로 검은색 차선을 따라 부드럽게 자율주행을 시작한다.\n2단계: 얼굴 인식으로 운전자의 표정을 살피고, 화난 표정이 감지되면 속도를 줄이며 "마음을 진정하고 안전운전 하세요"라고 읽어준다.\n3단계: 주행 중 근접 센서가 앞 장애물을 발견하면 버저로 경고음을 울리고 즉시 멈춘다.\n4단계: "주차"라고 말하면 초록색 LED를 깜빡이며 지정된 주차 구역으로 안전하게 후진 주차한다.',
    createdDate: getTodayIsoDate(),
  };
}

export function serializeHowItWorks(
  triggerInput: string,
  actionOutput: string,
  detailedFlow: string
): string {
  const parts: string[] = [];
  parts.push(`[상황(입력)]\n${triggerInput.trim() || '(미입력)'}`);
  parts.push(`[판단 및 행동(출력)]\n${actionOutput.trim() || '(미입력)'}`);
  parts.push(`[자유 상세 설명]\n${detailedFlow.trim() || '(미입력)'}`);
  return parts.join('\n\n');
}

export function parseHowItWorks(raw: string): {
  triggerInput: string;
  actionOutput: string;
  detailedFlow: string;
} {
  if (!raw || typeof raw !== 'string') {
    return { triggerInput: '', actionOutput: '', detailedFlow: '' };
  }

  const triggerMatch = raw.match(
    /\[상황\(입력\)\]\s*([\s\S]*?)(?=\n*\[판단 및 행동\(출력\)\]|\n*\[자유 상세 설명\]|$)/
  );
  const actionMatch = raw.match(
    /\[판단 및 행동\(출력\)\]\s*([\s\S]*?)(?=\n*\[자유 상세 설명\]|$)/
  );
  const detailMatch = raw.match(/\[자유 상세 설명\]\s*([\s\S]*?)$/);

  if (triggerMatch || actionMatch || detailMatch) {
    const clean = (val?: string) => {
      const trimmed = (val ?? '').trim();
      return trimmed === '(미입력)' ? '' : trimmed;
    };
    return {
      triggerInput: clean(triggerMatch?.[1]),
      actionOutput: clean(actionMatch?.[1]),
      detailedFlow: clean(detailMatch?.[1]),
    };
  }

  return {
    triggerInput: '',
    actionOutput: '',
    detailedFlow: raw.trim(),
  };
}

export function parseTechList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw !== 'string' || !raw.trim()) {
    return [];
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fallback to delimiter split
    }
  }
  return trimmed
    .split(/\s*,\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sanitizeFilenameSegment(value: string, fallback: string): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_');
  return cleaned || fallback;
}
