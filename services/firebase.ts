
// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// =================================================================
// ATENÇÃO: CONFIGURAÇÃO DO FIREBASE NECESSÁRIA
// =================================================================
// Esta aplicação usa variáveis de ambiente para configurar o Firebase
// de forma segura. Você precisa criar um arquivo chamado `.env`
// na raiz do seu projeto e adicionar as credenciais do SEU projeto Firebase.
//
// Siga estes passos para obter suas credenciais:
// 1. Acesse o Console do Firebase: https://console.firebase.google.com/
// 2. Selecione seu projeto (ou crie um novo).
// 3. Vá para "Configurações do projeto" (ícone de engrenagem).
// 4. Na aba "Geral", seção "Seus apps", crie um novo app da Web (</>).
// 5. Copie os valores do objeto `firebaseConfig` e cole-os no seu
//    arquivo `.env` da seguinte forma:
//
// Exemplo de arquivo `.env`:
// FIREBASE_API_KEY="AIza..."
// FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
// FIREBASE_PROJECT_ID="seu-projeto"
// FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
// FIREBASE_MESSAGING_SENDER_ID="1234567890"
// FIREBASE_APP_ID="1:12345..."
// FIREBASE_MEASUREMENT_ID="G-ABC..."
// =================================================================


const firebaseConfig = {
  apiKey: "AIzaSyCc2WOseiFM0eghOg6s3TBmWK_qGDCBJXM",
  authDomain: "travelxpirence.firebaseapp.com",
  databaseURL: "https://travelxpirence-default-rtdb.firebaseio.com",
  projectId: "travelxpirence",
  storageBucket: "travelxpirence.firebasestorage.app",
  messagingSenderId: "145088420696",
  appId: "1:145088420696:web:74e0b3bba7a8f29995232d",
  measurementId: "G-ZKHQ09GK9F"
};


// Validação para garantir que as variáveis de ambiente foram configuradas.
const requiredKeys: (keyof typeof firebaseConfig)[] = [
    'apiKey', 'authDomain', 'projectId', 'appId'
];

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
    throw new Error(`CONFIGURAÇÃO INCOMPLETA DO FIREBASE: As seguintes variáveis de ambiente estão faltando: ${missingKeys.join(', ')}. Por favor, crie um arquivo .env na raiz do projeto e adicione as credenciais do seu projeto Firebase. Veja as instruções em 'services/firebase.ts'.`);
}


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();
export const firestore = firebase.firestore();
