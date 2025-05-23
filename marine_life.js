// Dados da vida marinha por estado
let marineLifeData = null;

// Carregar dados da vida marinha
async function loadMarineLifeData() {
    try {
        const response = await fetch('vida_marinha.json');
        const data = await response.json();
        marineLifeData = data;
        console.log('Dados de vida marinha carregados com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao carregar dados de vida marinha:', error);
        return false;
    }
}

// Obter vida marinha por estado
function getMarineLifeByState(state) {
    if (!marineLifeData || !marineLifeData.estados || !marineLifeData.estados[state]) {
        console.error('Dados de vida marinha não disponíveis para o estado:', state);
        return null;
    }
    
    return marineLifeData.estados[state];
}

// Renderizar seção de vida marinha
function renderMarineLifeSection(state) {
    const marineLifeSection = document.getElementById('marine-life-section');
    
    if (!marineLifeSection) {
        console.error('Elemento marine-life-section não encontrado');
        return;
    }
    
    const marineLifeData = getMarineLifeByState(state);
    
    if (!marineLifeData) {
        marineLifeSection.classList.add('hidden');
        return;
    }
    
    // Construir HTML da seção de vida marinha
    let marineLifeHTML = `
        <div class="marine-life-container">
            <h3>Vida Marinha de ${state}</h3>
            <p class="marine-life-description">${marineLifeData.descricao}</p>
            <div class="marine-life-species">
    `;
    
    // Adicionar cada espécie
    marineLifeData.especies.forEach(species => {
        marineLifeHTML += `
            <div class="species-card">
                <div class="species-image">
                    <img src="images/${species.imagem}" alt="${species.nome}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="species-info">
                    <h4>${species.nome}</h4>
                    <p class="scientific-name">${species.nome_cientifico}</p>
                    <p class="species-description">${species.descricao}</p>
                </div>
            </div>
        `;
    });
    
    marineLifeHTML += `
            </div>
        </div>
    `;
    
    marineLifeSection.innerHTML = marineLifeHTML;
    marineLifeSection.classList.remove('hidden');
}

// Exportar funções
window.marineLife = {
    loadData: loadMarineLifeData,
    getByState: getMarineLifeByState,
    renderSection: renderMarineLifeSection
};
