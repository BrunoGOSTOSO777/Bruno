// ------------------------------------
// ---- CLASSE MANUTENCAO (Opcional) ----
// ------------------------------------
// (Coloque a classe Manutencao aqui se não estiver em arquivo separado)
// class Manutencao { ... }


// ------------------------------------
// ---- CLASSES DE VEICULOS ----
// ------------------------------------

// Classe Base: Veiculo (adicionando IDs dos elementos do painel)
class Veiculo {
    constructor(modelo, cor, painelId, imagemSrc) {
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
        }
    }

    atualizarBotaoLigarDesligar() {
         if (!this.painelElement) return;
         const btn = this.painelElement.querySelector('button[id^="ligarDesligar"]');
         if (btn) {
            btn.textContent = this.ligado ? "Desligar" : "Ligar";
         }
    }

     // Atualiza informações estáticas (modelo, cor) no painel
     preencherInfoBasicaPainel() {
        if (!this.painelElement) return;
        const setSpan = (idPart, value) => {
            const span = this.painelElement.querySelector(`span[id^="${idPart}"]`);
            if (span) span.textContent = value;
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
        }
    }

     // Sobrescreve para incluir atualização de velocidade
     associarPainel() {
        super.associarPainel();
        this.atualizarVelocidadeNaTela(); // Garante que a velocidade seja exibida ao selecionar
        this.preencherInfoBasicaPainel(); // Preenche modelo/cor
        this.atualizarStatusNaTela(); // Garante status correto
        this.atualizarBotaoLigarDesligar(); // Garante texto do botão
    }
}

// --- Classe CarroEsportivo ---
class CarroEsportivo extends Carro {
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
            // O turbo em si pode aumentar a aceleração na próxima chamada de acelerar
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

    acelerar() { // Sobrescreve para considerar o turbo
        if (this.ligado) {
            const incremento = this.turboAtivado ? 30 : 15; // Acelera mais rápido, mais ainda com turbo
            this.velocidade += incremento;
            console.log(`${this.modelo} acelerando ${this.turboAtivado ? 'COM TURBO' : ''}! Velocidade: ${this.velocidade} km/h`);
            this.playSom("somAceleracao"); // Mesmo som, talvez mais intenso?
            this.atualizarVelocidadeNaTela();
        } else {
            alert("Ligue o carro esportivo para acelerar!");
        }
    }

     // Freio talvez um pouco mais forte
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
        const turboSpan = this.painelElement.querySelector('span[id^="turbo"]');
        if (turboSpan) {
            turboSpan.textContent = this.turboAtivado ? "Ativado" : "Desativado";
        }
    }

     // Sobrescreve para incluir atualização de turbo
     associarPainel() {
        super.associarPainel(); // Chama o associarPainel do Carro
        this.atualizarTurboNaTela(); // Garante que o status do turbo seja exibido
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

     // Aceleração mais lenta
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

    // Freio menos eficaz com carga
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
        if (typeof quantidade !== 'number' || quantidade <= 0) {
            alert("Quantidade inválida para carregar.");
            return;
        }
        if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
            this.cargaAtual += quantidade;
            console.log(`Caminhão carregado com ${quantidade}kg. Carga atual: ${this.cargaAtual} kg`);
            this.atualizarCargaNaTela();
        } else {
            alert(`Não é possível carregar ${quantidade}kg. Capacidade máxima (${this.capacidadeCarga}kg) excedida!`);
        }
    }

    descarregar(quantidade) {
         if (!this.ligado) {
             alert("Ligue o caminhão para descarregar!");
             return;
        }
         if (typeof quantidade !== 'number' || quantidade <= 0) {
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
        if (cargaAtualSpan) cargaAtualSpan.textContent = this.cargaAtual;
        if (capacidadeSpan) capacidadeSpan.textContent = this.capacidadeCarga; // Capacidade pode ser estática, mas atualiza aqui tb
    }

    // Sobrescreve para incluir carga e capacidade
     associarPainel() {
        super.associarPainel(); // Chama o associarPainel do Carro
        this.atualizarCargaNaTela(); // Garante que a carga seja exibida
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
        this.infoContainer = document.getElementById(infoContainerId); // Div que contém todos os painéis de info

        if (!this.selecaoContainer || !this.imagemDisplay || !this.infoContainer) {
            console.error("Erro: Um ou mais elementos da interface da Garagem não foram encontrados!");
            return; // Impede a continuação se elementos cruciais faltam
        }

        // Adiciona listener para cliques nos botões de seleção
        this.selecaoContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.dataset.indice) {
                const indice = parseInt(event.target.dataset.indice, 10);
                this.selecionarVeiculoPorIndice(indice);
            }
        });

        // Adiciona listeners DELEGADOS para os botões de ação
        // Isso evita adicionar um listener para cada botão de cada painel
        this.infoContainer.addEventListener('click', (event) => {
            if (!this.veiculoSelecionado) return; // Nenhum veículo selecionado

            const targetId = event.target.id; // ID do botão clicado

            // Ligar/Desligar (genérico para todos)
            if (targetId.startsWith('ligarDesligar')) {
                 if (this.veiculoSelecionado.ligado) {
                    this.veiculoSelecionado.desligar();
                 } else {
                    this.veiculoSelecionado.ligar();
                 }
            }
            // Acelerar (genérico)
            else if (targetId.startsWith('acelerar')) {
                this.veiculoSelecionado.acelerar();
            }
            // Frear (genérico)
            else if (targetId.startsWith('frear')) {
                this.veiculoSelecionado.frear();
            }
            // Buzinar (genérico)
             else if (targetId.startsWith('buzinar')) {
                this.veiculoSelecionado.buzinar();
            }
            // Ações específicas do CarroEsportivo
            else if (this.veiculoSelecionado instanceof CarroEsportivo) {
                if (targetId === 'ativarTurbo') {
                    this.veiculoSelecionado.ativarTurbo();
                } else if (targetId === 'desativarTurbo') {
                    this.veiculoSelecionado.desativarTurbo();
                }
            }
            // Ações específicas do Caminhão
            else if (this.veiculoSelecionado instanceof Caminhao) {
                 const quantidadeInput = this.infoContainer.querySelector('#quantidadeCarga');
                 const quantidade = quantidadeInput ? parseInt(quantidadeInput.value, 10) : NaN;

                 if (targetId === 'carregarCaminhao') {
                    if (!isNaN(quantidade)) {
                       this.veiculoSelecionado.carregar(quantidade);
                    } else {
                       alert("Digite uma quantidade válida para carregar.");
                    }
                 } else if (targetId === 'descarregarCaminhao') {
                     if (!isNaN(quantidade)) {
                        this.veiculoSelecionado.descarregar(quantidade);
                     } else {
                         alert("Digite uma quantidade válida para descarregar.");
                     }
                 }
            }
        });
    } // Fim do constructor

    adicionarVeiculo(veiculo) {
        if (veiculo instanceof Veiculo) {
            this.veiculos.push(veiculo);
            const indice = this.veiculos.length - 1;
            this.criarBotaoSelecao(veiculo, indice);

            // Seleciona o primeiro veículo adicionado automaticamente
            if (this.indiceSelecionado === -1) {
                this.selecionarVeiculoPorIndice(0);
            }
        } else {
            console.error("Objeto inválido. Somente instâncias de Veiculo podem ser adicionadas.");
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
            // Desmarcar botão antigo (se houver)
            if (this.indiceSelecionado !== -1) {
                 const btnAntigo = this.selecaoContainer.querySelector(`button[data-indice="${this.indiceSelecionado}"]`);
                 if(btnAntigo) btnAntigo.classList.remove('selecionado');
            }

            this.indiceSelecionado = indice;
            this.veiculoSelecionado = this.veiculos[indice];

            // Marcar botão novo
            const btnNovo = this.selecaoContainer.querySelector(`button[data-indice="${this.indiceSelecionado}"]`);
             if(btnNovo) btnNovo.classList.add('selecionado');


            console.log(`Veículo selecionado: ${this.veiculoSelecionado.modelo}`);

            // Associa o painel ao objeto veículo (para ele saber onde atualizar)
            this.veiculoSelecionado.associarPainel();

            // Atualiza a interface
            this.atualizarDisplayGeral();

        } else {
            console.error(`Índice de veículo inválido: ${indice}`);
        }
    }

    atualizarDisplayGeral() {
        if (!this.veiculoSelecionado) {
            this.imagemDisplay.style.display = 'none';
             // Esconde todos os painéis de informação
            Array.from(this.infoContainer.children).forEach(painel => {
                if (painel.id.startsWith('informacoes')) { // Verifica se é um painel de info
                    painel.style.display = 'none';
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
             if (painel.id.startsWith('informacoes')) {
                painel.style.display = (painel.id === this.veiculoSelecionado.painelId) ? 'block' : 'none';
            }
        });

         // Chama o método do veículo para preencher/atualizar seus dados específicos no painel
         // O método associarPainel já faz as atualizações iniciais necessárias
         // this.veiculoSelecionado.associarPainel(); // Chamado na seleção, talvez não precise aqui de novo
         // Mas podemos chamar métodos de atualização específicos se necessário garantir
         this.veiculoSelecionado.atualizarStatusNaTela();
         this.veiculoSelecionado.atualizarVelocidadeNaTela?.(); // O '?' previne erro se não existir
         this.veiculoSelecionado.atualizarTurboNaTela?.();
         this.veiculoSelecionado.atualizarCargaNaTela?.();
         this.veiculoSelecionado.atualizarBotaoLigarDesligar();
         this.veiculoSelecionado.preencherInfoBasicaPainel();


    }

    getVeiculoSelecionado() {
        return this.veiculoSelecionado;
    }
}

// ------------------------------------
// ---- INICIALIZAÇÃO E EVENTOS ----
// ------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Cria a garagem, passando os IDs dos containers do HTML
    const minhaGaragem = new Garagem('selecaoGaragem', 'imagemVeiculoAtual', 'informacoesVeiculoContainer');

    // Cria e adiciona os veículos à garagem
    minhaGaragem.adicionarVeiculo(new CarroEsportivo("BMW M3 Competition", "Cinza"));
    minhaGaragem.adicionarVeiculo(new Caminhao("Scania R450", "Branco", 15000));
    minhaGaragem.adicionarVeiculo(new Carro("Corola do Novo", "Branco"));


    // Não precisamos mais dos listeners individuais aqui,
    // pois a classe Garagem usa delegação de eventos.

    // Exemplo de como adicionar manutenção (se a classe Manutencao existir)
    /*
    if (typeof Manutencao !== 'undefined') {
        const veiculoParaManut = minhaGaragem.veiculos[0]; // Pega o Fusca
        if(veiculoParaManut) {
            const manutOleo = new Manutencao('2024-01-15', 'Troca de Óleo', 120.00, 'Óleo 20w50');
            veiculoParaManut.adicionarManutencao(manutOleo);

            // Exibe histórico no console
            console.log(`\nHistórico ${veiculoParaManut.modelo}:`);
            veiculoParaManut.getHistoricoManutencoesFormatado().forEach(m => console.log(`- ${m}`));
        }
    }
    */

}); // Fim do DOMContentLoaded