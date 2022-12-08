export { Game };

class Game {
  constructor(row, column, players, canvasid) {
    this.players = players;
    this.canvasid = canvasid;
    this.canvas = document.getElementById(canvasid);
    this.rows = row;
    this.columns = column;
    this.grid = [];
    this.players = players;
    this.numberOfPlayers = players.length;
    this.turnNumber = 0;
    this.undoState = true;
    this.startGame();
  }
  checkPlayers() {
    let colorArr = [];
    this.players.forEach((player) => {
      if (!colorArr.includes(player.color)) {
        colorArr.push(player.color);
      } else {
        return false;
      }
    });
    return true;
  }
  startGame() {
    if (this.checkPlayers()) {
      this.displayUI();
      this.displayGrid();
    } else {
      let context = this.context;
      context.font = "20px Poppins";
      context.fillText(
        "Two players can not share the same color. Please modify your player array.",
        0,
        20
      );
    }
  }

  displayUI() {
    this.canvas.parentNode.innerHTML =
      "<canvas id=" + this.canvasid + "></canvas>";
    this.canvas = document.getElementById(this.canvasid);
    let container = document.getElementById("game-container");
    let title = document.createElement("h1");
    title.innerHTML = "Puissance 4";
    container.insertBefore(title, this.canvas);
    let playersContainer = document.createElement("div");
    playersContainer.id = "players-container";
    this.players.forEach((player) => {
      let playerNumber = document.createElement("h3");
      playerNumber.classList.add("player");
      playerNumber.id = player.number;
      playerNumber.innerHTML = "Joueur " + player.number;
      playerNumber.style.color = player.color;
      playersContainer.appendChild(playerNumber);
    });
    container.insertBefore(playersContainer, this.canvas);
    container.style.width = 100 * this.columns + "px";
    document.getElementById("1").style.fontSize = "24px";
    let cancelButton = document.createElement("button");
    cancelButton.id = "undo";
    cancelButton.innerText = "Undo";
    container.appendChild(cancelButton);
  }

  displayGrid() {
    // Draw grid
    document.getElementById("undo").addEventListener("click", (e) => {
      e.preventDefault();
      this.cancelAction();
    });
    this.canvas.setAttribute("height", 100 * this.rows);
    this.canvas.setAttribute("width", 100 * this.columns);
    this.canvas.style.cursor = "pointer";
    this.context = this.canvas.getContext("2d");
    this.mouseMoveEvent = (e) => {
      this.getMousePos(e);
      this.playPreview(this.currentColumn);
    };
    this.canvas.addEventListener("mousemove", this.mouseMoveEvent);
    this.clickEvent = () => {
      this.playerTurn(this.currentColumn, this.currentRow);
    };
    this.canvas.addEventListener("click", this.clickEvent);
    let context = this.context;
    context.fillStyle = "blue";
    context.lineWidth = "1";
    let width = 100 * this.columns;
    let height = 100 * this.rows;
    context.rect(0, 0, width, height);
    context.fill();
    // Draw empty circles
    context.fillStyle = "white";
    let tempArr;
    for (let row = 0; row < this.rows; row++) {
      tempArr = [];
      for (let column = 0; column < this.columns; column++) {
        context.beginPath();
        tempArr.push(0);
        context.arc(50 + 100 * column, 50 + 100 * row, 40, 0, Math.PI * 2);
        context.fill();
      }
      this.grid.push(tempArr);
    }
  }

  getMousePos(e) {
    let canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.currentColumn = Math.floor(x / 100);
  }

  playPreview(currentColumn) {
    let context = this.context;
    for (let column = 0; column < this.columns; column++) {
      for (let row = this.rows - 1; row >= 0; row--) {
        if (this.grid[row][column] == 0) {
          context.clearRect(100 * column, 100 * row, 100, 100);
          context.fillStyle = "blue";
          context.beginPath();
          context.rect(100 * column, 100 * row, 100, 100);
          context.fill();
          context.fillStyle = "white";
          context.beginPath();
          context.arc(50 + 100 * column, 50 + 100 * row, 40, 0, Math.PI * 2);
          context.fill();
          if (column == currentColumn) {
            context.fillStyle = "lightgreen";
            context.beginPath();
            context.arc(
              50 + 100 * currentColumn,
              50 + 100 * row,
              40,
              0,
              Math.PI * 2
            );
            context.fill();
            this.currentRow = row;
          }
          break;
        }
      }
    }
  }

  playerTurn(column, row) {
    this.savedGrid = JSON.parse(JSON.stringify(this.grid));
    this.savedRow = row;
    this.savedColumn = column;
    let playerNumber =
      this.players[this.turnNumber % this.numberOfPlayers].number;
    let playerColor =
      this.players[this.turnNumber % this.numberOfPlayers].color;
    let context = this.context;
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.grid[row][column] == 0) {
        if (this.grid[0][column] == 0) {
          Array.from(document.getElementsByClassName("player")).forEach(
            (element) => {
              element.style.fontSize = "18px";
            }
          );
          document.getElementById(
            this.players[(this.turnNumber + 1) % this.numberOfPlayers].number
          ).style.fontSize = "24px";
          this.grid[row][column] = playerNumber;
          context.fillStyle = playerColor;
          context.beginPath();
          context.arc(50 + 100 * column, 50 + 100 * row, 40, 0, Math.PI * 2);
          context.fill();
          this.checkGameState(playerNumber, row, column);
          this.undoState = false;
          this.turnNumber++;
          break;
        }
      }
    }
  }

  cancelAction() {
    if (this.grid != undefined && this.undoState == false) {
      this.grid = this.savedGrid;
      this.turnNumber--;
      Array.from(document.getElementsByClassName("player")).forEach(
        (element) => {
          element.style.fontSize = "18px";
        }
      );
      document.getElementById(
        this.players[this.turnNumber % this.numberOfPlayers].number
      ).style.fontSize = "24px";
      let context = this.context;
      context.fillStyle = "white";
      context.beginPath();
      context.arc(
        50 + 100 * this.savedColumn,
        50 + 100 * this.savedRow,
        40,
        0,
        Math.PI * 2
      );
      context.fill();
      this.undoState = true;
    }
  }

  checkGameState(player, row, column) {
    if (this.turnNumber == this.rows * this.columns - 1) {
      this.stopGame();
      let playersContainer = document.getElementById("players-container");
      playersContainer.innerText = "";
      context.clearRect(0, 0, this.columns * 100, this.rows * 100);
      context.font = "20px Poppins";
      context.fillText("It's a DRAW !", 0, 20);
    }
    if (
      this.checkHorizontal(player, row) ||
      this.checkVertical(player, column) ||
      this.checkDiagonalC(player, row, column) ||
      this.checkDiagonalCC(player, row, column)
    ) {
      this.stopGame();
      let playersContainer = document.getElementById("players-container");
      playersContainer.innerHTML = "";
      playersContainer.style.color = this.players[player - 1].color;
      let context = this.context;
      context.clearRect(0, 0, this.columns * 100, this.rows * 100);
      context.font = "20px Poppins";
      context.fillText("Player " + player + " wins", 0, 20);
      let replayButton = document.createElement("button");
      replayButton.id = "replay";
      replayButton.innerText = "Replay a game";
      document.getElementById("game-container").appendChild(replayButton);
      document.getElementById("replay").addEventListener("click", (e) => {
        e.preventDefault();
        let game = new Game(
          this.rows,
          this.columns,
          this.players,
          this.canvasid
        );
        return game;
      });
    }
  }
  checkHorizontal(player, row) {
    for (let column = 0; column < this.columns - 3; column++) {
      if (
        this.grid[row][column] == player &&
        this.grid[row][column + 1] == player &&
        this.grid[row][column + 2] == player &&
        this.grid[row][column + 3] == player
      ) {
        return true;
      }
    }
  }
  checkVertical(player, column) {
    for (let row = 0; row < this.rows - 3; row++) {
      if (
        this.grid[row][column] == player &&
        this.grid[row + 1][column] == player &&
        this.grid[row + 2][column] == player &&
        this.grid[row + 3][column] == player
      ) {
        return true;
      }
    }
  }
  checkDiagonalC(player, row, column) {
    let diff = row - column;
    let count = 0;
    for (
      let i = Math.max(diff, 0);
      i < Math.min(this.rows, this.columns + diff);
      i++
    ) {
      if (this.grid[i][i - diff] == player) {
        count++;
      } else {
        count = 0;
      }
      if (count >= 4) {
        return true;
      }
    }
  }
  checkDiagonalCC(player, row, column) {
    let diff = row + column;
    let count = 0;
    for (
      let i = Math.max(diff - this.columns + 1, 0);
      i < Math.min(this.rows, diff + 1);
      i++
    ) {
      if (this.grid[i][diff - i] == player) {
        count++;
      } else {
        count = 0;
      }
      if (count >= 4) {
        return true;
      }
    }
  }
  stopGame() {
    this.canvas.removeEventListener("mousemove", this.mouseMoveEvent);
    this.canvas.removeEventListener("click", this.clickEvent);
  }
}
