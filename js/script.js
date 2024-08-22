import { auth, database, storage } from "./firebase.js";
import {
  ref as databaseRef,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import {
  ref as storageRef,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Referências para os elementos
const profilePicElement = document.querySelector(".dp");
const logoutButton = document.querySelector(".logout");

// Função para redirecionar para a página de login
function redirectToLogin() {
  window.location.href = "login.html";
}

// Função para definir a imagem de perfil
async function setProfilePicture(url) {
  profilePicElement.style.backgroundImage = `url(${url})`;
}

// Função para carregar a foto de perfil do usuário
async function loadProfilePicture(codigoEmpresa, uid) {
  const userRef = child(
    databaseRef(database),
    `${codigoEmpresa}/usuarios/${uid}`
  );
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const { foto: fotoData } = snapshot.val();
    const defaultPicURL = "img/default_profile_pic.png";
    let profilePicURL = defaultPicURL;

    if (fotoData) {
      const fotoPath = `${codigoEmpresa}/fotos_perfil/${uid}/${fotoData}`;
      const fotoRef = storageRef(storage, fotoPath);

      try {
        profilePicURL = await getDownloadURL(fotoRef);
      } catch {
        profilePicURL = defaultPicURL;
      }
    }

    setProfilePicture(profilePicURL);
  } else {
    redirectToLogin();
  }
}

// Função para verificar autenticação e carregar a foto do perfil
async function verifyUserAndLoadProfilePicture() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const codigoEmpresa = localStorage.getItem("codigoEmpresa");

      if (!codigoEmpresa) {
        redirectToLogin();
      } else {
        await loadProfilePicture(codigoEmpresa, uid);
      }
    } else {
      redirectToLogin();
    }
  });
}

// Função para realizar o logout
function logout() {
  localStorage.removeItem("codigoEmpresa");
  localStorage.removeItem("outroDadoQueDesejaRemover");
  redirectToLogin();
}

// Inicializa a verificação do usuário e o carregamento da foto do perfil
verifyUserAndLoadProfilePicture();

// Adiciona evento de clique ao botão de logout
logoutButton.addEventListener("click", logout);

// Adiciona eventos de clique para a navegação
document.querySelectorAll(".nav-option").forEach((option) => {
  option.addEventListener("click", function () {
    document
      .querySelectorAll(".nav-option")
      .forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");

    document
      .querySelectorAll(".main > div")
      .forEach((section) => (section.style.display = "none"));

    const targetId = this.classList[1];
    document.getElementById(targetId).style.display = "block";
  });
});
