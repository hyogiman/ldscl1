// /js/admin.js
import { db, auth } from './firebaseConfig.js';
import {
  doc, setDoc, updateDoc, collection, getDocs, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
  onAuthStateChanged, signOut
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

// ✅ 관리자 로그인 확인
const adminStatus = document.getElementById('adminStatus');
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminStatus.innerHTML = `👤 로그인됨: ${user.email} <button onclick="logout()">로그아웃</button>`;
    listenParticipants(); // 실시간 참가자 모니터링
  } else {
    alert("로그인이 필요합니다!");
    window.location.href = '/index.html';
  }
});

window.logout = async function () {
  await signOut(auth);
  location.reload();
};

// 🎮 라운드 시작/종료 제어
window.toggleRound = async function (isOpen) {
  const round = document.getElementById("roundSelect").value;
  await updateDoc(doc(db, "rounds", round), { isOpen });
  alert(`📢 ${round} ${isOpen ? '시작' : '종료'}되었습니다`);
};

// ✍️ 선택지 저장
window.saveOptions = async function () {
  const round = document.getElementById("roundSelect").value;
  const scenario = document.getElementById("scenarioText").value;
  const options = {
    A: document.getElementById("optionA").value,
    B: document.getElementById("optionB").value,
    C: document.getElementById("optionC").value,
    D: document.getElementById("optionD").value
  };

  await setDoc(doc(db, "rounds", round), {
    scenario,
    options,
    isOpen: false // 기본은 비활성
  }, { merge: true });

  alert(`✅ ${round} 선택지가 저장되었습니다.`);
};

// 📊 참가자 정보 실시간 반영
function listenParticipants() {
  const tbody = document.getElementById("participantBody");
  onSnapshot(collection(db, "users"), (snapshot) => {
    tbody.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = `
        <tr>
          <td>${data.name}</td>
          <td>${data.employee_no}</td>
          <td>${data.team || '-'}</td>
          <td>${data.energy}</td>
          <td>${data.leadership_score}</td>
          <td>${data.last_choice || '-'}</td>
        </tr>`;
      tbody.innerHTML += row;
    });
  });
}

// 📁 CSV 다운로드
window.exportCSV = async function () {
  const snapshot = await getDocs(collection(db, "users"));
  let csv = '이름,사번,팀,에너지,점수\n';
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    csv += `${d.name},${d.employee_no},${d.team || '-'},${d.energy},${d.leadership_score}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "participant_data.csv";
  link.click();
};
