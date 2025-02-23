const accessCodes = {
    'aB9x-Yz!2W': 'apto1',
    'cDe5_Fg#H7': 'apto101',
    'iJk1$Lm%N3': 'apto102',
    'oPq8^Rs&T4': 'apto201',
    'xY7z!aB-cD': 'apto201',
    'FgH7+iJk=1': 'apto302',
    'LmN3[oPq]8': 'apto401'
};

const apartmentNames = {
    'apto1': 'João Paulo',
    'apto101': 'Lizandro',
    'apto102': 'Felipe Granja',
    'apto201': 'Jorge',
    'apto201': 'Ângela',
    'apto302': 'Suzane',
    'apto401': 'Célia'
};

const accessCodeOwners = {
    'aB9x-Yz!2W': 'João Paulo',
    'cDe5_Fg#H7': 'Lizandro',
    'iJk1$Lm%N3': 'Felipe Granja',
    'oPq8^Rs&T4': 'Jorge',
    'xY7z!aB-cD': 'Ângela',
    'FgH7+iJk=1': 'Suzane',
    'LmN3[oPq]8': 'Célia'
};

let activeApartmentButtonId = null;

function enableApartment() {
    const code = document.getElementById('accessCode').value;
    const apartmentButtonId = accessCodes[code];
    const ownerName = accessCodeOwners[code];

    if (apartmentButtonId) {
        if (activeApartmentButtonId) {
            document.getElementById(activeApartmentButtonId).disabled = true;
        }

        document.getElementById('file-list').innerHTML = '';
        document.getElementById('file-container').style.display = 'none';

        document.getElementById(apartmentButtonId).disabled = false;
        activeApartmentButtonId = apartmentButtonId;

        document.getElementById('welcome-message').innerHTML = `Seja bem-vindo(a), ${ownerName}. Abaixo estão os seus boletos. Clique sobre eles para baixá-los:`;

        document.getElementById('accessCode').value = '';
    } else {
        alert('Código de acesso inválido.');
    }
}

function getFilesForApartment(apartmentId) {
    const apartmentName = apartmentNames[apartmentId];
    let files = [];

    if (apartmentName) {
        if (apartmentName === 'João Paulo') {
            files = ['boleto_joao_1.pdf', 'boleto_joao_2.pdf'];
        } else if (apartmentName === 'Lizandro') {
            files = ['boleto_lizandro_1.pdf', 'boleto_lizandro_2.pdf'];
        } else if (apartmentName === 'Felipe Granja') {
            files = ['boleto_felipe_1.pdf', 'boleto_felipe_2.pdf'];
        } else if (apartmentName === 'Jorge') {
            files = ['boleto_jorge_1.pdf', 'boleto_jorge_2.pdf'];
        } else if (apartmentName === 'Ângela') {
            files = ['boleto_angela_1.pdf', 'boleto_angela_2.pdf'];
        } else if (apartmentName === 'Suzane') {
            files = ['boleto_suzane_1.pdf', 'boleto_suzane_2.pdf'];
        } else if (apartmentName === 'Célia') {
            files = ['boleto_celia_1.pdf', 'boleto_celia_2.pdf'];
        }

        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';

        files.forEach(file => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = file;
            link.textContent = file;
            link.download = file;
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        });

        document.getElementById('file-container').style.display = 'block';
    } else {
        alert('Apartamento não encontrado.');
    }
}
