// Dados das praias
let beachesData = [];
let currentNotificationIndex = 0;

// Mensagens de conscientização
const awarenessMessages = [
    "Sabia que 80% do lixo marinho vem de atividades terrestres? Descarte seu lixo corretamente!",
    "Uma garrafa plástica pode levar mais de 450 anos para se decompor no oceano.",
    "Pequenas ações fazem grande diferença: evite usar canudos plásticos e sacolas descartáveis.",
    "Peixes e tartarugas marinhas confundem plástico com alimento, causando sua morte.",
    "Ao visitar a praia, sempre leve seu lixo de volta. Deixe apenas suas pegadas na areia.",
    "Microplásticos já foram encontrados em mais de 114 espécies marinhas consumidas por humanos.",
    "Recifes de coral abrigam 25% de toda a vida marinha e estão ameaçados pela poluição.",
    "A cada ano, 8 milhões de toneladas de plástico são despejadas nos oceanos.",
    "Prefira protetor solar biodegradável para proteger os recifes de coral.",
    "Participe de mutirões de limpeza de praias na sua região!"
];

// Carregar dados das praias
async function loadBeachesData() {
    try {
        const response = await fetch('praias_atualizadas.json');
        const data = await response.json();
        beachesData = data.praias;
        
        // Atualizar a data da última atualização
        document.getElementById('last-update').textContent = data.metadados.ultima_atualizacao;
        
        console.log('Dados carregados com sucesso:', beachesData.length, 'praias');
        return true;
    } catch (error) {
        console.error('Erro ao carregar dados das praias:', error);
        showErrorMessage('Não foi possível carregar os dados das praias. Por favor, tente novamente mais tarde.');
        return false;
    }
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notification.style.backgroundColor = 'var(--danger-color)';
    notificationText.textContent = message;
    
    document.getElementById('notification-container').classList.add('visible');
}

// Mostrar mensagem de conscientização
function showAwarenessMessage() {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notification.style.backgroundColor = 'var(--primary-color)';
    notificationText.textContent = awarenessMessages[currentNotificationIndex];
    
    // Avançar para a próxima mensagem
    currentNotificationIndex = (currentNotificationIndex + 1) % awarenessMessages.length;
    
    document.getElementById('notification-container').classList.add('visible');
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('close-notification').addEventListener('click', function() {
        document.getElementById('notification-container').classList.remove('visible');
    });
});


// Buscar praias pelo nome
function searchBeaches(query) {
    if (!query) return [];
    
    query = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return beachesData.filter(beach => {
        const beachName = beach.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return beachName.includes(query);
    });
}

// Renderizar resultados da busca
function renderSearchResults(results) {
    const searchResultsElement = document.getElementById('search-results');
    searchResultsElement.innerHTML = '';
    
    if (results.length === 0) {
        searchResultsElement.innerHTML = '<div class="search-result-item">Nenhuma praia encontrada</div>';
        searchResultsElement.classList.add('active');
        return;
    }
    
    results.forEach(beach => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item');
        resultItem.textContent = beach.nome;
        resultItem.addEventListener('click', () => {
            displayBeachInfo(beach);
            searchResultsElement.classList.remove('active');
            document.getElementById('search-input').value = beach.nome;
            
            // Mostrar mensagem de conscientização ao selecionar uma praia
            setTimeout(() => {
                showAwarenessMessage();
            }, 1000);
        });
        
        searchResultsElement.appendChild(resultItem);
    });
    
    searchResultsElement.classList.add('active');
}

// Identificar o estado da praia com base nas coordenadas
function identifyBeachState(beach) {
    // Mapeamento de coordenadas para estados
    const stateCoordinates = {
        "Maranhão": {
            minLat: -10.0,
            maxLat: -1.0,
            minLng: -48.0,
            maxLng: -41.0
        },
        "Alagoas": {
            minLat: -10.5,
            maxLat: -8.5,
            minLng: -38.5,
            maxLng: -35.0
        },
        "Rio Grande do Norte": {
            minLat: -7.0,
            maxLat: -4.5,
            minLng: -38.5,
            maxLng: -34.5
        },
        "Bahia": {
            minLat: -18.5,
            maxLat: -8.5,
            minLng: -46.5,
            maxLng: -37.0
        },
        "Santa Catarina": {
            minLat: -30.0,
            maxLat: -25.5,
            minLng: -54.0,
            maxLng: -48.0
        }
    };

    // Verificar em qual estado a praia está localizada
    for (const [state, coords] of Object.entries(stateCoordinates)) {
        if (
            beach.latitude >= coords.minLat &&
            beach.latitude <= coords.maxLat &&
            beach.longitude >= coords.minLng &&
            beach.longitude <= coords.maxLng
        ) {
            return state;
        }
    }

    // Se não encontrar correspondência exata, usar uma abordagem de proximidade
    // Verificar qual estado está mais próximo das coordenadas da praia
    let closestState = null;
    let minDistance = Infinity;

    for (const [state, coords] of Object.entries(stateCoordinates)) {
        // Calcular o centro do estado
        const centerLat = (coords.minLat + coords.maxLat) / 2;
        const centerLng = (coords.minLng + coords.maxLng) / 2;
        
        // Calcular a distância entre a praia e o centro do estado
        const distance = calculateDistance(beach.latitude, beach.longitude, centerLat, centerLng);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestState = state;
        }
    }

    return closestState || "Maranhão"; // Fallback para Maranhão se não encontrar
}

// Exibir informações da praia
function displayBeachInfo(beach) {
    document.getElementById('beach-name').textContent = beach.nome;
    document.getElementById('beach-ph').textContent = beach.pH;
    document.getElementById('beach-pollution').textContent = beach.poluicao;
    document.getElementById('beach-coordinates').textContent = `${beach.latitude.toFixed(4)}, ${beach.longitude.toFixed(4)}`;
    
    // Atualizar status da praia
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    if (beach.condicao === 'Própria') {
        statusIndicator.classList.remove('improper');
        statusIndicator.classList.add('proper');
        statusText.textContent = 'Própria para banho';
        document.getElementById('alert-box').classList.add('hidden');
    } else {
        statusIndicator.classList.remove('proper');
        statusIndicator.classList.add('improper');
        statusText.textContent = 'Imprópria para banho';
        document.getElementById('alert-box').classList.remove('hidden');
        document.getElementById('alert-box').classList.add('danger');
        
        // Personalizar mensagem de alerta com base no nível de poluição
        const pollutionLevel = parseInt(beach.poluicao);
        let alertMessage = 'Esta praia está imprópria para banho. Recomendamos evitar contato com a água.';
        
        if (pollutionLevel > 15) {
            alertMessage += ' Níveis elevados de poluição podem causar problemas de saúde como infecções gastrointestinais, de pele e respiratórias.';
        } else {
            alertMessage += ' O contato com a água pode causar problemas de saúde como irritações na pele e olhos.';
        }
        
        document.getElementById('alert-message').textContent = alertMessage;
    }
    
    // Atualizar mapa usando OpenStreetMap
    updateMap(beach.latitude, beach.longitude, beach.nome);
    
    // Mostrar a seção de informações da praia
    document.getElementById('beach-info-section').classList.remove('hidden');
    
    // Identificar o estado da praia e mostrar a vida marinha correspondente
    const beachState = identifyBeachState(beach);
    if (beachState && window.marineLife) {
        window.marineLife.renderSection(beachState);
    }
}

// Atualizar mapa usando OpenStreetMap
function updateMap(lat, lng, beachName) {
    const mapContainer = document.getElementById('map-container');
    
    // Criar iframe com OpenStreetMap
    mapContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            style="border:0; border-radius: 8px;"
            src="https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&amp;layer=mapnik&amp;marker=${lat}%2C${lng}" 
        ></iframe>
        <div style="margin-top: 8px; font-size: 12px; text-align: center;">
            <a href="https://www.openstreetmap.org/?mlat=${lat}&amp;mlon=${lng}#map=15/${lat}/${lng}" target="_blank">
                Ver mapa ampliado
            </a>
        </div>
    `;
}

// Buscar praia mais próxima com base na geolocalização
function findNearestBeach(userLat, userLng) {
    if (beachesData.length === 0) return null;
    
    let nearestBeach = null;
    let shortestDistance = Infinity;
    
    beachesData.forEach(beach => {
        const distance = calculateDistance(userLat, userLng, beach.latitude, beach.longitude);
        
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestBeach = beach;
        }
    });
    
    return nearestBeach;
}

// Calcular distância entre dois pontos (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    
    return distance;
}

// Usar geolocalização para encontrar praia mais próxima
document.getElementById('geolocation-btn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                const nearestBeach = findNearestBeach(userLat, userLng);
                
                if (nearestBeach) {
                    displayBeachInfo(nearestBeach);
                    document.getElementById('search-input').value = nearestBeach.nome;
                    document.getElementById('search-results').classList.remove('active');
                    
                    // Mostrar mensagem de conscientização ao encontrar praia próxima
                    setTimeout(() => {
                        showAwarenessMessage();
                    }, 1000);
                } else {
                    showErrorMessage('Não foi possível encontrar praias próximas à sua localização.');
                }
            },
            function(error) {
                console.error('Erro ao obter localização:', error);
                showErrorMessage('Não foi possível acessar sua localização. Verifique as permissões do navegador.');
            }
        );
    } else {
        showErrorMessage('Seu navegador não suporta geolocalização.');
    }
});

// Evento de input para busca
document.getElementById('search-input').addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    if (query.length >= 2) {
        const results = searchBeaches(query);
        renderSearchResults(results);
    } else {
        document.getElementById('search-results').classList.remove('active');
    }
});

// Fechar resultados da busca ao clicar fora
document.addEventListener('click', function(e) {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.getElementById('search-results');
    
    if (!searchContainer.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// Configurar timer para mostrar mensagens de conscientização periodicamente
function setupAwarenessTimer() {
    // Mostrar mensagem inicial
    showAwarenessMessage();
    
    // Configurar timer para mostrar mensagens a cada 5 minutos
    setInterval(() => {
        showAwarenessMessage();
    }, 5 * 60 * 1000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Carregar dados das praias
    const dataLoaded = await loadBeachesData();
    
    if (dataLoaded) {
        // Carregar dados da vida marinha
        if (window.marineLife) {
            await window.marineLife.loadData();
        }
        
        // Configurar timer para mensagens de conscientização
        setupAwarenessTimer();
        
        // Pré-carregar algumas praias populares para sugestão
        const popularBeaches = beachesData.filter(beach => 
            beach.nome === "Ponta d'Areia" || 
            beach.nome === "Praia de São Marcos" || 
            beach.nome === "Praia do Araçagy" ||
            beach.nome === "Praia dos Lençóis"
        );
        
        if (popularBeaches.length > 0) {
            const searchResultsElement = document.getElementById('search-results');
            searchResultsElement.innerHTML = '<div class="search-result-item" style="font-weight: bold; color: var(--primary-color);">Praias Populares:</div>';
            
            popularBeaches.forEach(beach => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.textContent = beach.nome;
                resultItem.addEventListener('click', () => {
                    displayBeachInfo(beach);
                    searchResultsElement.classList.remove('active');
                    document.getElementById('search-input').value = beach.nome;
                    
                    // Mostrar mensagem de conscientização ao selecionar uma praia
                    setTimeout(() => {
                        showAwarenessMessage();
                    }, 1000);
                });
                
                searchResultsElement.appendChild(resultItem);
            });
            
            // Mostrar sugestões iniciais
            setTimeout(() => {
                searchResultsElement.classList.add('active');
                
                // Esconder após 5 segundos se o usuário não interagir
                setTimeout(() => {
                    if (!document.getElementById('search-input').value) {
                        searchResultsElement.classList.remove('active');
                    }
                }, 5000);
            }, 1000);
        }
    }
});
