// /js/admin.js
import { db } from './firebaseConfig.js';
import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const teamTableBody = document.getElementById("teamTableBody");
const participantTableBody = document.getElementById("participantTableBody");
const teamSelect = document.getElementById("teamSelect");

// 🔁 팀 목록 불러오기
async function loadTeams() {
  teamTableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "teams"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = `
      <tr>
        <td><input value="${data.name}" onchange="updateTeam('${docSnap.id}', this.value)" /></td>
        <td><button onclick="updateTeam('${docSnap.id}', this.previousElementSibling.value)">수정</button></td>
        <td><button onclick="deleteTeam('${docSnap.id}')">삭제</button></td>
      </tr>
    `;
    teamTableBody.innerHTML += row;
  });

  // 팀 선택 드롭다운도 갱신
  await loadTeamSelect();
}

// ✅ 팀 추가
window.addTeam = async function () {
  const name = document.getElementById("teamNameInput").value.trim();
  if (!name) return alert("팀 이름을 입력하세요");

  await addDoc(collection(db, "teams"), {
    name: name,
    created_at: new Date()
  });

  document.getElementById("teamNameInput").value = "";
  loadTeams();
};

// ✅ 팀 수정
window.updateTeam = async function (id, name) {
  await updateDoc(doc(db, "teams", id), { name });
  alert("팀 이름이 수정되었습니다.");
  loadTeams();
};

// ✅ 팀 삭제
window.deleteTeam = async function (id) {
  await deleteDoc(doc(db, "teams", id));
  alert("팀이 삭제되었습니다.");
  loadTeams();
};

// 📥 드롭다운에 팀 로드
async function loadTeamSelect() {
  teamSelect.innerHTML = '<option value="">팀 선택</option>';
  const snapshot = await getDocs(collection(db, "teams"));
  snapshot.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.data().name;
    teamSelect.appendChild(option);
  });
}

// ✅ 참가자 추가
window.addParticipant = async function () {
  const teamId = teamSelect.value;
  const employeeNo = document.getElementById("employeeNoInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();

  if (!teamId || !employeeNo || !name) {
    return alert("모든 정보를 입력해주세요.");
  }

  await addDoc(collection(db, "users"), {
    team_id: teamId,
    employee_no: employeeNo,
    name: name,
    energy: 5,
    leadership_score: 0,
    last_choice: null
  });

  document.getElementById("employeeNoInput").value = '';
  document.getElementById("nameInput").value = '';
  loadParticipants();
};

// ✅ 참가자 조회
window.loadParticipants = async function () {
  const teamId = teamSelect.value;
  participantTableBody.innerHTML = "";

  if (!teamId) return;

  const q = query(collection(db, "users"), where("team_id", "==", teamId));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const row = `
      <tr>
        <td><input value="${d.name}" onchange="updateParticipant('${docSnap.id}', 'name', this.value)" /></td>
        <td><input value="${d.employee_no}" onchange="updateParticipant('${docSnap.id}', 'employee_no', this.value)" /></td>
        <td>${teamSelect.options[teamSelect.selectedIndex].text}</td>
        <td>${d.energy}</td>
        <td>${d.leadership_score}</td>
        <td><button onclick="updateParticipant('${docSnap.id}')">저장</button></td>
        <td><button onclick="deleteParticipant('${docSnap.id}')">삭제</button></td>
      </tr>
    `;
    participantTableBody.innerHTML += row;
  });
};

// ✅ 참가자 수정
window.updateParticipant = async function (id, field = null, value = null) {
  if (field && value !== null) {
    await updateDoc(doc(db, "users", id), { [field]: value });
  } else {
    alert("자동 저장되었습니다.");
  }
};

// ✅ 참가자 삭제
window.deleteParticipant = async function (id) {
  await deleteDoc(doc(db, "users", id));
  alert("참가자가 삭제되었습니다.");
  loadParticipants();
};

// 초기 로딩
loadTeams();
