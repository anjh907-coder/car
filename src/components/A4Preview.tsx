import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Car, CheckCircle2, Cpu, FileCheck2 } from 'lucide-react';
import hamsterbotImg from '../assets/images/hamsterbot_ai_car_1795338224844.jpg';
import { ProjectPlan, formatKoreanDate } from '../types/project';

interface A4PreviewProps {
  plan: ProjectPlan;
  captureRef: React.RefObject<HTMLDivElement | null>;
}

const A4_BASE_WIDTH = 794;
const A4_BASE_HEIGHT = 1123;
const HAMSTERBOT_IMAGE_URL = hamsterbotImg;

export function A4Preview({ plan, captureRef }: A4PreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.75);
  const [sheetHeight, setSheetHeight] = useState(A4_BASE_HEIGHT);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth;
      if (availableWidth > 0) {
        const nextScale = Math.min(1, availableWidth / A4_BASE_WIDTH);
        setScale(nextScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = captureRef.current;
    if (!target) return;
    const measureHeight = () => {
      setSheetHeight(Math.max(A4_BASE_HEIGHT, target.scrollHeight));
    };
    measureHeight();
    const observer = new ResizeObserver(measureHeight);
    observer.observe(target);
    return () => observer.disconnect();
  }, [captureRef, plan]);

  const formattedDate = formatKoreanDate(plan.createdDate);
  const displayTeam = plan.teamName.trim();
  const displayProject = plan.projectName.trim();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">
            실시간 A4 기획서 미리보기
          </h2>
          <span className="text-xs text-slate-400 tabular-nums">
            · A4 세로 (210×297mm)
          </span>
        </div>
        <span className="text-xs text-slate-500 tabular-nums">
          화면 비율 {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Outer responsive stage frame (keeps shadow OUTSIDE the PDF capture element) */}
      <div
        ref={containerRef}
        className="w-full flex justify-center"
        style={{ height: `${Math.ceil(sheetHeight * scale) + 16}px` }}
      >
        <div
          id="a4-scale-wrapper"
          style={{
            width: `${A4_BASE_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className="shrink-0"
        >
          {/* Decorative paper elevation frame (NOT captured in PDF) */}
          <div className="rounded-xl shadow-[0_14px_38px_-12px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/90 overflow-hidden bg-[#FFFFFF]">
            {/*
              IMPORTANT: Everything inside #a4-document-sheet strictly uses pure HEX/RGBA
              colors so html2canvas never encounters unsupported Tailwind v4 oklch() colors.
            */}
            <div
              id="a4-document-sheet"
              ref={captureRef}
              style={{
                width: `${A4_BASE_WIDTH}px`,
                minHeight: `${A4_BASE_HEIGHT}px`,
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                padding: '40px 44px 36px 44px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
            >
              <div>
                {/* A4 Top Decorative Ribbon */}
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    borderRadius: '9999px',
                    background:
                      'linear-gradient(90deg, #34D399 0%, #38BDF8 55%, #FBBF24 100%)',
                    marginBottom: '24px',
                  }}
                />

                {/* A4 Header Banner */}
                <header
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    padding: '20px 24px',
                    borderRadius: '18px',
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    marginBottom: '22px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1 }}>
                    <div
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '2px solid #FFFFFF',
                        backgroundColor: '#E0F2FE',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!imgError ? (
                        <img
                          src={HAMSTERBOT_IMAGE_URL}
                          alt="햄스터봇 자율주행 자동차 일러스트"
                          referrerPolicy="no-referrer"
                          onError={() => setImgError(true)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <Car
                          size={34}
                          color="#0284C7"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0369A1',
                          margin: '0 0 4px 0',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        햄스터봇과 함께하는 자율주행 AI 모험
                      </p>
                      <h1
                        style={{
                          fontSize: '23px',
                          fontWeight: 700,
                          color: '#0F172A',
                          margin: 0,
                          lineHeight: 1.25,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        나만의 자율주행 자동차 프로젝트 기획서
                      </h1>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      flexShrink: 0,
                      paddingLeft: '14px',
                      borderLeft: '1px solid #BAE6FD',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748B',
                        marginBottom: '4px',
                      }}
                    >
                      작성일
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0F172A',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formattedDate}
                    </div>
                  </div>
                </header>

                {/* Team & Project Showcase Row */}
                <section
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '14px',
                    marginBottom: '22px',
                  }}
                >
                  <div
                    style={{
                      padding: '15px 18px',
                      borderRadius: '14px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#047857',
                        marginBottom: '6px',
                      }}
                    >
                      1. 팀명
                    </div>
                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: displayTeam ? '#0F172A' : '#94A3B8',
                        lineHeight: 1.35,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {displayTeam || '팀 이름을 입력해 주세요'}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '15px 18px',
                      borderRadius: '14px',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#B45309',
                        marginBottom: '6px',
                      }}
                    >
                      2. 프로젝트명
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: displayProject ? '#0F172A' : '#94A3B8',
                        lineHeight: 1.35,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {displayProject || '우리 팀만의 자율주행 자동차 이름을 입력해 주세요'}
                    </div>
                  </div>
                </section>

                {/* Used Technologies: Two-Column Section */}
                <section style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0F172A',
                        margin: 0,
                      }}
                    >
                      3. 사용한 기술 구성
                    </h2>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748B',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      하드웨어·센서 {plan.selectedSensors.length}개 · 엔트리 AI{' '}
                      {plan.selectedAiTechs.length}개
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >
                    {/* Hardware & Sensors Box */}
                    <div
                      style={{
                        borderRadius: '14px',
                        border: '1px solid #A7F3D0',
                        backgroundColor: '#F7FEFB',
                        padding: '15px 16px',
                        minHeight: '158px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          paddingBottom: '9px',
                          marginBottom: '10px',
                          borderBottom: '1px solid #D1FAE5',
                        }}
                      >
                        <Cpu size={15} color="#059669" aria-hidden="true" />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#065F46',
                          }}
                        >
                          하드웨어 &amp; 센서 기술
                        </span>
                      </div>

                      {plan.selectedSensors.length > 0 ? (
                        <ul
                          style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '7px',
                          }}
                        >
                          {plan.selectedSensors.map((sensor) => (
                            <li
                              key={sensor}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '7px',
                                fontSize: '12.5px',
                                lineHeight: 1.45,
                                color: '#1E293B',
                                fontWeight: 500,
                              }}
                            >
                              <CheckCircle2
                                size={14}
                                color="#10B981"
                                style={{ marginTop: '2px', flexShrink: 0 }}
                                aria-hidden="true"
                              />
                              <span>{sensor}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          style={{
                            fontSize: '12.5px',
                            color: '#94A3B8',
                            margin: '18px 0 0 0',
                            lineHeight: 1.5,
                          }}
                        >
                          선택된 하드웨어·센서가 아직 없습니다.
                          <br />
                          왼쪽 폼에서 사용할 센서를 골라 보세요.
                        </p>
                      )}
                    </div>

                    {/* Entry AI Box */}
                    <div
                      style={{
                        borderRadius: '14px',
                        border: '1px solid #BAE6FD',
                        backgroundColor: '#F5FAFF',
                        padding: '15px 16px',
                        minHeight: '158px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          paddingBottom: '9px',
                          marginBottom: '10px',
                          borderBottom: '1px solid #E0F2FE',
                        }}
                      >
                        <Bot size={15} color="#0284C7" aria-hidden="true" />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#075985',
                          }}
                        >
                          엔트리 인공지능 기술
                        </span>
                      </div>

                      {plan.selectedAiTechs.length > 0 ? (
                        <ul
                          style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '7px',
                          }}
                        >
                          {plan.selectedAiTechs.map((tech) => (
                            <li
                              key={tech}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '7px',
                                fontSize: '12.5px',
                                lineHeight: 1.45,
                                color: '#1E293B',
                                fontWeight: 500,
                              }}
                            >
                              <CheckCircle2
                                size={14}
                                color="#0EA5E9"
                                style={{ marginTop: '2px', flexShrink: 0 }}
                                aria-hidden="true"
                              />
                              <span>{tech}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          style={{
                            fontSize: '12.5px',
                            color: '#94A3B8',
                            margin: '18px 0 0 0',
                            lineHeight: 1.5,
                          }}
                        >
                          선택된 엔트리 AI 기술이 아직 없습니다.
                          <br />
                          왼쪽 폼에서 사용할 인공지능 기능을 골라 보세요.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Step 4: How It Works — Input -> Output Flow */}
                <section style={{ marginBottom: '20px' }}>
                  <h2
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0F172A',
                      margin: '0 0 10px 0',
                    }}
                  >
                    4. 자율주행 작동 방법 (입력 → 판단 및 행동)
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 30px 1fr',
                      alignItems: 'stretch',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    {/* Input Box */}
                    <div
                      style={{
                        borderRadius: '14px',
                        border: '1px solid #BAE6FD',
                        backgroundColor: '#F0F9FF',
                        padding: '14px 16px',
                        minHeight: '132px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0369A1',
                          marginBottom: '8px',
                        }}
                      >
                        1단계 · 상황 (입력)
                      </div>
                      <p
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.65,
                          color: plan.triggerInput.trim() ? '#1E293B' : '#94A3B8',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {plan.triggerInput.trim() ||
                          '어떤 센서나 인공지능이 무엇을 감지하는지 적어 보세요.'}
                      </p>
                    </div>

                    {/* Arrow Connector */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '9999px',
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FCD34D',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ArrowRight size={15} color="#B45309" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Output Box */}
                    <div
                      style={{
                        borderRadius: '14px',
                        border: '1px solid #FDE68A',
                        backgroundColor: '#FFFBEB',
                        padding: '14px 16px',
                        minHeight: '132px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#B45309',
                          marginBottom: '8px',
                        }}
                      >
                        2단계 · 판단 및 행동 (출력)
                      </div>
                      <p
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.65,
                          color: plan.actionOutput.trim() ? '#1E293B' : '#94A3B8',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {plan.actionOutput.trim() ||
                          '햄스터봇이 어떤 소리, 불빛, 움직임으로 반응하는지 적어 보세요.'}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Free Explanation */}
                  <div
                    style={{
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FAFCFE',
                      padding: '16px 18px',
                      minHeight: '210px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '10px',
                        paddingBottom: '8px',
                        borderBottom: '1px dashed #CBD5E1',
                      }}
                    >
                      전체 작동 순서 및 자유 상세 설명
                    </div>
                    <p
                      style={{
                        fontSize: '13.5px',
                        lineHeight: 1.8,
                        color: plan.detailedFlow.trim() ? '#1E293B' : '#94A3B8',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {plan.detailedFlow.trim() ||
                        '출발부터 도착까지 우리 자율주행 자동차가 움직이는 전체 순서를 자유롭게 설명해 보세요.'}
                    </p>
                  </div>
                </section>
              </div>

              {/* A4 Document Footer */}
              <footer
                style={{
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  color: '#64748B',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck2 size={14} color="#059669" aria-hidden="true" />
                  <span>햄스터봇과 함께하는 자율주행 AI 모험 프로젝트 결과물</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span>팀명: {displayTeam || '____________'}</span>
                  <span>확인: ____________</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
