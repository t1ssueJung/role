/**
 * @license
 * 우리 반 1인 1역할 배정기 - script.js
 * 초등학생 20명 1:1 무작위 역할 매칭, A4 인쇄, Apps Script 연동
 */

// 1. 기본 초등 예시 데이터 (학생 20명 & 역할 20개)
const DEFAULT_STUDENTS = [
  "김민준", "이서연", "박도윤", "최지우", "정시우",
  "강하은", "조예준", "윤수아", "장우진", "임은우",
  "한지호", "오채원", "서서진", "신유나", "권건우",
  "황다은", "안민서", "송현우", "전소율", "홍시윤"
];

const DEFAULT_ROLES = [
  { name: "칠판 지킴이", emoji: "🧹", desc: "수업 후 칠판을 깨끗하게 닦고 분필 가루를 털어요." },
  { name: "우유 도우미", emoji: "🥛", desc: "우유 급식 상자를 제시간에 가져오고 바르게 정리해요." },
  { name: "줄서기 대장", emoji: "🚶", desc: "이동 수업이나 급식실로 갈 때 앞장서서 줄을 바르게 세워요." },
  { name: "식판 정리 도우미", emoji: "🍽️", desc: "점심시간 후 퇴식구 식판과 잔반 정리를 도와요." },
  { name: "식물 사랑 지킴이", emoji: "🌱", desc: "교실 화분에 정성껏 물을 주고 잎을 살펴요." },
  { name: "불 끄기 에너지 요정", emoji: "💡", desc: "교실을 비울 때 전등과 전자제품 전원을 확인해요." },
  { name: "창문 환기 요정", emoji: "🪟", desc: "쉬는 시간마다 창문을 열어 교실 공기를 상쾌하게 해요." },
  { name: "도서 정리 도우미", emoji: "📚", desc: "학급 문고 책들을 종류별로 가지런히 꽂아요." },
  { name: "체육 부장", emoji: "⚽", desc: "체육 시간 체육용품을 챙기고 준비 운동을 이끌어요." },
  { name: "음악·종소리 도우미", emoji: "🎵", desc: "음악 시간 악기를 챙기고 수업 시작 종을 알려요." },
  { name: "컴퓨터·빔 도우미", emoji: "💻", desc: "선생님 교탁 컴퓨터와 빔프로젝터 켜고 끄기를 도와요." },
  { name: "분리수거 대장", emoji: "♻️", desc: "종이, 플라스틱, 캔을 바른 통에 분리수거해요." },
  { name: "학습지 배부 도우미", emoji: "📑", desc: "모둠별로 시험지나 안내장을 알맞게 나누어 주어요." },
  { name: "신발장 지킴이", emoji: "👟", desc: "신발장 실내화와 운동화가 단정하게 정돈되도록 살펴요." },
  { name: "시계·시간 알리미", emoji: "⏰", desc: "수업 시작 2분 전 친구들에게 미리 자리에 앉자고 알려요." },
  { name: "칭찬 배달부", emoji: "💌", desc: "선생님과 친구들의 칭찬 쪽지를 칭찬함에 모으고 전달해요." },
  { name: "응원 단장", emoji: "📣", desc: "아침 인사와 친구들의 멋진 발표 때 큰 박수로 응원해요." },
  { name: "게시판 꾸미기", emoji: "🎨", desc: "교실 뒤 게시판의 친구들 작품을 단정하게 정돈해요." },
  { name: "손소독 청결 지킴이", emoji: "🧴", desc: "급식 전과 외출 후 손소독과 손 씻기를 권장해요." },
  { name: "친절 안전 보안관", emoji: "🌟", desc: "복도에서 뛰지 않도록 당부하고 친구들에게 고운 말을 써요." }
];

// 6가지 파스텔 카드 테마 클래스명
const CARD_THEMES = ["theme-mint", "theme-sun", "theme-sky", "theme-peach", "theme-lavender", "theme-coral"];

// 2. 애플리케이션 상태 (State)
const state = {
  className: "3학년 2반",
  schoolYear: "2026학년도 1학기",
  students: [...DEFAULT_STUDENTS],
  roles: [...DEFAULT_ROLES],
  assignments: [], // [{ number: 1, studentName: '김민준', role: { name: '...', emoji: '...', desc: '...' } }]
  appsScriptUrl: "",
  swapSourceIndex: null, // 맞바꾸기 진행 중인 첫 번째 카드 인덱스
  presentationIndex: 0,
  presentationRevealed: false
};

// 3. 브라우저 내장 Web Audio API 사운드 효과 (외부 파일 없이 작동)
class SoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio playback silently fails if blocked
    }
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + (idx * 0.08);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      // Audio blocked safe fallback
    }
  }
}

const sound = new SoundManager();

// 4. 로컬 스토리지 동기화
function loadFromStorage() {
  try {
    const savedClass = localStorage.getItem("role_assigner_class");
    if (savedClass) state.className = savedClass;

    const savedYear = localStorage.getItem("role_assigner_year");
    if (savedYear) state.schoolYear = savedYear;

    const savedStudents = localStorage.getItem("role_assigner_students");
    if (savedStudents) state.students = JSON.parse(savedStudents);

    const savedRoles = localStorage.getItem("role_assigner_roles");
    if (savedRoles) state.roles = JSON.parse(savedRoles);

    const savedUrl = localStorage.getItem("role_assigner_sheet_url");
    if (savedUrl) state.appsScriptUrl = savedUrl;

    const savedAssignments = localStorage.getItem("role_assigner_assignments");
    if (savedAssignments) {
      state.assignments = JSON.parse(savedAssignments);
    } else {
      // 기본 대기 상태 생성
      initDefaultAssignments();
    }
  } catch (err) {
    console.warn("Storage load error:", err);
    initDefaultAssignments();
  }
}

function saveToStorage() {
  try {
    localStorage.setItem("role_assigner_class", state.className);
    localStorage.setItem("role_assigner_year", state.schoolYear);
    localStorage.setItem("role_assigner_students", JSON.stringify(state.students));
    localStorage.setItem("role_assigner_roles", JSON.stringify(state.roles));
    localStorage.setItem("role_assigner_sheet_url", state.appsScriptUrl);
    localStorage.setItem("role_assigner_assignments", JSON.stringify(state.assignments));
  } catch (err) {
    console.warn("Storage save error:", err);
  }
}

function initDefaultAssignments() {
  state.assignments = state.students.map((student, idx) => ({
    number: idx + 1,
    studentName: student,
    role: null // 아직 미배정
  }));
}

// 5. 무작위 1:1 매칭 알고리즘 (Fisher-Yates Shuffle)
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function assignRoles() {
  const studentCount = state.students.length;
  if (studentCount === 0) {
    showToast("학생 명단이 비어 있습니다. 명단을 먼저 등록해 주세요.");
    return;
  }

  // 역할 풀(Pool) 준비: 역할이 부족하면 순환하여 채움
  let shuffledRoles = shuffleArray(state.roles);
  while (shuffledRoles.length < studentCount) {
    shuffledRoles = shuffledRoles.concat(shuffleArray(state.roles));
  }

  // 1:1 매칭
  state.assignments = state.students.map((student, idx) => ({
    number: idx + 1,
    studentName: student,
    role: shuffledRoles[idx],
    assignedAt: new Date().toLocaleDateString("ko-KR")
  }));

  saveToStorage();
  renderCards(true); // 애니메이션과 함께 렌더링
  updateStats();
  sound.playFanfare();
  showToast("🎉 모든 학생에게 1인 1역할 배정이 완료되었습니다!");
}

// 6. 카드 그리드 렌더링
function renderCards(withAnimation = false) {
  const container = document.getElementById("cards-container");
  if (!container) return;

  container.innerHTML = "";

  state.assignments.forEach((item, index) => {
    const themeClass = CARD_THEMES[index % CARD_THEMES.length];
    const isAssigned = !!item.role;
    const isSwapSelected = state.swapSourceIndex === index;

    const card = document.createElement("div");
    card.className = `student-card ${themeClass} ${withAnimation ? "pop-animate" : ""} ${isSwapSelected ? "swap-selected" : ""}`;
    card.style.animationDelay = `${index * 0.03}s`;

    const roleEmoji = isAssigned ? item.role.emoji : "❓";
    const roleName = isAssigned ? item.role.name : "역할 배정 대기";
    const roleDesc = isAssigned ? item.role.desc : "위의 [역할 배정하기] 버튼을 눌러주세요.";

    card.innerHTML = `
      <div class="card-top-bar">
        <span class="student-num-badge"># ${String(item.number).padStart(2, '0')}</span>
        <div class="student-name-wrap">
          <span class="student-name">${item.studentName}</span>
        </div>
      </div>

      <div class="role-badge-container ${isAssigned ? "" : "unassigned"}">
        <span class="role-emoji-large" role="img" aria-label="${roleName}">${roleEmoji}</span>
        <h3 class="role-name">${roleName}</h3>
        <p class="role-desc">${roleDesc}</p>
      </div>

      <div class="card-footer">
        <button type="button" class="btn-card-swap" data-index="${index}" title="다른 학생과 역할 맞바꾸기">
          ${isSwapSelected ? "선택 해제 ✕" : "⇄ 맞바꾸기"}
        </button>
        <span class="card-status-indicator ${isAssigned ? "" : "unassigned"}">
          ${isAssigned ? "✓ 배정완료" : "대기"}
        </span>
      </div>
    `;

    // 맞바꾸기 버튼 이벤트
    const swapBtn = card.querySelector(".btn-card-swap");
    swapBtn.addEventListener("click", () => handleCardSwap(index));

    container.appendChild(card);
  });

  // 인쇄용 테이블도 실시간 갱신
  renderPrintTable();
}

// 역할 맞바꾸기(Swap) 처리
function handleCardSwap(clickedIndex) {
  if (state.swapSourceIndex === null) {
    // 첫 번째 학생 선택
    state.swapSourceIndex = clickedIndex;
    const studentA = state.assignments[clickedIndex].studentName;
    showToast(`⇄ [${studentA}] 학생 선택됨! 바꿀 두 번째 학생 카드를 클릭하세요.`);
    renderCards(false);
  } else if (state.swapSourceIndex === clickedIndex) {
    // 같은 카드 클릭 시 취소
    state.swapSourceIndex = null;
    showToast("역할 맞바꾸기가 취소되었습니다.");
    renderCards(false);
  } else {
    // 두 번째 학생 선택 -> 역할 교환 수행
    const idxA = state.swapSourceIndex;
    const idxB = clickedIndex;

    const studentA = state.assignments[idxA].studentName;
    const studentB = state.assignments[idxB].studentName;

    const tempRole = state.assignments[idxA].role;
    state.assignments[idxA].role = state.assignments[idxB].role;
    state.assignments[idxB].role = tempRole;

    state.swapSourceIndex = null;
    saveToStorage();
    sound.playChime();
    renderCards(false);
    showToast(`✨ [${studentA}] 학생과 [${studentB}] 학생의 역할이 서로 맞바뀌었습니다!`);
  }
}

// 7. 인쇄 전용 테이블 렌더링
function renderPrintTable() {
  const tbody = document.getElementById("print-table-body");
  const printClass = document.getElementById("print-class-name");
  const printDate = document.getElementById("print-date");
  const printTitle = document.getElementById("print-sheet-title");

  if (printClass) printClass.textContent = state.className;
  if (printDate) printDate.textContent = new Date().toLocaleDateString("ko-KR");
  if (printTitle) printTitle.textContent = `${state.className} 1인 1역할 실천표`;

  if (!tbody) return;
  tbody.innerHTML = "";

  state.assignments.forEach((item) => {
    const tr = document.createElement("tr");
    const roleText = item.role ? `${item.role.emoji} ${item.role.name}` : "(미배정)";
    const descText = item.role ? item.role.desc : "-";

    tr.innerHTML = `
      <td>${item.number}</td>
      <td><strong>${item.studentName}</strong></td>
      <td>${roleText}</td>
      <td>${descText}</td>
      <td><span class="stamp-box"></span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 8. 상단 상태 요약 갱신
function updateStats() {
  const studentCountDisplay = document.getElementById("student-count-display");
  const roleCountDisplay = document.getElementById("role-count-display");
  const statusDisplay = document.getElementById("assignment-status-display");
  const classTag = document.getElementById("class-title-tag");

  if (studentCountDisplay) studentCountDisplay.textContent = `${state.students.length}명`;
  if (roleCountDisplay) roleCountDisplay.textContent = `${state.roles.length}개`;
  if (classTag) classTag.textContent = state.className;

  if (statusDisplay) {
    const assignedCount = state.assignments.filter(a => a.role !== null).length;
    if (assignedCount === 0) {
      statusDisplay.textContent = "배정 대기 중";
      statusDisplay.style.color = "#E17055";
      statusDisplay.style.backgroundColor = "#FFEAA7";
    } else if (assignedCount === state.assignments.length) {
      statusDisplay.textContent = "전원 배정 완료 ✨";
      statusDisplay.style.color = "#00B894";
      statusDisplay.style.backgroundColor = "#D4EDDA";
    } else {
      statusDisplay.textContent = `${assignedCount}/${state.assignments.length}명 배정`;
      statusDisplay.style.color = "#0984E3";
      statusDisplay.style.backgroundColor = "#E1F5FE";
    }
  }
}

// 9. 인쇄 실행 기능
function triggerPrint() {
  renderPrintTable();
  window.print();
}

// 10. 클립보드 텍스트 복사 (학급 알림장, 카카오톡 등에 배포용)
function copyAssignmentsToClipboard() {
  if (state.assignments.length === 0 || !state.assignments.some(a => a.role)) {
    showToast("아직 배정된 역할이 없습니다. [역할 배정하기]를 먼저 눌러주세요.");
    return;
  }

  const lines = [
    `📢 [${state.className}] 1인 1역할 배정 결과 안내 ✨`,
    `----------------------------------------`
  ];

  state.assignments.forEach(item => {
    const roleStr = item.role ? `${item.role.emoji} ${item.role.name} - ${item.role.desc}` : "미배정";
    lines.push(`${String(item.number).padStart(2, ' ')}번 ${item.studentName} : ${roleStr}`);
  });

  lines.push(`----------------------------------------`);
  lines.push(`🌱 우리 모두 즐겁고 책임감 있게 실천해요!`);

  const fullText = lines.join("\n");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      showToast("📋 배정 결과가 클립보드에 복사되었습니다! (알림장이나 메신저에 붙여넣으세요)");
    }).catch(() => {
      fallbackCopyText(fullText);
    });
  } else {
    fallbackCopyText(fullText);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showToast("📋 배정 결과가 복사되었습니다!");
}

// 11. 구글 스프레드시트(Apps Script) 연동 관련 로직
function openSheetModal() {
  const modal = document.getElementById("sheet-modal");
  const urlInput = document.getElementById("apps-script-url-input");
  if (urlInput) urlInput.value = state.appsScriptUrl || "";
  if (modal) modal.classList.add("active");
}

function closeSheetModal() {
  const modal = document.getElementById("sheet-modal");
  if (modal) modal.classList.remove("active");
}

function saveSheetUrl() {
  const urlInput = document.getElementById("apps-script-url-input");
  if (!urlInput) return;
  const url = urlInput.value.trim();
  state.appsScriptUrl = url;
  saveToStorage();
  showToast(url ? "✅ Apps Script 웹 앱 URL이 저장되었습니다." : "ℹ️ URL이 비워졌습니다. 로컬 모드로 작동합니다.");
}

async function handleSheetImport() {
  const url = state.appsScriptUrl;
  if (!url) {
    openSheetModal();
    showToast("구글 Apps Script 웹 앱 URL을 먼저 등록해 주세요!");
    return;
  }

  showToast("🔄 구글 스프레드시트에서 데이터를 가져오는 중...");
  try {
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    if (data && data.status === "success") {
      if (Array.isArray(data.students) && data.students.length > 0) {
        state.students = data.students;
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        state.roles = data.roles.map(r => typeof r === "string" ? { name: r, emoji: "⭐", desc: "학급 실천 역할" } : r);
      }
      initDefaultAssignments();
      saveToStorage();
      renderCards();
      updateStats();
      closeSheetModal();
      showToast(`✅ 시트 연동 성공: 학생 ${state.students.length}명, 역할 ${state.roles.length}개를 불러왔습니다!`);
    } else {
      throw new Error(data.message || "응답 형식이 올바르지 않습니다.");
    }
  } catch (err) {
    console.error("Sheet import error:", err);
    showToast("⚠️ 시트 불러오기 실패: Apps Script 배포 설정 및 CORS/액세스 권한을 확인해 주세요.");
  }
}

async function handleSheetExport() {
  const url = state.appsScriptUrl;
  if (!url) {
    openSheetModal();
    showToast("구글 Apps Script 웹 앱 URL을 먼저 등록해 주세요!");
    return;
  }

  const payload = {
    className: state.className,
    schoolYear: state.schoolYear,
    timestamp: new Date().toISOString(),
    assignments: state.assignments.map(a => ({
      number: a.number,
      studentName: a.studentName,
      roleName: a.role ? a.role.name : "미배정",
      roleEmoji: a.role ? a.role.emoji : "",
      roleDesc: a.role ? a.role.desc : "",
      assignedAt: a.assignedAt || new Date().toLocaleDateString("ko-KR")
    }))
  };

  showToast("💾 구글 스프레드시트로 저장 전송 중...");
  try {
    // Apps Script의 경우 redirect 또는 CORS가 발생하므로 JSON POST 발송
    await fetch(url, {
      method: "POST",
      mode: "no-cors", // Apps Script Web App 특성 호환
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    closeSheetModal();
    sound.playChime();
    showToast("✅ 스프레드시트에 배정 결과 저장을 요청했습니다!");
  } catch (err) {
    console.error("Sheet export error:", err);
    showToast("⚠️ 저장 중 오류가 발생했습니다. Apps Script URL을 확인해 주세요.");
  }
}

// 12. 명단 및 역할 관리 모달
function openManageModal() {
  const modal = document.getElementById("manage-modal");
  const studentTa = document.getElementById("students-textarea");
  const roleTa = document.getElementById("roles-textarea");
  const classInput = document.getElementById("class-name-input");
  const yearInput = document.getElementById("school-year-input");

  if (studentTa) studentTa.value = state.students.join("\n");
  if (roleTa) {
    roleTa.value = state.roles.map(r => `${r.name} | ${r.emoji} | ${r.desc}`).join("\n");
  }
  if (classInput) classInput.value = state.className;
  if (yearInput) yearInput.value = state.schoolYear;

  updateManageCounters();
  if (modal) modal.classList.add("active");
}

function closeManageModal() {
  const modal = document.getElementById("manage-modal");
  if (modal) modal.classList.remove("active");
}

function updateManageCounters() {
  const studentTa = document.getElementById("students-textarea");
  const roleTa = document.getElementById("roles-textarea");
  const countStudent = document.getElementById("textarea-student-count");
  const countRole = document.getElementById("textarea-role-count");
  const tabStudentCount = document.getElementById("tab-student-count");
  const tabRoleCount = document.getElementById("tab-role-count");

  if (studentTa && countStudent) {
    const sList = studentTa.value.split("\n").map(s => s.trim()).filter(Boolean);
    countStudent.textContent = `총 ${sList.length}명 입력됨`;
    if (tabStudentCount) tabStudentCount.textContent = sList.length;
  }
  if (roleTa && countRole) {
    const rList = roleTa.value.split("\n").map(r => r.trim()).filter(Boolean);
    countRole.textContent = `총 ${rList.length}개 역할 입력됨`;
    if (tabRoleCount) tabRoleCount.textContent = rList.length;
  }
}

function saveManageChanges() {
  const studentTa = document.getElementById("students-textarea");
  const roleTa = document.getElementById("roles-textarea");
  const classInput = document.getElementById("class-name-input");
  const yearInput = document.getElementById("school-year-input");

  if (studentTa) {
    const parsedStudents = studentTa.value
      .split(/[\n,]/)
      .map(s => s.trim())
      .filter(Boolean);
    if (parsedStudents.length > 0) {
      state.students = parsedStudents;
    }
  }

  if (roleTa) {
    const parsedRoles = roleTa.value
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|").map(p => p.trim());
        return {
          name: parts[0] || "학급 역할",
          emoji: parts[1] || "🌟",
          desc: parts[2] || "친구들과 협동하며 책임을 다해요."
        };
      });
    if (parsedRoles.length > 0) {
      state.roles = parsedRoles;
    }
  }

  if (classInput && classInput.value.trim()) {
    state.className = classInput.value.trim();
  }
  if (yearInput && yearInput.value.trim()) {
    state.schoolYear = yearInput.value.trim();
  }

  initDefaultAssignments();
  saveToStorage();
  renderCards(false);
  updateStats();
  closeManageModal();
  showToast(`✅ 학생 ${state.students.length}명, 역할 ${state.roles.length}개가 적용되었습니다.`);
}

// 13. 두근두근 발표 모드 (전자칠판/TV 화면용)
function openPresentationModal() {
  if (state.assignments.length === 0 || !state.assignments.some(a => a.role)) {
    showToast("먼저 [🎲 역할 배정하기] 버튼을 눌러 역할을 매칭해 주세요!");
    return;
  }
  state.presentationIndex = 0;
  state.presentationRevealed = false;
  updatePresentationCard();
  const modal = document.getElementById("presentation-modal");
  if (modal) modal.classList.add("active");
}

function closePresentationModal() {
  const modal = document.getElementById("presentation-modal");
  if (modal) modal.classList.remove("active");
}

function updatePresentationCard() {
  const item = state.assignments[state.presentationIndex];
  if (!item) return;

  const numBadge = document.getElementById("pres-number");
  const nameEl = document.getElementById("pres-student-name");
  const qBox = document.getElementById("pres-question-box");
  const rBox = document.getElementById("pres-revealed-role");
  const rEmoji = document.getElementById("pres-role-emoji");
  const rTitle = document.getElementById("pres-role-title");
  const rDesc = document.getElementById("pres-role-desc");
  const revealBtn = document.getElementById("btn-pres-reveal");
  const prevBtn = document.getElementById("btn-pres-prev");
  const nextBtn = document.getElementById("btn-pres-next");
  const progressFill = document.getElementById("pres-progress-fill");
  const progressText = document.getElementById("pres-progress-text");

  if (numBadge) numBadge.textContent = `# ${item.number}`;
  if (nameEl) nameEl.textContent = item.studentName;

  if (state.presentationRevealed && item.role) {
    if (qBox) qBox.classList.add("hidden");
    if (rBox) rBox.classList.remove("hidden");
    if (rEmoji) rEmoji.textContent = item.role.emoji;
    if (rTitle) rTitle.textContent = item.role.name;
    if (rDesc) rDesc.textContent = item.role.desc;
    if (revealBtn) revealBtn.innerHTML = "<span>🎉 공개 완료!</span>";
  } else {
    if (qBox) qBox.classList.remove("hidden");
    if (rBox) rBox.classList.add("hidden");
    if (revealBtn) revealBtn.innerHTML = "<span>✨ 역할 공개하기!</span>";
  }

  if (prevBtn) prevBtn.disabled = state.presentationIndex === 0;
  if (nextBtn) nextBtn.disabled = state.presentationIndex === state.assignments.length - 1;

  const pct = Math.round(((state.presentationIndex + 1) / state.assignments.length) * 100);
  if (progressFill) progressFill.style.width = `${pct}%`;
  if (progressText) progressText.textContent = `${state.presentationIndex + 1} / ${state.assignments.length} 명 (${item.studentName})`;
}

function revealCurrentRole() {
  if (state.presentationRevealed) return;
  state.presentationRevealed = true;
  sound.playChime();
  updatePresentationCard();
}

function presNext() {
  if (state.presentationIndex < state.assignments.length - 1) {
    state.presentationIndex++;
    state.presentationRevealed = false;
    updatePresentationCard();
  }
}

function presPrev() {
  if (state.presentationIndex > 0) {
    state.presentationIndex--;
    state.presentationRevealed = true;
    updatePresentationCard();
  }
}

// 14. 토스트 알림 표시
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
}

// 15. 초기화 및 이벤트 리스너 등록
function initApp() {
  loadFromStorage();
  renderCards(false);
  updateStats();

  // 메인 배정 버튼
  const rollBtn = document.getElementById("btn-roll-roles");
  if (rollBtn) {
    rollBtn.addEventListener("click", () => {
      rollBtn.classList.add("rolling");
      sound.playChime();
      setTimeout(() => {
        rollBtn.classList.remove("rolling");
        assignRoles();
      }, 400);
    });
  }

  // 상단 액션 버튼들
  const printBtn = document.getElementById("btn-print");
  if (printBtn) printBtn.addEventListener("click", triggerPrint);

  const copyBtn = document.getElementById("btn-copy-clipboard");
  if (copyBtn) copyBtn.addEventListener("click", copyAssignmentsToClipboard);

  const resetBtn = document.getElementById("btn-reset-roles");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("배정된 역할을 초기화하시겠습니까?")) {
        initDefaultAssignments();
        saveToStorage();
        renderCards(false);
        updateStats();
        showToast("배정 상태가 초기화되었습니다.");
      }
    });
  }

  // 스프레드시트 모달 & 액션
  const importBtn = document.getElementById("btn-sheet-import");
  if (importBtn) importBtn.addEventListener("click", handleSheetImport);

  const exportBtn = document.getElementById("btn-sheet-export");
  if (exportBtn) exportBtn.addEventListener("click", handleSheetExport);

  const closeSheetBtn = document.getElementById("close-sheet-modal");
  if (closeSheetBtn) closeSheetBtn.addEventListener("click", closeSheetModal);

  const closeSheetBottom = document.getElementById("btn-close-sheet-modal-bottom");
  if (closeSheetBottom) closeSheetBottom.addEventListener("click", closeSheetModal);

  const saveUrlBtn = document.getElementById("btn-save-sheet-url");
  if (saveUrlBtn) saveUrlBtn.addEventListener("click", saveSheetUrl);

  const runImportModal = document.getElementById("btn-run-sheet-import");
  if (runImportModal) runImportModal.addEventListener("click", handleSheetImport);

  const runExportModal = document.getElementById("btn-run-sheet-export");
  if (runExportModal) runExportModal.addEventListener("click", handleSheetExport);

  const copyScriptCodeBtn = document.getElementById("btn-copy-script-code");
  if (copyScriptCodeBtn) {
    copyScriptCodeBtn.addEventListener("click", () => {
      const codeEl = document.getElementById("apps-script-sample-code");
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          showToast("📋 Apps Script 샘플 코드가 복사되었습니다!");
        });
      }
    });
  }

  // 명단 관리 모달
  const openManageBtn = document.getElementById("btn-open-manage");
  if (openManageBtn) openManageBtn.addEventListener("click", openManageModal);

  const closeManageBtn = document.getElementById("close-manage-modal");
  if (closeManageBtn) closeManageBtn.addEventListener("click", closeManageModal);

  const closeManageBottom = document.getElementById("btn-close-manage-modal-bottom");
  if (closeManageBottom) closeManageBottom.addEventListener("click", closeManageModal);

  const saveManageBtn = document.getElementById("btn-save-manage-modal");
  if (saveManageBtn) saveManageBtn.addEventListener("click", saveManageChanges);

  // 학급 태그 클릭 시에도 관리 모달 열림
  const classTag = document.getElementById("class-title-tag");
  if (classTag) classTag.addEventListener("click", openManageModal);

  // 관리 모달 내 탭 전환
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.toggle("active", panel.id === targetId);
      });
    });
  });

  const studentTa = document.getElementById("students-textarea");
  if (studentTa) studentTa.addEventListener("input", updateManageCounters);

  const roleTa = document.getElementById("roles-textarea");
  if (roleTa) roleTa.addEventListener("input", updateManageCounters);

  const loadDefStudentsBtn = document.getElementById("btn-load-default-students");
  if (loadDefStudentsBtn) {
    loadDefStudentsBtn.addEventListener("click", () => {
      if (studentTa) {
        studentTa.value = DEFAULT_STUDENTS.join("\n");
        updateManageCounters();
      }
    });
  }

  const loadDefRolesBtn = document.getElementById("btn-load-default-roles");
  if (loadDefRolesBtn) {
    loadDefRolesBtn.addEventListener("click", () => {
      if (roleTa) {
        roleTa.value = DEFAULT_ROLES.map(r => `${r.name} | ${r.emoji} | ${r.desc}`).join("\n");
        updateManageCounters();
      }
    });
  }

  // 두근두근 뽑기 모드
  const openPresBtn = document.getElementById("btn-open-presentation");
  if (openPresBtn) openPresBtn.addEventListener("click", openPresentationModal);

  const closePresBtn = document.getElementById("close-presentation-modal");
  if (closePresBtn) closePresBtn.addEventListener("click", closePresentationModal);

  const presRevealBtn = document.getElementById("btn-pres-reveal");
  if (presRevealBtn) presRevealBtn.addEventListener("click", revealCurrentRole);

  const presNextBtn = document.getElementById("btn-pres-next");
  if (presNextBtn) presNextBtn.addEventListener("click", presNext);

  const presPrevBtn = document.getElementById("btn-pres-prev");
  if (presPrevBtn) presPrevBtn.addEventListener("click", presPrev);

  // 모달 백드롭 클릭 시 닫기
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove("active");
      }
    });
  });
}

// DOM 로드 완료 시 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
