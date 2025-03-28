// /js/participant.js
import { db } from './firebaseConfig.js';
import {
  collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

let currentUser = null;
let currentRound = null;

// 🔐 간단한 참가자 인증 (사번으로 사용자 조회)
window.participantLogin = async function () {
  const inputNo = document.getElementById("employeeNo").value;
  const usersSnapshot = await getDocs(collection(db, "users"));
  let found = false;

  usersSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.employee_no === inputNo) {
      currentUser = { ...data, id: docSnap.id };
      found = true;
    }
  });

  if (!found) return alert("사번을 찾을 수 없습니다.");

  document.getElementById("loginArea").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  listenRounds();
};

// 🧠 현재 열린 라운드를 실시간으로 감지
function listenRounds() {
  const roundsCol = collection(db, "rounds");
  onSnapshot(roundsCol, (snapshot) => {
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.isOpen) {
        currentRound = docSnap.id;
        updateScenarioDisplay(data);
      }
    });
  });
}

// 💬 상황 및 선택지 UI 업데이트
function updateScenarioDisplay(data) {
  document.getElementById("scenarioDisplay").innerText = data.scenario || "상황 없음";
  document.getElementById("optionsArea").style.display = "block";

  // 버튼 텍스트 동적으로 변경
  document.getElementById("btnA").innerText = "A: " + data.options?.A;
  document.getElementById("btnB").innerText = "B: " + data.options?.B;
  document.getElementById("btnC").innerText = "C: " + data.options?.C;
  document.getElementById("btnD").innerText = "D: " + data.options?.D;
}

// ✅ 선택지 클릭
window.selectOption = async function (choice) {
  const ref = doc(db, `user_choices/${currentRound}/${currentUser.id}`);
  await setDoc(ref, {
    selected_option: choice,
    empathy_received: 0
  });

  await updateDoc(doc(db, "users", currentUser.id), {
    last_choice: choice
  });

  document.getElementById("selectedResult").innerHTML = `<h3>✔️ 선택한 옵션: ${choice}</h3>`;
  document.getElementById("optionsArea").style.display = "none";

  renderEmpathyForm();
};

// 🧡 공감 체크박스 렌더링
async function renderEmpathyForm() {
  const form = document.getElementById("empathyForm");
  form.innerHTML = "";
  const users = await getDocs(collection(db, "users"));
  let count = 0;

  users.forEach(docSnap => {
    const user = docSnap.data();
    if (user.team === currentUser.team && docSnap.id !== currentUser.id) {
      form.innerHTML += `
        <label>
          <input type="checkbox" name="empathy" value="${docSnap.id}" /> ${user.name}
        </label><br/>
      `;
      count++;
    }
  });

  if (count > 0) {
    document.getElementById("empathyArea").style.display = "block";
  }
}

// 💬 공감 제출
window.submitEmpathy = async function () {
  const checked = document.querySelectorAll('input[name="empathy"]:checked');
  if (checked.length > 2) return alert("최대 2명까지 선택 가능합니다.");

  for (let checkbox of checked) {
    const userId = checkbox.value;
    const choiceRef = doc(db, `user_choices/${currentRound}/${userId}`);
    const choiceSnap = await getDoc(choiceRef);
    if (choiceSnap.exists()) {
      const currentEmpathy = choiceSnap.data().empathy_received || 0;
      await updateDoc(choiceRef, { empathy_received: currentEmpathy + 1 });
      await updateDoc(doc(db, "users", userId), {
        energy: (await getDoc(doc(db, "users", userId))).data().energy + 1
      });
    }
  }

  document.getElementById("resultArea").innerHTML = `
    <p>🎉 공감 제출 완료! 관리자 발표 시 결과를 확인하세요.</p
