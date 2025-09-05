// --- CLASSE BASE (PAI DE TODOS) ---
// Agora o construtor também recebe o caminho para o som da buzina
class Veiculo {
    constructor(modelo, cor, imagem, arquivoSomBuzina) {
        this.modelo = modelo;
        this.cor = cor;
        this.imagem = imagem;
        this.ligado = false;
        
        // Cria um objeto de áudio para a buzina deste veículo
        this.somBuzina = new Audio(arquivoSomBuzina);
    }

    ligar() {
        if (!this.ligado) this.ligado = true;
    }

    desligar() {
        if (this.ligado) this.ligado = false;
    }

    buzinar() {
        // Toca o som da buzina
        this.somBuzina.currentTime = 0; // Dica: Reinicia o som se ele já estiver tocando
        this.somBuzina.play();
    }
}

// --- CLASSE FILHA: CARRO (HERDA DE VEICULO) ---
class Carro extends Veiculo {
    constructor(modelo, cor, imagem, arquivoSomBuzina) {
        // Passa todos os parâmetros para o construtor da classe pai (Veiculo)
        super(modelo, cor, imagem, arquivoSomBuzina);
        this.velocidade = 0;
    }

    acelerar() {
        if (this.ligado && this.velocidade < 180) this.velocidade += 10;
    }

    frear() {
        if (this.velocidade > 0) this.velocidade -= 10;
    }
    
    // O método buzinar agora é herdado diretamente da classe Veiculo,
    // então não precisamos mais reescrevê-lo aqui, a menos que quiséssemos
    // um comportamento especial além de tocar o som.

    desligar() {
        super.desligar();
        this.velocidade = 0;
    }
}

// --- CLASSE FILHA: CARRO ESPORTIVO (HERDA DE CARRO) ---
class CarroEsportivo extends Carro {
    constructor(modelo, cor, imagem, arquivoSomBuzina) {
        super(modelo, cor, imagem, arquivoSomBuzina);
        this.turboAtivado = false;
    }

    ativarTurbo() {
        if (this.ligado) {
            this.turboAtivado = true;
            this.velocidade += 50;
        }
    }

    desativarTurbo() {
        this.turboAtivado = false;
    }
}

// --- CLASSE FILHA: CAMINHÃO (HERDA DE CARRO) ---
class Caminhao extends Carro {
    constructor(modelo, cor, imagem, capacidadeCarga, arquivoSomBuzina) {
        super(modelo, cor, imagem, arquivoSomBuzina);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(peso) {
        if (this.velocidade === 0) {
            if (this.cargaAtual + peso <= this.capacidadeCarga) {
                this.cargaAtual += peso;
                alert(`Carga de ${peso}kg adicionada!`);
            } else {
                alert(`Excesso de peso! A capacidade máxima é ${this.capacidadeCarga}kg.`);
            }
        } else {
            alert("Pare o caminhão para poder carregar!");
        }
    }

    acelerar() {
        if (this.ligado && this.velocidade < 100) this.velocidade += 5;
    }
}

// --- LÓGICA DA PÁGINA (INTERAÇÃO COM O HTML) ---

// 1. Criar os objetos, passando o caminho do som da buzina para cada um
const meuCarro = new Carro("Corolla", "Branco", "imagens/carro-normal.png", "sons/buzina-carro.mp3");
const meuCarroEsportivo = new CarroEsportivo("LaFerrari", "Vermelho", "imagens/ferrari.jpg", "sons/buzina-esportiva.mp3");
const meuCaminhao = new Caminhao("Volvo", "Prateado", "imagens/caminhao.jpg", 47000, "sons/buzina-caminhao.mp3");
let veiculoAtual = meuCarro;

// O restante do código de interação com o HTML (a partir da linha "Pegar os elementos do HTML")
// permanece exatamente o mesmo de antes.
// ... (cole o restante do seu código JS aqui, sem alterações)
const vehicleImage = document.getElementById("vehicle-image");
const vehicleModel = document.getElementById("vehicle-model");
const vehicleColor = document.getElementById("vehicle-color");
const vehicleStatus = document.getElementById("vehicle-status");
const vehicleSpeed = document.getElementById("vehicle-speed");
const sportInfoPanel = document.getElementById("sport-info");
const turboStatus = document.getElementById("turbo-status");
const truckInfoPanel = document.getElementById("truck-info");
const truckCapacity = document.getElementById("truck-capacity");
const truckLoad = document.getElementById("truck-load");
const sportControlsPanel = document.getElementById("sport-controls");
const truckControlsPanel = document.getElementById("truck-controls");
const inputCarga = document.getElementById("input-carga");

function atualizarDisplay() {
    vehicleModel.textContent = veiculoAtual.modelo;
    vehicleColor.textContent = veiculoAtual.cor;
    vehicleImage.src = veiculoAtual.imagem;
    vehicleStatus.textContent = veiculoAtual.ligado ? "Ligado" : "Desligado";
    vehicleSpeed.textContent = veiculoAtual.velocidade;
    vehicleImage.classList.toggle('vehicle-on', veiculoAtual.ligado);

    sportInfoPanel.style.display = 'none';
    truckInfoPanel.style.display = 'none';
    sportControlsPanel.style.display = 'none';
    truckControlsPanel.style.display = 'none';

    if (veiculoAtual instanceof CarroEsportivo) {
        sportInfoPanel.style.display = 'block';
        sportControlsPanel.style.display = 'flex';
        turboStatus.textContent = veiculoAtual.turboAtivado ? "Ativado" : "Desativado";
    } else if (veiculoAtual instanceof Caminhao) {
        truckInfoPanel.style.display = 'block';
        truckControlsPanel.style.display = 'flex';
        truckCapacity.textContent = veiculoAtual.capacidadeCarga;
        truckLoad.textContent = veiculoAtual.cargaAtual;
    }
    
    document.querySelectorAll('#vehicle-selector button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (veiculoAtual === meuCarro) document.getElementById('btn-select-car').classList.add('active');
    if (veiculoAtual === meuCarroEsportivo) document.getElementById('btn-select-sport').classList.add('active');
    if (veiculoAtual === meuCaminhao) document.getElementById('btn-select-truck').classList.add('active');
}

document.body.addEventListener('click', (event) => {
    const targetId = event.target.id;
    if (event.target.tagName !== 'BUTTON') return;

    if (targetId === 'btn-select-car') veiculoAtual = meuCarro;
    if (targetId === 'btn-select-sport') veiculoAtual = meuCarroEsportivo;
    if (targetId === 'btn-select-truck') veiculoAtual = meuCaminhao;

    switch(targetId) {
        case 'btn-ligar': veiculoAtual.ligar(); break;
        case 'btn-desligar': veiculoAtual.desligar(); break;
        case 'btn-acelerar': 
            veiculoAtual.acelerar(); 
            vehicleImage.classList.add("move-vehicle");
            setTimeout(() => vehicleImage.classList.remove("move-vehicle"), 400);
            break;
        case 'btn-frear': veiculoAtual.frear(); break;
        case 'btn-buzinar': veiculoAtual.buzinar(); break;
        case 'btn-turbo-on': if(veiculoAtual.ativarTurbo) veiculoAtual.ativarTurbo(); break;
        case 'btn-turbo-off': if(veiculoAtual.desativarTurbo) veiculoAtual.desativarTurbo(); break;
        case 'btn-carregar':
            const carga = parseInt(inputCarga.value, 10);
            if (!isNaN(carga) && carga > 0) {
                if(veiculoAtual.carregar) veiculoAtual.carregar(carga);
                inputCarga.value = '';
            } else {
                alert("Por favor, insira um peso válido.");
            }
            break;
    }
    
    atualizarDisplay();
});

window.onload = atualizarDisplay;