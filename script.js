// ------------------------------------
// ---- CLASSE MANUTENCAO (Opcional) ----
// ------------------------------------
// (Coloque a classe Manutencao aqui se não estiver em arquivo separado)
// class Manutencao { ... }
// Exemplo básico (se precisar usar):
/*
class Manutencao {
    constructor(data, descricao, custo, detalhes = '') {
        // Validar data (simplificado)
        this.data = new Date(data + 'T00:00:00'); // Adiciona hora para evitar problemas de fuso
        this.descricao = descricao;
        this.custo = parseFloat(custo);
        this.detalhes = detalhes;
    }

    validar() {
        return !isNaN(this.data.getTime()) &&
               typeof this.descricao === 'string' && this.descricao.length > 0 &&
               !isNaN(this.custo) && this.custo >= 0;
    }

    getRepresentacaoFormatada() {
        const dataFormatada = this.data.toLocaleDateString('pt-BR');
        return `${dataFormatada} - ${this.descricao} (R$ ${this.custo.toFixed(2)}) ${this.detalhes ? `- ${this.detalhes}` : ''}`;
    }
}
*/

// ------------------------------------
// ---- OPENWEATHERMAP API CONFIG ----
// ------------------------------------

// ATENÇÃO: ARMAZENAR A API KEY DIRETAMENTE NO CÓDIGO FRONTEND É INSEGURO!
// Em uma aplicação real, a chave NUNCA deve ficar exposta aqui.
// A forma correta envolve um backend (Node.js, Serverless) atuando como proxy.
// Para FINS DIDÁTICOS nesta atividade, vamos usá-la aqui temporariamente.
const openWeatherApiKey = "e7b530ba5429936b7b96cf5f5b7a72ae"; // <-- SUBSTITUA PELA SUA CHAVE

// ------------------------------------
// ---- FUNÇÕES DO PLANEJADOR DE VIAGEM (CLIMA ATUAL) ----
// ------------------------------------

/**
 * Busca o clima atual para uma cidade específica.
 * @async
 * @param {string} nomeCidade - O nome da cidade para buscar o clima atual.
 * @returns {Promise<object|null>} Uma Promise que resolve com os dados do clima atual ou null em caso de erro.
 */
async function buscarClimaAtualViagem(nomeCidade) {
    const statusDiv = document.getElementById('clima-viagem-status');
    if (!openWeatherApiKey || openWeatherApiKey === "SUA_CHAVE_OPENWEATHERMAP_AQUI") {
        console.error("Chave da API OpenWeatherMap não configurada.");
        if (statusDiv) statusDiv.textContent = "Erro: Chave da API não configurada. Verifique o console.";
        return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        const data = await response.json(); // Tenta parsear JSON mesmo em erro para pegar mensagem

        if (!response.ok) {
            const errorMessage = data.message || `Erro HTTP: ${response.status}`;
            console.error(`Erro ao buscar clima atual: ${errorMessage}`, data);
            throw new Error(errorMessage);
        }
        // Extrai e formata os dados relevantes
        return {
            nome: data.name,
            temperatura: Math.round(data.main.temp),
            sensacao: Math.round(data.main.feels_like),
            descricao: data.weather[0].description,
            umidade: data.main.humidity,
            icone: data.weather[0].icon,
            ventoVelocidade: data.wind.speed, // m/s
            pressao: data.main.pressure, // hPa
            visibilidade: data.visibility, // metros
            nascerDoSol: data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}) : 'N/A',
            porDoSol: data.sys.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}) : 'N/A',
        };
    } catch (error) {
        console.error("Falha na requisição do clima atual:", error);
        if (statusDiv) statusDiv.textContent = `Erro ao buscar clima: ${error.message}. Verifique o nome da cidade ou sua conexão.`;
        return null;
    }
}

/**
 * Exibe o clima atual na interface do usuário para o planejador de viagem.
 * @param {object} dadosClima - Objeto com os dados do clima atual processados.
 * @param {string} nomeCidadeInput - O nome da cidade conforme digitado pelo usuário (para título).
 */
function exibirClimaAtualViagem(dadosClima, nomeCidadeInput) {
    const resultadoDiv = document.getElementById('clima-viagem-resultado');
    const statusDiv = document.getElementById('clima-viagem-status');

    if (!resultadoDiv || !statusDiv) {
        console.error("Elementos da UI para clima da viagem não encontrados.");
        return;
    }
    resultadoDiv.innerHTML = ''; // Limpa resultados anteriores
    statusDiv.textContent = '';   // Limpa mensagem de status

    if (!dadosClima) {
        resultadoDiv.innerHTML = '<p>Não foi possível obter o clima atual para o destino.</p>';
        return;
    }

    // Usa o nome da cidade retornado pela API se disponível, senão o input
    const nomeExibicao = dadosClima.nome || nomeCidadeInput;

    resultadoDiv.innerHTML = `
        <h3>Clima Atual em ${nomeExibicao}</h3>
        <div class="clima-atual-cartao">
            <div class="clima-principal">
                <img src="https://openweathermap.org/img/wn/${dadosClima.icone}@2x.png" alt="${dadosClima.descricao}" title="${dadosClima.descricao}">
                <p class="temperatura-atual">${dadosClima.temperatura}°C</p>
                <p class="descricao-clima-atual">${dadosClima.descricao}</p>
            </div>
            <div class="clima-detalhes">
                <p>Sensação Térmica: <strong>${dadosClima.sensacao}°C</strong></p>
                <p>Umidade: <strong>${dadosClima.umidade}%</strong></p>
                <p>Vento: <strong>${(dadosClima.ventoVelocidade * 3.6).toFixed(1)} km/h</strong></p> 
                <p>Pressão: <strong>${dadosClima.pressao} hPa</strong></p>
                <p>Visibilidade: <strong>${(dadosClima.visibilidade / 1000).toFixed(1)} km</strong></p>
                <p>Nascer do Sol: <strong>${dadosClima.nascerDoSol}</strong></p>
                <p>Pôr do Sol: <strong>${dadosClima.porDoSol}</strong></p>
            </div>
        </div>
    `;
}


// ------------------------------------
// ---- FUNÇÕES DA PREVISÃO DO TEMPO (5 DIAS FORECAST) ----
// ------------------------------------

/**
 * Busca a previsão do tempo detalhada para 5 dias (a cada 3 horas) para uma cidade.
 * @async
 * @param {string} cidade - O nome da cidade para buscar a previsão.
 * @returns {Promise<object|null>} Uma Promise que resolve com os dados da API ou null em caso de erro.
 */
async function buscarPrevisaoDetalhada(cidade) {
    const statusDiv = document.getElementById('previsao-status');
    if (!openWeatherApiKey || openWeatherApiKey === "SUA_CHAVE_OPENWEATHERMAP_AQUI") {
        console.error("Chave da API OpenWeatherMap não configurada.");
        if (statusDiv) statusDiv.textContent = "Erro: Chave da API não configurada. Verifique o console.";
        return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        const data = await response.json(); // Tenta parsear JSON mesmo em erro para pegar mensagem

        if (!response.ok) {
            // A API OpenWeatherMap geralmente retorna um objeto JSON com 'cod' e 'message' em caso de erro
            const errorMessage = data.message || `Erro HTTP: ${response.status}`;
            console.error(`Erro ao buscar previsão: ${errorMessage}`, data);
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error("Falha na requisição da previsão do tempo:", error);
        if (statusDiv) statusDiv.textContent = `Erro ao buscar previsão: ${error.message}. Verifique o nome da cidade ou sua conexão.`;
        return null;
    }
}

/**
 * Processa os dados brutos da API de forecast para agrupar por dia e resumir informações.
 * @param {object} data - O objeto JSON completo retornado pela API OpenWeatherMap Forecast.
 * @returns {Array<object>|null} Um array de objetos, onde cada objeto representa um dia com dados resumidos, ou null se os dados forem inválidos.
 * Exemplo de objeto de retorno para um dia: { data: 'AAAA-MM-DD', temp_min: X, temp_max: Y, descricao: '...', icone: '...' }
 */
function processarDadosForecast(data) {
    if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
        console.error("Dados da previsão inválidos ou lista vazia:", data);
        return null;
    }

    const diasAgrupados = {};

    data.list.forEach(item => {
        const [dateStr] = item.dt_txt.split(' '); // Pega apenas a parte da data 'AAAA-MM-DD'
        
        if (!diasAgrupados[dateStr]) {
            diasAgrupados[dateStr] = {
                temps: [],
                weatherEntries: [] // Para armazenar {time, description, icon}
            };
        }
        diasAgrupados[dateStr].temps.push(item.main.temp);
        diasAgrupados[dateStr].weatherEntries.push({
            time: item.dt_txt.split(' ')[1], // Hora 'HH:MM:SS'
            description: item.weather[0].description,
            icon: item.weather[0].icon
        });
    });

    const previsaoDiariaProcessada = [];
    // Ordenar as chaves (datas) para garantir a ordem cronológica
    const datasOrdenadas = Object.keys(diasAgrupados).sort();

    for (const dateKey of datasOrdenadas) {
        const dia = diasAgrupados[dateKey];
        const temp_min = Math.min(...dia.temps);
        const temp_max = Math.max(...dia.temps);

        // Lógica para escolher uma descrição e ícone representativos para o dia
        // Tenta pegar a entrada das 12:00 ou 15:00, se não, a do meio do dia
        let representativeWeather = dia.weatherEntries.find(e => e.time === "12:00:00" || e.time === "15:00:00");
        if (!representativeWeather && dia.weatherEntries.length > 0) {
            representativeWeather = dia.weatherEntries[Math.floor(dia.weatherEntries.length / 2)];
        } else if (!representativeWeather) { // Caso não haja entradas (improvável, mas seguro)
            representativeWeather = { description: "N/A", icon: "01d" }; // Ícone padrão
        }
        
        previsaoDiariaProcessada.push({
            data: dateKey,
            temp_min: Math.round(temp_min), // Arredonda para inteiro
            temp_max: Math.round(temp_max), // Arredonda para inteiro
            descricao: representativeWeather.description,
            icone: representativeWeather.icon
        });
    }
    return previsaoDiariaProcessada;
}

/**
 * Exibe a previsão do tempo detalhada na interface do usuário.
 * @param {Array<object>} previsaoDiaria - Array com os dados da previsão processados por dia.
 * @param {string} nomeCidade - O nome da cidade para exibição no título.
 */
function exibirPrevisaoDetalhada(previsaoDiaria, nomeCidade) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    const statusDiv = document.getElementById('previsao-status');

    if (!resultadoDiv || !statusDiv) {
        console.error("Elementos da UI para previsão do tempo não encontrados.");
        return;
    }
    resultadoDiv.innerHTML = ''; // Limpa resultados anteriores
    statusDiv.textContent = ''; // Limpa mensagem de status

    if (!previsaoDiaria || previsaoDiaria.length === 0) {
        resultadoDiv.innerHTML = '<p>Não foi possível obter a previsão detalhada.</p>';
        return;
    }

    const titulo = document.createElement('h3');
    titulo.textContent = `Previsão para ${nomeCidade} (Próximos Dias):`;
    resultadoDiv.appendChild(titulo);

    const containerDias = document.createElement('div');
    containerDias.className = 'previsao-dias-container'; // Para estilização com flexbox/grid

    previsaoDiaria.forEach(dia => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'previsao-dia-item';

        const dataObj = new Date(dia.data + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

        diaDiv.innerHTML = `
            <h4>${dataFormatada}</h4>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}" title="${dia.descricao}">
            <p class="descricao-clima">${dia.descricao}</p>
            <p>Min: <span class="temp-min">${dia.temp_min}°C</span></p>
            <p>Máx: <span class="temp-max">${dia.temp_max}°C</span></p>
        `;
        containerDias.appendChild(diaDiv);
    });
    resultadoDiv.appendChild(containerDias);
}


// ------------------------------------
// ---- CLASSES DE VEICULOS ----
// ------------------------------------

// Classe Base: Veiculo
class Veiculo {
    constructor(modelo, cor, painelId, imagemSrc) {
        if (!modelo || !cor || !painelId || !imagemSrc) {
            throw new Error("Todos os parâmetros (modelo, cor, painelId, imagemSrc) são obrigatórios para Veiculo.");
        }
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.painelId = painelId; // ID da div de informações (ex: 'informacoesCarro')
        this.imagemSrc = imagemSrc; // Caminho da imagem para este veículo
        this.historicoManutencoes = []; // Para a classe Manutencao (opcional)

        // Referência ao painel (obtida quando selecionado)
        this.painelElement = null;
    }

    // Método para definir o elemento do painel quando o veículo é selecionado
    associarPainel() {
        this.painelElement = document.getElementById(this.painelId);
        if (!this.painelElement) {
            console.error(`Painel com ID ${this.painelId} não encontrado para ${this.modelo}`);
        }
    }

    // Métodos de ação básicos (ligar/desligar/buzinar)
    ligar() {
        this.ligado = true;
        console.log(`${this.modelo} ligado!`);
        this.playSom('somLigando'); // Toca som genérico de ligar
        this.atualizarStatusNaTela();
        this.atualizarBotaoLigarDesligar();
    }

    desligar() {
        this.ligado = false;
        console.log(`${this.modelo} desligado!`);
        this.atualizarStatusNaTela();
        this.atualizarBotaoLigarDesligar();
        // Outras ações ao desligar (ex: zerar velocidade) podem ser sobrescritas
    }

    buzinar() {
        console.log(`Buzina genérica do ${this.modelo}: Bi bi!`);
        // Implementar som específico nas subclasses se necessário
    }

    // Métodos para tocar sons (centralizado)
    playSom(somId) {
        const som = document.getElementById(somId);
        if (som) {
            som.currentTime = 0; // Reinicia o som se já estiver tocando
            som.play().catch(e => console.error("Erro ao tocar som:", e));
        } else {
            console.warn(`Elemento de áudio com ID "${somId}" não encontrado.`);
        }
    }

    // Métodos de atualização da UI (usando this.painelElement)
    atualizarStatusNaTela() {
        if (!this.painelElement) return;
        // Encontra o span de status DENTRO do painel correto
        const statusSpan = this.painelElement.querySelector('span[id^="status"]'); // Procura span cujo id começa com 'status'
        if (statusSpan) {
            statusSpan.textContent = this.ligado ? "Ligado" : "Desligado";
        } else {
             console.warn(`Span de status não encontrado no painel ${this.painelId}`);
        }
    }

    atualizarBotaoLigarDesligar() {
         if (!this.painelElement) return;
         const btn = this.painelElement.querySelector('button[id^="ligarDesligar"]');
         if (btn) {
            btn.textContent = this.ligado ? "Desligar" : "Ligar";
         } else {
             console.warn(`Botão Ligar/Desligar não encontrado no painel ${this.painelId}`);
         }
    }

     // Atualiza informações estáticas (modelo, cor) no painel
     preencherInfoBasicaPainel() {
        if (!this.painelElement) return;
        const setSpan = (idPart, value) => {
            // Busca pelo ID COMPLETO agora, mais específico
            const span = this.painelElement.querySelector(`span#${idPart}${this.constructor.name}`); // Ex: modeloCarro, modeloCarroEsportivo
             if (span) {
                 span.textContent = value;
             } else {
                 // Tenta encontrar por ID parcial como fallback (manter compatibilidade se ID não seguir padrão)
                 const fallbackSpan = this.painelElement.querySelector(`span[id^="${idPart}"]`);
                 if (fallbackSpan) {
                     fallbackSpan.textContent = value;
                 } else {
                     console.warn(`Span para '${idPart}' não encontrado no painel ${this.painelId}`);
                 }
             }
        };
        setSpan('modelo', this.modelo);
        setSpan('cor', this.cor);
    }

    // --- Métodos de Manutenção (Opcional) ---
    adicionarManutencao(manutencao) {
        if (typeof Manutencao !== 'undefined' && manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencoes.push(manutencao);
            console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencao.getRepresentacaoFormatada()}`);
            this.historicoManutencoes.sort((a, b) => a.data - b.data);
            // Aqui você poderia atualizar uma área de histórico na UI, se existir
            return true;
        } else {
            console.error("Não foi possível adicionar a manutenção: dados inválidos ou classe Manutencao não definida/importada.");
            return false;
        }
    }

    getHistoricoManutencoesFormatado() {
        if (typeof Manutencao === 'undefined') return ["Classe Manutencao não disponível."];
        return this.historicoManutencoes.map(m => m.getRepresentacaoFormatada());
    }
}

// --- Classe Carro ---
class Carro extends Veiculo {
    constructor(modelo, cor) {
        // Passa ID do painel e imagem para o construtor pai
        super(modelo, cor, 'informacoesCarro', 'imagens/carroNormal.jpg');
        this.velocidade = 0;
        this.somBuzinaId = "somBuzinaCarro"; // ID do som específico
    }

    desligar() {
        super.desligar();
        this.velocidade = 0;
        this.atualizarVelocidadeNaTela();
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            console.log(`${this.modelo} acelerando! Velocidade: ${this.velocidade} km/h`);
            this.playSom("somAceleracao");
            this.atualizarVelocidadeNaTela();
        } else {
            alert("Ligue o carro para acelerar!"); // Usando alert para feedback visual
        }
    }

    frear() {
        if (this.ligado) {
            this.velocidade -= 10;
            if (this.velocidade < 0) this.velocidade = 0;
            console.log(`${this.modelo} freando! Velocidade: ${this.velocidade} km/h`);
            // Poderia ter um som de freio aqui
            this.atualizarVelocidadeNaTela();
        } else {
             alert("O carro está desligado.");
        }
    }

    buzinar() {
        console.log(`${this.modelo} buzina: Fon fon!`);
        this.playSom(this.somBuzinaId);
    }

    atualizarVelocidadeNaTela() {
        if (!this.painelElement) return;
        const velSpan = this.painelElement.querySelector('span[id^="velocidade"]');
        if (velSpan) {
            velSpan.textContent = this.velocidade;
        } else {
            console.warn(`Span de velocidade não encontrado no painel ${this.painelId}`);
        }
    }

     // Sobrescreve para incluir atualização de velocidade e outras infos
     associarPainel() {
        super.associarPainel(); // Chama o método da classe pai
        if (this.painelElement) { // Garante que o painel foi encontrado
            this.preencherInfoBasicaPainel(); // Preenche modelo/cor
            this.atualizarStatusNaTela(); // Garante status correto
            this.atualizarBotaoLigarDesligar(); // Garante texto do botão
            this.atualizarVelocidadeNaTela(); // Garante que a velocidade seja exibida ao selecionar
        }
    }
}

// --- Classe CarroEsportivo ---
class CarroEsportivo extends Carro { // Herda de Carro
    constructor(modelo, cor) {
        super(modelo, cor); // Chama construtor do Carro
        // Sobrescreve painelId e imagemSrc definidos pelo Carro
        this.painelId = 'informacoesCarroEsportivo';
        this.imagemSrc = 'imagens/carroEsportivo.jpg';
        this.turboAtivado = false;
        this.somBuzinaId = "somBuzinaEsportivo"; // Som diferente
    }

    ativarTurbo() {
        if (this.ligado && !this.turboAtivado) {
            this.turboAtivado = true;
            console.log(`${this.modelo}: Turbo ATIVADO!`);
            this.playSom("somTurbo");
            this.atualizarTurboNaTela();
        } else if (!this.ligado) {
             alert("Ligue o carro esportivo para ativar o turbo!");
        } else if (this.turboAtivado){
            console.log("Turbo já está ativado.");
        }
    }

    desativarTurbo() {
        if (this.turboAtivado) {
            this.turboAtivado = false;
            console.log(`${this.modelo}: Turbo DESATIVADO!`);
            this.atualizarTurboNaTela();
        }
    }

    // Sobrescreve acelerar para considerar o turbo
    acelerar() {
        if (this.ligado) {
            const incremento = this.turboAtivado ? 30 : 15; // Acelera mais rápido, mais ainda com turbo
            this.velocidade += incremento;
            console.log(`${this.modelo} acelerando ${this.turboAtivado ? 'COM TURBO' : ''}! Velocidade: ${this.velocidade} km/h`);
            this.playSom("somAceleracao");
            this.atualizarVelocidadeNaTela();
        } else {
            alert("Ligue o carro esportivo para acelerar!");
        }
    }

     // Sobrescreve frear (opcionalmente mais forte)
     frear() {
        if (this.ligado) {
            this.velocidade -= 15;
            if (this.velocidade < 0) this.velocidade = 0;
            console.log(`${this.modelo} freando! Velocidade: ${this.velocidade} km/h`);
            this.atualizarVelocidadeNaTela();
        } else {
             alert("O carro está desligado.");
        }
    }

    desligar() {
        super.desligar(); // Chama o desligar do Carro (que zera velocidade)
        this.desativarTurbo(); // Desativa o turbo ao desligar
    }


    buzinar() {
        console.log(`${this.modelo} buzina: Vruum Vruum! (Esportivo)`);
        this.playSom(this.somBuzinaId);
    }

    atualizarTurboNaTela() {
        if (!this.painelElement) return;
        const turboSpan = this.painelElement.querySelector('span[id^="turbo"]'); // Procura span id começando com turbo
        if (turboSpan) {
            turboSpan.textContent = this.turboAtivado ? "Ativado" : "Desativado";
        } else {
             console.warn(`Span de turbo não encontrado no painel ${this.painelId}`);
        }
    }

     // Sobrescreve para incluir atualização de turbo
     associarPainel() {
        super.associarPainel(); // Chama o associarPainel do Carro
        if (this.painelElement) {
            this.atualizarTurboNaTela(); // Garante que o status do turbo seja exibido
        }
    }
}

// --- Classe Caminhao ---
class Caminhao extends Carro { // Herda de Carro para reusar velocidade, etc.
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor); // Chama construtor do Carro
         // Sobrescreve painelId e imagemSrc
        this.painelId = 'informacoesCaminhao';
        this.imagemSrc = 'imagens/caminhao.jpg';
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.somBuzinaId = "somBuzinaCaminhao"; // Som diferente
    }

     // Sobrescreve Aceleração (mais lenta, afetada pela carga)
     acelerar() {
        if (this.ligado) {
            // Aceleração diminui com mais carga
            const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.5))); // Exemplo de fator
            const incremento = Math.round(8 * fatorCarga);
            this.velocidade += incremento > 0 ? incremento : 1; // Acelera pelo menos 1
            console.log(`${this.modelo} acelerando (carga: ${this.cargaAtual}kg)! Velocidade: ${this.velocidade} km/h`);
            this.playSom("somAceleracao"); // Talvez um som diferente?
            this.atualizarVelocidadeNaTela();
        } else {
            alert("Ligue o caminhão para acelerar!");
        }
    }

    // Sobrescreve Freio (menos eficaz com carga)
    frear() {
        if (this.ligado) {
             const fatorCarga = Math.max(0.5, 1 - (this.cargaAtual / (this.capacidadeCarga * 2)));
             const decremento = Math.round(10 * fatorCarga);
            this.velocidade -= decremento > 0 ? decremento : 2;
            if (this.velocidade < 0) this.velocidade = 0;
            console.log(`${this.modelo} freando (carga: ${this.cargaAtual}kg)! Velocidade: ${this.velocidade} km/h`);
            this.atualizarVelocidadeNaTela();
        } else {
             alert("O caminhão está desligado.");
        }
    }

    carregar(quantidade) {
        if (!this.ligado) {
             alert("Ligue o caminhão para carregar!");
             return;
        }
        if (typeof quantidade !== 'number' || quantidade <= 0 || isNaN(quantidade)) {
            alert("Quantidade inválida para carregar.");
            return;
        }
        if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
            this.cargaAtual += quantidade;
            console.log(`Caminhão carregado com ${quantidade}kg. Carga atual: ${this.cargaAtual} kg`);
            this.atualizarCargaNaTela();
        } else {
            alert(`Não é possível carregar ${quantidade}kg. Capacidade máxima (${this.capacidadeCarga}kg) excedida! Carga atual: ${this.cargaAtual}kg`);
        }
    }

    descarregar(quantidade) {
         if (!this.ligado) {
             alert("Ligue o caminhão para descarregar!");
             return;
        }
         if (typeof quantidade !== 'number' || quantidade <= 0 || isNaN(quantidade)) {
            alert("Quantidade inválida para descarregar.");
            return;
        }
        if (this.cargaAtual - quantidade >= 0) {
            this.cargaAtual -= quantidade;
            console.log(`Caminhão descarregado ${quantidade}kg. Carga atual: ${this.cargaAtual} kg`);
            this.atualizarCargaNaTela();
        } else {
             alert(`Não é possível descarregar ${quantidade}kg. Carga atual (${this.cargaAtual}kg) é insuficiente!`);
        }
    }

    buzinar() {
        console.log(`${this.modelo} buzina: Fom Fom! (Caminhão)`);
        this.playSom(this.somBuzinaId);
    }

    atualizarCargaNaTela() {
        if (!this.painelElement) return;
        const cargaAtualSpan = this.painelElement.querySelector('#cargaAtualCaminhao');
        const capacidadeSpan = this.painelElement.querySelector('#capacidadeCargaCaminhao');
        if (cargaAtualSpan) {
             cargaAtualSpan.textContent = this.cargaAtual;
        } else {
            console.warn(`Span #cargaAtualCaminhao não encontrado no painel ${this.painelId}`);
        }
        if (capacidadeSpan) {
             capacidadeSpan.textContent = this.capacidadeCarga; // Capacidade pode ser estática, mas atualiza aqui tb
        } else {
             console.warn(`Span #capacidadeCargaCaminhao não encontrado no painel ${this.painelId}`);
        }
    }

    // Sobrescreve para incluir carga e capacidade
     associarPainel() {
        super.associarPainel(); // Chama o associarPainel do Carro
        if (this.painelElement) {
            this.atualizarCargaNaTela(); // Garante que a carga seja exibida
        }
    }
}


// ------------------------------------
// ---- API SIMULADA (FUNÇÃO) ----
// ------------------------------------

/**
 * Busca detalhes extras de um veículo na API simulada (arquivo JSON local).
 * @param {string} identificadorVeiculo - O identificador único do veículo (neste caso, o modelo) para buscar.
 * @returns {Promise<object|null>} Uma Promise que resolve com o objeto de detalhes do veículo encontrado ou null se não encontrado ou em caso de erro.
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
  console.log(`Buscando detalhes (API simulada) para: ${identificadorVeiculo}`); // Log para debug
  try {
    const response = await fetch('./dados_veiculos_api.json'); // Caminho relativo ao HTML

    if (!response.ok) {
      // Lança um erro que será pego pelo catch
      throw new Error(`Erro HTTP ao buscar dados_veiculos_api.json: ${response.status} ${response.statusText}`);
    }

    // Verifica o tipo de conteúdo para ter certeza que é JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, não recebemos JSON! Verifique o arquivo 'dados_veiculos_api.json'.");
    }

    const detalhesTodosVeiculos = await response.json();
    // console.log("Dados carregados da API simulada:", detalhesTodosVeiculos); // Descomente para debug

    // Procura pelo veículo específico usando o identificador (modelo, neste caso)
    // Comparação insensível a maiúsculas/minúsculas pode ser mais robusta:
    // const detalhesVeiculo = detalhesTodosVeiculos.find(veiculo => veiculo.identificador.toLowerCase() === identificadorVeiculo.toLowerCase());
    const detalhesVeiculo = detalhesTodosVeiculos.find(veiculo => veiculo.identificador === identificadorVeiculo);


    if (detalhesVeiculo) {
      console.log("Detalhes encontrados:", detalhesVeiculo);
      return detalhesVeiculo; // Retorna o objeto encontrado
    } else {
      console.log(`Nenhum detalhe encontrado para o identificador: ${identificadorVeiculo}`);
      return null; // Retorna null se não encontrar
    }

  } catch (error) {
    console.error("Falha ao buscar/processar detalhes da API simulada:", error);
    // Retorna null para indicar que a busca falhou
    return null;
  }
}


// ------------------------------------
// ---- CLASSE GARAGEM ----
// ------------------------------------
class Garagem {
    constructor(selecaoContainerId, imagemDisplayId, infoContainerId) {
        // Propriedades da Garagem
        this.veiculos = [];
        this.veiculoSelecionado = null;
        this.indiceSelecionado = -1;

        // Referências aos elementos do DOM
        this.selecaoContainer = document.getElementById(selecaoContainerId);
        this.imagemDisplay = document.getElementById(imagemDisplayId);
        this.infoContainer = document.getElementById(infoContainerId); // Div que contém todos os painéis de info

        // Validação inicial dos elementos do DOM
        if (!this.selecaoContainer || !this.imagemDisplay || !this.infoContainer) {
            console.error("Erro Crítico: Um ou mais elementos da interface da Garagem não foram encontrados no HTML! Verifique os IDs:", selecaoContainerId, imagemDisplayId, infoContainerId);
            // Poderia lançar um erro ou desabilitar a funcionalidade
            alert("Erro crítico ao inicializar a Garagem. Verifique o console (F12).");
            return; // Impede a continuação se elementos cruciais faltam
        }

        // --- Event Listener para os botões de SELEÇÃO de veículo ---
        this.selecaoContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.dataset.indice) {
                const indice = parseInt(event.target.dataset.indice, 10);
                 // Evita re-selecionar o mesmo veículo desnecessariamente
                if(indice !== this.indiceSelecionado) {
                    this.selecionarVeiculoPorIndice(indice);
                }
            }
        });

        // --- Event Listener DELEGADO para os botões de AÇÃO dentro dos painéis de informação ---
        this.infoContainer.addEventListener('click', async (event) => { // Adicionado async
            if (!this.veiculoSelecionado || !this.veiculoSelecionado.painelElement) {
                // Se não há veículo selecionado ou seu painel não está associado, ignora o clique
                return;
            }

            const target = event.target; // O elemento que foi clicado
            const targetId = target.id; // O ID do elemento clicado (se tiver)
            const painelAtual = this.veiculoSelecionado.painelElement; // O painel de informações do veículo atual

            // --- Lógica para Ações Comuns ---
            if (targetId.startsWith('ligarDesligar')) {
                 if (this.veiculoSelecionado.ligado) {
                    this.veiculoSelecionado.desligar();
                 } else {
                    this.veiculoSelecionado.ligar();
                 }
            }
            else if (targetId.startsWith('acelerar')) {
                // Verifica se o método existe antes de chamar (boa prática)
                if (typeof this.veiculoSelecionado.acelerar === 'function') {
                    this.veiculoSelecionado.acelerar();
                }
            }
            else if (targetId.startsWith('frear')) {
                if (typeof this.veiculoSelecionado.frear === 'function') {
                    this.veiculoSelecionado.frear();
                }
            }
             else if (targetId.startsWith('buzinar')) {
                 if (typeof this.veiculoSelecionado.buzinar === 'function') {
                    this.veiculoSelecionado.buzinar();
                 }
            }

            // --- Lógica para Ações Específicas (usando instanceof) ---
            else if (this.veiculoSelecionado instanceof CarroEsportivo) {
                if (targetId === 'ativarTurbo') {
                    this.veiculoSelecionado.ativarTurbo();
                } else if (targetId === 'desativarTurbo') {
                    this.veiculoSelecionado.desativarTurbo();
                }
            }
            else if (this.veiculoSelecionado instanceof Caminhao) {
                 const quantidadeInput = painelAtual.querySelector('#quantidadeCarga');
                 const quantidade = quantidadeInput ? parseInt(quantidadeInput.value, 10) : NaN;

                 if (targetId === 'carregarCaminhao') {
                    this.veiculoSelecionado.carregar(quantidade); // A validação da quantidade é feita no método
                 } else if (targetId === 'descarregarCaminhao') {
                    this.veiculoSelecionado.descarregar(quantidade); // A validação é feita no método
                 }
            }

            // --- LÓGICA PARA O BOTÃO "Ver Detalhes Extras" (API Simulada) ---
            else if (target.classList.contains('btn-detalhes-extras')) {
                console.log("Botão 'Ver Detalhes Extras' clicado para:", this.veiculoSelecionado.modelo);
                const areaDetalhes = painelAtual.querySelector('.area-detalhes-extras');
                const botaoDetalhes = target;

                if (!areaDetalhes) {
                    console.error("Elemento '.area-detalhes-extras' não encontrado dentro do painel:", painelAtual.id);
                    return;
                }

                // Feedback visual e prevenção de cliques múltiplos
                areaDetalhes.innerHTML = '<p><i>Carregando detalhes...</i></p>';
                botaoDetalhes.disabled = true;
                botaoDetalhes.textContent = 'Carregando...';

                try {
                    const identificador = this.veiculoSelecionado.modelo;
                    const detalhes = await buscarDetalhesVeiculoAPI(identificador); // Chama a função assíncrona

                    if (detalhes) {
                        areaDetalhes.innerHTML = `
                            <h4>Detalhes Extras (API Simulada):</h4>
                            <p><strong>Valor FIPE:</strong> ${detalhes.valorFIPE || 'N/A'}</p>
                            <p><strong>Recall Pendente:</strong>
                                ${detalhes.recallPendente
                                    ? `<span style="color:red; font-weight:bold;">Sim</span> ${detalhes.recallInfo ? `(${detalhes.recallInfo})` : ''}`
                                    : 'Não'}
                            </p>
                            <p><strong>Última Revisão:</strong> ${detalhes.ultimaRevisao || 'N/A'}</p>
                            <p><strong>Dica:</strong> ${detalhes.dicaManutencao || 'Nenhuma dica disponível.'}</p>
                        `;
                    } else {
                        areaDetalhes.innerHTML = '<p style="color:orange;">Detalhes extras não encontrados ou erro ao buscar.</p>';
                    }
                } catch (error) {
                    // Captura erros inesperados durante o processo (embora buscarDetalhesVeiculoAPI já tenha try/catch)
                    console.error("Erro ao exibir detalhes da API:", error);
                    areaDetalhes.innerHTML = '<p style="color:red;">Ocorreu um erro inesperado ao processar os detalhes.</p>';
                } finally {
                    // Garante que o botão seja reabilitado e o texto restaurado
                    botaoDetalhes.disabled = false;
                    botaoDetalhes.textContent = 'Ver Detalhes Extras';
                }
            }
            // --- FIM DA LÓGICA "Ver Detalhes Extras" ---

        }); // Fim do listener this.infoContainer.addEventListener
    } // Fim do constructor

    adicionarVeiculo(veiculo) {
        if (veiculo instanceof Veiculo) {
            this.veiculos.push(veiculo);
            const indice = this.veiculos.length - 1;
            this.criarBotaoSelecao(veiculo, indice);

            // Seleciona o primeiro veículo adicionado automaticamente
            if (this.indiceSelecionado === -1 && this.veiculos.length === 1) {
                 // Atraso mínimo para garantir que o DOM esteja pronto (embora DOMContentLoaded já ajude)
                 setTimeout(() => this.selecionarVeiculoPorIndice(0), 0);
            }
        } else {
            console.error("Objeto inválido. Somente instâncias de Veiculo podem ser adicionadas.", veiculo);
        }
    }

    criarBotaoSelecao(veiculo, indice) {
        const button = document.createElement('button');
        // Usar modelo e talvez tipo para o texto do botão
        button.textContent = `${veiculo.modelo} (${veiculo.constructor.name})`;
        button.dataset.indice = indice; // Guarda o índice no dataset
        this.selecaoContainer.appendChild(button);
    }

    selecionarVeiculoPorIndice(indice) {
        if (indice >= 0 && indice < this.veiculos.length) {
            // Desmarcar botão antigo (se houver um selecionado)
            if (this.indiceSelecionado !== -1) {
                 const btnAntigo = this.selecaoContainer.querySelector(`button[data-indice="${this.indiceSelecionado}"]`);
                 if(btnAntigo) btnAntigo.classList.remove('selecionado');
            }

            // Atualiza o índice e o veículo selecionado
            this.indiceSelecionado = indice;
            this.veiculoSelecionado = this.veiculos[indice];

            // Marcar botão novo
            const btnNovo = this.selecaoContainer.querySelector(`button[data-indice="${this.indiceSelecionado}"]`);
             if(btnNovo) btnNovo.classList.add('selecionado');
             else console.warn("Botão de seleção não encontrado para o índice:", indice);


            console.log(`Veículo selecionado: ${this.veiculoSelecionado.modelo}`);

            // Associa o painel ao objeto veículo (para ele saber onde atualizar)
            // Isso também chama os métodos de atualização iniciais do veículo (status, vel, etc.)
            this.veiculoSelecionado.associarPainel();

            // Atualiza a interface geral (imagem, visibilidade do painel)
            this.atualizarDisplayGeral(); // Isso inclui limpar a área de detalhes extras

        } else {
            console.error(`Índice de veículo inválido: ${indice}`);
        }
    }

    atualizarDisplayGeral() {
        if (!this.veiculoSelecionado) {
            this.imagemDisplay.style.display = 'none';
            this.imagemDisplay.src = ''; // Limpa src para evitar mostrar imagem antiga rapidamente
             // Esconde todos os painéis de informação
            Array.from(this.infoContainer.children).forEach(painel => {
                // Verifica se é uma div e se o ID começa com 'informacoes'
                if (painel.tagName === 'DIV' && painel.id.startsWith('informacoes')) {
                    painel.style.display = 'none';
                     // Limpa área de detalhes e reseta botão em TODOS os painéis ao esconder
                     this.limparAreaDetalhesExtras(painel);
                }
            });
            return;
        }

        // Atualiza a imagem
        this.imagemDisplay.src = this.veiculoSelecionado.imagemSrc;
        this.imagemDisplay.alt = `Imagem de ${this.veiculoSelecionado.modelo}`;
        this.imagemDisplay.style.display = 'block';

        // Esconde todos os painéis e mostra apenas o do veículo selecionado
        Array.from(this.infoContainer.children).forEach(painel => {
             if (painel.tagName === 'DIV' && painel.id.startsWith('informacoes')) {
                 const deveMostrar = (painel.id === this.veiculoSelecionado.painelId);
                 painel.style.display = deveMostrar ? 'block' : 'none';
                 // Limpa a área de detalhes de todos os painéis, incluindo o que vai ser mostrado
                 // (garante estado inicial limpo)
                 this.limparAreaDetalhesExtras(painel);
            }
        });

         // A chamada a this.veiculoSelecionado.associarPainel() dentro de selecionarVeiculoPorIndice
         // já deve ter atualizado os dados básicos (modelo, cor, status inicial, etc.).
         // Se houver necessidade de re-atualizar algo específico aqui, pode ser feito.
         // Ex: this.veiculoSelecionado.atualizarVelocidadeNaTela?.();
    }

    /**
     * Limpa a área de detalhes extras e reseta o botão correspondente dentro de um painel específico.
     * @param {HTMLElement} painelElement O elemento do painel onde procurar.
     */
    limparAreaDetalhesExtras(painelElement) {
        if (!painelElement) return;
        const areaDetalhes = painelElement.querySelector('.area-detalhes-extras');
        const botaoDetalhes = painelElement.querySelector('.btn-detalhes-extras');

        if (areaDetalhes) {
            areaDetalhes.innerHTML = ''; // Limpa o conteúdo HTML
        }
        if (botaoDetalhes) {
            botaoDetalhes.disabled = false; // Reabilita o botão
            botaoDetalhes.textContent = 'Ver Detalhes Extras'; // Restaura o texto original
        }
    }


    getVeiculoSelecionado() {
        return this.veiculoSelecionado;
    }
} // Fim da classe Garagem

// ------------------------------------
// ---- INICIALIZAÇÃO E EVENTOS GLOBAIS ----
// ------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente carregado e parseado.");

    // --- Inicialização da Garagem de Veículos ---
    try {
        const minhaGaragem = new Garagem(
            'selecaoGaragem',
            'imagemVeiculoAtual',
            'informacoesVeiculoContainer'
        );

        minhaGaragem.adicionarVeiculo(new CarroEsportivo("BMW M3 Competition", "Cinza"));
        minhaGaragem.adicionarVeiculo(new Caminhao("Scania R450", "Branco", 15000));
        minhaGaragem.adicionarVeiculo(new Carro("Corola do Novo", "Branco"));

        console.log("Garagem inicializada e veículos adicionados.");

    } catch (error) {
        console.error("Erro durante a inicialização da Garagem:", error);
        alert("Ocorreu um erro grave ao iniciar a Garagem. Verifique o console (F12).");
        // Considerar não sobrescrever o body inteiro em caso de erro se outras partes da página podem funcionar
        // document.body.innerHTML = '<h1 style="color: red;">Erro ao carregar a Garagem</h1><p>Por favor, verifique o console para mais detalhes.</p>';
    }

    // --- Event Listener para o botão de Previsão do Tempo Detalhada (5 dias) ---
    const verificarClimaBtn = document.getElementById('verificar-clima-btn');
    const cidadeInputForecast = document.getElementById('cidade-input'); // Renomeado para clareza
    const previsaoStatusDiv = document.getElementById('previsao-status');
    const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');

    if (verificarClimaBtn && cidadeInputForecast && previsaoStatusDiv && previsaoResultadoDiv) {
        verificarClimaBtn.addEventListener('click', async () => {
            const cidade = cidadeInputForecast.value.trim();
            if (!cidade) {
                previsaoStatusDiv.textContent = "Por favor, digite o nome de uma cidade.";
                previsaoResultadoDiv.innerHTML = ''; 
                return;
            }

            previsaoStatusDiv.textContent = "Carregando previsão detalhada...";
            previsaoResultadoDiv.innerHTML = ''; 
            verificarClimaBtn.disabled = true;

            try {
                const dadosApi = await buscarPrevisaoDetalhada(cidade);
                if (dadosApi) {
                    const previsaoProcessada = processarDadosForecast(dadosApi);
                    if (previsaoProcessada) {
                        exibirPrevisaoDetalhada(previsaoProcessada, dadosApi.city.name || cidade); 
                        previsaoStatusDiv.textContent = ''; 
                    } else {
                        previsaoStatusDiv.textContent = "Não foi possível processar os dados da previsão detalhada.";
                    }
                } else {
                    if (!previsaoStatusDiv.textContent) { 
                        previsaoStatusDiv.textContent = "Erro ao buscar previsão detalhada. Verifique o console.";
                    }
                }
            } catch (error) { 
                console.error("Erro no fluxo de verificação da previsão detalhada:", error);
                previsaoStatusDiv.textContent = `Erro: ${error.message}`;
            } finally {
                verificarClimaBtn.disabled = false;
            }
        });
    } else {
        console.error("Elementos da UI para previsão do tempo detalhada não foram encontrados.");
    }

    // --- Event Listener para o botão de Planejar Viagem (Clima Atual) ---
    const verificarClimaViagemBtn = document.getElementById('verificar-clima-viagem-btn');
    const destinoViagemInput = document.getElementById('destino-viagem-input');
    const climaViagemStatusDiv = document.getElementById('clima-viagem-status');
    const climaViagemResultadoDiv = document.getElementById('clima-viagem-resultado');

    if (verificarClimaViagemBtn && destinoViagemInput && climaViagemStatusDiv && climaViagemResultadoDiv) {
        verificarClimaViagemBtn.addEventListener('click', async () => {
            const cidadeDestino = destinoViagemInput.value.trim();
            if (!cidadeDestino) {
                climaViagemStatusDiv.textContent = "Por favor, digite a cidade de destino.";
                climaViagemResultadoDiv.innerHTML = '';
                return;
            }

            climaViagemStatusDiv.textContent = "Buscando clima atual...";
            climaViagemResultadoDiv.innerHTML = '';
            verificarClimaViagemBtn.disabled = true;

            try {
                const dadosClima = await buscarClimaAtualViagem(cidadeDestino);
                if (dadosClima) {
                    exibirClimaAtualViagem(dadosClima, cidadeDestino);
                    climaViagemStatusDiv.textContent = '';
                } else {
                    // buscarClimaAtualViagem já deve ter setado o erro no statusDiv
                     if (!climaViagemStatusDiv.textContent) { 
                        climaViagemStatusDiv.textContent = "Erro ao buscar clima atual. Verifique o console.";
                    }
                }
            } catch (error) {
                console.error("Erro no fluxo de verificação do clima da viagem:", error);
                climaViagemStatusDiv.textContent = `Erro: ${error.message}`;
            } finally {
                verificarClimaViagemBtn.disabled = false;
            }
        });
    } else {
        console.error("Elementos da UI para o Planejador de Viagem (Clima Atual) não foram encontrados.");
    }

    // Exemplo de como adicionar manutenção (se a classe Manutencao existir e for definida)
    /*
    if (typeof Manutencao !== 'undefined' && minhaGaragem && minhaGaragem.veiculos.length > 0) {
        const veiculoParaManut = minhaGaragem.veiculos[0]; // Pega o primeiro veículo (BMW)
        if(veiculoParaManut) {
            const manutOleo = new Manutencao('2024-01-15', 'Troca de Óleo', 350.00, 'Óleo 5w30 Sintético');
            if (veiculoParaManut.adicionarManutencao(manutOleo)) {
                 // Exibe histórico no console se a adição foi bem-sucedida
                console.log(`\nHistórico ${veiculoParaManut.modelo}:`);
                veiculoParaManut.getHistoricoManutencoesFormatado().forEach(m => console.log(`- ${m}`));
            }
        }
    }
    */

}); // Fim do DOMContentLoaded