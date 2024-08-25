import { auth, database } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const submitBtn = document.querySelector(".submit"),
  emailInput = document.querySelector("input[type='email']"),
  passwordInput = document.querySelector("input[type='password']"),
  messageField = document.querySelector(".label-message");

// Função para enviar o formulário ao pressionar Enter
function handleEnterKey(event) {
  if (event.key === "Enter") {
    submitBtn.click();
  }
}

// Adicionar o evento keydown aos campos de e-mail e senha
emailInput.addEventListener("keydown", handleEnterKey);
passwordInput.addEventListener("keydown", handleEnterKey);

submitBtn.addEventListener("click", async function (event) {
  event.preventDefault();

  const email = emailInput.value.trim(),
    password = passwordInput.value.trim();

  if (!email || !password) {
    displayMessage("Por favor, preencha todos os campos.", "rgb(236, 118, 118)");
    return;
  }

  try {
    // Autentica o usuário com e-mail e senha
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verifica se o e-mail foi verificado
    if (!user.emailVerified) {
      displayMessage("Verifique seu e-mail.", "rgb(236, 118, 118)");
      return;
    }

    // Encontra o nó de `codigoEmpresa` em que o usuário está localizado
    const codigoEmpresa = await findCodigoEmpresa(user.uid);

    // Armazena o UID e o código da empresa no localStorage
    localStorage.setItem("userUID", user.uid);
    localStorage.setItem("codigoEmpresa", codigoEmpresa);

    displayMessage("Login bem-sucedido!", "rgb(76, 175, 80)");
    setTimeout(() => (window.location.href = "index.html"), 1500);

  } catch (error) {
    displayMessage("Erro: " + error.message, "rgb(236, 118, 118)");
  }
});

async function findCodigoEmpresa(uid) {
  const dbRef = ref(database);
  const snapshot = await get(dbRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const codigoEmpresa in data) {
      if (data[codigoEmpresa].usuarios && data[codigoEmpresa].usuarios[uid]) {
        return codigoEmpresa;
      }
    }
  }
  throw new Error("Código da empresa não encontrado.");
}

function displayMessage(message, color) {
  messageField.textContent = message;
  messageField.style.color = color;
}
