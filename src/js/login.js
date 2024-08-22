import { auth, database } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { ref, get, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Seleciona os elementos do DOM
const submitBtn = document.querySelector('.submit');
const userInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');
const messageField = document.querySelector('.label-message');

submitBtn.addEventListener('click', async function(event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    const username = userInput.value.trim();
    const password = passwordInput.value.trim();

    // Verifica se os campos estão preenchidos
    if (!username || !password) {
        messageField.textContent = 'Por favor, preencha todos os campos.';
        messageField.style.color = 'rgb(236, 118, 118)'; // Cor para mensagem de erro
        return;
    }

    try {
        const rootRef = ref(database);
        const snapshot = await get(rootRef);

        let userEmail = null;
        snapshot.forEach(cnpjSnapshot => {
            const usersRef = child(cnpjSnapshot.ref, 'usuarios');
            cnpjSnapshot.forEach(userSnapshot => {
                const userData = userSnapshot.val();
                if (userData.usuario === username) {
                    userEmail = userData.email;
                    return true; // Encerra o loop se o usuário for encontrado
                }
            });
            if (userEmail) {
                return true; // Encerra o loop externo se o usuário for encontrado
            }
        });

        if (!userEmail) {
            throw new Error('Usuário não encontrado.');
        }

        // Tenta autenticar o usuário
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
        const user = userCredential.user;

        // Verifica se o e-mail está verificado
        if (!user.emailVerified) {
            messageField.textContent = 'Verifique seu e-mail.';
            messageField.style.color = 'rgb(236, 118, 118)'; // Cor para mensagem de erro
            return;
        }

        // Redireciona para a página principal ou realiza outra ação de sucesso
        messageField.textContent = 'Login bem-sucedido!';
        messageField.style.color = 'rgb(76, 175, 80)'; // Cor para mensagem de sucesso

        setTimeout(() => {
            window.location.href = 'index.html'; // Redireciona para a página inicial
        }, 1500);

    } catch (error) {
        console.error(`Erro ao fazer login: ${error.code} - ${error.message}`);
        messageField.textContent = `Erro: ${error.message}`;
        messageField.style.color = 'rgb(236, 118, 118)'; // Cor para mensagem de erro
    }
});
