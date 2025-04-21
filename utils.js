import { getFirestore, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

async function fetchDatabaseURL() {
    const app = getApp(); // Obtém a instância do aplicativo Firebase já inicializada
    const firestore = getFirestore(app);
    const variablesCollection = collection(firestore, 'variables');
    const databaseURLDoc = doc(variablesCollection, 'FIREBASE_DATABASE_URL');

    try {
        const docSnap = await getDoc(databaseURLDoc);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.DATABASE_URL; // Lembre-se que o nome do campo no seu documento é 'DATABASE_URL'
        } else {
            console.error("Documento 'FIREBASE_DATABASE_URL' não encontrado no Firestore");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar databaseURL do Firestore:", error);
        return null;
    }
}

export { fetchDatabaseURL };