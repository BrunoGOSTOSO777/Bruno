/* ==================================================================
   PARTE 1: DEFINIÇÃO DAS CLASSES (OS MOLDES DOS VEÍCULOS)
================================================================== */

// CLASSE PAI (SUPERCLASSE)
class Veiculo {
    constructor(modelo, cor, imagem, velocidadeMaxima) {
        this.modelo = modelo;
        this.cor = cor;
        this.imagem = imagem; // Caminho para a imagem
        this.velocidadeMaxima = velocidadeMaxima;
        this.ligado = false;
        this.velocidade = 0;
    }

    // Retorna true se a operação foi bem-sucedida, false caso contrário
    ligar() {
        if (this.ligado) {
            exibirAlerta(`${this.modelo} já está ligado.`);
            return false;
        }
        this.ligado = true;
        return true;
    }

    desligar() {
        if (!this.ligado) {
            exibirAlerta(`${this.modelo} já está desligado.`);
            return false;
        }
        if (this.velocidade > 0) {
            exibirAlerta(`Freie o ${this.modelo} antes de desligar!`);
            return false;
        }
        this.ligado = false;
        this.velocidade = 0;
        return true;
    }

    acelerar() {
        if (!this.ligado) {
            exibirAlerta(`Ligue o ${this.modelo} para acelerar.`);
            return false;
        }
        if (this.velocidade >= this.velocidadeMaxima) {
            exibirAlerta(`${this.modelo} já atingiu a velocidade máxima!`);
            return false;
        }
        this.velocidade = Math.min(this.velocidade + 10, this.velocidadeMaxima);
        return true;
    }

    frear() {
        if (this.velocidade === 0) {
            exibirAlerta(`${this.modelo} já está parado.`);
            return false;
        }
        this.velocidade = Math.max(this.velocidade - 10, 0);
        return true;
    }

    buzinar() {
        tocarSom('audioBuzina');
    }

    // MÉTODO POLIMÓRFICO
    exibirInformacoes() {
        const statusTexto = this.ligado ? 'Ligado' : 'Desligado';
        const statusClasse = this.ligado ? 'status-ligado' : 'status-desligado';
        return `Modelo: ${this.modelo}\nCor: ${this.cor}\nStatus: ${statusTexto} <span class="status-indicator ${statusClasse}"></span>\nVelocidade: ${this.velocidade} km/h`;
    }
}

// CLASSE FILHA: Carro
class Carro extends Veiculo {
    constructor(modelo, cor) {
        // Define imagem e velocidade máxima específicas para o Carro comum
        super(modelo, cor, 'images/carro_comum.png', 120);
    }
}

// CLASSE FILHA: CarroEsportivo
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor) {
        // Define imagem e velocidade máxima específicas para o Carro Esportivo
        super(modelo, cor, 'images/carro_esportivo.png', 250);
        this.turboAtivado = false;
    }

    ativarTurbo() {
        if (!this.ligado) {
            exibirAlerta("Ligue o carro para ativar o turbo!");
            return false;
        }
        if (this.turboAtivado) {
            exibirAlerta("O turbo já está ativado!");
            return false;
        }
        this.turboAtivado = true;
        // O turbo adiciona um bônus à velocidade máxima temporariamente
        this.velocidade = Math.min(this.velocidade + 50, this.velocidadeMaxima + 50);
        return true;
    }
    
    // Sobrescreve desligar para garantir que o turbo seja desativado
    desligar() {
        const sucesso = super.desligar(); // Chama o método do pai primeiro
        if (sucesso) {
            this.turboAtivado = false;
        }
        return sucesso;
    }
    
    // SOBRESCRITA DO MÉTODO (Polimorfismo)
    exibirInformacoes() {
        const infoBasica = super.exibirInformacoes();
        const turboTexto = `\nTurbo: ${this.turboAtivado ? "ATIVADO" : "Desativado"}`;
        return infoBasica + turboTexto;
    }
}

// CLASSE FILHA: Caminhao
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor, 'images/caminhao.png', 90);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(peso) {
        if (this.ligado) {
            exibirAlerta("Não é seguro carregar um caminhão ligado!");
            return false;
        }
        if (this.cargaAtual + peso > this.capacidadeCarga) {
            exibirAlerta(`Carga excede a capacidade máxima de ${this.capacidadeCarga}kg!`);
            return false;
        }
        this.cargaAtual += peso;
        exibirAlerta(`Carregado ${peso}kg. Carga atual: ${this.cargaAtual}kg.`);
        return true;
    }

    // SOBRESCRITA DO MÉTODO (Polimorfismo)
    exibirInformacoes() {
        const infoBasica = super.exibirInformacoes();
        const cargaTexto = `\nCarga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
        return infoBasica + cargaTexto;
    }
}

/* ==================================================================
   PARTE 2: A CLASSE GARAGEM (O GERENCIADOR)
================================================================== */

class Garagem {
    constructor() {
        this.veiculos = [];
        this.veiculoSelecionado = null;
    }

    adicionarVeiculo(veiculo) {
        this.veiculos.push(veiculo);
    }

    selecionarVeiculo(indice) {
        if (indice >= 0 && indice < this.veiculos.length) {
            this.veiculoSelecionado = this.veiculos[indice];
        }
    }

    interagir(acao, valor = 0) {
        const veiculo = this.veiculoSelecionado;
        if (!veiculo) {
            exibirAlerta("Por favor, selecione um veículo primeiro.");
            return;
        }

        let sucesso = false;
        switch (acao) {
            case 'ligar':
                if (veiculo.ligar()) tocarSom('audioLigar');
                break;
            case 'desligar':
                if (veiculo.desligar()) tocarSom('audioDesligar');
                break;
            case 'acelerar':
                if (veiculo.acelerar()) tocarSom('audioAcelerar');
                break;
            case 'frear':
                if (veiculo.frear()) tocarSom('audioFrear');
                break;
            case 'buzinar':
                veiculo.buzinar(); // Buzina não tem estado de sucesso/falha
                break;
            case 'ativarTurbo':
                if (veiculo instanceof CarroEsportivo) {
                    if (veiculo.ativarTurbo()) tocarSom('audioAcelerar'); // Reusa som de aceleração
                } else {
                    exibirAlerta("Este veículo não possui turbo!");
                }
                break;
            case 'carregar':
                if (veiculo instanceof Caminhao) {
                    veiculo.carregar(valor); // O próprio método já exibe alerta
                } else {
                    exibirAlerta("Este veículo não pode ser carregado!");
                }
                break;
        }
        atualizarUI();
    }
}

/* ==================================================================
   PARTE 3: FUNÇÕES AUXILIARES E MANIPULAÇÃO DO DOM
================================================================== */

// --- FUNÇÕES AUXILIARES ---
function exibirAlerta(mensagem) {
    // No futuro, isso pode ser trocado por um modal mais elegante
    alert(mensagem);
}

function tocarSom(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0; // Reinicia o som para que possa ser tocado de novo rapidamente
        audio.play();
    }
}

// --- ELEMENTOS DO DOM ---
const painelInteracao = document.getElementById('painel-interacao');
const elVeiculoSelecionado = document.getElementById('veiculoSelecionado');
const elInformacoesVeiculo = document.getElementById('informacoesVeiculo');
const elImagemVeiculo = document.getElementById('imagemVeiculo');
const elVelocimetroBarra = document.getElementById('velocimetro-barra');
const elControlesAcoes = document.getElementById('controles-acoes');
const elBtnTurbo = document.getElementById('btnTurbo');
const elControlesCaminhao = document.getElementById('controlesCaminhao');
const elInputCarga = document.getElementById('inputCarga');

// --- INICIALIZAÇÃO ---
const minhaGaragem = new Garagem();
minhaGaragem.adicionarVeiculo(new Carro("Fusca", "Azul"));
minhaGaragem.adicionarVeiculo(new CarroEsportivo("Ferrari 488", "Vermelho"));
minhaGaragem.adicionarVeiculo(new Caminhao("Scania R450", "Branco", 5000));

// --- FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO DA INTERFACE ---
function atualizarUI() {
    const veiculo = minhaGaragem.veiculoSelecionado;
    if (!veiculo) {
        painelInteracao.classList.add('hidden');
        return;
    }

    painelInteracao.classList.remove('hidden');

    // Atualiza título, imagem e informações (aqui o polimorfismo brilha!)
    elVeiculoSelecionado.textContent = `Controlando: ${veiculo.modelo}`;
    elImagemVeiculo.src = veiculo.imagem;
    elInformacoesVeiculo.innerHTML = veiculo.exibirInformacoes();

    // Atualiza o velocímetro
    const percentualVelocidade = (veiculo.velocidade / veiculo.velocidadeMaxima) * 100;
    elVelocimetroBarra.style.width = `${percentualVelocidade}%`;

    // Mostra/Esconde botões específicos
    elBtnTurbo.style.display = (veiculo instanceof CarroEsportivo) ? 'inline-block' : 'none';
    elControlesCaminhao.classList.toggle('hidden', !(veiculo instanceof Caminhao));
}

// --- EVENT LISTENERS (CLIQUES DOS BOTÕES) ---

// Seleção de Veículo
document.getElementById('btnCarro').addEventListener('click', () => {
    minhaGaragem.selecionarVeiculo(0);
    atualizarUI();
});
document.getElementById('btnEsportivo').addEventListener('click', () => {
    minhaGaragem.selecionarVeiculo(1);
    atualizarUI();
});
document.getElementById('btnCaminhao').addEventListener('click', () => {
    minhaGaragem.selecionarVeiculo(2);
    atualizarUI();
});

// Ações do Veículo (usando delegação de eventos)
elControlesAcoes.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.acao) {
        const acao = event.target.dataset.acao;
        minhaGaragem.interagir(acao);
    }
});

// Ação de Carregar Caminhão
document.querySelector('#controlesCaminhao button').addEventListener('click', () => {
    const peso = parseInt(elInputCarga.value, 10);
    if (!isNaN(peso) && peso > 0) {
        minhaGaragem.interagir('carregar', peso);
        elInputCarga.value = '';
    } else {
        exibirAlerta("Por favor, insira um peso válido.");
    }
});