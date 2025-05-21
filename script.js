// ------------------------------------
// ---- CLASSE MANUTENCAO (Opcional) ----
// ------------------------------------
// (Coloque a classe Manutencao aqui se não estiver em arquivo separado Manutencao.js)
// Se Manutencao.js estiver sendo usado, certifique-se que ele define a classe globalmente
// ou a exporta e você a importa aqui (se estiver usando módulos JS, o que não parece ser o caso).

// ------------------------------------
// ---- OPENWEATHERMAP API CONFIG ----
// ------------------------------------
const openWeatherApiKey = "e7b530ba5429936b7b96cf5f5b7a72ae"; // <-- SUBSTITUA PELA SUA CHAVE REAL SE NECESSÁRIO

// ------------------------------------
// ---- VARIÁVEIS GLOBAIS PARA INTERATIVIDADE DA PREVISÃO ----
// ------------------------------------
let dadosCompletosForecast = [];
let numeroDeDiasAtual = 5; // Padrão inicial para previsão
let nomeCidadeAtualForecast = ""; // Para manter o nome da cidade entre filtragens

// ------------------------------------
// ---- FUNÇÕES DO PLANEJADOR DE VIAGEM (CLIMA ATUAL) ----
// ------------------------------------
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
        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || `Erro HTTP: ${response.status}`;
            console.error(`Erro ao buscar clima atual: ${errorMessage}`, data);
            throw new Error(errorMessage);
        }
        return {
            nome: data.name,
            temperatura: Math.round(data.main.temp),
            sensacao: Math.round(data.main.feels_like),
            descricao: data.weather[0].description,
            umidade: data.main.humidity,
            icone: data.weather[0].icon,
            ventoVelocidade: data.wind.speed,
            pressao: data.main.pressure,
            visibilidade: data.visibility,
            nascerDoSol: data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}) : 'N/A',
            porDoSol: data.sys.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}) : 'N/A',
        };
    } catch (error) {
        console.error("Falha na requisição do clima atual:", error);
        if (statusDiv) statusDiv.textContent = `Erro ao buscar clima: ${error.message}. Verifique o nome da cidade ou sua conexão.`;
        return null;
    }
}

function exibirClimaAtualViagem(dadosClima, nomeCidadeInput) {
    const resultadoDiv = document.getElementById('clima-viagem-resultado');
    const statusDiv = document.getElementById('clima-viagem-status');
    if (!resultadoDiv || !statusDiv) {
        console.error("Elementos da UI para clima da viagem não encontrados.");
        return;
    }
    resultadoDiv.innerHTML = '';
    statusDiv.textContent = '';
    if (!dadosClima) {
        resultadoDiv.innerHTML = '<p>Não foi possível obter o clima atual para o destino.</p>';
        return;
    }
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
        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || `Erro HTTP: ${response.status}`;
            console.error(`Erro ao buscar previsão: ${errorMessage}`, data);
            throw new Error(errorMessage);
        }
        nomeCidadeAtualForecast = data.city.name || cidade; // Armazena o nome da cidade retornado pela API
        return data;
    } catch (error) {
        console.error("Falha na requisição da previsão do tempo:", error);
        if (statusDiv) statusDiv.textContent = `Erro ao buscar previsão: ${error.message}. Verifique o nome da cidade ou sua conexão.`;
        return null;
    }
}

function processarDadosForecast(data) {
    if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
        console.error("Dados da previsão inválidos ou lista vazia:", data);
        return null;
    }
    const diasAgrupados = {};
    data.list.forEach(item => {
        const [dateStr] = item.dt_txt.split(' ');
        if (!diasAgrupados[dateStr]) {
            diasAgrupados[dateStr] = {
                temps: [],
                weatherEntries: []
            };
        }
        diasAgrupados[dateStr].temps.push(item.main.temp);
        diasAgrupados[dateStr].weatherEntries.push({
            time: item.dt_txt.split(' ')[1],
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            // Adicionar mais detalhes se for usar expansão de card
            umidade: item.main.humidity,
            ventoVelocidade: item.wind.speed,
            idCondicao: item.weather[0].id // útil para identificar tipo de chuva/condição
        });
    });

    const previsaoDiariaProcessada = [];
    const datasOrdenadas = Object.keys(diasAgrupados).sort();

    for (const dateKey of datasOrdenadas) {
        const dia = diasAgrupados[dateKey];
        const temp_min = Math.min(...dia.temps);
        const temp_max = Math.max(...dia.temps);
        let representativeWeather = dia.weatherEntries.find(e => e.time === "12:00:00" || e.time === "15:00:00");
        if (!representativeWeather && dia.weatherEntries.length > 0) {
            representativeWeather = dia.weatherEntries[Math.floor(dia.weatherEntries.length / 2)];
        } else if (!representativeWeather) {
            representativeWeather = { description: "N/A", icon: "01d", umidade: "N/A", ventoVelocidade: "N/A" };
        }
        previsaoDiariaProcessada.push({
            data: dateKey,
            temp_min: Math.round(temp_min),
            temp_max: Math.round(temp_max),
            descricao: representativeWeather.description,
            icone: representativeWeather.icon,
            umidade: representativeWeather.umidade, // Guardar para possível expansão
            ventoVelocidade: representativeWeather.ventoVelocidade // Guardar para possível expansão
        });
    }
    return previsaoDiariaProcessada;
}

/**
 * Exibe a previsão do tempo detalhada na interface do usuário.
 * @param {Array<object>} previsaoDiariaCompleta - Array com os dados da previsão processados para todos os dias disponíveis.
 * @param {string} nomeCidade - O nome da cidade para exibição no título.
 * @param {number} [numDiasParaExibir=5] - O número de dias da previsão a serem exibidos.
 */
function exibirPrevisaoDetalhada(previsaoDiariaCompleta, nomeCidade, numDiasParaExibir = 5) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    const statusDiv = document.getElementById('previsao-status');
    const checkDestaqueChuvaEl = document.getElementById('check-destaque-chuva'); // Pegar aqui

    if (!resultadoDiv || !statusDiv) {
        console.error("Elementos da UI para previsão do tempo não encontrados.");
        return;
    }
    resultadoDiv.innerHTML = '';
    // statusDiv.textContent = ''; // Não limpar o status se for erro da API, mas limpar se for sucesso

    if (!previsaoDiariaCompleta || previsaoDiariaCompleta.length === 0) {
        resultadoDiv.innerHTML = '<p>Não foi possível obter a previsão detalhada.</p>';
        return;
    }

    const diasFiltrados = previsaoDiariaCompleta.slice(0, numDiasParaExibir);

    if (diasFiltrados.length === 0) {
         resultadoDiv.innerHTML = `<p>Não há previsão para o(s) dia(s) solicitado(s).</p>`;
         return;
    }

    const titulo = document.createElement('h3');
    titulo.textContent = `Previsão para ${nomeCidade} (Próximos Dias):`;
    resultadoDiv.appendChild(titulo);

    const containerDias = document.createElement('div');
    containerDias.className = 'previsao-dias-container';

    diasFiltrados.forEach(dia => {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'previsao-dia-item';

        // Lógica de Destaque de Chuva
        if (checkDestaqueChuvaEl && checkDestaqueChuvaEl.checked) {
            const descricaoLowerCase = dia.descricao.toLowerCase();
            if (descricaoLowerCase.includes('chuva') || descricaoLowerCase.includes('rain') || 
                descricaoLowerCase.includes('shower') || descricaoLowerCase.includes('drizzle') || 
                descricaoLowerCase.includes('thunderstorm') || descricaoLowerCase.includes('garoa') ||
                descricaoLowerCase.includes('tempestade')) {
                diaDiv.classList.add('dia-chuvoso-destaque');
            }
        }

        const dataObj = new Date(dia.data + "T00:00:00");
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

        diaDiv.innerHTML = `
            <h4>${dataFormatada}</h4>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}" title="${dia.descricao}">
            <p class="descricao-clima">${dia.descricao}</p>
            <p>Min: <span class="temp-min">${dia.temp_min}°C</span></p>
            <p>Máx: <span class="temp-max">${dia.temp_max}°C</span></p>
            <!-- Você pode adicionar um local para mais detalhes (umidade, vento) se implementar expansão de card -->
            <!-- Ex: <div class="detalhes-extras-previsao" style="display:none;">
                        <p>Umidade: ${dia.umidade}%</p>
                        <p>Vento: ${(dia.ventoVelocidade * 3.6).toFixed(1)} km/h</p>
                    </div> -->
        `;
        containerDias.appendChild(diaDiv);
    });
    resultadoDiv.appendChild(containerDias);
    if (statusDiv && statusDiv.textContent === "Carregando previsão detalhada...") { // Limpa "Carregando..." se tudo ok
        statusDiv.textContent = '';
    }
}

// ------------------------------------
// ---- CLASSES DE VEICULOS ----
// ------------------------------------
class Veiculo {
    constructor(modelo, cor, painelId, imagemSrc) {
        if (!modelo || !cor || !painelId || !imagemSrc) {
            throw new Error("Todos os parâmetros (modelo, cor, painelId, imagemSrc) são obrigatórios para Veiculo.");
        }
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.painelId = painelId;
        this.imagemSrc = imagemSrc;
        this.historicoManutencoes = [];
        this.painelElement = null;
    }

    associarPainel() {
        this.painelElement = document.getElementById(this.painelId);
        if (!this.painelElement) {
            console.error(`Painel com ID ${this.painelId} não encontrado para ${this.modelo}`);
        } else {
             this.preencherInfoBasicaPainel();
        }
    }

    ligar() {
        this.ligado = true;
        console.log(`${this.modelo} ligado!`);
        this.playSom('somLigando');
        this.atualizarStatusNaTela();
        this.atualizarBotaoLigarDesligar();
    }

    desligar() {
        this.ligado = false;
        console.log(`${this.modelo} desligado!`);
        this.atualizarStatusNaTela();
        this.atualizarBotaoLigarDesligar();
    }

    buzinar() {
        console.log(`Buzina genérica do ${this.modelo}: Bi bi!`);
    }

    playSom(somId) {
        const som = document.getElementById(somId);
        if (som) {
            som.currentTime = 0;
            som.play().catch(e => console.error("Erro ao tocar som:", e));
        } else {
            console.warn(`Elemento de áudio com ID "${somId}" não encontrado.`);
        }
    }

    atualizarStatusNaTela() {
        if (!this.painelElement) return;
        const statusSpan = this.painelElement.querySelector(`span[id^="status${this.constructor.name.replace('Carro','') }"]`); // Ajuste para ID mais específico se necessário (statusCarro, statusCarroEsportivo)
        if (statusSpan) {
            statusSpan.textContent = this.ligado ? "Ligado" : "Desligado";
        } else {
             console.warn(`Span de status não encontrado no painel ${this.painelId} para ${this.constructor.name}. Tentando ID genérico.`);
             const genericStatusSpan = this.painelElement.querySelector('span[id^="status"]');
             if(genericStatusSpan) genericStatusSpan.textContent = this.ligado ? "Ligado" : "Desligado";
             else console.error(`Span de status DEFINITIVAMENTE não encontrado no painel ${this.painelId}`);
        }
    }

    atualizarBotaoLigarDesligar() {
         if (!this.painelElement) return;
         // Assumindo que os botões Ligar/Desligar têm IDs que incluem o tipo de veículo
         // ex: ligarDesligarCarro, ligarDesligarCarroEsportivo
         const btn = this.painelElement.querySelector(`button[id^="ligarDesligar${this.constructor.name.replace('Carro','')}"]`);
         if (btn) {
            btn.textContent = this.ligado ? "Desligar" : "Ligar";
         } else {
             console.warn(`Botão Ligar/Desligar não encontrado com ID específico no painel ${this.painelId} para ${this.constructor.name}.`);
             // Fallback para um ID mais genérico se o padrão acima não for encontrado
             const genericBtn = this.painelElement.querySelector('button[id^="ligarDesligar"]');
             if(genericBtn) genericBtn.textContent = this.ligado ? "Desligar" : "Ligar";
             else console.error(`Botão Ligar/Desligar DEFINITIVAMENTE não encontrado no painel ${this.painelId}`);
         }
    }

    preencherInfoBasicaPainel() {
        if (!this.painelElement) return;
        const tipoVeiculoNome = this.constructor.name.replace('Carro', ''); // "Carro", "CarroEsportivo", "Caminhao" -> "", "Esportivo", "Caminhao"

        const setSpan = (idPart, value) => {
            // Tenta primeiro com o nome completo da classe (ex: modeloCarro, modeloCarroEsportivo)
            let span = this.painelElement.querySelector(`span#${idPart}${this.constructor.name}`);
            if (!span && tipoVeiculoNome) { // Tenta com o tipo mais curto se o primeiro falhar e tipoVeiculoNome não for vazio
                span = this.painelElement.querySelector(`span#${idPart}${tipoVeiculoNome}`);
            }
             if (span) {
                 span.textContent = value;
             } else {
                // Fallback mais genérico se os IDs no HTML não seguirem esse padrão
                const fallbackSpan = this.painelElement.querySelector(`span[id^="${idPart}"]`);
                 if (fallbackSpan && fallbackSpan.id.toLowerCase().includes(idPart.toLowerCase())) {
                     fallbackSpan.textContent = value;
                 } else {
                    console.warn(`Span para '${idPart}' (tentativas: #${idPart}${this.constructor.name}, #${idPart}${tipoVeiculoNome}) não encontrado no painel ${this.painelId}`);
                 }
             }
        };
        setSpan('modelo', this.modelo);
        setSpan('cor', this.cor);
    }

    adicionarManutencao(manutencao) {
        if (typeof Manutencao !== 'undefined' && manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencoes.push(manutencao);
            console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencao.getRepresentacaoFormatada()}`);
            this.historicoManutencoes.sort((a, b) => a.data - b.data);
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

class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor, 'informacoesCarro', 'imagens/carroNormal.jpg');
        this.velocidade = 0;
        this.somBuzinaId = "somBuzinaCarro";
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
            alert("Ligue o carro para acelerar!");
        }
    }

    frear() {
        if (this.ligado) {
            this.velocidade -= 10;
            if (this.velocidade < 0) this.velocidade = 0;
            console.log(`${this.modelo} freando! Velocidade: ${this.velocidade} km/h`);
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
        const velSpan = this.painelElement.querySelector('span[id^="velocidade"]'); // ID genérico por agora
        if (velSpan) {
            velSpan.textContent = this.velocidade;
        } else {
            console.warn(`Span de velocidade não encontrado no painel ${this.painelId}`);
        }
    }

     associarPainel() {
        super.associarPainel();
        if (this.painelElement) {
            this.atualizarStatusNaTela();
            this.atualizarBotaoLigarDesligar();
            this.atualizarVelocidadeNaTela();
        }
    }
}

class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.painelId = 'informacoesCarroEsportivo';
        this.imagemSrc = 'imagens/carroEsportivo.jpg';
        this.turboAtivado = false;
        this.somBuzinaId = "somBuzinaEsportivo";
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

    acelerar() {
        if (this.ligado) {
            const incremento = this.turboAtivado ? 30 : 15;
            this.velocidade += incremento;
            console.log(`${this.modelo} acelerando ${this.turboAtivado ? 'COM TURBO' : ''}! Velocidade: ${this.velocidade} km/h`);
            this.playSom("somAceleracao");
            this.atualizarVelocidadeNaTela();
        } else {
            alert("Ligue o carro esportivo para acelerar!");
        }
    }

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
        super.desligar();
        this.desativarTurbo();
    }

    buzinar() {
        console.log(`${this.modelo} buzina: Vruum Vruum! (Esportivo)`);
        this.playSom(this.somBuzinaId);
    }

    atualizarTurboNaTela() {
        if (!this.painelElement) return;
        const turboSpan = this.painelElement.querySelector('span[id^="turbo"]');
        if (turboSpan) {
            turboSpan.textContent = this.turboAtivado ? "Ativado" : "Desativado";
        } else {
             console.warn(`Span de turbo não encontrado no painel ${this.painelId}`);
        }
    }

     associarPainel() {
        super.associarPainel();
        if (this.painelElement) {
            this.atualizarTurboNaTela();
        }
    }
}

class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.painelId = 'informacoesCaminhao';
        this.imagemSrc = 'imagens/caminhao.jpg';
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.somBuzinaId = "somBuzinaCaminhao";
    }

     acelerar() {
        if (this.ligado) {
            const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.5)));
            const incremento = Math.round(8 * fatorCarga);
            this.velocidade += incremento > 0 ? incremento : 1;
            console.log(`${this.modelo} acelerando (carga: ${this.cargaAtual}kg)! Velocidade: ${this.velocidade} km/h`);
            this.playSom("somAceleracao");
            this.atualizarVelocidadeNaTela();
        } else {
            alert("Ligue o caminhão para acelerar!");
        }
    }

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
             alert("Ligue o caminhão para carregar!"); return;
        }
        if (typeof quantidade !== 'number' || quantidade <= 0 || isNaN(quantidade)) {
            alert("Quantidade inválida para carregar."); return;
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
             alert("Ligue o caminhão para descarregar!"); return;
        }
         if (typeof quantidade !== 'number' || quantidade <= 0 || isNaN(quantidade)) {
            alert("Quantidade inválida para descarregar."); return;
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
        if (cargaAtualSpan) cargaAtualSpan.textContent = this.cargaAtual;
        else console.warn(`Span #cargaAtualCaminhao não encontrado no painel ${this.painelId}`);
        if (capacidadeSpan) capacidadeSpan.textContent = this.capacidadeCarga;
        else console.warn(`Span #capacidadeCargaCaminhao não encontrado no painel ${this.painelId}`);
    }

     associarPainel() {
        super.associarPainel();
        if (this.painelElement) {
            this.atualizarCargaNaTela();
        }
    }
}

// ------------------------------------
// ---- API SIMULADA (FUNÇÃO) ----
// ------------------------------------
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
  console.log(`Buscando detalhes (API simulada) para: ${identificadorVeiculo}`);
  try {
    const response = await fetch('./dados_veiculos_api.json');
    if (!response.ok) {
      throw new Error(`Erro HTTP ao buscar dados_veiculos_api.json: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, não recebemos JSON! Verifique o arquivo 'dados_veiculos_api.json'.");
    }
    const detalhesTodosVeiculos = await response.json();
    const detalhesVeiculo = detalhesTodosVeiculos.find(veiculo => veiculo.identificador === identificadorVeiculo);
    if (detalhesVeiculo) {
      console.log("Detalhes encontrados:", detalhesVeiculo);
      return detalhesVeiculo;
    } else {
      console.log(`Nenhum detalhe encontrado para o identificador: ${identificadorVeiculo}`);
      return null;
    }
  } catch (error) {
    console.error("Falha ao buscar/processar detalhes da API simulada:", error);
    return null;
  }
}

// ------------------------------------
// ---- CLASSE GARAGEM ----
// ------------------------------------
class Garagem {
    constructor(selecaoContainerId, imagemDisplayId, infoContainerId) {
        this.veiculos = [];
        this.veiculoSelecionado = null;
        this.indiceSelecionado = -1;
        this.selecaoContainer = document.getElementById(selecaoContainerId);
        this.imagemDisplay = document.getElementById(imagemDisplayId);
        this.infoContainer = document.getElementById(infoContainerId);

        if (!this.selecaoContainer || !this.imagemDisplay || !this.infoContainer) {
            console.error("Erro Crítico: Um ou mais elementos da interface da Garagem não foram encontrados!");
            alert("Erro crítico ao inicializar a Garagem. Verifique o console (F12).");
            return;
        }

        this.selecaoContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.dataset.indice) {
                const indice = parseInt(event.target.dataset.indice, 10);
                if(indice !== this.indiceSelecionado) {
                    this.selecionarVeiculoPorIndice(indice);
                }
            }
        });

        this.infoContainer.addEventListener('click', async (event) => {
            if (!this.veiculoSelecionado || !this.veiculoSelecionado.painelElement) return;
            const target = event.target;
            const targetId = target.id;
            const painelAtual = this.veiculoSelecionado.painelElement;

            // Lógica para Ações Comuns (identificadores podem precisar de ajuste)
            if (targetId === `ligarDesligar${this.veiculoSelecionado.constructor.name.replace('Carro','')}`) {
                 if (this.veiculoSelecionado.ligado) this.veiculoSelecionado.desligar();
                 else this.veiculoSelecionado.ligar();
            }
            else if (targetId === `acelerar${this.veiculoSelecionado.constructor.name.replace('Carro','')}`) {
                if (typeof this.veiculoSelecionado.acelerar === 'function') this.veiculoSelecionado.acelerar();
            }
            else if (targetId === `frear${this.veiculoSelecionado.constructor.name.replace('Carro','')}`) {
                if (typeof this.veiculoSelecionado.frear === 'function') this.veiculoSelecionado.frear();
            }
             else if (targetId === `buzinar${this.veiculoSelecionado.constructor.name.replace('Carro','')}`) {
                 if (typeof this.veiculoSelecionado.buzinar === 'function') this.veiculoSelecionado.buzinar();
            }
            // Lógica para Ações Específicas
            else if (this.veiculoSelecionado instanceof CarroEsportivo) {
                if (targetId === 'ativarTurbo') this.veiculoSelecionado.ativarTurbo();
                else if (targetId === 'desativarTurbo') this.veiculoSelecionado.desativarTurbo();
            }
            else if (this.veiculoSelecionado instanceof Caminhao) {
                 const quantidadeInput = painelAtual.querySelector('#quantidadeCarga');
                 const quantidade = quantidadeInput ? parseInt(quantidadeInput.value, 10) : NaN;
                 if (targetId === 'carregarCaminhao') this.veiculoSelecionado.carregar(quantidade);
                 else if (targetId === 'descarregarCaminhao') this.veiculoSelecionado.descarregar(quantidade);
            }
            // API Simulada
            else if (target.classList.contains('btn-detalhes-extras')) {
                const areaDetalhes = painelAtual.querySelector('.area-detalhes-extras');
                const botaoDetalhes = target;
                if (!areaDetalhes) { console.error("Elemento '.area-detalhes-extras' não encontrado."); return; }
                areaDetalhes.innerHTML = '<p><i>Carregando detalhes...</i></p>';
                botaoDetalhes.disabled = true; botaoDetalhes.textContent = 'Carregando...';
                try {
                    const identificador = this.veiculoSelecionado.modelo;
                    const detalhes = await buscarDetalhesVeiculoAPI(identificador);
                    if (detalhes) {
                        areaDetalhes.innerHTML = `
                            <h4>Detalhes Extras:</h4>
                            <p><strong>Valor FIPE:</strong> ${detalhes.valorFIPE || 'N/A'}</p>
                            <p><strong>Recall Pendente:</strong>
                                ${detalhes.recallPendente
                                    ? `<span style="color:red; font-weight:bold;">Sim</span> ${detalhes.recallInfo ? `(${detalhes.recallInfo})` : ''}`
                                    : 'Não'}
                            </p>
                            <p><strong>Última Revisão:</strong> ${detalhes.ultimaRevisao || 'N/A'}</p>
                            <p><strong>Dica:</strong> ${detalhes.dicaManutencao || 'Nenhuma dica disponível.'}</p>
                        `;
                    } else { areaDetalhes.innerHTML = '<p style="color:orange;">Detalhes extras não encontrados ou erro ao buscar.</p>'; }
                } catch (error) {
                    console.error("Erro ao exibir detalhes da API:", error);
                    areaDetalhes.innerHTML = '<p style="color:red;">Ocorreu um erro inesperado ao processar os detalhes.</p>';
                } finally {
                    botaoDetalhes.disabled = false; botaoDetalhes.textContent = 'Ver Detalhes Extras';
                }
            }
        });
    }

    adicionarVeiculo(veiculo) {
        if (veiculo instanceof Veiculo) {
            this.veiculos.push(veiculo);
            const indice = this.veiculos.length - 1;
            this.criarBotaoSelecao(veiculo, indice);
            if (this.indiceSelecionado === -1 && this.veiculos.length === 1) {
                 setTimeout(() => this.selecionarVeiculoPorIndice(0), 0);
            }
        } else {
            console.error("Objeto inválido. Somente instâncias de Veiculo podem ser adicionadas.", veiculo);
        }
    }

    criarBotaoSelecao(veiculo, indice) {
        const button = document.createElement('button');
        button.textContent = `${veiculo.modelo} (${veiculo.constructor.name})`;
        button.dataset.indice = indice;
        this.selecaoContainer.appendChild(button);
    }

    selecionarVeiculoPorIndice(indice) {
        if (indice >= 0 && indice < this.veiculos.length) {
            if (this.indiceSelecionado !== -1) {
                 const btnAntigo = this.selecaoContainer.querySelector(`button[data-indice="${this.indiceSelecionado}"]`);
                 if(btnAntigo) btnAntigo.classList.remove('selecionado');
            }
            this.indiceSelecionado = indice;
            this.veiculoSelecionado = this.veiculos[indice];
            const btnNovo = this.selecaoContainer.querySelector(`button[data-indice="${this.indiceSelecionado}"]`);
            if(btnNovo) btnNovo.classList.add('selecionado');
            console.log(`Veículo selecionado: ${this.veiculoSelecionado.modelo}`);
            this.veiculoSelecionado.associarPainel(); // Isso deve chamar os métodos de atualização inicial
            this.atualizarDisplayGeral();
        } else {
            console.error(`Índice de veículo inválido: ${indice}`);
        }
    }

    atualizarDisplayGeral() {
        if (!this.veiculoSelecionado) {
            this.imagemDisplay.style.display = 'none'; this.imagemDisplay.src = '';
            Array.from(this.infoContainer.children).forEach(painel => {
                if (painel.tagName === 'DIV' && painel.id.startsWith('informacoes')) {
                    painel.style.display = 'none';
                    this.limparAreaDetalhesExtras(painel);
                }
            });
            return;
        }
        this.imagemDisplay.src = this.veiculoSelecionado.imagemSrc;
        this.imagemDisplay.alt = `Imagem de ${this.veiculoSelecionado.modelo}`;
        this.imagemDisplay.style.display = 'block';

        Array.from(this.infoContainer.children).forEach(painel => {
             if (painel.tagName === 'DIV' && painel.id.startsWith('informacoes')) {
                 const deveMostrar = (painel.id === this.veiculoSelecionado.painelId);
                 painel.style.display = deveMostrar ? 'block' : 'none';
                 this.limparAreaDetalhesExtras(painel); // Limpa mesmo o que vai ser mostrado
            }
        });
        // Garante que os métodos de atualização específicos do veículo (velocidade, turbo, carga) são chamados
        // após o painel correto ser associado e tornado visível.
        this.veiculoSelecionado.atualizarStatusNaTela?.(); // Chamada segura
        this.veiculoSelecionado.atualizarBotaoLigarDesligar?.();
        this.veiculoSelecionado.atualizarVelocidadeNaTela?.();
        if(this.veiculoSelecionado instanceof CarroEsportivo) this.veiculoSelecionado.atualizarTurboNaTela?.();
        if(this.veiculoSelecionado instanceof Caminhao) this.veiculoSelecionado.atualizarCargaNaTela?.();
    }

    limparAreaDetalhesExtras(painelElement) {
        if (!painelElement) return;
        const areaDetalhes = painelElement.querySelector('.area-detalhes-extras');
        const botaoDetalhes = painelElement.querySelector('.btn-detalhes-extras');
        if (areaDetalhes) areaDetalhes.innerHTML = '';
        if (botaoDetalhes) {
            botaoDetalhes.disabled = false;
            botaoDetalhes.textContent = 'Ver Detalhes Extras';
        }
    }
    getVeiculoSelecionado() { return this.veiculoSelecionado; }
}

// ------------------------------------
// ---- INICIALIZAÇÃO E EVENTOS GLOBAIS ----
// ------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente carregado e parseado.");

    try {
        const minhaGaragem = new Garagem('selecaoGaragem', 'imagemVeiculoAtual', 'informacoesVeiculoContainer');
        minhaGaragem.adicionarVeiculo(new CarroEsportivo("BMW M3 Competition", "Cinza"));
        minhaGaragem.adicionarVeiculo(new Caminhao("Scania R450", "Branco", 15000));
        minhaGaragem.adicionarVeiculo(new Carro("Corolla Novo", "Branco")); // Corrigido o nome para consistência
        console.log("Garagem inicializada e veículos adicionados.");
    } catch (error) {
        console.error("Erro durante a inicialização da Garagem:", error);
        alert("Ocorreu um erro grave ao iniciar a Garagem. Verifique o console (F12).");
    }

    // --- Event Listener para Previsão do Tempo Detalhada ---
    const verificarClimaBtn = document.getElementById('verificar-clima-btn');
    const cidadeInputForecast = document.getElementById('cidade-input');
    const previsaoStatusDiv = document.getElementById('previsao-status');
    const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');

    if (verificarClimaBtn && cidadeInputForecast && previsaoStatusDiv && previsaoResultadoDiv) {
        verificarClimaBtn.addEventListener('click', async () => {
            const cidade = cidadeInputForecast.value.trim();
            if (!cidade) {
                previsaoStatusDiv.textContent = "Por favor, digite o nome de uma cidade.";
                previsaoResultadoDiv.innerHTML = ''; return;
            }
            previsaoStatusDiv.textContent = "Carregando previsão detalhada...";
            previsaoResultadoDiv.innerHTML = ''; verificarClimaBtn.disabled = true;
            try {
                const dadosApi = await buscarPrevisaoDetalhada(cidade); // nomeCidadeAtualForecast é setado aqui
                if (dadosApi) {
                    const previsaoProcessada = processarDadosForecast(dadosApi);
                    if (previsaoProcessada) {
                        dadosCompletosForecast = previsaoProcessada; // Armazena para filtragem
                        // Usar nomeCidadeAtualForecast que foi pego da API ou fallback para 'cidade' (input)
                        exibirPrevisaoDetalhada(dadosCompletosForecast, nomeCidadeAtualForecast || cidade, numeroDeDiasAtual);
                        previsaoStatusDiv.textContent = '';
                    } else { previsaoStatusDiv.textContent = "Não foi possível processar os dados da previsão."; }
                } else { /* Erro já tratado em buscarPrevisaoDetalhada ou mensagem genérica se necessário */
                    if (!previsaoStatusDiv.textContent.toLowerCase().includes('erro')) {
                        previsaoStatusDiv.textContent = "Erro ao buscar previsão. Verifique o nome da cidade ou console.";
                    }
                }
            } catch (error) {
                console.error("Erro no fluxo de verificação da previsão detalhada:", error);
                previsaoStatusDiv.textContent = `Erro: ${error.message}`;
            } finally { verificarClimaBtn.disabled = false; }
        });
    } else { console.error("Elementos da UI para previsão detalhada não encontrados."); }

    // --- Event Listener para Clima Atual da Viagem ---
    const verificarClimaViagemBtn = document.getElementById('verificar-clima-viagem-btn');
    const destinoViagemInput = document.getElementById('destino-viagem-input');
    const climaViagemStatusDiv = document.getElementById('clima-viagem-status');
    const climaViagemResultadoDiv = document.getElementById('clima-viagem-resultado');

    if (verificarClimaViagemBtn && destinoViagemInput && climaViagemStatusDiv && climaViagemResultadoDiv) {
        verificarClimaViagemBtn.addEventListener('click', async () => {
            const cidadeDestino = destinoViagemInput.value.trim();
            if (!cidadeDestino) {
                climaViagemStatusDiv.textContent = "Por favor, digite a cidade de destino.";
                climaViagemResultadoDiv.innerHTML = ''; return;
            }
            climaViagemStatusDiv.textContent = "Buscando clima atual...";
            climaViagemResultadoDiv.innerHTML = ''; verificarClimaViagemBtn.disabled = true;
            try {
                const dadosClima = await buscarClimaAtualViagem(cidadeDestino);
                if (dadosClima) {
                    exibirClimaAtualViagem(dadosClima, cidadeDestino);
                    climaViagemStatusDiv.textContent = '';
                } else {
                     if (!climaViagemStatusDiv.textContent.toLowerCase().includes('erro')) {
                        climaViagemStatusDiv.textContent = "Erro ao buscar clima atual. Verifique o console.";
                    }
                }
            } catch (error) {
                console.error("Erro no fluxo de verificação do clima da viagem:", error);
                climaViagemStatusDiv.textContent = `Erro: ${error.message}`;
            } finally { verificarClimaViagemBtn.disabled = false; }
        });
    } else { console.error("Elementos da UI para Planejador de Viagem não encontrados."); }

    // --- Event Listeners para Interatividade da Previsão do Tempo ---
    const botoesFiltroPrevisao = document.querySelectorAll('#filtros-previsao-dias .btn-filtro-previsao');
    const checkDestaqueChuva = document.getElementById('check-destaque-chuva');

    botoesFiltroPrevisao.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesFiltroPrevisao.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            numeroDeDiasAtual = parseInt(botao.dataset.dias);
            if (dadosCompletosForecast.length > 0) {
                // Usar nomeCidadeAtualForecast que foi pego da última API ou fallback
                exibirPrevisaoDetalhada(dadosCompletosForecast, nomeCidadeAtualForecast || "a cidade", numeroDeDiasAtual);
            }
        });
    });

    if (checkDestaqueChuva) {
        checkDestaqueChuva.addEventListener('change', () => {
            if (dadosCompletosForecast.length > 0) {
                 // Usar nomeCidadeAtualForecast que foi pego da última API ou fallback
                exibirPrevisaoDetalhada(dadosCompletosForecast, nomeCidadeAtualForecast || "a cidade", numeroDeDiasAtual);
            }
        });
    }
});