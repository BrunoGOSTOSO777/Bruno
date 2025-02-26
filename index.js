class Carro {
    constructor(modelo, cor) {
      this.modelo = modelo;
      this.cor = cor;
      this.ligado = false;
      this.velocidade = 0;
      this.somAceleracao = document.getElementById("som-aceleracao");
      this.somDesaceleracao = document.getElementById("som-desaceleracao");
      this.imagemCarro = document.getElementById("carro-imagem"); // Pega a imagem do carro
    }
  
    ligar() {
      if (!this.ligado) {
        this.ligado = true;
        console.log("Carro ligado!");
        this.atualizarStatus();
      } else {
        console.log("O carro já está ligado.");
      }
    }
  
    desligar() {
      if (this.ligado) {
        this.ligado = false;
        this.velocidade = 0;
        console.log("Carro desligado!");
        this.atualizarStatus();
        this.atualizarVelocidade();
      } else {
        console.log("O carro já está desligado.");
      }
    }
  
    acelerar() {
      if (this.ligado) {
        this.velocidade += 10;
        console.log(`Acelerando! Velocidade: ${this.velocidade} km/h`);
        this.atualizarVelocidade();
        this.tocarSom(this.somAceleracao);
      } else {
        console.log("O carro precisa estar ligado para acelerar.");
      }
    }
  
    desacelerar() {
      if (this.ligado) {
        this.velocidade -= 10;
        if (this.velocidade < 0) {
          this.velocidade = 0; // Impede velocidade negativa
        }
        console.log(`Desacelerando! Velocidade: ${this.velocidade} km/h`);
        this.atualizarVelocidade();
        this.tocarSom(this.somDesaceleracao);
      } else {
        console.log("O carro precisa estar ligado para desacelerar.");
      }
    }
  
    tocarSom(somElement) {
      somElement.currentTime = 0;
      somElement.play();
    }
  
    atualizarStatus() {
      const statusElement = document.getElementById("carro-status");
      statusElement.textContent = `Status: ${this.ligado ? "Ligado" : "Desligado"}`;
    }
  
    atualizarVelocidade() {
      const velocidadeElement = document.getElementById("carro-velocidade");
      velocidadeElement.textContent = `Velocidade: ${this.velocidade} km/h`;
    }
  
    mudarCor(cor) {
         this.cor = cor;
         console.log(`Cor do carro mudada para: ${cor}`);
  
         //Mudar a cor da imagem, necessita de tratamento de imagem
         //this.imagemCarro.src = `carro-${cor}.jpg`;  //Assumindo que você tem imagens diferentes para cada cor
    }
  }
  
  // Criar uma instância da classe Carro
  const meuCarro = new Carro("Fusca", "Azul");
  
  // Obter os elementos do HTML
  const ligarBtn = document.getElementById("ligar-btn");
  const desligarBtn = document.getElementById("desligar-btn");
  const acelerarBtn = document.getElementById("acelerar-btn");
  const desacelerarBtn = document.getElementById("desacelerar-btn");
  const corSeletor = document.getElementById("cor-seletor");
  // Adicionar event listeners aos botões
  ligarBtn.addEventListener("click", () => meuCarro.ligar());
  desligarBtn.addEventListener("click", () => meuCarro.desligar());
  acelerarBtn.addEventListener("click", () => meuCarro.acelerar());
  desacelerarBtn.addEventListener("click", () => meuCarro.desacelerar());
  corSeletor.addEventListener("change", (event) => {  // Arrow function para pegar o evento
      meuCarro.mudarCor(event.target.value); //pega o valor selecionado no dropdown
  });
  
  // Inicializar o status e a velocidade na tela
  meuCarro.atualizarStatus();
  meuCarro.atualizarVelocidade();