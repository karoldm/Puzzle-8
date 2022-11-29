//Desenvolvido por Karolyne Domiciano Marques para a disciplina de Intenligência Artificial

const board = document.querySelector("#board");
const heuristicOneButton = document.querySelector("#heuristic01");
const heuristicTwoButton = document.querySelector("#heuristic02");
const heuristicPButton = document.querySelector("#heuristicP");


heuristicOneButton.addEventListener("click", async () => {
    await mixSquaresRandom();
    await heuristicOne();
    init();
});
heuristicTwoButton.addEventListener("click", async () => {
    await mixSquaresRandom();
    await heuristicTwo();
    init();

});
heuristicPButton.addEventListener("click", async () => {
    await mixSquaresRandom();
    await heuristicP();
    init();

});

//array para armazenar ultimos movimentos e verificar se há loops
let lastMove = [];

//matriz para calcular heuristicas
let matriz;

//matriz para acessar os quadradinhos do tabuleiro
let matrizSquares;

//matriz para controlar posição dos quadradinhos do tabuleiro
let positionSquares;

//posição do quadrado 9 na matriz inicialmente
let y;
let x;

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

    let copyMatriz = matriz.map(e => e.slice());

    // Percorre cada joagada possível
    for (n in neighbors) {
        sum = 0;

        //trocando peças
        const currentSquare = copyMatriz[neighbors[n].y][neighbors[n].x];
        copyMatriz[y][x] = currentSquare;
        copyMatriz[neighbors[n].y][neighbors[n].x] = 9;

        // Soma da diferença de cada quadrado com sua posição final
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                sum += Math.abs(matrizResult[i][j] - copyMatriz[i][j]);
            }
        }

        if (sum < minSum) {
            minSum = sum;
            best = neighbors[n];
        }

        //destrocando peças
        copyMatriz[y][x] = 9;
        copyMatriz[neighbors[n].y][neighbors[n].x] = currentSquare;
    }

    return best;
}

// Função para Heurística de um nível (verificar somente os filhos a um nível do estado atual)
async function heuristicOne() {
    alert('Iniciano heuristica de nível um!');

    lastMove = [];
    let qtdMov = 0;

    //Enquanto a mtriz atual não for o resultado esperado
    while (!checkSucess() && qtdMov < 100) {

        let neighbors = getNeighbors({ 'y': y, 'x': x });

        let best = getBestChild(neighbors);

        const neighborAux = neighbors.slice();

        lastMove.push(matriz[best.y][best.x]);

        //evitando jogadas repetidas
        while (loop()) {
            //removendo vizinho já que mover para ele levara a um loop
            neighbors = neighbors.filter((e) => e !== best);

            //se todos os vizinhos levam a um loop, escolhemos um aleatório
            if (neighbors.length === 0) {
                const randomBest = Math.floor(Math.random() * (neighborAux.length - 1));
                best = neighborAux[randomBest];
                break;
            }

            lastMove.pop(); //removendo ultimo movimento já que ele levará a um loop

            best = getBestChild(neighbors);

            //armazenando ultimos movimentos para identificar loops nos movimentos
            lastMove.push(matriz[best.y][best.x]);
        }

        //só verificamos loops até seis movimentos
        //ou seja, comparamos os seis primeiros com os seis últimos
        //logo quando atingimos mais de 12 movimentos podemos zerar o array
        if (lastMove.length >= 13) {
            const aux = lastMove.pop();
            lastMove = [];
            lastMove.push(aux);
        }

        moveSquare(best.y, best.x);

        //esperando movimento
        await delay(700);

        qtdMov++;
    }

    if (qtdMov >= 100) alert("Solução não encontrada, máximo de 100 movimentos!");
    else alert(`Resultado encontrado depois de ${qtdMov} movimentos!`);
}

/**
* Função para encotnrar a melhor jogada em dois níveis 
* Para cada vizinho explorado, trocamos o quadrado vazio por ele e pegamos seus novos vizinhos
* Calculamos a distância até o resultado e selecionamos o vizinho com a menor distância 
* Se os filhos do nó atual sao a) e b), e os filhos de a) e b) são c), d) e e), f), respectivamente
* Então se c) ou d) tem a menor distância, escolhemos o nó a), caso e) ou f) tenham a menor distância
* escolhemos o nó b).
*/
function getBestChildTwo(neighbors) {
    let sum;
    let minSum = 200;
    let best = neighbors[0];

    let copyMatriz = matriz.map(e => e.slice());

    //para cada vizinho do nó atual
    for (n in neighbors) {

        //trocando peças primeiro nivel
        const currentSquareFirst = copyMatriz[neighbors[n].y][neighbors[n].x];
        copyMatriz[y][x] = currentSquareFirst;
        copyMatriz[neighbors[n].y][neighbors[n].x] = 9;

        //pegamos os vizinhos do nó n
        let neighborsTwo = getNeighbors({ 'y': neighbors[n].y, 'x': neighbors[n].x });


        //Percorre cada joagada possível no segundo nivel
        for (n2 in neighborsTwo) {
            sum = 0;

            //trocando peças segundo nivel
            const currentSquareSecond = copyMatriz[neighborsTwo[n2].y][neighborsTwo[n2].x];
            copyMatriz[neighbors[n].y][neighbors[n].x] = currentSquareSecond;
            copyMatriz[neighborsTwo[n2].y][neighborsTwo[n2].x] = 9;

            if (currentSquareFirst === currentSquareSecond) continue;

            // Soma da diferença de cada quadrado com sua posição final
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    sum += Math.abs(matrizResult[i][j] - copyMatriz[i][j]);
                }
            }

            if (sum < minSum) {
                minSum = sum;
                //escolhemos o nó do primeiro nível que leve ao nó do segundo nível com a menor soma
                best = neighbors[n];
            }

            //destrocando peças segundo nivel
            copyMatriz[neighbors[n].y][neighbors[n].x] = 9;
            copyMatriz[neighborsTwo[n2].y][neighborsTwo[n2].x] = currentSquareSecond;
        }

        //destrocando peças primeiro nível
        copyMatriz[y][x] = 9;
        copyMatriz[neighbors[n].y][neighbors[n].x] = currentSquareFirst;
    }

    return best;
}

async function heuristicTwo() {
    alert('Iniciano heuristica de nível dois!');

    lastMove = [];
    let qtdMov = 0;

    //Enquanto a mtriz atual não for o resultado esperado
    while (!checkSucess() && qtdMov < 100) {

        let neighbors = getNeighbors({ 'y': y, 'x': x });

        let best = getBestChildTwo(neighbors);

        const neighborAux = neighbors.slice();

        lastMove.push(matriz[best.y][best.x]);

        //evitando jogadas repetidas
        while (loop()) {
            //removendo vizinho já que mover para ele levara a um loop
            neighbors = neighbors.filter((e) => e !== best);

            //se todos os vizinhos levam a um loop, escolhemos um aleatório
            if (neighbors.length === 0) {
                const randomBest = Math.floor(Math.random() * (neighborAux.length - 1));
                best = neighborAux[randomBest];
                break;
            }

            lastMove.pop(); //removendo ultimo movimento já que ele levará a um loop

            best = getBestChildTwo(neighbors);

            //armazenando ultimos movimentos para identificar loops nos movimentos
            lastMove.push(matriz[best.y][best.x]);
        }

        if (lastMove.length >= 13) {
            const aux = lastMove.pop();
            lastMove = [];
            lastMove.push(aux);
        }

        moveSquare(best.y, best.x);

        //esperando movimento
        await delay(700);

        qtdMov++;
    }

    if (qtdMov >= 100) alert("Solução não encontrada, máximo de 100 movimentos!");
    else alert(`Resultado encontrado depois de ${qtdMov} movimentos!`);
}

/**
 * Heuristica baseada no número de quadrados na posição errada no segundo nível (após duas jogadas)
 */
function getBestChildP(neighbors) {
    let numberIncorrectSquares;
    let min = 200;
    let best = neighbors[0];

    let copyMatriz = matriz.map(e => e.slice());

    //para cada vizinho do nó atual
    for (n in neighbors) {
        //pegamos os vizinhos desse nó caso ele tenha sido movido 
        let neighborsTwo = getNeighbors({ 'y': neighbors[n].y, 'x': neighbors[n].x });

        //trocando peças primeiro nivel
        const currentSquareFirst = copyMatriz[neighbors[n].y][neighbors[n].x];
        copyMatriz[y][x] = currentSquareFirst;
        copyMatriz[neighbors[n].y][neighbors[n].x] = 9;

        //Percorre cada joagada possível no segundo nivel
        for (n2 in neighborsTwo) {
            numberIncorrectSquares = 0;

            //trocando peças segundo nivel
            const currentSquareSecond = copyMatriz[neighborsTwo[n2].y][neighborsTwo[n2].x];
            copyMatriz[neighbors[n].y][neighbors[n].x] = currentSquareSecond;
            copyMatriz[neighborsTwo[n2].y][neighborsTwo[n2].x] = 9;

            // quantidade de quadrados fora do lugar
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    if (matrizResult[i][j] !== copyMatriz[i][j])
                        numberIncorrectSquares++;
                }
            }

            if (numberIncorrectSquares < min) {
                min = numberIncorrectSquares;
                //escolhemos o nó com o menor número de quadrados fora do lugar
                best = neighbors[n];
            }

            //destrocando peças segundo nivel
            copyMatriz[neighbors[n].y][neighbors[n].x] = 9;
            copyMatriz[neighborsTwo[n2].y][neighborsTwo[n2].x] = currentSquareSecond;
        }

        //destrocando peças primeiro nível
        copyMatriz[y][x] = 9;
        copyMatriz[neighbors[n].y][neighbors[n].x] = currentSquareFirst;
    }

    return best;
}

async function heuristicP() {
    alert('Iniciano heuristica baseada na quantidade de quadrados fora do lugar no segundo nível');

    lastMove = [];
    let qtdMov = 0;

    //Enquanto a mtriz atual não for o resultado esperado
    while (!checkSucess() && qtdMov < 100) {

        let neighbors = getNeighbors({ 'y': y, 'x': x });

        let best = getBestChildP(neighbors);

        const neighborAux = neighbors.slice();

        lastMove.push(matriz[best.y][best.x]);

        //evitando jogadas repetidas
        while (loop()) {
            //removendo vizinho já que mover para ele levara a um loop
            neighbors = neighbors.filter((e) => e !== best);

            //se todos os vizinhos levam a um loop, escolhemos um aleatório
            if (neighbors.length === 0) {
                const randomBest = Math.floor(Math.random() * (neighborAux.length - 1));
                best = neighborAux[randomBest];
                break;
            }

            lastMove.pop(); //removendo ultimo movimento já que ele levará a um loop

            best = getBestChildP(neighbors);

            //armazenando ultimos movimentos para identificar loops nos movimentos
            lastMove.push(matriz[best.y][best.x]);
        }

        if (lastMove.length >= 13) {
            const aux = lastMove.pop();
            lastMove = [];
            lastMove.push(aux);
        }

        moveSquare(best.y, best.x);

        //esperando movimento
        await delay(700);

        qtdMov++;
    }

    if (qtdMov >= 100) alert("Solução não encontrada, máximo de 100 movimentos!");
    else alert(`Resultado encontrado depois de ${qtdMov} movimentos!`);
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

    if (lastMove.length > 1
        && lastMove[lastMove.length - 1] === lastMove[lastMove.length - 2]) return true;

    let subMovs1;
    let subMovs2;


    for (jump = 2; jump <= 6; jump++) {

        subMovs1 = lastMove.slice(0, jump).join('');

        for (i = jump; i < lastMove.length && lastMove.length >= 2 * jump; i++) {

            subMovs2 = lastMove.slice(i, i + jump).join('');

            if (subMovs1.length !== subMovs2.length) break;

            if (subMovs1 === subMovs2) return true;

            subMovs1 = lastMove.slice(i - jump + 1, i + 1).join('');
        }
    }

    return false;
}

//função para pegar todos os vizinhos-4 do quadrado 9
function getNeighbors({ 'y': cy, 'x': cx }) {
    //armazenar seus vizinhos
    //o quadrado 9 só pode se mover (trocar de lugar) com um vizinho-4
    let neighbors = [];

    //verificando posição atual do quadrado 9 e armazenando a posição dos seus vizinhos
    if (cy == 2 && cx == 2) {
        neighbors.push(
            { 'y': cy - 1, 'x': cx },
            { 'y': cy, 'x': cx - 1 });
    }
    else if (cy == 2 && cx == 1) {
        neighbors.push(
            { 'y': cy - 1, 'x': cx },
            { 'y': cy, 'x': cx - 1 },
            { 'y': cy, 'x': cx + 1 });
    }
    else if (cy == 2 && cx == 0) {
        neighbors.push(
            { 'y': cy - 1, 'x': cx },
            { 'y': cy, 'x': cx + 1 });
    }
    else if (cy == 1 && cx == 2) {
        neighbors.push(
            { 'y': cy - 1, 'x': cx },
            { 'y': cy + 1, 'x': cx },
            { 'y': cy, 'x': cx - 1 });
    }
    else if (cy == 1 && cx == 1) {
        neighbors.push(
            { 'y': cy - 1, 'x': cx },
            { 'y': cy + 1, 'x': cx },
            { 'y': cy, 'x': cx - 1 },
            { 'y': cy, 'x': cx + 1 });
    }
    else if (cy == 1 && cx == 0) {
        neighbors.push(
            { 'y': cy - 1, 'x': cx },
            { 'y': cy + 1, 'x': cx },
            { 'y': cy, 'x': cx + 1 });
    }
    else if (cy == 0 && cx == 2) {
        neighbors.push(
            { 'y': cy + 1, 'x': cx },
            { 'y': cy, 'x': cx - 1 });
    }
    else if (cy == 0 && cx == 1) {
        neighbors.push(
            { 'y': cy + 1, 'x': cx },
            { 'y': cy, 'x': cx - 1 },
            { 'y': cy, 'x': cx + 1 });
    }
    else if (cy == 0 && cx == 0) {
        neighbors.push(
            { 'y': cy + 1, 'x': cx },
            { 'y': cy, 'x': cx + 1 });
    }

    return neighbors;
}

//função que escolhe um vizinho aleatório do quadrado 9 para mover
function randomNeighbor() {

    let neighbors = getNeighbors({ 'y': y, 'x': x });

    //escolhendo um vizinho aleatório
    let neighbor = Math.floor(Math.random() * (neighbors.length - 1));

    //armazenando ultimos movimentos para identificar loops nos movimentos
    lastMove.push(matriz[neighbors[neighbor].y][neighbors[neighbor].x]);

    const auxNeighbors = neighbors.slice();

    while (loop()) {
        //removendo vizinho já que ele mover para ele levará a um loop
        neighbors = neighbors.filter((e) => e !== neighbor);

        if (neighbors.length === 0) {
            best = auxNeighbors[Math.floor(Math.random() * (auxNeighbors.length - 1))];
            break;
        }

        lastMove.pop(); //removendo ultimo movimento já que ele levará a um loop

        //escolhendo um vizinho aleatório
        neighbor = Math.floor(Math.random() * (neighbors.length));

        //armazenando ultimos movimentos para identificar loops nos movimentos
        lastMove.push(matriz[neighbors[neighbor].y][neighbors[neighbor].x]);
    }

    //movendo quadrado 9 para a posição do seu vizinho
    moveSquare(neighbors[neighbor].y, neighbors[neighbor].x);
    if (lastMove.length >= 12) lastMove = [];
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

    lastMove = [];

    y = 2; //terceira linha 
    x = 2; //terceira coluna

    renderBoard();
}

init();
