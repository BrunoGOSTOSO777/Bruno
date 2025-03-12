let carroNormal;
let carroEsportivo;
let caminhao;

// Funções para mostrar/ocultar as divs
function mostrarCarroNormal() {
  esconderTodos();
  document.getElementById('carroNormal').style.display = 'block';
  atualizarCarroNormal();
}

function mostrarCarroEsportivo() {
  esconderTodos();
  document.getElementById('carroEsportivo').style.display = 'block';
  atualizarCarroEsportivo();
}

function mostrarCaminhao() {
  esconderTodos();
  document.getElementById('caminhao').style.display = 'block';
  atualizarCaminhao();
}

function esconderTodos() {
  document.getElementById('carroNormal').style.display = 'none';
  document.getElementById('carroEsportivo').style.display = 'none';
  document.getElementById('caminhao').style.display = 'none';
}

// Funções para o Carro Normal
function atualizarCarroNormal() {
  const modelo = document.getElementById('modeloCarro').value;
  const cor = document.getElementById('corCarro').value;
  carroNormal = new Carro(modelo, cor);
  exibirInfoCarro();
}

function ligarCarro() {
  if (carroNormal) {
    carroNormal.ligar();
    exibirInfoCarro();
  } else {
    alert('Mostre o carro primeiro!');
  }
}

function desligarCarro() {
  if (carroNormal) {
    carroNormal.desligar();
    exibirInfoCarro();
  } else {
    alert('Mostre o carro primeiro!');
  }
}

function acelerarCarro() {
  if (carroNormal) {
    carroNormal.acelerar(10);
    exibirInfoCarro();
  } else {
    alert('Mostre o carro primeiro!');
  }
}

function exibirInfoCarro() {
  const infoDiv = document.getElementById('infoCarro');
  if (carroNormal) {
    infoDiv.innerHTML = `
      Modelo: ${carroNormal.modelo}<br>
      Cor: ${carroNormal.cor}<br>
      Ligado: ${carroNormal.ligado}<br>
      Velocidade: ${carroNormal.velocidade} km/h
    `;
  } else {
    infoDiv.innerHTML = 'Mostre o carro primeiro!';
  }
}

// Funções para o Carro Esportivo (já existente)
function atualizarCarroEsportivo() {
  const modelo = document.getElementById('modeloEsportivo').value;
  const cor = document.getElementById('corEsportivo').value;
  carroEsportivo = new CarroEsportivo(modelo, cor);
  exibirInfoEsportivo();
}

function ligarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.ligar();
    exibirInfoEsportivo();
  } else {
    alert('Mostre o carro esportivo primeiro!');
  }
}

function desligarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.desligar();
    exibirInfoEsportivo();
  } else {
    alert('Mostre o carro esportivo primeiro!');
  }
}

function acelerarEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.acelerar(10);
    exibirInfoEsportivo();
  } else {
    alert('Mostre o carro esportivo primeiro!');
  }
}

function ativarTurbo() {
  if (carroEsportivo) {
    carroEsportivo.ativarTurbo();
    exibirInfoEsportivo();
  } else {
    alert('Mostre o carro esportivo primeiro!');
  }
}

function exibirInfoEsportivo() {
  const infoDiv = document.getElementById('infoEsportivo');
  if (carroEsportivo) {
    infoDiv.innerHTML = `
      Modelo: ${carroEsportivo.modelo}<br>
      Cor: ${carroEsportivo.cor}<br>
      Ligado: ${carroEsportivo.ligado}<br>
      Velocidade: ${carroEsportivo.velocidade} km/h<br>
      Turbo Ativado: ${carroEsportivo.turboAtivado}
    `;
  } else {
    infoDiv.innerHTML = 'Mostre o carro esportivo primeiro!';
  }
}

// Funções para o Caminhão (já existente, com função de descarregar)
function atualizarCaminhao() {
  const modelo = document.getElementById('modeloCaminhao').value;
  const cor = document.getElementById('corCaminhao').value;
  const capacidadeCarga = parseInt(document.getElementById('capacidadeCaminhao').value);
  caminhao = new Caminhao(modelo, cor, capacidadeCarga);
  exibirInfoCaminhao();
}

function ligarCaminhao() {
  if (caminhao) {
    caminhao.ligar();
    exibirInfoCaminhao();
  } else {
    alert('Mostre o caminhão primeiro!');
  }
}

function desligarCaminhao() {
  if (caminhao) {
    caminhao.desligar();
    exibirInfoCaminhao();
  } else {
    alert('Mostre o caminhão primeiro!');
  }
}

function acelerarCaminhao() {
  if (caminhao) {
    caminhao.acelerar(5);
    exibirInfoCaminhao();
  } else {
    alert('Mostre o caminhão primeiro!');
  }
}

function carregarCaminhao() {
  if (caminhao) {
    const peso = parseInt(document.getElementById('pesoCarga').value);
    caminhao.carregar(peso);
    exibirInfoCaminhao();
  } else {
    alert('Mostre o caminhão primeiro!');
  }
}

function descarregarCaminhao() {
  if (caminhao) {
    const peso = parseInt(document.getElementById('pesoCarga').value);
    const descarga = Math.min(peso, caminhao.cargaAtual);
    caminhao.cargaAtual -= descarga;

    console.log(`Caminhão descarregado com ${descarga} kg. Carga atual: ${caminhao.cargaAtual} kg`);
    exibirInfoCaminhao();
  } else {
    alert('Mostre o caminhão primeiro!');
  }
}

function exibirInfoCaminhao() {
  const infoDiv = document.getElementById('infoCaminhao');
  if (caminhao) {
    infoDiv.innerHTML = `
      Modelo: ${caminhao.modelo}<br>
      Cor: ${caminhao.cor}<br>
      Ligado: ${caminhao.ligado}<br>
      Velocidade: ${caminhao.velocidade} km/h<br>
      Capacidade de Carga: ${caminhao.capacidadeCarga} kg<br>
      Carga Atual: ${caminhao.cargaAtual} kg
    `;
  } else {
    infoDiv.innerHTML = 'Mostre o caminhão primeiro!';
  }
}