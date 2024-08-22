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

// Função para redirecionar
function redirectTo(url) {
  window.location.href = url;
}

// Função para redirecionar e exibir a seção
function redirectToSection(sectionId) {
  document.querySelectorAll(".main > div").forEach((section) => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  document
    .querySelectorAll(".nav-option")
    .forEach((opt) => opt.classList.remove("active"));
  const navOption = document.querySelector(`.nav-option.${sectionId}`);
  if (navOption) navOption.classList.add("active");
}

// Função para definir a imagem de perfil
async function setProfilePicture(url) {
  if (profilePicElement) {
    profilePicElement.style.backgroundImage = `url(${url})`;
  }
}

// Função para carregar a foto de perfil do usuário
async function loadProfilePicture(codigoEmpresa, uid) {
  const userRef = child(
    databaseRef(database),
    `${codigoEmpresa}/usuarios/${uid}`
  );
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const fotoData = snapshot.val().foto;
    const defaultPicURL = "img/default_profile_pic.png";
    let profilePicURL = defaultPicURL;

    if (fotoData) {
      const fotoPath = `${codigoEmpresa}/fotos_perfil/${uid}/${fotoData}`;
      const fotoRef = storageRef(storage, fotoPath);
      try {
        profilePicURL = await getDownloadURL(fotoRef);
      } catch {
        // Use default picture if an error occurs
      }
    }

    setProfilePicture(profilePicURL);
  } else {
    redirectTo("login.html");
  }
}

// Função para verificar autenticação e carregar a foto do perfil
function verifyUserAndLoadProfilePicture() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const codigoEmpresa = localStorage.getItem("codigoEmpresa");

      if (codigoEmpresa) {
        await loadProfilePicture(codigoEmpresa, uid);
      } else {
        redirectTo("login.html");
      }
    } else {
      redirectTo("login.html");
    }
  });
}

// Função para realizar o logout
function logout() {
  localStorage.clear(); // Limpa todos os dados do localStorage
  redirectTo("login.html");
}

// Inicializa a verificação do usuário e o carregamento da foto do perfil
verifyUserAndLoadProfilePicture();

// Adiciona eventos
if (profilePicElement) {
  profilePicElement.addEventListener("click", () =>
    redirectToSection("profile")
  );
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

document.querySelectorAll(".nav-option").forEach((option) => {
  option.addEventListener("click", function () {
    redirectToSection(this.classList[1]);
  });
});
