const accessCodes = {
  'aB9x-Yz!2W': { id: 'apto1', name: 'João Paulo' },
  'cDe5_Fg#H7': { id: 'apto101', name: 'Lizandro' },
  'iJk1$Lm%N3': { id: 'apto102', name: 'Felipe Granja' },
  'oPq8^Rs&T4': { id: 'apto201', name: 'Jorge' },
  'xY7z!aB-cD': { id: 'apto201', name: 'Ângela' },
  'FgH7+iJk=1': { id: 'apto302', name: 'Suzane' },
  'LmN3[oPq]8': { id: 'apto401', name: 'Célia' }
};

let activeApartmentButtonId = null;

function enableApartment() {
  const code = document.getElementById('accessCode').value;
  const userData = accessCodes[code];

  if (userData) {
    const { id, name } = userData;

    document.querySelectorAll('.apartment-button').forEach(btn => btn.disabled = true);

    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-container').style.display = 'none';
    document.getElementById('viewer-container').style.display = 'none';

    document.getElementById(id).disabled = false;
    activeApartmentButtonId = id;

    document.getElementById('welcome-message').innerHTML = `Seja bem-vindo(a), ${name}. Clique no botão do seu apartamento para acessar seus boletos.`;

    document.getElementById('accessCode').value = '';

    // Adiciona o log do Firebase
    const db = getDatabase();
    const logsRef = ref(db, 'logs/');
    push(logsRef, {
      accessCode: code,
      userName: name,
      timestamp: new Date().toISOString()
    });
  } else {
    alert('Código de acesso inválido.');
  }
}

function showFiles(apartment) {
  const fileContainer = document.getElementById('file-container');
  const fileList = document.getElementById('file-list');
  const viewerContainer = document.getElementById('viewer-container');
  const fileViewer = document.getElementById('file-viewer');

  fileContainer.style.display = 'none';
  fileList.innerHTML = '';

  document.getElementById('apartment-number').textContent = apartment;
  fileContainer.style.display = 'block';

  fileContainer.classList.remove('active');
  setTimeout(() => fileContainer.classList.add('active'), 50);

  let files = getFilesForApartment(apartment);

  if (apartment === '1') {
    files.push(
      { name: 'Boleto Condomínio (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1a.pdf' },
      { name: 'Boleto Acordo M2D (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1a.pdf' },
      { name: 'Boleto Hidro/Eletr (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1a.pdf' },
      { name: 'Boleto Condomínio (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1b.pdf' },
      { name: 'Boleto Acordo M2D (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1b.pdf' },
      { name: 'Boleto Hidro/Eletr (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1b.pdf' }
    );
  }

  files.forEach(file => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = "#";
    link.textContent = file.name;

    const isMobile = window.innerWidth <= 768;

    link.onclick = function (event) {
      event.preventDefault();
      if (isMobile) {
        window.open(file.path, "_blank");
      } else {
        openFileViewer(file.path);
      }
    };

    listItem.appendChild(link);
    fileList.appendChild(listItem);
  });

  // Adiciona o log do Firebase
  const db = getDatabase();
  const logsRef = ref(db, 'logs/');
  push(logsRef, {
    apartment: apartment,
    timestamp: new Date().toISOString(),
    action: 'showFiles'
  });

  viewerContainer.style.display = 'none';
}

function openFileViewer(filePath) {
  const viewerContainer = document.getElementById('viewer-container');
  const fileViewer = document.getElementById('file-viewer');
  const downloadButton = document.getElementById('download-button');

  fileViewer.src = filePath;
  downloadButton.href = filePath;

  // Adiciona o log do Firebase
  const db = getDatabase();
  const logsRef = ref(db, 'logs/');
  push(logsRef, {
    apartment: document.getElementById('apartment-number').textContent,
    fileOpened: filePath,
    timestamp: new Date().toISOString(),
    action: 'openFileViewer'
  });

  downloadButton.addEventListener('click', () => {
    const db = getDatabase();
    const logsRef =
