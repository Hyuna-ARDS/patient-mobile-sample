import { useState } from 'react';

// Phone Frame Component
function PhoneFrame({ children, title, activeTab = 'chat' }: { children: React.ReactNode; title: string; activeTab?: 'home' | 'chat' | 'lab' | 'my' }) {
  return (
    <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl flex-shrink-0" style={{ width: '300px', height: '620px' }}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10" />
      
      {/* Screen */}
      <div className="bg-white rounded-[2.5rem] h-full overflow-hidden relative">
        {/* Status Bar */}
        <div className="bg-white h-12 flex items-end justify-between px-6 pb-2">
          <span className="text-xs font-semibold">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-3 border border-black rounded-sm" />
            <div className="w-3 h-3 border border-black rounded-sm" />
            <div className="w-2 h-3 bg-black rounded-sm" />
          </div>
        </div>

        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 shadow-md">
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
          {children}
        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded ${activeTab === 'home' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <span className={`text-[9px] ${activeTab === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>홈</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded ${activeTab === 'chat' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <span className={`text-[9px] ${activeTab === 'chat' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>채팅</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded ${activeTab === 'lab' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <span className={`text-[9px] ${activeTab === 'lab' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>검사지</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded ${activeTab === 'my' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <span className={`text-[9px] ${activeTab === 'my' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>마이</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Arrow({ label, vertical = false }: { label?: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center justify-center h-20">
        <div className="text-center mb-2">
          {label && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              {label}
            </span>
          )}
        </div>
        <svg width="24" height="40" viewBox="0 0 24 40">
          <defs>
            <marker id="arrowdown" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="#3b82f6" />
            </marker>
          </defs>
          <line x1="12" y1="0" x2="12" y2="35" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowdown)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 flex-shrink-0">
      {label && (
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2 whitespace-nowrap">
          {label}
        </div>
      )}
      <svg width="60" height="24" viewBox="0 0 60 24">
        <defs>
          <marker id="arrowright" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <polygon points="0 0, 10 5, 0 10" fill="#3b82f6" />
          </marker>
        </defs>
        <line x1="0" y1="12" x2="55" y2="12" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowright)" />
      </svg>
    </div>
  );
}

export function UserFlowDiagram() {
  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-2xl text-gray-800 mb-2">📱 채팅 → 검사지 해석 User Flow</h1>
        <p className="text-sm text-gray-500">실제 모바일 화면 기반 사용자 플로우 (가로 스크롤)</p>
      </div>

      {/* Main Flow - Horizontal Scroll */}
      <div className="overflow-x-auto pb-8 -mx-8 px-8">
        <div className="inline-flex items-start gap-0">
          
          {/* 1. 채팅 메인 */}
          <PhoneFrame title="채팅" activeTab="chat">
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700">이전 대화</p>
                <p className="text-[10px] text-gray-500 mt-1">오늘 오전 10:23</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700">검사지 기반 상담</p>
                <p className="text-[10px] text-gray-500 mt-1">어제</p>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-sm">
                  + 새 채팅 시작
                </button>
              </div>
            </div>
          </PhoneFrame>

          <Arrow label="새 채팅" />

          {/* 2. 채팅 화면 */}
          <PhoneFrame title="채팅" activeTab="chat">
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[200px]">
                <p className="text-xs text-gray-800">안녕하세요! 무엇을 도와드릴까요?</p>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[200px]">
                  <p className="text-xs">폐암 초기 증상이 궁금해요</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[200px]">
                <p className="text-xs text-gray-800">폐암 초기에는 기침, 호흡곤란...</p>
              </div>

              <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-semibold text-purple-800">💡 검사지 해석</p>
                <p className="text-[10px] text-purple-600 mt-1">검사 결과를 분석해드릴까요?</p>
                <button className="w-full mt-2 bg-purple-600 text-white rounded py-2 text-xs font-semibold">
                  검사지 해석 요청
                </button>
              </div>

              <div className="absolute bottom-20 left-0 right-0 px-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="메시지 입력..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-xs"
                  />
                  <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </PhoneFrame>

          <Arrow label="해석 요청" />

          {/* 3. 검사지 탭으로 전환 - 업로드 */}
          <PhoneFrame title="검사지 업로드" activeTab="lab">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-32 h-32 border-4 border-dashed border-blue-300 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              
              <p className="text-sm font-semibold text-gray-700 mb-2">검사지를 업로드해주세요</p>
              <p className="text-xs text-gray-500 text-center mb-6">
                사진 또는 PDF 파일<br/>최대 10MB
              </p>

              <div className="w-full space-y-2">
                <button className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold">
                  📷 사진 촬영
                </button>
                <button className="w-full bg-white border-2 border-blue-600 text-blue-600 rounded-lg py-3 text-sm font-semibold">
                  📁 파일 선택
                </button>
              </div>

              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full">
                <p className="text-[10px] text-blue-700">
                  💬 채팅은 백그라운드에서 계속 이용 가능합니다
                </p>
              </div>
            </div>
          </PhoneFrame>

          <Arrow label="업로드 완료" />

          {/* 4. 해석 진행중 (백그라운드) */}
          <PhoneFrame title="검사지 목록" activeTab="lab">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">혈액검사 결과</p>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs opacity-90">AI 분석 중...</p>
                <div className="mt-2 bg-white/20 rounded-full h-1">
                  <div className="bg-white h-1 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700">건강검진 결과</p>
                <p className="text-[10px] text-gray-500 mt-1">2024.11.15 · 해석 완료</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-2">💡 TIP</p>
                <p className="text-[10px] text-blue-600">
                  해석이 진행되는 동안에도<br/>
                  채팅 탭에서 대화를 계속하실 수 있어요
                </p>
              </div>
            </div>
          </PhoneFrame>

          <Arrow label="채팅으로 복귀" />

          {/* 5. 채팅 계속 (백그라운드 해석 중) */}
          <PhoneFrame title="채팅" activeTab="chat">
            <div className="space-y-3">
              {/* 진행중 알림바 */}
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] text-purple-700 flex-1">검사지 분석 중...</p>
                <button className="text-[9px] text-purple-600 underline">보기</button>
              </div>

              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[200px]">
                <p className="text-xs text-gray-800">폐암 초기에는 기침, 호흡곤란...</p>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[200px]">
                  <p className="text-xs">예방법도 알려주세요</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[220px]">
                <p className="text-xs text-gray-800">
                  폐암 예방을 위해서는 금연이 가장 중요합니다...
                </p>
              </div>

              <div className="absolute bottom-20 left-0 right-0 px-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="메시지 입력..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-xs"
                  />
                  <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </PhoneFrame>

          <Arrow label="해석 완료 알림" />

          {/* 6. 해석 완료 토스트 알림 */}
          <PhoneFrame title="채팅" activeTab="chat">
            <div className="space-y-3">
              {/* 완료 알림바 */}
              <div className="bg-green-500 text-white rounded-lg p-3 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold">✓ 검사지 해석 완료!</p>
                    <p className="text-[10px] mt-1 opacity-90">혈액검사 결과 분석이 완료되었습니다</p>
                  </div>
                  <button className="text-xs font-semibold underline">보기</button>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[220px]">
                <p className="text-xs text-gray-800">
                  폐암 예방을 위해서는 금연이 가장 중요합니다...
                </p>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[200px]">
                  <p className="text-xs">감사합니다!</p>
                </div>
              </div>

              <div className="absolute bottom-20 left-0 right-0 px-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="메시지 입력..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-xs"
                  />
                  <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </PhoneFrame>

          <Arrow label="결과 보기" />

          {/* 7. 검사지 해석 결과 */}
          <PhoneFrame title="검사지 해석 결과" activeTab="lab">
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-2">내 결과 한눈에</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-600">백혈구 수치</span>
                    <span className="text-[10px] font-semibold text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-600">적혈구 수치</span>
                    <span className="text-[10px] font-semibold text-orange-600">주의</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-600">혈소판 수치</span>
                    <span className="text-[10px] font-semibold text-green-600">정상</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-800 mb-2">나비 가이드</p>
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  검사 결과를 종합해보면, 전반적으로 양호한 상태입니다. 다만 적혈구 수치가 다소 낮게 나타났으니...
                </p>
              </div>

              <button className="w-full bg-white border-2 border-gray-300 text-gray-700 rounded-lg py-2 text-xs font-semibold">
                더 자세히 보기 →
              </button>

              <div className="pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">추천 질문</p>
                <div className="space-y-2">
                  <button className="w-full bg-purple-50 border border-purple-200 text-purple-700 rounded-lg py-2 text-[10px] text-left px-3">
                    적혈구 수치를 높이려면?
                  </button>
                  <button className="w-full bg-purple-50 border border-purple-200 text-purple-700 rounded-lg py-2 text-[10px] text-left px-3">
                    어떤 치료를 받게 되나요?
                  </button>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold">
                💬 질문하기
              </button>
            </div>
          </PhoneFrame>

          <Arrow label="질문하기" />

          {/* 8. 검사지 기반 채팅 */}
          <PhoneFrame title="검사지 기반 채팅" activeTab="chat">
            <div className="space-y-3">
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 flex items-center gap-2">
                <div className="w-8 h-10 bg-white rounded border border-purple-300 flex items-center justify-center">
                  <span className="text-[8px]">📋</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-semibold text-purple-900">혈액검사 결과</p>
                  <p className="text-[8px] text-purple-600">2024.12.20</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[200px]">
                <p className="text-xs text-gray-800">검사 결과를 바탕으로 답변드리겠습니다!</p>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[200px]">
                  <p className="text-xs">적혈구 수치를 높이려면?</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[220px]">
                <p className="text-xs text-gray-800">
                  적혈구 수치를 높이기 위해서는 철분이 풍부한 음식을 섭취하시는 것이 좋습니다...
                </p>
              </div>

              <div className="absolute bottom-20 left-0 right-0 px-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="메시지 입력..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-xs"
                  />
                  <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </PhoneFrame>

        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-4">개선된 UX 플로우 핵심 포인트</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-blue-600 mb-2">✨ 주요 개선사항</p>
            <ul className="space-y-1 text-xs">
              <li>• 채팅 유형 선택 단계 제거 → 바로 시작</li>
              <li>• 검사지 해석 요청 시 검사지 탭으로 이동</li>
              <li>• 해석 중에도 채팅 계속 가능 (백그라운드)</li>
              <li>• 진행 상황 알림바로 실시간 확인</li>
              <li>• 완료 시 토스트 알림 + 결과 바로 보기</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-purple-600 mb-2">🎯 UX 설계 원칙</p>
            <ul className="space-y-1 text-xs">
              <li>• 끊김 없는 사용자 경험 (Non-blocking)</li>
              <li>• 명확한 탭 전환 (채팅 ↔ 검사지)</li>
              <li>• 백그라운드 작업 상태 투명하게 표시</li>
              <li>• 컨텍스트 유지 (검사지 정보 표시)</li>
              <li>• 결과에서 즉시 질문 가능한 연결</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}