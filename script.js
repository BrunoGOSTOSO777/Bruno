document.addEventListener('DOMContentLoaded', () => {

    function exibirAlerta(mensagem) {
        alert(mensagem);
    }

    function tocarSom(idAudio) {
        const audio = document.getElementById(idAudio);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => console.log(`Erro ao tocar áudio: ${error}`));
        } else {
            console.error(`Áudio com ID '${idAudio}' não encontrado.`);
        }
    }

    class Manutencao {
        constructor(data, tipo, custo, descricao = '') {
            this.data = data;
            this.tipo = tipo;
            this.custo = parseFloat(custo) || 0;
            this.descricao = descricao;
        }
        getFormatado() {
            const dataFormatada = new Date(this.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            let texto = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
            if (this.descricao) texto += ` (${this.descricao})`;
            return texto;
        }
        validar() {
            if (!this.data || !this.tipo || isNaN(this.custo) || this.custo < 0) {
                exibirAlerta("Erro de validação: Data, Tipo e Custo válido são obrigatórios.");
                return false;
            }
            return true;
        }
    }

    class Veiculo {
        constructor(modelo, cor, imagem) {
            this.modelo = modelo; this.cor = cor; this.imagem = imagem; this.ligado = false;
            this.historicoManutencao = [];
        }
        addManutencao(manutencao) {
            if (manutencao instanceof Manutencao && manutencao.validar()) {
                this.historicoManutencao.push(manutencao);
                this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
                return true;
            }
            return false;
        }
        getHistoricoManutencao() { return this.historicoManutencao; }
        ligar() { if (this.ligado) { exibirAlerta(`${this.modelo} já está ligado!`); return; } this.ligado = true; tocarSom('audio-ligar'); }
        desligar() { if (!this.ligado) { exibirAlerta(`${this.modelo} já está desligado.`); return; } this.ligado = false; tocarSom('audio-desligar'); }
        exibirInformacoes() {
            const statusVelocidade = typeof this.velocidade !== 'undefined' ? `Velocidade: ${this.velocidade} km/h` : 'Velocidade não aplicável';
            return `Modelo: ${this.modelo} | Cor: ${this.cor} | Estado: ${this.ligado ? "Ligado" : "Desligado"} | ${statusVelocidade}`;
        }
    }

    class Carro extends Veiculo {
        constructor(modelo, cor, imagem, velocidadeMaxima = 240) { super(modelo, cor, imagem); this.velocidade = 0; this.velocidadeMaxima = velocidadeMaxima; }
        desligar() { if (this.velocidade > 0) { exibirAlerta("Desacelere o carro antes de desligar."); return; } super.desligar(); }
        acelerar() { if (!this.ligado) { exibirAlerta("Ligue o carro primeiro!"); return; } if (this.velocidade >= this.velocidadeMaxima) { exibirAlerta(`Velocidade máxima atingida!`); return; } this.velocidade = Math.min(this.velocidadeMaxima, this.velocidade + 10); tocarSom('audio-acelerar'); }
        frear() { if(this.velocidade === 0) { return; } this.velocidade = Math.max(0, this.velocidade - 20); tocarSom('audio-frear'); }
        buzinar() { tocarSom('audio-buzina-carro'); }
    }

    class CarroEsportivo extends Carro {
        constructor(modelo, cor, imagem) { super(modelo, cor, imagem, 380); this.turboAtivado = false; }
        ativarTurbo() { if (!this.ligado) { exibirAlerta("Ligue o carro para ativar o turbo!"); return; } this.turboAtivado = true; }
        desativarTurbo() { this.turboAtivado = false; }
        acelerar() { if (!this.ligado) { exibirAlerta("Ligue o carro primeiro!"); return; } if (this.velocidade >= this.velocidadeMaxima) { exibirAlerta(`Velocidade máxima atingida!`); return; } const incremento = this.turboAtivado ? 40 : 20; this.velocidade = Math.min(this.velocidadeMaxima, this.velocidade + incremento); tocarSom('audio-acelerar'); }
        buzinar() { tocarSom('audio-buzina-esportivo'); }
        exibirInformacoes() { return `${super.exibirInformacoes()} | Turbo: ${this.turboAtivado ? 'ATIVADO' : 'Desligado'}`; }
    }

    class Caminhao extends Carro {
        constructor(modelo, cor, imagem, capacidadeCarga) { super(modelo, cor, imagem, 120); this.capacidadeCarga = capacidadeCarga; this.cargaAtual = 0; }
        carregar(peso) { const p = Number(peso); if (isNaN(p) || p <= 0) { exibirAlerta("Valor de carga inválido."); return; } if ((this.cargaAtual + p) > this.capacidadeCarga) { exibirAlerta(`Carga excedida!`); } else { this.cargaAtual += p; alert(`${p}kg carregados.`); } }
        buzinar() { tocarSom('audio-buzina-caminhao'); }
        exibirInformacoes() { return `${super.exibirInformacoes()} | Carga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`; }
    }

    class Garagem {
        constructor() { this.veiculos = []; this.veiculoSelecionado = null; }
        adicionarVeiculo(veiculo) { this.veiculos.push(veiculo); }
        selecionarVeiculo(indice) { if (indice >= 0 && indice < this.veiculos.length) { this.veiculoSelecionado = this.veiculos[indice]; atualizarDisplay(); } }
        interagir(acao, valor = null) {
            if (!this.veiculoSelecionado) { exibirAlerta("Selecione um veículo!"); return; }
            const v = this.veiculoSelecionado;
            if (acao === 'ativarTurbo') { acao = v.turboAtivado ? 'desativarTurbo' : 'ativarTurbo'; }
            if (typeof v[acao] === 'function') { valor ? v[acao](valor) : v[acao](); } else { exibirAlerta(`Ação inválida!`); }
            atualizarDisplay();
        }
    }

    function salvarGaragem() {
        const dados = minhaGaragem.veiculos.map(v => ({...v, _class: v.constructor.name }));
        localStorage.setItem('garagemInteligente', JSON.stringify(dados));
    }

    function carregarGaragem() {
        const dadosSalvos = localStorage.getItem('garagemInteligente');
        if (!dadosSalvos) return null;
        const veiculosCrus = JSON.parse(dadosSalvos);
        return veiculosCrus.map(vc => {
            let veiculo;
            const classes = { Carro, CarroEsportivo, Caminhao };
            if (!classes[vc._class]) return null;
            veiculo = new classes[vc._class](vc.modelo, vc.cor, vc.imagem, vc.capacidadeCarga);
            Object.assign(veiculo, vc);
            veiculo.historicoManutencao = vc.historicoManutencao.map(m => new Manutencao(m.data, m.tipo, m.custo, m.descricao));
            return veiculo;
        }).filter(v => v);
    }

    const minhaGaragem = new Garagem();
    const veiculosSalvos = carregarGaragem();
    if (veiculosSalvos && veiculosSalvos.length > 0) {
        minhaGaragem.veiculos = veiculosSalvos;
    } else {
        minhaGaragem.adicionarVeiculo(new Carro('Opala', 'Preto', 'imagens/opala.jpg'));
        minhaGaragem.adicionarVeiculo(new CarroEsportivo('Ferrari 488', 'Vermelha', 'imagens/ferrari.jpg'));
        minhaGaragem.adicionarVeiculo(new Caminhao('Scania R450', 'Branco', 'imagens/scania.jpg', 25000));
        salvarGaragem();
    }
    
    const el = id => document.getElementById(id);
    const [seletorContainer, displayContainer, formManutencao, historicoList, agendamentosFuturosList] =
        ['seletor-veiculos', 'display-principal', 'form-manutencao', 'lista-historico-veiculo', 'lista-agendamentos-futuros'].map(el);

    function atualizarDisplay() {
        const v = minhaGaragem.veiculoSelecionado;
        if (!v) return;
        document.querySelectorAll('#seletor-veiculos button').forEach((btn, i) => btn.classList.toggle('active', minhaGaragem.veiculos[i] === v));
        ['nome-veiculo', 'modelo', 'cor', 'estado', 'velocidade'].forEach(id => el(`display-${id}`).textContent = v[id] ?? '---');
        el('display-imagem').src = v.imagem || 'imagens/placeholder.png';
        el('display-estado').className = v.ligado ? 'status-ligado' : 'status-desligado';
        
        const percVel = v.velocidade && v.velocidadeMaxima ? (v.velocidade / v.velocidadeMaxima) * 100 : 0;
        el('velocimetro-barra').style.width = `${percVel}%`;
        
        el('info-turbo').classList.toggle('hidden', !('turboAtivado' in v));
        el('btn-turbo').classList.toggle('hidden', !('turboAtivado' in v));
        if ('turboAtivado' in v) {
            el('display-turbo').textContent = v.turboAtivado ? 'ATIVADO' : 'Desligado';
            el('display-turbo').classList.toggle('ativado', v.turboAtivado);
            el('btn-turbo').textContent = v.turboAtivado ? 'Desativar Turbo' : 'Ativar Turbo';
        }
        
        el('info-carga').classList.toggle('hidden', !('capacidadeCarga' in v));
        el('controle-carga').classList.toggle('hidden', !('capacidadeCarga' in v));
        if ('capacidadeCarga' in v) {
            el('display-carga-atual').textContent = v.cargaAtual; el('display-capacidade').textContent = v.capacidadeCarga;
        }

        el('informacoesVeiculo').innerHTML = `<p>${v.exibirInformacoes()}</p>`;
        
        historicoList.innerHTML = v.getHistoricoManutencao().map(m => `<li>${m.getFormatado()}</li>`).join('') || '<li>Nenhum registro.</li>';
    }

    function atualizarAgendamentosFuturos() {
        const agora = new Date(); agora.setHours(0,0,0,0);
        const agendamentos = minhaGaragem.veiculos.flatMap(v => v.historicoManutencao.filter(m => new Date(m.data + 'T00:00:00') >= agora).map(m => ({veiculo: v, manutencao: m})));
        agendamentos.sort((a,b) => new Date(a.manutencao.data) - new Date(b.manutencao.data));
        agendamentosFuturosList.innerHTML = agendamentos.map(item => `<li><span>${item.veiculo.modelo}:</span> ${item.manutencao.getFormatado()}</li>`).join('') || '<li>Nenhum agendamento futuro.</li>';
    }

    formManutencao.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = minhaGaragem.veiculoSelecionado;
        if (!v) { exibirAlerta("Selecione um veículo."); return; }
        const data = new FormData(formManutencao);
        const novaManutencao = new Manutencao(el('manut-data').value, el('manut-tipo').value, el('manut-custo').value, el('manut-descricao').value);
        if (v.addManutencao(novaManutencao)) {
            salvarGaragem();
            atualizarDisplay();
            atualizarAgendamentosFuturos();
            formManutencao.reset();
            exibirAlerta("Manutenção salva com sucesso!");
        }
    });

    minhaGaragem.veiculos.forEach((v, i) => {
        const btn = document.createElement('button'); btn.textContent = v.modelo;
        btn.onclick = () => minhaGaragem.selecionarVeiculo(i);
        seletorContainer.appendChild(btn);
    });

    displayContainer.addEventListener('click', e => {
        const target = e.target.closest('button[data-action]');
        if (target) {
            const acao = target.dataset.action;
            const valor = acao === 'carregar' ? el('input-carga').value : null;
            minhaGaragem.interagir(acao, valor);
            if (acao === 'carregar') el('input-carga').value = '';
        }
    });

    minhaGaragem.selecionarVeiculo(0);
    atualizarAgendamentosFuturos();
});