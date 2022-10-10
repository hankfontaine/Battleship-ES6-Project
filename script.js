(function runModulesOfGame() {
  ///////////////////////////////////////////////////////////////////////
  /////////////// BEGIN CODE OF MODULES PROJECT /////////////////////////
  ///////////////////////////////////////////////////////////////////////
  class Square {
    constructor(coordsOfSquare) {
      this.coordsOfSquare = coordsOfSquare;
      this.isOccupiedBy = null;
      this.wasAttacked = false;
    }
  }

  class Ship {
    constructor(name, coordsOccupied, coordsWhereHit = null) {
      this.name = name;
      this.coordsOccupied = coordsOccupied;
      this.coordsWhereHit = [];
      this.sunk = false;
    }
    hit = (coords) => {
      this.coordsOccupied.forEach((nodeOfShip) => {
        if (coords[0] === nodeOfShip[0] && coords[1] === nodeOfShip[1]) {
          this.coordsWhereHit.push(coords);
          return this.coordsWhereHit;
        }
      });
      this.isSunk();
    };
    isSunk = () => {
      if (this.coordsWhereHit.length === this.coordsOccupied.length) {
        this.sunk = true;
        // console.log(this.name + ' sunk!');
      }
    };
  }

  const setShipName = (input) => {
    if (input === 5) return 'carrier';
    if (input === 4) return 'battleship';
    if (input === 3) return 'cruiser';
    if (input === 2) return 'destroyer';
  };

  class Gameboard {
    constructor(player, boardType) {
      this.player = player;
      this.boardType = boardType;
      this.squares = this.makeSquares();
      this.deployedShips = [];
      this.shipCount = 0;
    }

    makeSquares = () => {
      const squaresArray = [];
      for (let x = 1; x <= 10; x++) {
        for (let y = 1; y <= 10; y++) {
          squaresArray.push(new Square([x, y]));
        }
      }
      return squaresArray;
    };

    setShipLengthToDeploy = () => {
      let shipLength;
      if (this.shipCount === 5) return;
      if (this.shipCount === 0) shipLength = 5;
      if (this.shipCount === 1) shipLength = 4;
      if (this.shipCount === 2) shipLength = 3;
      if (this.shipCount === 3) shipLength = 3;
      if (this.shipCount === 4) shipLength = 2;
      this.shipCount++;
      return shipLength;
    };

    placeShip = (startingCoord, length, orientation) => {
      if (
        startingCoord[0] < 1 ||
        startingCoord[0] > 10 ||
        startingCoord[1] < 1 ||
        startingCoord[1] > 10 ||
        (startingCoord[0] + length > 11 && orientation === 'horizontal') ||
        (startingCoord[1] + length > 11 && orientation === 'vertical') ||
        !length ||
        !startingCoord ||
        !orientation
      )
        return 'error';

      let coordsArray = [];
      if (orientation === 'vertical') {
        for (let i = 0; i < length; i++) {
          coordsArray.push([startingCoord[0], startingCoord[1] + i]);
        }
      } else if (orientation === 'horizontal') {
        for (let i = 0; i < length; i++) {
          coordsArray.push([startingCoord[0] + i, startingCoord[1]]);
        }
      }

      let arrayOfSquaresToOccupy = [];
      coordsArray.forEach((coordinates) => {
        arrayOfSquaresToOccupy.push(
          this.squares.find(
            (nodeOfShip) =>
              nodeOfShip.coordsOfSquare[0] === coordinates[0] &&
              nodeOfShip.coordsOfSquare[1] === coordinates[1],
          ),
        );
      });

      if (
        arrayOfSquaresToOccupy.find(
          (nodeOfShip) => nodeOfShip.isOccupiedBy != null,
        )
      )
        return;

      const ship = new Ship(setShipName(length), coordsArray);
      coordsArray.forEach((coordinates) => {
        this.squares.find(
          (nodeOfShip) =>
            nodeOfShip.coordsOfSquare[0] === coordinates[0] &&
            nodeOfShip.coordsOfSquare[1] === coordinates[1],
        ).isOccupiedBy = ship.name;
      });
      this.deployedShips.push(ship);
      return ship;
    };

    recieveAttack = (coords) => {
      const attackedCoords = this.squares.find(
        (nodeOfShip) =>
          nodeOfShip.coordsOfSquare[0] === coords[0] &&
          nodeOfShip.coordsOfSquare[1] === coords[1],
      );
      if (attackedCoords.wasAttacked) return;

      if (attackedCoords.isOccupiedBy) {
        const soughtShip = this.deployedShips.find(
          (ship) => ship.name === attackedCoords.isOccupiedBy,
        );
        soughtShip.hit(attackedCoords.coordsOfSquare);
        // console.log(this.player + "'s " + soughtShip.name + ' was hit!');
      } else {
        attackedCoords.isOccupiedBy = 'miss';
        // console.log('that was a miss!');
      }

      attackedCoords.wasAttacked = true;
      this.checkForLoss();
      return attackedCoords.isOccupiedBy;
    };

    sendAttack = (coords, wasAHit) => {
      const attackedCoords = this.squares.find(
        (nodeOfShip) =>
          nodeOfShip.coordsOfSquare[0] === coords[0] &&
          nodeOfShip.coordsOfSquare[1] === coords[1],
      );
      if (attackedCoords.wasAttacked) return;

      attackedCoords.isOccupiedBy = wasAHit;
      attackedCoords.wasAttacked = true;
      // console.log(
      //   attackedCoords.coordsOfSquare +
      //     ' was attacked by ' +
      //     this.player +
      //     ' and it was a ' +
      //     wasAHit +
      //     '!',
      // );
    };
    checkForLoss = () => {
      if (!this.deployedShips.find((ship) => ship.sunk === false))
        return 'loss';
    };
  }

  class Player {
    constructor(name) {
      this.name = name;
      this.offensiveBoard = new Gameboard(this.name, 'offensive');
      this.defensiveBoard = new Gameboard(this.name, 'defensive');
    }
  }

  const setShipOrientation = (input) => {
    if (input) return 'vertical';
    return 'horizontal';
  };

  const generateComputerMove = (player) => {
    let arrayOfLegalMoves = [];
    let arrayOfSquares = player.offensiveBoard.squares;
    arrayOfSquares.forEach((square) => {
      if (!square.wasAttacked) {
        arrayOfLegalMoves.push(square);
      }
    });
    return arrayOfLegalMoves[
      Math.floor(Math.random() * arrayOfLegalMoves.length)
    ].coordsOfSquare;
  };

  const playRound = () => {
    const playerOne = new Player('Human');
    const playerTwo = new Player('Computer');
    ///////////////////////////////////////////////////////////////////////
    /////////////////////// SET PIECES IN PLACE ///////////////////////////
    ///////////////////////////////////////////////////////////////////////
    (function setPiecesInPlace() {
      playerOne.defensiveBoard.placeShip(
        [1, 1],
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(),
      );
      playerOne.defensiveBoard.placeShip(
        [6, 1],
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(),
      );
      playerOne.defensiveBoard.placeShip(
        [2, 2],
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation('X'),
      );
      playerOne.defensiveBoard.placeShip(
        [5, 5],
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(),
      );
      playerOne.defensiveBoard.placeShip(
        [5, 6],
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation('X'),
      );

      playerTwo.defensiveBoard.placeShip(
        [1, 1],
        playerTwo.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(),
      );
      // playerTwo.defensiveBoard.placeShip(
      //   [6, 1],
      //   playerTwo.defensiveBoard.setShipLengthToDeploy(),
      //   setShipOrientation(),
      // );
      // playerTwo.defensiveBoard.placeShip(
      //   [2, 2],
      //   playerTwo.defensiveBoard.setShipLengthToDeploy(),
      //   setShipOrientation('X'),
      // );
      // playerTwo.defensiveBoard.placeShip(
      //   [5, 5],
      //   playerTwo.defensiveBoard.setShipLengthToDeploy(),
      //   setShipOrientation(),
      // );
      // playerTwo.defensiveBoard.placeShip(
      //   [5, 6],
      //   playerTwo.defensiveBoard.setShipLengthToDeploy(),
      //   setShipOrientation('X'),
      // );
    })();

    ///////////////////////////////////////////////////////////////////////
    /////////////////// CHECK FOR WIN CONDITION ///////////////////////////
    ///////////////////////////////////////////////////////////////////////
    if (playerOne.defensiveBoard.checkForLoss() === 'loss') {
      result = playerOne.name + ' won the game!';
      // console.log(result);
      return result;
    }

    if (playerTwo.defensiveBoard.checkForLoss() === 'loss') {
      result = playerOne.name + ' won the game!';
      // console.log(result);
      return result;
    }
    ///////////////////////////////////////////////////////////////////////
    /////////////////////// PLAYER ONE ATTACKS ////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    let playerOneCoords = [10, 10];
    let playerOneAttack =
      playerTwo.defensiveBoard.recieveAttack(playerOneCoords);
    playerOne.offensiveBoard.sendAttack(playerOneCoords, playerOneAttack);

    ///////////////////////////////////////////////////////////////////////
    /////////////////////// PLAYER TWO ATTACKS ////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    let playerTwoCoords = generateComputerMove(playerTwo);
    let playerTwoAttack =
      playerOne.defensiveBoard.recieveAttack(playerTwoCoords);
    playerTwo.offensiveBoard.sendAttack(playerTwoCoords, playerTwoAttack);

    ///////////////////////////////////////////////////////////////////////
    /////////////////// TEMP ESCAPE FROM RECURSION ////////////////////////
    ///////////////////////////////////////////////////////////////////////

    (function keepGameGoingDuringTesting() {
      playerOneCoords = [1, 1];
      playerOneAttack = playerTwo.defensiveBoard.recieveAttack(playerOneCoords);
      playerOne.offensiveBoard.sendAttack(playerOneCoords, playerOneAttack);

      playerOneCoords = [2, 1];
      playerOneAttack = playerTwo.defensiveBoard.recieveAttack(playerOneCoords);
      playerOne.offensiveBoard.sendAttack(playerOneCoords, playerOneAttack);

      playerOneCoords = [3, 1];
      playerOneAttack = playerTwo.defensiveBoard.recieveAttack(playerOneCoords);
      playerOne.offensiveBoard.sendAttack(playerOneCoords, playerOneAttack);

      playerOneCoords = [4, 1];
      playerOneAttack = playerTwo.defensiveBoard.recieveAttack(playerOneCoords);
      playerOne.offensiveBoard.sendAttack(playerOneCoords, playerOneAttack);

      playerOneCoords = [5, 1];
      playerOneAttack = playerTwo.defensiveBoard.recieveAttack(playerOneCoords);
      playerOne.offensiveBoard.sendAttack(playerOneCoords, playerOneAttack);

      if (playerOne.defensiveBoard.checkForLoss() === 'loss') {
        result = playerOne.name + ' won the game!';
        // console.log(result);
        return result;
      }

      if (playerTwo.defensiveBoard.checkForLoss() === 'loss') {
        result = playerOne.name + ' won the game!';
        // console.log(result);
        return result;
      }
    })();

    ///////////////////////////////////////////////////////////////////////
    //////////////// PLAY CONTINUES RECURSIVELY ///////////////////////////
    ///////////////////////////////////////////////////////////////////////

    // playRound();

    ///////////////////////////////////////////////////////////////////////
    ////////////////////////////// END ////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    ///////////////// END OF BUSINESS LOGIC MODULES ///////////////////////
    ///////////////////////////////////////////////////////////////////////

    const mainContainer = document.querySelector('.main');

    const header = document.querySelector('.header');
    const gameTitle = document.createElement('div');
    gameTitle.classList.add('header-text');
    gameTitle.append('BATTLESHIP');
    header.appendChild(gameTitle);

    const body = document.querySelector('.body');

    const mainGameplayWindow = document.createElement('div');
    mainGameplayWindow.classList.add('main-gameplay-window');
    body.appendChild(mainGameplayWindow);

    const playerOffenseBoardContainer = document.createElement('div');
    playerOffenseBoardContainer.classList.add('player-offense-board-container');
    mainGameplayWindow.appendChild(playerOffenseBoardContainer);

    const playerOffensiveGridArea = document.createElement('div');
    playerOffensiveGridArea.classList.add('grid-area');
    playerOffenseBoardContainer.appendChild(playerOffensiveGridArea);

    const playerDefenseBoardContainer = document.createElement('div');
    playerDefenseBoardContainer.classList.add('player-defense-board-container');
    mainGameplayWindow.appendChild(playerDefenseBoardContainer);

    const playerDefensiveGridArea = document.createElement('div');
    playerDefensiveGridArea.classList.add('grid-area');
    playerDefenseBoardContainer.appendChild(playerDefensiveGridArea);

    const footer = document.querySelector('.footer');
    const footerText = document.createElement('div');
    footerText.classList.add('footer-text');
    footerText.append('c Hank');
    footer.appendChild(footerText);

    const generateGridSquares = (board, grid) => {
      board.forEach((square) => {
        const newSquare = document.createElement('div');
        newSquare.classList.add('square');
        newSquare.id =
          +square.coordsOfSquare[0].toString() +
          square.coordsOfSquare[1].toString();
        grid.appendChild(newSquare);
      });
    };

    generateGridSquares(
      playerOne.defensiveBoard.squares,
      playerDefensiveGridArea,
    );

    generateGridSquares(
      playerOne.offensiveBoard.squares,
      playerOffensiveGridArea,
    );
  };

  ///////////////////////////////////////////////////////////////////////
  /////////////// END OF DOM MANIPULATION MODULES ///////////////////////
  ///////////////////////////////////////////////////////////////////////

  (function main() {
    playRound();
  })();
})();
