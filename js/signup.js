import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "./firebase.js";
import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const slidePage = document.querySelector(".slide-page");
const nextBtnFirst = document.querySelector(".firstNext");
const prevBtnSec = document.querySelector(".prev-1");
const nextBtnSec = document.querySelector(".next-1");
const prevBtnThird = document.querySelector(".prev-2");
const nextBtnThird = document.querySelector(".next-2");
const prevBtnFourth = document.querySelector(".prev-3");
const submitBtn = document.querySelector(".submit");
const progressText = document.querySelectorAll(".step p");
const progressCheck = document.querySelectorAll(".step .check");
const bullet = document.querySelectorAll(".step .bullet");

let current = 1;

function showError(step, message) {
  const label = document.querySelector(`.field-${step} .label-${step}`);
  label.textContent = message;
  label.style.visibility = "visible";
}

function hideError(step) {
  const label = document.querySelector(`.field-${step} .label-${step}`);
  label.style.visibility = "hidden";
}

function checkFields(step) {
  const fields = document.querySelectorAll(`.page:nth-of-type(${step}) input`);
  let valid = true;

  fields.forEach((field) => {
    if (field.value.trim() === "") {
      showError(step, "Por favor, preencha todos os campos.");
      valid = false;
    }
  });

  if (valid) hideError(step);
  return valid;
}

nextBtnFirst.addEventListener("click", function (event) {
  event.preventDefault();
  if (checkFields(1)) {
    slidePage.style.marginLeft = "-25%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;
  }
});

nextBtnSec.addEventListener("click", function (event) {
  event.preventDefault();
  if (checkFields(2)) {
    slidePage.style.marginLeft = "-50%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;
  }
});

nextBtnThird.addEventListener("click", function (event) {
  event.preventDefault();
  if (checkFields(3)) {
    slidePage.style.marginLeft = "-75%";
    bullet[current - 1].classList.add("active");
    progressCheck[current - 1].classList.add("active");
    progressText[current - 1].classList.add("active");
    current += 1;
  }
});

submitBtn.addEventListener("click", async function (event) {
  event.preventDefault();

  const inputs = document.querySelectorAll(
    ".page:nth-of-type(1) input[type='text']"
  );
  const nameInput = inputs[0].value.trim();
  const surnameInput = inputs[1].value.trim();
  const emailInput = document
    .querySelector(".page:nth-of-type(2) input[type='email']")
    .value.trim();
  const passwordInput = document
    .querySelector(".page:nth-of-type(4) input[type='password']")
    .value.trim();
  const cargoSelect = document.querySelector(
    ".page:nth-of-type(2) select"
  ).value;
  const setorSelect = document.querySelector(
    ".page:nth-of-type(3) select"
  ).value;
  const segmentoSelect = document.querySelector(
    ".page:nth-of-type(3) select"
  ).value;
  const usuarioInput = document
    .querySelector(".page:nth-of-type(4) input[type='text']")
    .value.trim();

  if (checkFields(4)) {
    try {
      if (!emailInput || !passwordInput) {
        throw new Error("O e-mail e a senha são obrigatórios.");
      }

      if (passwordInput.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      const db = getDatabase();
      const usuariosRef = ref(db, "usuarios/");
      const snapshot = await get(usuariosRef);
      let emailExists = false;
      let usernameExists = false;

      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        if (childData.email === emailInput) {
          emailExists = true;
        }
        if (childData.usuario === usuarioInput) {
          usernameExists = true;
        }
      });

      if (emailExists) {
        throw new Error("O e-mail já está em uso.");
      }

      if (usernameExists) {
        throw new Error("O nome de usuário já está em uso.");
      }

      // Criar novo usuário se não existir
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailInput,
        passwordInput
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      // Salvar informações do usuário no banco de dados
      const userRefNew = ref(db, "usuarios/" + user.uid);
      await set(userRefNew, {
        nome: nameInput,
        sobrenome: surnameInput,
        email: emailInput,
        cargo: cargoSelect,
        setor: setorSelect,
        segmento: segmentoSelect,
        usuario: usuarioInput,
        senha: passwordInput,
      });

      bullet[current - 1].classList.add("active");
      progressCheck[current - 1].classList.add("active");
      progressText[current - 1].classList.add("active");

      const successLabel = document.querySelector(".field-4 .label-4");
      successLabel.textContent =
        "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar sua conta.";
      successLabel.style.color = "rgb(76, 175, 80)";
      successLabel.style.visibility = "visible";

      setTimeout(function () {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error(`Erro ao criar usuário: ${error.code} - ${error.message}`);
      const errorLabel = document.querySelector(".field-4 .label-4");
      errorLabel.textContent = `Erro: ${error.message}`;
      errorLabel.style.color = "rgb(236, 118, 118)";
      errorLabel.style.visibility = "visible";
    }
  }
});

prevBtnSec.addEventListener("click", function (event) {
  event.preventDefault();
  slidePage.style.marginLeft = "0%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});

prevBtnThird.addEventListener("click", function (event) {
  event.preventDefault();
  slidePage.style.marginLeft = "-25%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});

prevBtnFourth.addEventListener("click", function (event) {
  event.preventDefault();
  slidePage.style.marginLeft = "-50%";
  bullet[current - 2].classList.remove("active");
  progressCheck[current - 2].classList.remove("active");
  progressText[current - 2].classList.remove("active");
  current -= 1;
});
