document.addEventListener("DOMContentLoaded", function() {
    const chessBoard = document.querySelector(".chess-board");
    let selectedPiece = null;
    let selectedSquare = null;
    let gameOver = false;
    let playerSide = Math.random() < 0.5 ? 'white' : 'black';
    let turn = 'white';
    let moveCount = 1;
    let whiteTime = 120000;
    let blackTime = 120000;
    let timerInterval;

    const pieces = {
        'R': 'white_rook.png',
        'N': 'white_knight.png',
        'B': 'white_bishop.png',
        'Q': 'white_queen.png',
        'K': 'white_king.png',
        'P': 'white_pawn.png',
        'r': 'black_rook.png',
        'n': 'black_knight.png',
        'b': 'black_bishop.png',
        'q': 'black_queen.png',
        'k': 'black_king.png',
        'p': 'black_pawn.png'
    };

    const initialBoard = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    let board = JSON.parse(JSON.stringify(initialBoard));

    createBoard();

    if (playerSide === 'black') {
        setTimeout(() => makeRandomMove(turn), 500);
    } else {
        swapTimers();
    }

    startTimer();

    function createBoard() {
        chessBoard.innerHTML = '';

        const isFlipped = playerSide === 'black';

        for (let row = 0; row < 8; row++) {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("row");

            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square");

                const displayRow = isFlipped ? 7 - row : row;
                const displayCol = isFlipped ? 7 - col : col;

                if ((displayRow + displayCol) % 2 === 0) {
                    square.classList.add("light");
                } else {
                    square.classList.add("dark");
                }

                const piece = board[displayRow][displayCol];
                if (piece) {
                    const img = document.createElement("img");
                    img.src = `images/${pieces[piece]}`;
                    img.alt = piece;
                    img.classList.add("piece");
                    square.appendChild(img);
                }

                square.dataset.row = displayRow;
                square.dataset.col = displayCol;
                square.addEventListener("click", onSquareClick);

                rowDiv.appendChild(square);
            }

            chessBoard.appendChild(rowDiv);
        }
    }

    function onSquareClick(event) {
        if (gameOver || turn !== playerSide) return;
    
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const pieceImg = square.querySelector("img");
    
        if (selectedPiece) {
            const startRow = parseInt(selectedSquare.dataset.row);
            const startCol = parseInt(selectedSquare.dataset.col);
            const piece = selectedPiece.alt;
    
            const selectedPieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
            const targetPieceColor = pieceImg ? (pieceImg.alt === pieceImg.alt.toUpperCase() ? 'white' : 'black') : null;
    
            if (selectedPieceColor === turn && (!pieceImg || selectedPieceColor !== targetPieceColor) &&
                isValidMove(piece, startRow, startCol, row, col)) {
    
                removeValidMoveIndicators();
    
                if (pieceImg) {
                    if (pieceImg.alt.toLowerCase() === 'k') {
                        gameOver = true;
                        displayGameOver(selectedPieceColor);
                    }
                    square.removeChild(pieceImg);
                }
                selectedSquare.innerHTML = "";
                square.appendChild(selectedPiece);
                selectedPiece.classList.remove("selected-light", "selected-dark");
                updateBoardState(startRow, startCol, row, col, piece);
                selectedPiece = null;
                selectedSquare = null;
    
                if (!gameOver) {
                    turn = turn === 'white' ? 'black' : 'white';
                    document.getElementById('turn-indicator').innerText = `turn: ${turn}`;
                    if (turn === 'white') {
                        moveCount++;
                        document.getElementById('move-count').innerText = `move: ${moveCount}`;
                    }
    
                    startTimer();
    
                    if (turn !== playerSide) {
                        setTimeout(() => makeRandomMove(turn), 500);
                    }
                }
                return;
            } else {
                selectedPiece.classList.remove("selected-light", "selected-dark");
                selectedPiece = null;
                selectedSquare = null;
            }
    
            removeValidMoveIndicators();
        }
    
        if (pieceImg && !gameOver) {
            const pieceColor = pieceImg.alt === pieceImg.alt.toUpperCase() ? 'white' : 'black';
            if (pieceColor === turn) {
                removeValidMoveIndicators();
                selectedPiece = pieceImg;
                selectedSquare = square;
                if (square.classList.contains("light")) {
                    selectedPiece.classList.add("selected-light");
                } else {
                    selectedPiece.classList.add("selected-dark");
                }
    
                showValidMoves(pieceImg.alt, parseInt(square.dataset.row), parseInt(square.dataset.col));
            }
        }
    }    

    function removeValidMoveIndicators() {
        const indicators = document.querySelectorAll(".valid-move");
        indicators.forEach(indicator => indicator.remove());
    }

    function showValidMoves(piece, startRow, startCol) {
        const pieceColor = piece.toUpperCase() === piece ? 'white' : 'black';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (isValidMove(piece, startRow, startCol, row, col)) {
                    const targetPiece = board[row][col];
                    const targetPieceColor = targetPiece ? (targetPiece.toUpperCase() === targetPiece ? 'white' : 'black') : null;
                    if (!targetPiece || targetPieceColor !== pieceColor) {
                        const square = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
                        const indicator = document.createElement("div");
                        indicator.classList.add("valid-move");
                        square.appendChild(indicator);
                    }
                }
            }
        }
    }    

    function updateBoardState(startRow, startCol, endRow, endCol, piece) {
        board[endRow][endCol] = piece;
        board[startRow][startCol] = '';
    }

    function isValidMove(piece, startRow, startCol, endRow, endCol) {
        switch (piece.toLowerCase()) {
            case 'p':
                return isValidPawnMove(piece, startRow, startCol, endRow, endCol);
            case 'r':
                return isValidRookMove(startRow, startCol, endRow, endCol);
            case 'n':
                return isValidKnightMove(startRow, startCol, endRow, endCol);
            case 'b':
                return isValidBishopMove(startRow, startCol, endRow, endCol);
            case 'q':
                return isValidQueenMove(startRow, startCol, endRow, endCol);
            case 'k':
                return isValidKingMove(startRow, startCol, endRow, endCol);
            default:
                return false;
        }
    }

    function isValidPawnMove(piece, startRow, startCol, endRow, endCol) {
        const direction = piece === 'P' ? -1 : 1;
        const startRowInitial = piece === 'P' ? 6 : 1;
        if (startCol === endCol) {
            if (startRow + direction === endRow && !board[endRow][endCol]) {
                return true; 
            } else if (startRow === startRowInitial && startRow + 2 * direction === endRow && !board[endRow][endCol] && !board[startRow + direction][endCol]) {
                return true;
            }
        } else if (Math.abs(startCol - endCol) === 1 && startRow + direction === endRow && board[endRow][endCol]) {
            return true;
        }
        return false;
    }

    function isValidRookMove(startRow, startCol, endRow, endCol) {
        if (startRow === endRow) {
            const colStart = Math.min(startCol, endCol);
            const colEnd = Math.max(startCol, endCol);
            for (let col = colStart + 1; col < colEnd; col++) {
                if (board[startRow][col] !== '') return false;
            }
            return true;
        } else if (startCol === endCol) {
            const rowStart = Math.min(startRow, endRow);
            const rowEnd = Math.max(startRow, endRow);
            for (let row = rowStart + 1; row < rowEnd; row++) {
                if (board[row][startCol] !== '') return false;
            }
            return true;
        }
        return false;
    }

    function isValidBishopMove(startRow, startCol, endRow, endCol) {
        if (Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) {
            const rowDirection = startRow < endRow ? 1 : -1;
            const colDirection = startCol < endCol ? 1 : -1;
            let row = startRow + rowDirection;
            let col = startCol + colDirection;
            while (row !== endRow && col !== endCol) {
                if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;
                if (board[row][col] !== '') return false;
                row += rowDirection;
                col += colDirection;
            }
            return true;
        }
        return false;
    }    

    function isValidQueenMove(startRow, startCol, endRow, endCol) {
        return isValidRookMove(startRow, startCol, endRow, endCol) || isValidBishopMove(startRow, startCol, endRow, endCol);
    }    

    function isValidKnightMove(startRow, startCol, endRow, endCol) {
        const rowDiff = Math.abs(startRow - endRow);
        const colDiff = Math.abs(startCol - endCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    function isValidKingMove(startRow, startCol, endRow, endCol) {
        const rowDiff = Math.abs(startRow - endRow);
        const colDiff = Math.abs(startCol - endCol);

        if (rowDiff <= 1 && colDiff <= 1) {
            const targetPiece = board[endRow][endCol];
            const startPiece = board[startRow][startCol];

            const startPieceColor = startPiece === startPiece.toUpperCase() ? 'white' : 'black';
            const targetPieceColor = targetPiece ? (targetPiece === targetPiece.toUpperCase() ? 'white' : 'black') : null;

            return !targetPiece || targetPieceColor !== startPieceColor;
        }
        return false;
    }

    function updateTimer() {
        const currentTimer = turn === 'white' ? 'white-timer' : 'black-timer';
        const currentTime = turn === 'white' ? (whiteTime -= 100) : (blackTime -= 100);
    
        if (currentTime < 0) {
            clearInterval(timerInterval);
            gameOver = true;
            displayGameOver(turn === 'white' ? 'black' : 'white');
            return;
        }
    
        const minutes = Math.floor(currentTime / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((currentTime % 60000) / 1000).toString().padStart(2, '0');
        const tenths = Math.floor((currentTime % 1000) / 100).toString();
        document.getElementById(currentTimer).innerText = `${minutes}:${seconds}.${tenths}`;
    }
    
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 100);
    }        

    function swapTimers() {
        const timerContainer = document.querySelector('.timer');
        const whiteTimer = document.getElementById('white-timer');
        const blackTimer = document.getElementById('black-timer');
        timerContainer.insertBefore(blackTimer, whiteTimer);
    }

    function getAllLegalMoves(color) {
        const legalMoves = [];
        for (let startRow = 0; startRow < 8; startRow++) {
            for (let startCol = 0; startCol < 8; startCol++) {
                const piece = board[startRow][startCol];
                if (piece && ((piece === piece.toUpperCase() && color === 'white') || (piece === piece.toLowerCase() && color === 'black'))) {
                    for (let endRow = 0; endRow < 8; endRow++) {
                        for (let endCol = 0; endCol < 8; endCol++) {
                            if (isValidMove(piece, startRow, startCol, endRow, endCol)) {
                                const targetPiece = board[endRow][endCol];
                                if (!targetPiece || (targetPiece.toUpperCase() === targetPiece && color === 'black') || (targetPiece.toLowerCase() === targetPiece && color === 'white')) {
                                    legalMoves.push({
                                        startRow: startRow,
                                        startCol: startCol,
                                        endRow: endRow,
                                        endCol: endCol
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        return legalMoves;
    }

    function makeRandomMove(color) {
        const legalMoves = getAllLegalMoves(color);
        if (legalMoves.length === 0) return;
    
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    
        const piece = board[randomMove.startRow][randomMove.startCol];
        const targetPiece = board[randomMove.endRow][randomMove.endCol];
    
        const startSquare = document.querySelector(`.square[data-row='${randomMove.startRow}'][data-col='${randomMove.startCol}']`);
        const endSquare = document.querySelector(`.square[data-row='${randomMove.endRow}'][data-col='${randomMove.endCol}']`);
    
        if (targetPiece) {
            endSquare.innerHTML = "";
        }
    
        const img = startSquare.querySelector("img");
        startSquare.innerHTML = "";
        endSquare.appendChild(img);
    
        updateBoardState(randomMove.startRow, randomMove.startCol, randomMove.endRow, randomMove.endCol, piece);
    
        turn = turn === 'white' ? 'black' : 'white';
        document.getElementById('turn-indicator').innerText = `turn: ${turn}`;
        if (turn === 'white') {
            moveCount++;
            document.getElementById('move-count').innerText = `move: ${moveCount}`;
        }
    
        startTimer();
    
        if (targetPiece && targetPiece.toLowerCase() === 'k') {
            gameOver = true;
            displayGameOver(color);
        }
    
        if (!gameOver && turn !== playerSide) {
            setTimeout(() => makeRandomMove(turn), 500);
        }
    }
    
    function displayGameOver(winner) {
        const gameOverBackground = document.createElement("div");
        gameOverBackground.classList.add("game-over-background");
        
        const gameOverText = document.createElement("div");
        gameOverText.classList.add("game-over-text");
        gameOverText.innerText = `${winner} wins!`;

        chessBoard.appendChild(gameOverBackground);
        chessBoard.appendChild(gameOverText);
    }

});
