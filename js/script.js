import { auth, database, storage } from "./firebase.js";
import {
  ref as databaseRef,
  get,
  child,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import {
  ref as storageRef,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { onAuthStateChanged, updatePassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Seletores de elementos DOM
const profilePicElement = document.querySelector(".dp");
const logoutButton = document.querySelector(".logout");
const navOptions = document.querySelectorAll(".nav-option");
const contactsContainer = document.getElementById("contacts-container");
const defaultPicURL = "img/default_profile_pic.png";

// Função para redirecionar para uma URL
function redirectTo(url) {
  window.location.href = url;
}

// Função para exibir uma seção específica e atualizar a navegação
function displaySection(sectionId) {
  document.querySelectorAll(".main > div").forEach((section) => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  navOptions.forEach((opt) => opt.classList.remove("active"));
  const navOption = document.querySelector(`.nav-option.${sectionId}`);
  if (navOption) navOption.classList.add("active");
}

// Função para definir a imagem de perfil
function updateProfilePicture(url) {
  if (profilePicElement) {
    profilePicElement.style.backgroundImage = `url(${url})`;
  }
}

// Função para carregar dados do usuário
async function getUserData(codigoEmpresa, uid) {
  try {
    const userRef = child(databaseRef(database), `${codigoEmpresa}/usuarios/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return redirectTo("login.html");
    }

    return snapshot.val();
  } catch {
    return null;
  }
}

// Função para carregar a foto de perfil do usuário
async function loadProfilePicture(codigoEmpresa, uid) {
  const userData = await getUserData(codigoEmpresa, uid);

  if (userData) {
    const fotoData = userData.foto;
    let profilePicURL = defaultPicURL;

    if (fotoData) {
      const fotoPath = `${codigoEmpresa}/fotos_perfil/${uid}/${fotoData}`;
      const fotoRef = storageRef(storage, fotoPath);
      profilePicURL = await getDownloadURL(fotoRef);
    }

    updateProfilePicture(profilePicURL);
  } else {
    updateProfilePicture(defaultPicURL);
  }
}

// Função para abreviar o sobrenome
function abreviarSobrenome(nomeCompleto) {
  const partes = nomeCompleto.split(' ');

  if (partes.length < 2) {
    return nomeCompleto;
  }

  const primeiroNome = partes[0];
  const sobrenomes = partes.slice(1);
  const sobrenomeAbreviado = sobrenomes.length > 1 
    ? `${sobrenomes[0][0]}.`
    : sobrenomes[0];
    
  return `${primeiroNome} ${sobrenomeAbreviado} ${sobrenomes.slice(1).join(' ')}`;
}

// Função para carregar contatos do banco de dados, excluindo o usuário logado
function loadContacts(codigoEmpresa, currentUserUid) {
  try {
    const usersRef = child(databaseRef(database), `${codigoEmpresa}/usuarios`);

    // Adiciona o listener em tempo real
    onValue(usersRef, async (snapshot) => {
      const usersContainer = document.getElementById('contacts-container');
      usersContainer.innerHTML = ''; // Limpa o container antes de adicionar novos contatos

      if (snapshot.exists()) {
        const users = snapshot.val();

        for (const [userId, user] of Object.entries(users)) {
          if (userId !== currentUserUid) { // Exclui o usuário logado
            const fotoPath = user.foto ? `${codigoEmpresa}/fotos_perfil/${userId}/${user.foto}` : defaultPicURL;

            let profilePicURL = defaultPicURL;
            if (user.foto) {
              try {
                const fotoRef = storageRef(storage, fotoPath);
                profilePicURL = await getDownloadURL(fotoRef);
              } catch (error) {
                console.error(`Erro ao obter URL da foto para ${userId}:`, error);
              }
            }

            const nomeAbreviado = abreviarSobrenome(user.nome + ' ' + user.sobrenome);

            // Cria um elemento de contato e inclui dados adicionais
            const contactElement = document.createElement('div');
            contactElement.className = 'contact';
            contactElement.dataset.cargo = user.cargo || 'Cargo não disponível'; // Armazena o cargo no dataset
            contactElement.dataset.setor = user.setor || 'Setor não disponível'; // Armazena o setor no dataset
            contactElement.dataset.segmento = user.segmento || 'Segmento não disponível'; // Armazena o segmento no dataset
            contactElement.dataset.userId = userId; // Adiciona o userId ao dataset
            contactElement.innerHTML = `
              <div class="contact-img" style="background-image: url(${profilePicURL});"></div>
              <div class="contact-info">
                <p class="contact-name">${nomeAbreviado}</p>
                <p class="contact-message">Mensagem recente</p> <!-- Ajuste isso conforme necessário -->
              </div>
            `;
            usersContainer.appendChild(contactElement);
          }
        }
      }
    }, {
      onlyOnce: false // Define o listener para ouvir atualizações contínuas
    });

  } catch (error) {
    console.error("Erro ao carregar contatos:", error);
  }
}

let codigoEmpresaGlobal;

// Seletores de elementos DOM
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const cargoSelect = document.getElementById("cargo");
const setorSelect = document.getElementById("setor");
const segmentoSelect = document.getElementById("segmento");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("password");

// Função para preencher o formulário com os dados do usuário
function populateProfileForm(userData) {
  if (userData) {
    firstNameInput.value = userData.nome || "";
    lastNameInput.value = userData.sobrenome || "";
    cargoSelect.value = userData.cargo || "analista"; // Valor padrão
    setorSelect.value = userData.setor || "contabil"; // Valor padrão
    segmentoSelect.value = userData.segmento || "comercio"; // Valor padrão
    emailInput.value = userData.email || ""; // Não editável
    senhaInput.value = userData.senha || ""; // Preenche o campo de senha
  }
}

// Atualiza a função initializeUserProfile para preencher o formulário
async function initializeUserProfile() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      return redirectTo("login.html");
    }

    const uid = user.uid;
    codigoEmpresaGlobal = localStorage.getItem("codigoEmpresa");

    if (!codigoEmpresaGlobal) {
      return redirectTo("login.html");
    }

    const userData = await getUserData(codigoEmpresaGlobal, uid);
    populateProfileForm(userData); // Preenche o formulário com os dados do usuário
    await loadProfilePicture(codigoEmpresaGlobal, uid);
    await loadContacts(codigoEmpresaGlobal, uid);
  });
}

// Função para realizar o logout
function handleLogout() {
  localStorage.clear();
  redirectTo("login.html");
}

// Inicializa a verificação do usuário e o carregamento da foto do perfil
initializeUserProfile();

// Adiciona eventos
if (profilePicElement) {
  profilePicElement.addEventListener("click", () => displaySection("profile"));
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

navOptions.forEach((option) => {
  option.addEventListener("click", () => {
    displaySection(option.classList[1]);
  });
});

// Função para atualizar o cabeçalho do chat com base no contato selecionado
function updateChatHeader(nome, imagemURL, cargo, setor, segmento) {
  const chatHeaderContainer = document.getElementById('chat-header-container');

  // Atualiza o conteúdo do cabeçalho do chat
  chatHeaderContainer.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-img" style="background-image: url(${imagemURL});"></div>
      <div class="chat-header-info">
        <h3>${nome}</h3>
        <p>${cargo} ${setor} | ${segmento}</p>
      </div>
    </div>
  `;
}

async function handleContactClick(nome, imagemURL, cargo, setor, segmento, contactUserId) {
  const currentUserUid = auth.currentUser.uid;
  
  const chatId = generateChatId(currentUserUid, contactUserId);
  
  currentChatUserId = contactUserId; // Atualiza o ID do usuário do chat atual
  
  updateChatHeader(nome, imagemURL, cargo, setor, segmento);
  
  displaySection('chats'); // Exibe a seção de chats
  
  await loadMessages(codigoEmpresaGlobal, chatId, currentUserUid);
}

// Função para gerar o chatId baseado nos IDs dos usuários
function generateChatId(userId1, userId2) {
  const [id1, id2] = [userId1, userId2].sort(); // Ordena os IDs alfabeticamente
  return `${id1}_${id2}`;
}

async function loadMessages(codigoEmpresa, chatId, currentUserUid) {
  try {
    const messagesRef = child(databaseRef(database), `${codigoEmpresa}/chats/${chatId}/messages`);

    // Adiciona o listener em tempo real
    onValue(messagesRef, (snapshot) => {
      const chatContainer = document.getElementById('chat-container');
      chatContainer.innerHTML = ''; // Limpa o container antes de adicionar novas mensagens

      if (snapshot.exists()) {
        const messages = snapshot.val();
        const sortedMessages = Object.entries(messages).sort((a, b) => a[1].timestamp - b[1].timestamp);

        let lastDate = null;

        sortedMessages.forEach(([messageId, message]) => {
          const messageDate = new Date(message.timestamp);
          const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formattedDate = messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

          // Verifica se é a primeira mensagem de um novo dia
          if (lastDate !== formattedDate) {
            lastDate = formattedDate;
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.innerHTML = formattedDate;
            chatContainer.appendChild(dateHeader);
          }

          const messageElement = document.createElement('div');
          messageElement.className = message.sender === currentUserUid ? 'message sent' : 'message received';
          messageElement.innerHTML = `
            <p>${message.content}</p>
            <span class="message-time">${formattedTime}</span>
          `;
          chatContainer.appendChild(messageElement);
        });

        // Rola o container para mostrar a última mensagem
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, {
      onlyOnce: false // Define o listener para ouvir atualizações contínuas
    });

  } catch (error) {
    console.error("Erro ao carregar mensagens:", error);
  }
}

// Função para gerar um ID aleatório
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

// Função para enviar uma nova mensagem
async function sendMessage(content) {
  const currentUserUid = auth.currentUser.uid;
  const chatId = generateChatId(currentUserUid, currentChatUserId);
  const timestamp = Date.now();
  const messageId = generateRandomId();

  try {
    const newMessage = {
      sender: currentUserUid,
      content,
      timestamp
    };

    const chatRef = child(databaseRef(database), `${codigoEmpresaGlobal}/chats/${chatId}/messages/${messageId}`);
    await set(chatRef, newMessage);
    
    // Atualiza o chat com a nova mensagem
    await loadMessages(codigoEmpresaGlobal, chatId, currentUserUid);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}

document.getElementById('send-message-button').addEventListener('click', () => {
  const messageInput = document.getElementById('message-input');
  const content = messageInput.value.trim();

  if (content) {
    sendMessage(content);
    messageInput.value = '';
  }
});

contactsContainer.addEventListener('click', (event) => {
  const contactElement = event.target.closest('.contact');
  if (contactElement) {
    const contactUserId = contactElement.dataset.userId;
    const nome = contactElement.querySelector('.contact-name').textContent;
    const imagemURL = contactElement.querySelector('.contact-img').style.backgroundImage.slice(5, -2);
    const cargo = contactElement.dataset.cargo;
    const setor = contactElement.dataset.setor;
    const segmento = contactElement.dataset.segmento;
    
    handleContactClick(nome, imagemURL, cargo, setor, segmento, contactUserId);
  }
});

document.getElementById('message-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Impede a quebra de linha no campo de entrada
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();

    if (content) {
      sendMessage(content);
      messageInput.value = '';
    }
  }
});

document.getElementById('toggle-password').addEventListener('click', function() {
  const passwordInput = document.getElementById('password');
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
});

document.addEventListener('DOMContentLoaded', function() {
  function toggleSelectMenu(menuId) {
    const menu = document.getElementById(menuId);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }

  function selectValue(value, inputId) {
    document.getElementById(inputId).value = value;
    document.querySelector(`#${inputId}-menu`).style.display = 'none';
  }

  // Close all menus when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.matches('.select-button')) {
      document.querySelectorAll('.select-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });

  // Expor funções para o escopo global
  window.toggleSelectMenu = toggleSelectMenu;
  window.selectValue = selectValue;
});

// Função para atualizar a senha no Firebase Authentication
async function updateUserPassword(newPassword) {
  const user = auth.currentUser.uid;;
  if (user) {
    try {
      await updatePassword(user, newPassword);
      console.log("Senha atualizada no Firebase Authentication com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar senha no Firebase Authentication:", error.message);
      throw error;  // Repassa o erro para o tratamento na chamada da função
    }
  } else {
    console.error("Nenhum usuário autenticado.");
    throw new Error("Nenhum usuário autenticado.");
  }
}

// Função para atualizar a senha no banco de dados
async function updateUserDatabasePassword(uid, newPassword) {
  const codigoEmpresa = localStorage.getItem("codigoEmpresa");
  const userRef = child(databaseRef(database), `${codigoEmpresa}/usuarios/${uid}`);

  try {
    // Atualiza a senha no banco de dados
    await update(userRef, { senha: newPassword });
    console.log("Senha atualizada no banco de dados com sucesso.");
  } catch (error) {
    console.error("Erro ao atualizar senha no banco de dados:", error.message);
    throw error;  // Repassa o erro para o tratamento na chamada da função
  }
}

document.getElementById('confirm-button').addEventListener('click', async () => {
  const nome = firstNameInput.value.trim();
  const sobrenome = lastNameInput.value.trim();
  const cargo = cargoSelect.value;
  const setor = setorSelect.value;
  const segmento = segmentoSelect.value;
  const password = senhaInput.value.trim();

  const uid = auth.currentUser.uid;
  
  try {
    const codigoEmpresa = localStorage.getItem("codigoEmpresa");
    const userRef = child(databaseRef(database), `${codigoEmpresa}/usuarios/${uid}`);
    
    // Obtém os dados atuais do usuário
    const snapshot = await get(userRef);
    const userData = snapshot.exists() ? snapshot.val() : {};

    // Cria um objeto com os dados atuais e atualiza apenas os campos informados
    const updates = {
      ...userData,
      nome: nome || userData.nome,
      sobrenome: sobrenome || userData.sobrenome,
      cargo: cargo || userData.cargo,
      setor: setor || userData.setor,
      segmento: segmento || userData.segmento,
    };

    // Atualiza os dados no Firebase
    await set(userRef, updates);

    // Se a senha for fornecida, atualize também a senha do usuário
    if (password) {
      await updateUserPassword(password); // Atualiza no Firebase Authentication
      await updateUserDatabasePassword(uid, password); // Atualiza no banco de dados
    }
    
    alert("Dados atualizados com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar dados:", error.message);
    alert("Erro ao atualizar dados. Tente novamente.");
  }
});

const changePasswordButton = document.getElementById("change-password-btn");

async function handleChangePassword() {
  const user = auth.currentUser;
  const email = user.email;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Um e-mail para redefinir sua senha foi enviado para " + email);
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição de senha:", error);
    alert("Ocorreu um erro ao tentar enviar o e-mail de redefinição de senha.");
  }
}

// Adiciona evento ao botão de alteração de senha
if (changePasswordButton) {
  changePasswordButton.addEventListener("click", handleChangePassword);
}