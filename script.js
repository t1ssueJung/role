/**
 * @license
 * 우리 반 1인 1역할 배정기 - script.js
 * - 학생 드래그 앤 드롭 직접 선택 기능 (클릭/터치 보조 지원)
 * - 한 역할에 여러 명 배정 (정원/다인수 역할) 지원
 * - 교사용 화면 및 비밀번호(123456!) 보안 인증
 * - A4 게시판 인쇄 및 구글 스프레드시트 연동
 */

// 1. 기본 초등 예시 데이터 (학생 20명)
const DEFAULT_STUDENTS = [
  { id: "s1", number: 1, name: "김민준" },
  { id: "s2", number: 2, name: "이서연" },
  { id: "s3", number: 3, name: "박도윤" },
  { id: "s4", number: 4, name: "최지우" },
  { id: "s5", number: 5, name: "정시우" },
  { id: "s6", number: 6, name: "강하은" },
  { id: "s7", number: 7, name: "조예준" },
  { id: "s8", number: 8, name: "윤수아" },
  { id: "s9", number: 9, name: "장우진" },
  { id: "s10", number: 10, name: "임은우" },
  { id: "s11", number: 11, name: "한지호" },
  { id: "s12", number: 12, name: "오채원" },
  { id: "s13", number: 13, name: "서서진" },
  { id: "s14", number: 14, name: "신유나" },
  { id: "s15", number: 15, name: "권건우" },
  { id: "s16", number: 16, name: "황다은" },
  { id: "s17", number: 17, name: "안민서" },
  { id: "s18", number: 18, name: "송현우" },
  { id: "s19", number: 19, name: "전소율" },
  { id: "s20", number: 20, name: "홍시윤" }
];

// 기본 초등 역할 목록 (정원 설정 포함: 칠판, 우유, 식판, 분리수거 등 다인원 지원)
const DEFAULT_ROLES = [
  { id: "r1", name: "칠판 지킴이", emoji: "🧹", desc: "수업 후 칠판을 깨끗하게 닦고 분필 가루를 털어요.", quota: 2 },
  { id: "r2", name: "우유 도우미", emoji: "🥛", desc: "우유 급식 상자를 제시간에 가져오고 바르게 정리해요.", quota: 2 },
  { id: "r3", name: "줄서기 대장", emoji: "🚶", desc: "이동 수업이나 급식실로 갈 때 앞장서서 줄을 바르게 세워요.", quota: 2 },
  { id: "r4", name: "식판 정리 도우미", emoji: "🍽️", desc: "점심시간 후 퇴식구 식판과 잔반 정리를 도와요.", quota: 2 },
  { id: "r5", name: "분리수거 대장", emoji: "♻️", desc: "종이, 플라스틱, 캔을 바른 통에 분리수거해요.", quota: 2 },
  { id: "r6", name: "창문 환기 요정", emoji: "🪟", desc: "쉬는 시간마다 창문을 열어 교실 공기를 상쾌하게 해요.", quota: 2 },
  { id: "r7", name: "식물 사랑 지킴이", emoji: "🌱", desc: "교실 화분에 정성껏 물을 주고 잎을 살펴요.", quota: 1 },
  { id: "r8", name: "불 끄기 에너지 요정", emoji: "💡", desc: "교실을 비울 때 전등과 전자제품 전원을 확인해요.", quota: 1 },
  { id: "r9", name: "도서 정리 도우미", emoji: "📚", desc: "학급 문고 책들을 종류별로 가지런히 꽂아요.", quota: 1 },
  { id: "r10", name: "체육 부장", emoji: "⚽", desc: "체육 시간 체육용품을 챙기고 준비 운동을 이끌어요.", quota: 1 },
  { id: "r11", name: "음악·종소리 도우미", emoji: "🎵", desc: "음악 시간 악기를 챙기고 수업 시작 종을 알려요.", quota: 1 },
  { id: "r12", name: "컴퓨터·빔 도우미", emoji: "💻", desc: "선생님 교탁 컴퓨터와 빔프로젝터 켜고 끄기를 도와요.", quota: 1 },
  { id: "r13", name: "학습지 배부 도우미", emoji: "📑", desc: "모둠별로 시험지나 안내장을 알맞게 나누어 주어요.", quota: 1 },
  { id: "r14", name: "신발장 지킴이", emoji: "👟", desc: "신발장 실내화와 운동화가 단정하게 정돈되도록 살펴요.", quota: 1 },
  { id: "r15", name: "시계·시간 알리미", emoji: "⏰", desc: "수업 시작 2분 전 친구들에게 미리 자리에 앉자고 알려요.", quota: 1 },
  { id: "r16", name: "칭찬 배달부", emoji: "💌", desc: "선생님과 친구들의 칭찬 쪽지를 칭찬함에 모으고 전달해요.", quota: 1 },
  { id: "r17", name: "응원 단장", emoji: "📣", desc: "아침 인사와 친구들의 멋진 발표 때 큰 박수로 응원해요.", quota: 1 },
  { id: "r18", name: "게시판 꾸미기", emoji: "🎨", desc: "교실 뒤 게시판의 친구들 작품을 단정하게 정돈해요.", quota: 1 },
  { id: "r19", name: "손소독 청결 지킴이", emoji: "🧴", desc: "급식 전과 외출 후 손소독과 손 씻기를 권장해요.", quota: 1 },
  { id: "r20", name: "친절 안전 보안관", emoji: "🌟", desc: "복도에서 뛰지 않도록 당부하고 친구들에게 고운 말을 써요.", quota: 1 }
];

// 6가지 파스텔 테마 색상 클래스
const CARD_THEMES = ["theme-mint", "theme-sun", "theme-sky", "theme-peach", "theme-lavender", "theme-coral"];

// 2. 애플리케이션 상태 (State)
const state = {
  className: "3학년 2반",
  schoolYear: "2026학년도 1학기",
  teacherPassword: "123456!", // 기본 교사용 비밀번호
  isTeacherAuthenticated: false,
  currentView: "student", // "student" | "teacher"
  allowStudentSelection: true,
  students: [...DEFAULT_STUDENTS],
  roles: DEFAULT_ROLES.map(r => ({ ...r, assignedStudentIds: [] })),
  appsScriptUrl: "",
  selectedStudentIdForClick: null // 터치/클릭 배정 보조용
};

// 3. 브라우저 내장 Web Audio API 사운드 매니저
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

  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // safe fallback
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
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // safe fallback
    }
  }
}

const sound = new SoundManager();

// 4. 로컬 스토리지 동기화
function loadFromStorage() {
  try {
    const savedClass = localStorage.getItem("role_app_class");
    if (savedClass) state.className = savedClass;

    const savedYear = localStorage.getItem("role_app_year");
    if (savedYear) state.schoolYear = savedYear;

    const savedPwd = localStorage.getItem("role_app_pwd");
    if (savedPwd) state.teacherPassword = savedPwd;

    const savedAllow = localStorage.getItem("role_app_allow_select");
    if (savedAllow !== null) state.allowStudentSelection = savedAllow === "true";

    const savedStudents = localStorage.getItem("role_app_students");
    if (savedStudents) {
      state.students = JSON.parse(savedStudents);
    }

    const savedRoles = localStorage.getItem("role_app_roles");
    if (savedRoles) {
      state.roles = JSON.parse(savedRoles);
    } else {
      state.roles = DEFAULT_ROLES.map(r => ({ ...r, assignedStudentIds: [] }));
    }

    const savedUrl = localStorage.getItem("role_app_sheet_url");
    if (savedUrl) state.appsScriptUrl = savedUrl;
  } catch (err) {
    console.warn("Storage load error:", err);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem("role_app_class", state.className);
    localStorage.setItem("role_app_year", state.schoolYear);
    localStorage.setItem("role_app_pwd", state.teacherPassword);
    localStorage.setItem("role_app_allow_select", String(state.allowStudentSelection));
    localStorage.setItem("role_app_students", JSON.stringify(state.students));
    localStorage.setItem("role_app_roles", JSON.stringify(state.roles));
    localStorage.setItem("role_app_sheet_url", state.appsScriptUrl);
  } catch (err) {
    console.warn("Storage save error:", err);
  }
}

// 5. 헬퍼 함수: 배정된 학생 목록 및 미배정 학생 계산
function getAssignedStudentIds() {
  const set = new Set();
  state.roles.forEach(role => {
    (role.assignedStudentIds || []).forEach(id => set.add(id));
  });
  return set;
}

function getUnassignedStudents() {
  const assignedSet = getAssignedStudentIds();
  return state.students.filter(student => !assignedSet.has(student.id));
}

function findStudentById(studentId) {
  return state.students.find(s => s.id === studentId);
}

// 6. 학생 직접 드래그 앤 드롭 및 렌더링
function renderStudentView() {
  renderUnassignedDock();
  renderRolesBoard();
  updateStatsCounters();
  renderPrintTable();
}

// A. 미배정 학생 독(Dock) 렌더링
function renderUnassignedDock() {
  const pool = document.getElementById("unassigned-chips-pool");
  const badge = document.getElementById("dock-counter-badge");
  if (!pool) return;

  const unassigned = getUnassignedStudents();
  if (badge) badge.textContent = `${unassigned.length}명 대기`;

  pool.innerHTML = "";

  if (unassigned.length === 0) {
    pool.innerHTML = `
      <div style="width: 100%; text-align: center; color: #00B894; font-weight: 700; padding: 24px 0;">
        🎉 모든 친구들이 1인 1역할을 선택했습니다!
      </div>
    `;
    return;
  }

  unassigned.forEach(student => {
    const chip = document.createElement("div");
    chip.className = `student-chip ${state.selectedStudentIdForClick === student.id ? "selected" : ""}`;
    chip.draggable = state.allowStudentSelection;
    chip.dataset.studentId = student.id;

    chip.innerHTML = `
      <span class="chip-num">${student.number}</span>
      <span class="chip-name">${student.name}</span>
    `;

    // 드래그 시작 이벤트
    chip.addEventListener("dragstart", (e) => {
      if (!state.allowStudentSelection) {
        e.preventDefault();
        showToast("선생님이 현재 역할 선택을 마감하셨습니다.");
        return;
      }
      e.dataTransfer.setData("text/plain", student.id);
      chip.classList.add("dragging");
    });

    chip.addEventListener("dragend", () => {
      chip.classList.remove("dragging");
    });

    // 클릭/터치 보조 선택 (전자칠판 및 모바일 지원)
    chip.addEventListener("click", () => {
      if (!state.allowStudentSelection) {
        showToast("선생님이 현재 역할 선택을 마감하셨습니다.");
        return;
      }
      if (state.selectedStudentIdForClick === student.id) {
        state.selectedStudentIdForClick = null;
        showToast("선택이 해제되었습니다.");
      } else {
        state.selectedStudentIdForClick = student.id;
        showToast(`👉 [${student.name}] 학생 선택됨! 원하는 역할 상자를 클릭하세요.`);
      }
      renderStudentView();
    });

    pool.appendChild(chip);
  });
}

// B. 역할 보드 렌더링 (한 역할에 여러 명 지원!)
function renderRolesBoard() {
  const grid = document.getElementById("roles-board-grid");
  if (!grid) return;

  grid.innerHTML = "";

  state.roles.forEach((role, idx) => {
    const themeClass = CARD_THEMES[idx % CARD_THEMES.length];
    const assignedIds = role.assignedStudentIds || [];
    const quota = role.quota || 1;
    const isFull = assignedIds.length >= quota;

    const card = document.createElement("div");
    card.className = `role-card ${themeClass} ${isFull ? "is-full" : ""}`;
    card.dataset.roleId = role.id;

    card.innerHTML = `
      <div class="role-card-header">
        <div class="role-info-wrap">
          <span class="role-card-emoji">${role.emoji}</span>
          <div>
            <h4 class="role-card-name">${role.name}</h4>
          </div>
        </div>
        <span class="role-quota-badge ${isFull ? "full" : ""}">
          ${isFull ? "✓ 정원 마감" : `${assignedIds.length} / ${quota}명`}
        </span>
      </div>
      <p class="role-card-desc">${role.desc}</p>
      
      <!-- 드롭 존 -->
      <div class="role-drop-zone" data-drop-zone="role" data-role-id="${role.id}">
        ${assignedIds.length === 0 ? '<div class="role-drop-placeholder">여기로 이름표를 드래그하세요</div>' : ""}
      </div>
    `;

    // 배정된 학생 칩들 삽입
    const dropZone = card.querySelector(".role-drop-zone");
    assignedIds.forEach(studentId => {
      const student = findStudentById(studentId);
      if (!student) return;

      const chip = document.createElement("div");
      chip.className = "assigned-chip";
      chip.innerHTML = `
        <span class="chip-num">${student.number}</span>
        <span>${student.name}</span>
        <button type="button" class="chip-remove-btn" title="선택 취소 (명단으로 복귀)">✕</button>
      `;

      // ✕ 버튼 클릭 시 배정 취소
      chip.querySelector(".chip-remove-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        unassignStudent(student.id);
      });

      dropZone.appendChild(chip);
    });

    // 드래그 앤 드롭 이벤트 등록
    setupDropZoneEvents(dropZone, role);

    // 클릭/터치 방식 보조 배정 (보드 클릭 시)
    card.addEventListener("click", () => {
      if (state.selectedStudentIdForClick) {
        assignStudentToRole(state.selectedStudentIdForClick, role.id);
        state.selectedStudentIdForClick = null;
      }
    });

    grid.appendChild(card);
  });
}

// 드롭 존 이벤트 리스너 등록
function setupDropZoneEvents(dropZone, role) {
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!state.allowStudentSelection) return;
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (!state.allowStudentSelection) {
      showToast("선생님이 현재 역할 선택을 마감하셨습니다.");
      return;
    }

    const studentId = e.dataTransfer.getData("text/plain");
    if (studentId) {
      assignStudentToRole(studentId, role.id);
    }
  });
}

// 학생을 특정 역할에 배정 (다인수 정원 체크)
function assignStudentToRole(studentId, roleId) {
  const student = findStudentById(studentId);
  const targetRole = state.roles.find(r => r.id === roleId);

  if (!student || !targetRole) return;

  const currentAssigned = targetRole.assignedStudentIds || [];
  const quota = targetRole.quota || 1;

  // 이미 이 역할에 속해 있는 경우
  if (currentAssigned.includes(studentId)) {
    return;
  }

  // 정원 초과 체크
  if (currentAssigned.length >= quota) {
    showToast(`⚠️ [${targetRole.name}] 역할은 정원(${quota}명)이 다 찼습니다! 다른 역할을 골라주세요.`);
    return;
  }

  // 다른 역할에 이미 배정되어 있다면 이전 역할에서 제거
  state.roles.forEach(r => {
    r.assignedStudentIds = (r.assignedStudentIds || []).filter(id => id !== studentId);
  });

  // 새 역할에 추가
  targetRole.assignedStudentIds = [...currentAssigned, studentId];

  saveToStorage();
  sound.playPop();
  renderStudentView();

  const isNowFull = targetRole.assignedStudentIds.length === quota;
  showToast(`✨ [${student.name}] 학생이 [${targetRole.emoji} ${targetRole.name}] 역할을 선택했습니다!${isNowFull ? " (정원 마감)" : ""}`);
}

// 학생 배정 취소
function unassignStudent(studentId) {
  const student = findStudentById(studentId);
  state.roles.forEach(r => {
    r.assignedStudentIds = (r.assignedStudentIds || []).filter(id => id !== studentId);
  });

  saveToStorage();
  renderStudentView();
  if (student) {
    showToast(`↩ [${student.name}] 학생의 역할 선택이 취소되어 대기 명단으로 돌아갔습니다.`);
  }
}

// 남은 학생들만 자동으로 골고루 배정
function assignRemainingStudentsRandomly() {
  const unassigned = getUnassignedStudents();
  if (unassigned.length === 0) {
    showToast("이미 모든 친구들이 역할을 선택했습니다!");
    return;
  }

  // 남은 빈 자리(슬롯)가 있는 역할들 수집
  let availableSlots = [];
  state.roles.forEach(role => {
    const current = (role.assignedStudentIds || []).length;
    const remaining = (role.quota || 1) - current;
    for (let i = 0; i < remaining; i++) {
      availableSlots.push(role.id);
    }
  });

  if (availableSlots.length < unassigned.length) {
    showToast(`⚠️ 남은 역할 빈자리(${availableSlots.length}자리)가 남은 학생(${unassigned.length}명)보다 적습니다. 교사용 화면에서 역할 정원을 늘려주세요!`);
    return;
  }

  // 무작위 셔플
  availableSlots = shuffleArray(availableSlots);
  const shuffledStudents = shuffleArray(unassigned);

  shuffledStudents.forEach((student, idx) => {
    const roleId = availableSlots[idx];
    const role = state.roles.find(r => r.id === roleId);
    if (role) {
      role.assignedStudentIds = [...(role.assignedStudentIds || []), student.id];
    }
  });

  saveToStorage();
  sound.playFanfare();
  renderStudentView();
  showToast(`🎉 남은 ${unassigned.length}명의 친구들에게 역할 배정이 완료되었습니다!`);
}

// 전체 학생 무작위 재배정
function fullRandomAssign() {
  if (confirm("모든 학생의 역할을 무작위로 새로 배정하시겠습니까? (기존 선택은 초기화됩니다)")) {
    // 모든 배정 초기화
    state.roles.forEach(r => r.assignedStudentIds = []);

    // 전체 역할 슬롯 생성
    let slots = [];
    state.roles.forEach(role => {
      const quota = role.quota || 1;
      for (let i = 0; i < quota; i++) {
        slots.push(role.id);
      }
    });

    if (slots.length < state.students.length) {
      showToast(`⚠️ 전체 역할 정원(${slots.length}명)이 학생 수(${state.students.length}명)보다 적습니다. 교사용 화면에서 역할 정원을 늘려주세요!`);
      return;
    }

    slots = shuffleArray(slots);
    const shuffledStudents = shuffleArray(state.students);

    shuffledStudents.forEach((student, idx) => {
      const roleId = slots[idx];
      const role = state.roles.find(r => r.id === roleId);
      if (role) {
        role.assignedStudentIds = [...(role.assignedStudentIds || []), student.id];
      }
    });

    saveToStorage();
    sound.playFanfare();
    renderStudentView();
    showToast("🎲 전체 학생 1인 1역할 무작위 배정이 완료되었습니다!");
  }
}

// 전체 배정 비우기
function resetAllSelections() {
  if (confirm("모든 학생의 역할 선택을 초기화하시겠습니까?")) {
    state.roles.forEach(r => r.assignedStudentIds = []);
    saveToStorage();
    renderStudentView();
    showToast("모든 역할 선택이 초기화되었습니다.");
  }
}

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// C. 카운터 및 상태 요약 갱신
function updateStatsCounters() {
  const total = state.students.length;
  const unassigned = getUnassignedStudents().length;
  const assigned = total - unassigned;

  const totalEl = document.getElementById("student-total-count");
  const assignedEl = document.getElementById("student-assigned-count");
  const unassignedEl = document.getElementById("student-unassigned-count");
  const headerClassTag = document.getElementById("header-class-tag");

  if (totalEl) totalEl.textContent = `${total}명`;
  if (assignedEl) assignedEl.textContent = `${assigned}명`;
  if (unassignedEl) unassignedEl.textContent = `${unassigned}명`;
  if (headerClassTag) headerClassTag.textContent = state.className;
}

// D. 교실 게시판 부착용 A4 인쇄 테이블 렌더링 (다인수 배정 완벽 지원)
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

  state.roles.forEach((role, idx) => {
    const assignedIds = role.assignedStudentIds || [];
    const studentNames = assignedIds.map(id => {
      const s = findStudentById(id);
      return s ? `${s.number}번 ${s.name}` : "";
    }).filter(Boolean);

    const namesText = studentNames.length > 0 ? studentNames.join(", ") : "(미배정)";
    const quotaText = `${role.quota || 1}명`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${role.emoji} ${role.name}</strong></td>
      <td>${quotaText}</td>
      <td>${namesText}</td>
      <td>${role.desc}</td>
      <td><span class="stamp-box"></span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 7. 교사용 화면 (Teacher Dashboard) 관리 기능
function renderTeacherView() {
  const studentTa = document.getElementById("teacher-students-textarea");
  const studentBadge = document.getElementById("teacher-student-badge");
  const roleBadge = document.getElementById("teacher-role-badge");
  const classInput = document.getElementById("teacher-class-name-input");
  const yearInput = document.getElementById("teacher-school-year-input");
  const allowToggle = document.getElementById("teacher-allow-selection-toggle");
  const sheetUrlInput = document.getElementById("teacher-sheet-url-input");

  if (studentTa) {
    studentTa.value = state.students.map(s => s.name).join("\n");
  }
  if (studentBadge) studentBadge.textContent = `${state.students.length}명 등록됨`;

  // 역할 테이블 렌더링
  renderTeacherRolesTable();

  // 총 정원 계산
  const totalQuota = state.roles.reduce((sum, r) => sum + (Number(r.quota) || 1), 0);
  if (roleBadge) {
    roleBadge.textContent = `${state.roles.length}개 역할 / 총 정원 ${totalQuota}명`;
  }

  if (classInput) classInput.value = state.className;
  if (yearInput) yearInput.value = state.schoolYear;
  if (allowToggle) allowToggle.checked = state.allowStudentSelection;
  if (sheetUrlInput) sheetUrlInput.value = state.appsScriptUrl || "";
}

function renderTeacherRolesTable() {
  const tbody = document.getElementById("teacher-roles-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.roles.forEach((role, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <input type="text" class="t-role-emoji" data-idx="${idx}" value="${role.emoji}" style="width: 42px;" />
      </td>
      <td>
        <input type="text" class="t-role-name" data-idx="${idx}" value="${role.name}" />
      </td>
      <td>
        <input type="number" class="t-role-quota" data-idx="${idx}" min="1" max="10" value="${role.quota || 1}" style="width: 60px;" title="이 역할을 맡을 인원수" />
      </td>
      <td>
        <input type="text" class="t-role-desc" data-idx="${idx}" value="${role.desc}" />
      </td>
      <td>
        <button type="button" class="btn-del-role" data-idx="${idx}" title="역할 삭제">🗑️</button>
      </td>
    `;

    // 삭제 버튼
    tr.querySelector(".btn-del-role").addEventListener("click", () => {
      if (confirm(`'${role.name}' 역할을 목록에서 삭제하시겠습니까?`)) {
        state.roles.splice(idx, 1);
        saveToStorage();
        renderTeacherView();
        renderStudentView();
      }
    });

    tbody.appendChild(tr);
  });
}

// 교사용 학생 명단 저장
function saveTeacherStudents() {
  const ta = document.getElementById("teacher-students-textarea");
  if (!ta) return;

  const names = ta.value
    .split(/[\n,]/)
    .map(n => n.trim())
    .filter(Boolean);

  if (names.length === 0) {
    showToast("학생 이름을 최소 1명 이상 입력해 주세요.");
    return;
  }

  state.students = names.map((name, idx) => ({
    id: `s_${Date.now()}_${idx}`,
    number: idx + 1,
    name: name
  }));

  // 기존 배정 중 없는 학생 ID 정리
  const validIds = new Set(state.students.map(s => s.id));
  state.roles.forEach(r => {
    r.assignedStudentIds = (r.assignedStudentIds || []).filter(id => validIds.has(id));
  });

  saveToStorage();
  renderTeacherView();
  renderStudentView();
  showToast(`✅ 학생 ${state.students.length}명 명단이 성공적으로 적용되었습니다!`);
}

// 교사용 역할 설정 저장
function saveTeacherRoles() {
  const emojis = document.querySelectorAll(".t-role-emoji");
  const names = document.querySelectorAll(".t-role-name");
  const quotas = document.querySelectorAll(".t-role-quota");
  const descs = document.querySelectorAll(".t-role-desc");

  const updatedRoles = [];
  names.forEach((nameEl, idx) => {
    const originalRole = state.roles[idx] || {};
    const quotaVal = Math.max(1, parseInt(quotas[idx].value, 10) || 1);
    
    // 정원이 줄어든 경우 초과 학생 정리
    const currentAssigned = originalRole.assignedStudentIds || [];
    const trimmedAssigned = currentAssigned.slice(0, quotaVal);

    updatedRoles.push({
      id: originalRole.id || `r_${Date.now()}_${idx}`,
      emoji: emojis[idx].value.trim() || "⭐",
      name: nameEl.value.trim() || "학급 역할",
      quota: quotaVal,
      desc: descs[idx].value.trim() || "책임감 있게 역할을 실천해요.",
      assignedStudentIds: trimmedAssigned
    });
  });

  state.roles = updatedRoles;
  saveToStorage();
  renderTeacherView();
  renderStudentView();
  showToast("✅ 역할 목록 및 정원(인원수) 설정이 저장되었습니다!");
}

// 새 역할 추가
function addNewRole() {
  const emojiInput = document.getElementById("new-role-emoji");
  const nameInput = document.getElementById("new-role-name");
  const quotaInput = document.getElementById("new-role-quota");
  const descInput = document.getElementById("new-role-desc");

  const name = nameInput.value.trim();
  if (!name) {
    showToast("새 역할의 이름을 입력해 주세요.");
    nameInput.focus();
    return;
  }

  const quota = Math.max(1, parseInt(quotaInput.value, 10) || 1);

  state.roles.push({
    id: `r_${Date.now()}`,
    emoji: emojiInput.value.trim() || "✨",
    name: name,
    quota: quota,
    desc: descInput.value.trim() || "친구들과 협동하며 책임을 다해요.",
    assignedStudentIds: []
  });

  nameInput.value = "";
  descInput.value = "";
  quotaInput.value = "1";

  saveToStorage();
  renderTeacherView();
  renderStudentView();
  showToast(`✅ 새 역할 '${name}'(정원 ${quota}명)이 추가되었습니다!`);
}

// 8. 뷰 전환 및 비밀번호 인증 (123456!)
function openPasswordModal() {
  const modal = document.getElementById("password-modal");
  const input = document.getElementById("teacher-password-input");
  const errorMsg = document.getElementById("pwd-error-msg");

  if (input) input.value = "";
  if (errorMsg) errorMsg.classList.add("hidden");
  if (modal) modal.classList.add("active");
  if (input) input.focus();
}

function closePasswordModal() {
  const modal = document.getElementById("password-modal");
  if (modal) modal.classList.remove("active");
}

function verifyPasswordAndEnter() {
  const input = document.getElementById("teacher-password-input");
  const errorMsg = document.getElementById("pwd-error-msg");
  if (!input) return;

  const entered = input.value.trim();
  if (entered === state.teacherPassword) {
    state.isTeacherAuthenticated = true;
    closePasswordModal();
    switchToTeacherView();
    showToast("👩‍🏫 교사용 관리 화면에 로그인되었습니다!");
  } else {
    if (errorMsg) errorMsg.classList.remove("hidden");
    input.select();
  }
}

function switchToTeacherView() {
  state.currentView = "teacher";
  const studentSection = document.getElementById("student-view-section");
  const teacherSection = document.getElementById("teacher-view-section");
  const indicator = document.getElementById("current-mode-indicator");
  const teacherBtnText = document.getElementById("teacher-btn-text");

  if (studentSection) studentSection.classList.add("hidden");
  if (teacherSection) teacherSection.classList.remove("hidden");

  if (indicator) {
    indicator.textContent = "👩‍🏫 교사용 관리 모드";
    indicator.className = "mode-badge teacher-mode";
  }
  if (teacherBtnText) teacherBtnText.textContent = "교사용 화면 (접속 중)";

  renderTeacherView();
}

function switchToStudentView() {
  state.currentView = "student";
  const studentSection = document.getElementById("student-view-section");
  const teacherSection = document.getElementById("teacher-view-section");
  const indicator = document.getElementById("current-mode-indicator");
  const teacherBtnText = document.getElementById("teacher-btn-text");

  if (teacherSection) teacherSection.classList.add("hidden");
  if (studentSection) studentSection.classList.remove("hidden");

  if (indicator) {
    indicator.textContent = "🎈 학생 선택 모드";
    indicator.className = "mode-badge student-mode";
  }
  if (teacherBtnText) {
    teacherBtnText.textContent = state.isTeacherAuthenticated ? "교사용 관리로 이동" : "교사용 화면";
  }

  renderStudentView();
}

function teacherLogout() {
  state.isTeacherAuthenticated = false;
  switchToStudentView();
  showToast("교사용 모드에서 로그아웃되었습니다.");
}

// 9. 구글 스프레드시트 연동 (다인수 역할 지원)
async function handleSheetExport() {
  const url = state.appsScriptUrl;
  if (!url) {
    showToast("구글 Apps Script 웹 앱 URL을 먼저 입력하고 저장해 주세요!");
    return;
  }

  const payload = {
    className: state.className,
    schoolYear: state.schoolYear,
    timestamp: new Date().toISOString(),
    roles: state.roles.map(r => ({
      name: r.name,
      emoji: r.emoji,
      quota: r.quota,
      desc: r.desc,
      assignedStudents: (r.assignedStudentIds || []).map(id => {
        const s = findStudentById(id);
        return s ? `${s.number}번 ${s.name}` : "";
      }).filter(Boolean)
    }))
  };

  showToast("💾 구글 스프레드시트로 저장 요청 중...");
  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "구글 시트에서 저장을 확인하지 못했습니다.");
    }
    sound.playPop();
    showToast(`✅ 구글 시트에 ${result.savedRows}명의 배정 결과를 저장했습니다!`);
  } catch (err) {
    console.error("Sheet export error:", err);
    showToast(`⚠️ 저장 확인 실패: ${err.message}. 시트의 실제 기록을 확인한 뒤 다시 시도해 주세요.`);
  }
}

async function handleSheetImport() {
  const url = state.appsScriptUrl;
  if (!url) {
    showToast("구글 Apps Script 웹 앱 URL을 먼저 입력하고 저장해 주세요!");
    return;
  }

  showToast("🔄 구글 스프레드시트에서 데이터를 가져오는 중...");
  try {
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    if (data && data.status === "success") {
      if (Array.isArray(data.students) && data.students.length > 0) {
        state.students = data.students.map((name, idx) => ({
          id: `s_import_${idx}`,
          number: idx + 1,
          name: typeof name === "string" ? name : name.name
        }));
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        state.roles = data.roles.map((r, idx) => ({
          id: `r_import_${idx}`,
          name: typeof r === "string" ? r : r.name,
          emoji: r.emoji || "⭐",
          quota: Number(r.quota) || 1,
          desc: r.desc || "학급 실천 역할",
          assignedStudentIds: []
        }));
      }
      saveToStorage();
      renderTeacherView();
      renderStudentView();
      showToast(`✅ 시트 연동 성공: 학생 ${state.students.length}명, 역할 ${state.roles.length}개를 불러왔습니다!`);
    } else {
      throw new Error(data.message || "응답 형식이 올바르지 않습니다.");
    }
  } catch (err) {
    console.error("Sheet import error:", err);
    showToast("⚠️ 시트 불러오기 실패: Apps Script 배포 설정 및 접근 권한을 확인해 주세요.");
  }
}

// 10. 알림장/메신저 공지용 텍스트 복사
function copyAssignmentsText() {
  const lines = [
    `📢 [${state.className}] 1인 1역할 배정 결과 안내 ✨`,
    `----------------------------------------`
  ];

  state.roles.forEach(role => {
    const assigned = (role.assignedStudentIds || []).map(id => {
      const s = findStudentById(id);
      return s ? `${s.number}번 ${s.name}` : "";
    }).filter(Boolean);

    const names = assigned.length > 0 ? assigned.join(", ") : "(미배정)";
    lines.push(`${role.emoji} ${role.name} (${role.quota}명): ${names} - ${role.desc}`);
  });

  lines.push(`----------------------------------------`);
  lines.push(`🌱 우리 모두 즐겁고 책임감 있게 역할을 실천해요!`);

  const text = lines.join("\n");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("📋 배정 결과가 클립보드에 복사되었습니다!");
    }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showToast("📋 배정 결과가 복사되었습니다!");
}

// 11. 토스트 알림
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

// 12. 전체 이벤트 리스너 바인딩 및 앱 초기화
function initApp() {
  loadFromStorage();
  renderStudentView();

  // 상단 바 버튼들
  const toggleTeacherBtn = document.getElementById("btn-toggle-teacher-mode");
  if (toggleTeacherBtn) {
    toggleTeacherBtn.addEventListener("click", () => {
      if (state.isTeacherAuthenticated) {
        if (state.currentView === "teacher") {
          switchToStudentView();
        } else {
          switchToTeacherView();
        }
      } else {
        openPasswordModal();
      }
    });
  }

  const quickPrintBtn = document.getElementById("btn-quick-print");
  if (quickPrintBtn) {
    quickPrintBtn.addEventListener("click", () => {
      renderPrintTable();
      window.print();
    });
  }

  // 학생 뷰 컨트롤 버튼들
  const quickRandomBtn = document.getElementById("btn-student-quick-random");
  if (quickRandomBtn) quickRandomBtn.addEventListener("click", assignRemainingStudentsRandomly);

  const fullRandomBtn = document.getElementById("btn-full-random-assign");
  if (fullRandomBtn) fullRandomBtn.addEventListener("click", fullRandomAssign);

  const resetAllBtn = document.getElementById("btn-reset-all-selections");
  if (resetAllBtn) resetAllBtn.addEventListener("click", resetAllSelections);

  // 미배정 풀 드롭 이벤트 (역할 카드의 학생을 미배정 풀로 끌어오면 배정 취소)
  const unassignedPool = document.getElementById("unassigned-chips-pool");
  if (unassignedPool) {
    unassignedPool.addEventListener("dragover", (e) => {
      e.preventDefault();
      unassignedPool.classList.add("drag-over");
    });
    unassignedPool.addEventListener("dragleave", () => {
      unassignedPool.classList.remove("drag-over");
    });
    unassignedPool.addEventListener("drop", (e) => {
      e.preventDefault();
      unassignedPool.classList.remove("drag-over");
      const studentId = e.dataTransfer.getData("text/plain");
      if (studentId) {
        unassignStudent(studentId);
      }
    });
  }

  // 비밀번호 모달 관련
  const closePwdBtn = document.getElementById("close-password-modal");
  if (closePwdBtn) closePwdBtn.addEventListener("click", closePasswordModal);

  const cancelPwdBtn = document.getElementById("btn-cancel-password");
  if (cancelPwdBtn) cancelPwdBtn.addEventListener("click", closePasswordModal);

  const submitPwdBtn = document.getElementById("btn-submit-password");
  if (submitPwdBtn) submitPwdBtn.addEventListener("click", verifyPasswordAndEnter);

  const pwdInput = document.getElementById("teacher-password-input");
  if (pwdInput) {
    pwdInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyPasswordAndEnter();
    });
  }

  // 교사용 화면 내 버튼들
  const returnStudentBtn = document.getElementById("btn-return-to-student-view");
  if (returnStudentBtn) returnStudentBtn.addEventListener("click", switchToStudentView);

  const logoutBtn = document.getElementById("btn-teacher-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", teacherLogout);

  const saveStudentsBtn = document.getElementById("btn-teacher-save-students");
  if (saveStudentsBtn) saveStudentsBtn.addEventListener("click", saveTeacherStudents);

  const restoreStudentsBtn = document.getElementById("btn-teacher-restore-students");
  if (restoreStudentsBtn) {
    restoreStudentsBtn.addEventListener("click", () => {
      if (confirm("초등 기본 20명 학생 명단으로 복원하시겠습니까?")) {
        state.students = [...DEFAULT_STUDENTS];
        saveToStorage();
        renderTeacherView();
        renderStudentView();
        showToast("기본 20명 학생 명단이 복원되었습니다.");
      }
    });
  }

  const addNewRoleBtn = document.getElementById("btn-add-new-role");
  if (addNewRoleBtn) addNewRoleBtn.addEventListener("click", addNewRole);

  const saveRolesBtn = document.getElementById("btn-teacher-save-roles");
  if (saveRolesBtn) saveRolesBtn.addEventListener("click", saveTeacherRoles);

  const restoreRolesBtn = document.getElementById("btn-teacher-restore-roles");
  if (restoreRolesBtn) {
    restoreRolesBtn.addEventListener("click", () => {
      if (confirm("초등 기본 20개 역할 및 정원 설정으로 복원하시겠습니까?")) {
        state.roles = DEFAULT_ROLES.map(r => ({ ...r, assignedStudentIds: [] }));
        saveToStorage();
        renderTeacherView();
        renderStudentView();
        showToast("기본 20개 역할 목록 및 정원이 복원되었습니다.");
      }
    });
  }

  const saveClassSettingsBtn = document.getElementById("btn-save-class-settings");
  if (saveClassSettingsBtn) {
    saveClassSettingsBtn.addEventListener("click", () => {
      const classInput = document.getElementById("teacher-class-name-input");
      const yearInput = document.getElementById("teacher-school-year-input");
      const allowToggle = document.getElementById("teacher-allow-selection-toggle");
      const newPwdInput = document.getElementById("teacher-change-pwd-input");

      if (classInput && classInput.value.trim()) state.className = classInput.value.trim();
      if (yearInput && yearInput.value.trim()) state.schoolYear = yearInput.value.trim();
      if (allowToggle) state.allowStudentSelection = allowToggle.checked;

      if (newPwdInput && newPwdInput.value.trim()) {
        state.teacherPassword = newPwdInput.value.trim();
        newPwdInput.value = "";
        showToast("✅ 교사용 비밀번호가 새롭게 변경되었습니다!");
      } else {
        showToast("✅ 학급 설정이 저장되었습니다!");
      }

      saveToStorage();
      renderTeacherView();
      renderStudentView();
    });
  }

  const saveSheetUrlBtn = document.getElementById("btn-teacher-save-sheet-url");
  if (saveSheetUrlBtn) {
    saveSheetUrlBtn.addEventListener("click", () => {
      const urlInput = document.getElementById("teacher-sheet-url-input");
      if (urlInput) {
        state.appsScriptUrl = urlInput.value.trim();
        saveToStorage();
        showToast(state.appsScriptUrl ? "✅ Apps Script 웹 앱 URL이 저장되었습니다." : "ℹ️ URL이 비워졌습니다.");
      }
    });
  }

  const sheetImportBtn = document.getElementById("btn-teacher-sheet-import");
  if (sheetImportBtn) sheetImportBtn.addEventListener("click", handleSheetImport);

  const sheetExportBtn = document.getElementById("btn-teacher-sheet-export");
  if (sheetExportBtn) sheetExportBtn.addEventListener("click", handleSheetExport);

  const teacherPrintBtn = document.getElementById("btn-teacher-open-print");
  if (teacherPrintBtn) {
    teacherPrintBtn.addEventListener("click", () => {
      renderPrintTable();
      window.print();
    });
  }

  const teacherCopyBtn = document.getElementById("btn-teacher-copy-text");
  if (teacherCopyBtn) teacherCopyBtn.addEventListener("click", copyAssignmentsText);

  // 모달 백드롭 클릭 시 닫기
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove("active");
      }
    });
  });
}

// DOM 로드 완료 시 초기화 실행
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

