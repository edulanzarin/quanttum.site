import { auth, database, storage } from './firebase.js';
import { ref as databaseRef, get, child } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';
import { ref as storageRef, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// Referência para o elemento da foto de perfil
const profilePicElement = document.querySelector('.dp');

// Função para carregar a foto de perfil
async function loadProfilePicture() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const uid = user.uid;

                const codigoEmpresa = localStorage.getItem('codigoEmpresa'); // Recupera o código da empresa do localStorage

                if (!codigoEmpresa) {
                    profilePicElement.style.backgroundImage = 'url(img/default_profile_pic.png)';
                    return;
                }

                // Construir o caminho para o nó do usuário
                const userRef = child(databaseRef(database), `${codigoEmpresa}/usuarios/${uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.val();

                    const fotoData = userData.foto; // Nome da imagem

                    let profilePicURL = 'img/default_profile_pic.png'; // URL padrão

                    if (fotoData) {
                        // Construir o caminho completo para o arquivo da foto no Storage
                        const fotoPath = `${codigoEmpresa}/fotos_perfil/${uid}/${fotoData}`;

                        const fotoRef = storageRef(storage, fotoPath);
                        try {
                            profilePicURL = await getDownloadURL(fotoRef);
                        } catch {
                            // Se houver um erro ao obter a URL, use a imagem padrão
                            profilePicURL = 'img/default_profile_pic.png';
                        }
                    }

                    profilePicElement.style.backgroundImage = `url(${profilePicURL})`;

                } else {
                    profilePicElement.style.backgroundImage = 'url(img/default_profile_pic.png)';
                }
            } catch {
                profilePicElement.style.backgroundImage = 'url(img/default_profile_pic.png)';
            }
        } else {
            profilePicElement.style.backgroundImage = 'url(img/default_profile_pic.png)';
        }
    });
}

// Chama a função para carregar a foto de perfil
loadProfilePicture();
