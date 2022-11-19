//Desenvolvido por Karolyne Domiciano Marques para a disciplina de Intenligência Artificial

const board = document.querySelector("#board");
const heuristicOneButton = document.querySelector("#heuristic01");
const heuristicTwoButton = document.querySelector("#heuristic02");
const heuristicPButton = document.querySelector("#heuristicP");

let lastMove = [];

heuristicOneButton.addEventListener("click", () => {
    mixSquaresRandom();
    heuristicOne();
});
heuristicTwoButton.addEventListener("click", () => {
    mixSquaresRandom();
    heuristicTwo();
});
heuristicPButton.addEventListener("click", () => {
    mixSquaresRandom();
    heuristicP();
});

//matriz para calcular heuristicas
let matriz;

//matriz para acessar os quadradinhos do tabuleiro
let matrizSquares;

//matriz para controlar posição dos quadradinhos do tabuleiro
let positionSquares;

//posição do quadrado 9 na matriz inicialmente
let y;
let x;

function heuristicOne() {

}

function heuristicTwo() {

}

function heuristicP() {

}


function init() {
    matriz = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    matrizSquares = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    positionSquares = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    y = 2; //terceira linha 
    x = 2; //terceira coluna

    renderBoard();
}

//função de delay para conseguir visualizar a movimentação dos quadrados
function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

//Mover o quadrado 9 (quadrado vazio) para uma nova posição 
//Troca o quadrado 9 pelo quadrado na posição newy newx
function moveSquare(newy, newx) {

    //movendo quadrado 9 para posição do seu vizinho
    matrizSquares[y][x].style.left = `${(150) * (newx - x) + positionSquares[y][x].x}px`;
    matrizSquares[y][x].style.top = `${(150) * (newy - y) + positionSquares[y][x].y}px`;

    //movendo quadrado vizinho para onde estava o quadrado 9
    matrizSquares[newy][newx].style.left = `${(150) * (x - newx) + positionSquares[newy][newx].x}px`;
    matrizSquares[newy][newx].style.top = `${(150) * (y - newy) + positionSquares[newy][newx].y}px`;



    //atualizando matriz de acesso aos quadrados 
    const aux = matrizSquares[y][x]
    matrizSquares[y][x] = matrizSquares[newy][newx];
    matrizSquares[newy][newx] = aux;

    //atualizando matriz numérica para as heuristicas
    matriz[y][x] = matriz[newy][newx];
    matriz[newy][newx] = 9;
}

//Função para verificar loops nas jogadas
function loop() {

    if (lastMove.length === 0 || lastMove.length === 1) return false;

    if (lastMove[lastMove.length - 1] === lastMove[lastMove.length - 2]) return true;

    let subMovs1;
    let subMovs2;

    for (jump = 2; jump < 6; jump++) {
        subMovs1 = lastMove.slice(0, jump).join('');
        for (i = jump; i < lastMove.length; i++) {
            //[1, 2, 1, 2, 1, 2]
            //jump = 2
            //subMovs1 = 12 --> lastMove[0], lastMove[1]
            //subMovs2 = 12 --> lastMove[2], lastMove[3]
            //if(subMovs1 === subMovs2) return true

            subMovs2 = lastMove.slice(i, i + jump).join('');

            if (subMovs1 === subMovs2) return true;
            subMovs1 = subMovs2;
        }
    }

    return false;
}


//função que escolhe um vizinho aleatório do quadrado 9 para mover
function randomNeighbor() {

    //armazenar seus vizinhos
    //o quadrado 9 só pode se mover (trocar de lugar) com um vizinho-4
    let neighbors = [];

    //verificando posição atual do quadrado 9 e armazenando a posição dos seus vizinhos
    if (y == 2 && x == 2) {
        neighbors.push(
            { 'y': y - 1, 'x': x },
            { 'y': y, 'x': x - 1 });
    }
    else if (y == 2 && x == 1) {
        neighbors.push(
            { 'y': y - 1, 'x': x },
            { 'y': y, 'x': x - 1 },
            { 'y': y, 'x': x + 1 });
    }
    else if (y == 2 && x == 0) {
        neighbors.push(
            { 'y': y - 1, 'x': x },
            { 'y': y, 'x': x + 1 });
    }
    else if (y == 1 && x == 2) {
        neighbors.push(
            { 'y': y - 1, 'x': x },
            { 'y': y + 1, 'x': x },
            { 'y': y, 'x': x - 1 });
    }
    else if (y == 1 && x == 1) {
        neighbors.push(
            { 'y': y - 1, 'x': x },
            { 'y': y + 1, 'x': x },
            { 'y': y, 'x': x - 1 },
            { 'y': y, 'x': x + 1 });
    }
    else if (y == 1 && x == 0) {
        neighbors.push(
            { 'y': y - 1, 'x': x },
            { 'y': y + 1, 'x': x },
            { 'y': y, 'x': x + 1 });
    }
    else if (y == 0 && x == 2) {
        neighbors.push(
            { 'y': y + 1, 'x': x },
            { 'y': y, 'x': x - 1 });
    }
    else if (y == 0 && x == 1) {
        neighbors.push(
            { 'y': y + 1, 'x': x },
            { 'y': y, 'x': x - 1 },
            { 'y': y, 'x': x + 1 });
    }
    else if (y == 0 && x == 0) {
        neighbors.push(
            { 'y': y + 1, 'x': x },
            { 'y': y, 'x': x + 1 });
    }

    //escolhendo um vizinho aleatório
    let neighbor = Math.floor(Math.random() * ((neighbors.length - 1) - 0) + 0);

    //armazenando ultimos movimentos para identificar loops nos movimentos
    lastMove.push(matriz[neighbors[neighbor].y][neighbors[neighbor].x]);

    while (loop()) {
        //removendo vizinho já que ele mover para ele levará a um loop
        neighbors = neighbors.filter((e) => e !== neighbor);

        //removendo ultimo movimento já que ele levará a um loop
        lastMove.pop();

        //escolhendo um vizinho aleatório
        neighbor = Math.floor(Math.random() * (neighbors.length));

        //armazenando ultimos movimentos para identificar loops nos movimentos
        lastMove.push(matriz[neighbors[neighbor].y][neighbors[neighbor].x]);
    }

    //movendo quadrado 9 para a posição do seu vizinho
    moveSquare(neighbors[neighbor].y, neighbors[neighbor].x);

    //atualizando posição do quadrado 9
    y = neighbors[neighbor].y;
    x = neighbors[neighbor].x;
}

//função para embaralhar quadrados aleatóriamente
async function mixSquaresRandom() {

    let n = prompt("Quantas vezes você gostaria de misturar os quadrados?", 10);
    while (isNaN(n)) {
        n = prompt("Por favor, inisira um valor numérico!", 10);
    }

    cont = 0;

    init();
    await delay(1000);

    while (cont < n) {

        randomNeighbor();
        //esperando movimento
        await delay(1000);

        cont++;

    }
}


//Desenhando tabuleiro 
function renderBoard() {

    board.innerHTML = "";
    for (i = 0; i < matriz.length; i++) {
        for (j = 0; j < matriz[i].length; j++) {
            const htmlSquare = document.createElement('div');
            htmlSquare.innerHTML = matriz[i][j];

            if (matriz[i][j] !== 9) {
                htmlSquare.className = 'square';
            }
            else {
                htmlSquare.className = 'squareEmpty';
            }

            htmlSquare.style.left = `${j * 150 + 200}px`;
            htmlSquare.style.top = `${i * 150 + 100}px`;

            positionSquares[i][j] = {
                'y': i * 150 + 100,
                'x': j * 150 + 200
            }

            matrizSquares[i][j] = htmlSquare;
            board.appendChild(htmlSquare);
        }
    }
}

init();
