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
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

// Atualiza a função initializeUserProfile para definir a variável global
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

let currentChatUserId = null;

function getCurrentChatUserId() {
  return currentChatUserId;
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

