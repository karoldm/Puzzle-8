//Desenvolvido por Karolyne Domiciano Marques para a disciplina de Intenligência Artificial

const board = document.querySelector("#board");
const heuristicOneButton = document.querySelector("#heuristic01");
const heuristicTwoButton = document.querySelector("#heuristic02");
const heuristicPButton = document.querySelector("#heuristicP");

let lastMove = [];

heuristicOneButton.addEventListener("click", async () => {
    await mixSquaresRandom();
    await heuristicOne();
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
var matriz;

//matriz para acessar os quadradinhos do tabuleiro
var matrizSquares;

//matriz para controlar posição dos quadradinhos do tabuleiro
var positionSquares;

//posição do quadrado 9 na matriz inicialmente
var y;
var x;

const matrizResult = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9]
];

// Função para verificar se quadrados do tabuleiro estão nas posições corretas
function checkSucess() {
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (matrizResult[i][j] !== matriz[i][j]) return false;
        }
    }

    return true;
}

/**
 * Função para escolher melhor movimento entre os vizinhos-4 do quadrado 9
 * A melhor joagada é escolhida calculando a soma da diferença dos quadrados com suas posições corretas 
 * A jogada que tiver a menor soma (ou seja, que levar os quadrados o mais próximo possível da sua posição
 * final) é retornada.
 * Em caso de somas iguais para dois estados/filhos, retorna o primeiro encontrado
 */
function getBestChild(neighbors) {
    let sum;
    let minSum = 200;
    let best = neighbors[0];

    // Percorre cada joagada possível
    for (n in neighbors) {
        sum = 0;

        // Soma da diferença de cada quadrado com sua posição final
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {

                if (i === neighbors[n].y && j === neighbors[n].x) {
                    sum += Math.abs(matrizResult[i][j] - 9);
                }
                else if (i === y && j === x) {
                    sum += Math.abs(matrizResult[i][j] - matriz[neighbors[n].y][neighbors[n].x]);
                }
                else {
                    sum += Math.abs(matrizResult[i][j] - matriz[i][j]);
                }
            }
        }

        // console.log("n ", neighbors[n]);
        // console.log("s ", sum, "\n\n\n");

        if (sum < minSum) {
            minSum = sum;
            best = neighbors[n];
        }
    }

    return best;
}

// Função para Heurística de um nível (verificar somente os filhos a um nível do estado atual)
async function heuristicOne() {
    alert('Iniciano heuristica de um nível!');

    lastMove = [];
    let qtdMov = 0;

    //Enquanto a mtriz atual não for o resultado esperado
    while (!checkSucess() && qtdMov < 500) {

        let neighbors = getNeighbors();
        let best = getBestChild(neighbors);

        lastMove.push(matriz[best.y][best.x]);

        //evitando jogadas repetidas
        while (loop() && neighbors.length > 0) {
            //removendo vizinho já que mover para ele levara a um loop
            neighbors = neighbors.filter((e) => e !== best);

            if (neighbors.length === 0) {

                break;
            }

            lastMove.pop(); //removendo ultimo movimento já que ele levará a um loop

            best = getBestChild(neighbors);

            //armazenando ultimos movimentos para identificar loops nos movimentos
            lastMove.push(matriz[best.y][best.x]);
        }

        moveSquare(best.y, best.x);

        //esperando movimento
        await delay(700);

        qtdMov++;
    }

    if (qtdMov === 500) alert("Solução não encontrada! máximo de 200 movimentos alcançado.");
    else alert(`Resultado encontrado depois de ${qtdMov} movimentos!`);
}

function heuristicTwo() {

}

function heuristicP() {

}


//função de delay para conseguir visualizar a movimentação dos quadrados
function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

//Mover o quadrado 9 (quadrado vazio) para uma nova posição 
function moveSquare(newy, newx) {

    //movendo quadrado 9 para posição do seu vizinho na interface
    matrizSquares[y][x].style.left = `${(150) * (newx - x) + positionSquares[y][x].x}px`;
    matrizSquares[y][x].style.top = `${(150) * (newy - y) + positionSquares[y][x].y}px`;

    //movendo quadrado vizinho para onde estava o quadrado 9 na interface
    matrizSquares[newy][newx].style.left = `${(150) * (x - newx) + positionSquares[newy][newx].x}px`;
    matrizSquares[newy][newx].style.top = `${(150) * (y - newy) + positionSquares[newy][newx].y}px`;

    //atualizando matriz de acesso aos quadrados 
    const aux = matrizSquares[y][x]
    matrizSquares[y][x] = matrizSquares[newy][newx];
    matrizSquares[newy][newx] = aux;

    //atualizando matriz numérica para as heuristicas
    matriz[y][x] = matriz[newy][newx];
    matriz[newy][newx] = 9;

    //atualizando posição do quadrado 9
    y = newy;
    x = newx;

}

//Função para verificar loops nas jogadas
function loop() {

    console.log(lastMove)

    if (lastMove.length > 1
        && lastMove[lastMove.length - 1] === lastMove[lastMove.length - 2]) return true;
    if (lastMove.length < 4) return false;

    let subMovs1;
    let subMovs2;


    for (jump = 2; jump <= 6; jump++) {

        subMovs1 = lastMove.slice(0, jump).join('');

        for (i = jump; i < lastMove.length && lastMove.length >= 2 * jump; i++) {

            subMovs2 = lastMove.slice(i, i + jump).join('');

            if (subMovs1.length !== subMovs2.length) break;

            if (subMovs1 === subMovs2) return true;

            subMovs1 = lastMove.slice(i - (jump - 1), i + jump - (jump - 1)).join('');
        }
    }

    return false;
}

//função para pegar todos os vizinhos-4 do quadrado 9
function getNeighbors() {
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

    return neighbors;
}

//função que escolhe um vizinho aleatório do quadrado 9 para mover
function randomNeighbor() {

    let neighbors = getNeighbors();

    //escolhendo um vizinho aleatório
    let neighbor = Math.floor(Math.random() * ((neighbors.length - 1) - 0) + 0);

    //armazenando ultimos movimentos para identificar loops nos movimentos
    lastMove.push(matriz[neighbors[neighbor].y][neighbors[neighbor].x]);

    while (loop()) {
        //removendo vizinho já que ele mover para ele levará a um loop
        neighbors = neighbors.filter((e) => e !== neighbor);

        lastMove.pop(); //removendo ultimo movimento já que ele levará a um loop

        //escolhendo um vizinho aleatório
        neighbor = Math.floor(Math.random() * (neighbors.length));

        //armazenando ultimos movimentos para identificar loops nos movimentos
        lastMove.push(matriz[neighbors[neighbor].y][neighbors[neighbor].x]);
    }

    //movendo quadrado 9 para a posição do seu vizinho
    moveSquare(neighbors[neighbor].y, neighbors[neighbor].x);
}

//função para embaralhar quadrados aleatóriamente
async function mixSquaresRandom() {

    let n = prompt("Quantas vezes você gostaria de misturar os quadrados?", 10);
    while (isNaN(n)) {
        n = prompt("Por favor, inisira um valor numérico!", 10);
    }

    cont = 0;

    init();
    await delay(700);

    while (cont < n) {

        randomNeighbor();

        //esperando movimento 
        await delay(700);

        cont++;

    }
}

//Desenhando tabuleiro 
function renderBoard() {

    board.innerHTML = "";

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {

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

function init() {
    matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

    matrizSquares = [[], [], []];

    positionSquares = [[], [], []];

    y = 2; //terceira linha 
    x = 2; //terceira coluna

    renderBoard();
}

init();
