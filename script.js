document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: DEFINIÇÃO DAS CLASSES COM HERANÇA ---
    
    // Classe base 'Veiculo'
    class Veiculo {
        constructor(modelo, cor) {
            this.modelo = modelo;
            this.cor = cor;
            this.ligado = false;
        }

        ligar() {
            if (this.ligado) { console.log(`O ${this.modelo} já está ligado!`); return; }
            this.ligado = true;
            console.log(`${this.modelo} ligado! Vrum vrum!`);
        }

        desligar() {
            if (!this.ligado) { console.log(`O ${this.modelo} já está desligado.`); return; }
            this.ligado = false;
            console.log(`${this.modelo} desligado.`);
        }
        
        buzinar() { alert("BEEP!"); }
    }
    
    // Sua classe Carro, evoluída para herdar de Veiculo e ter o método frear
    class Carro extends Veiculo {
        constructor(modelo, cor) {
            super(modelo, cor);
            this.velocidade = 0;
        }

        desligar() {
            if (this.velocidade > 0) {
                alert("Perigo! Desacelere o carro completamente antes de desligar.");
                return;
            }
            super.desligar();
        }

        acelerar() {
            if (!this.ligado) { alert("Primeiro você precisa ligar o carro!"); return; }
            this.velocidade += 10;
        }

        frear() {
            this.velocidade = Math.max(0, this.velocidade - 10); // Garante que a velocidade não fique negativa
        }
        
        buzinar() { alert("Bibi! Fon-fon!"); }
    }

    // Classe CarroEsportivo que herda de Carro
    class CarroEsportivo extends Carro {
        constructor(modelo, cor) {
            super(modelo, cor);
            this.turboAtivado = false;
        }

        ativarTurbo() {
            if (!this.ligado) { alert("Ligue o carro para ativar o turbo!"); return; }
            if (this.turboAtivado) { alert("Turbo já ativado!"); return; }
            this.turboAtivado = true;
            this.velocidade += 50;
            alert("TURBO ATIVADO!");
        }
        
        desativarTurbo() {
            if (!this.turboAtivado) return;
            this.turboAtivado = false;
            alert("Turbo desativado.");
        }
        
        buzinar() { alert("VROOOM PA-PÁ!"); }
    }

    // Classe Caminhao que herda de Carro
    class Caminhao extends Carro {
        constructor(modelo, cor, capacidadeCarga) {
            super(modelo, cor);
            this.capacidadeCarga = capacidadeCarga;
            this.cargaAtual = 0;
        }
        
        acelerar() { // Acelera mais devagar
            if (!this.ligado) { alert("Primeiro você precisa ligar o caminhão!"); return; }
            this.velocidade += 5;
        }

        carregar(peso) {
            const pesoNumerico = Number(peso);
            if (isNaN(pesoNumerico) || pesoNumerico <= 0) { alert("Valor de carga inválido."); return; }
            if ((this.cargaAtual + pesoNumerico) > this.capacidadeCarga) {
                alert(`Carga excedida! Capacidade máxima: ${this.capacidadeCarga}kg.`);
            } else {
                this.cargaAtual += pesoNumerico;
                alert(`${pesoNumerico}kg carregados.`);
            }
        }
        
        buzinar() { alert("FÕOOOOM! FÕOOOOM!"); }
    }

    // --- CRIAÇÃO DOS TRÊS OBJETOS ---
    const meuOpala = new Carro('Opala', 'Vermelho'); // Seu carro original
    const meuCarroEsportivo = new CarroEsportivo('Ferrari 488', 'Vermelha');
    const meuCaminhao = new Caminhao('Scania R450', 'Branco', 25000);

    // --- Funções para atualizar os painéis de cada veículo ---

    function atualizarDisplayOpala() {
        document.getElementById('opala-modelo').textContent = meuOpala.modelo;
        document.getElementById('opala-cor').textContent = meuOpala.cor;
        document.getElementById('opala-estado').textContent = meuOpala.ligado ? "Ligado" : "Desligado";
        document.getElementById('opala-velocidade').textContent = meuOpala.velocidade;
    }

    function atualizarDisplayEsportivo() {
        document.getElementById('esportivo-modelo').textContent = meuCarroEsportivo.modelo;
        document.getElementById('esportivo-cor').textContent = meuCarroEsportivo.cor;
        document.getElementById('esportivo-estado').textContent = meuCarroEsportivo.ligado ? "Ligado" : "Desligado";
        document.getElementById('esportivo-velocidade').textContent = meuCarroEsportivo.velocidade;
        document.getElementById('esportivo-turbo').textContent = meuCarroEsportivo.turboAtivado ? "ATIVADO" : "Desligado";
    }

    function atualizarDisplayCaminhao() {
        document.getElementById('caminhao-modelo').textContent = meuCaminhao.modelo;
        document.getElementById('caminhao-cor').textContent = meuCaminhao.cor;
        document.getElementById('caminhao-estado').textContent = meuCaminhao.ligado ? "Ligado" : "Desligado";
        document.getElementById('caminhao-velocidade').textContent = meuCaminhao.velocidade;
        document.getElementById('caminhao-capacidade').textContent = meuCaminhao.capacidadeCarga;
        document.getElementById('caminhao-carga-atual').textContent = meuCaminhao.cargaAtual;
    }
    
    // --- EVENTOS PARA O OPALA ---
    document.getElementById('opala-ligar').addEventListener('click', () => { meuOpala.ligar(); atualizarDisplayOpala(); });
    document.getElementById('opala-desligar').addEventListener('click', () => { meuOpala.desligar(); atualizarDisplayOpala(); });
    document.getElementById('opala-acelerar').addEventListener('click', () => { meuOpala.acelerar(); atualizarDisplayOpala(); });
    document.getElementById('opala-frear').addEventListener('click', () => { meuOpala.frear(); atualizarDisplayOpala(); });
    document.getElementById('opala-buzinar').addEventListener('click', () => meuOpala.buzinar());

    // --- EVENTOS PARA O CARRO ESPORTIVO ---
    document.getElementById('esportivo-ligar').addEventListener('click', () => { meuCarroEsportivo.ligar(); atualizarDisplayEsportivo(); });
    document.getElementById('esportivo-desligar').addEventListener('click', () => { meuCarroEsportivo.desligar(); atualizarDisplayEsportivo(); });
    document.getElementById('esportivo-acelerar').addEventListener('click', () => { meuCarroEsportivo.acelerar(); atualizarDisplayEsportivo(); });
    document.getElementById('esportivo-frear').addEventListener('click', () => { meuCarroEsportivo.frear(); atualizarDisplayEsportivo(); });
    document.getElementById('esportivo-ativar-turbo').addEventListener('click', () => { meuCarroEsportivo.ativarTurbo(); atualizarDisplayEsportivo(); });
    document.getElementById('esportivo-desativar-turbo').addEventListener('click', () => { meuCarroEsportivo.desativarTurbo(); atualizarDisplayEsportivo(); });
    document.getElementById('esportivo-buzinar').addEventListener('click', () => meuCarroEsportivo.buzinar());

    // --- EVENTOS PARA O CAMINHÃO ---
    document.getElementById('caminhao-ligar').addEventListener('click', () => { meuCaminhao.ligar(); atualizarDisplayCaminhao(); });
    document.getElementById('caminhao-desligar').addEventListener('click', () => { meuCaminhao.desligar(); atualizarDisplayCaminhao(); });
    document.getElementById('caminhao-acelerar').addEventListener('click', () => { meuCaminhao.acelerar(); atualizarDisplayCaminhao(); });
    document.getElementById('caminhao-frear').addEventListener('click', () => { meuCaminhao.frear(); atualizarDisplayCaminhao(); });
    document.getElementById('caminhao-carregar').addEventListener('click', () => {
        const input = document.getElementById('caminhao-input-carga');
        meuCaminhao.carregar(input.value);
        atualizarDisplayCaminhao();
        input.value = '';
    });
    document.getElementById('caminhao-buzinar').addEventListener('click', () => meuCaminhao.buzinar());

    // --- INICIALIZAÇÃO DA TELA ---
    atualizarDisplayOpala();
    atualizarDisplayEsportivo();
    atualizarDisplayCaminhao();
});