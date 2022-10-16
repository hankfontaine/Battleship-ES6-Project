const initializeDom = () => {
  const body = document.querySelector('.body');
  body.innerHTML = '';

  ///////////////////////////////////////////////////////////////////////
  ///////////////// BEGIN DOM MANIPULATION LOGIC MODULES ///////////////////////
  ///////////////////////////////////////////////////////////////////////

  const header = document.querySelector('.header');
  const gameUpdates = document.createElement('div');
  gameUpdates.classList.add('header-text');
  gameUpdates.append('B A T T L E S H I P');
  header.appendChild(gameUpdates);

  const topGameplayWindow = document.createElement('div');
  topGameplayWindow.classList.add('main-gameplay-window');
  body.appendChild(topGameplayWindow);

  const bottomGameplayWindow = document.createElement('div');
  bottomGameplayWindow.classList.add('main-gameplay-window');
  body.appendChild(bottomGameplayWindow);

  const playerOffenseBoardContainer = document.createElement('div');
  playerOffenseBoardContainer.classList.add('player-offense-board-container');
  topGameplayWindow.appendChild(playerOffenseBoardContainer);

  const playerOffensiveGridArea = document.createElement('div');
  playerOffensiveGridArea.classList.add('grid-area');
  playerOffensiveGridArea.id = 'offense-area';
  playerOffenseBoardContainer.appendChild(playerOffensiveGridArea);

  const playerDefenseBoardContainer = document.createElement('div');
  playerDefenseBoardContainer.classList.add('player-defense-board-container');
  bottomGameplayWindow.appendChild(playerDefenseBoardContainer);

  const playerDefensiveGridArea = document.createElement('div');
  playerDefensiveGridArea.classList.add('grid-area');
  playerDefensiveGridArea.id = 'defense-area';
  playerDefenseBoardContainer.appendChild(playerDefensiveGridArea);

  const footer = document.querySelector('.footer');
  const footerText = document.createElement('div');
  footerText.classList.add('footer-text');
  // footerText.append('c Hank');
  footer.appendChild(footerText);

  ///////////////////////////////////////////////////////////////////////
  ///////////////// END DOM MANIPULATION LOGIC MODULES ///////////////////////
  ///////////////////////////////////////////////////////////////////////
};

initializeDom();

const fillUpdateArea = (input) => {
  const gameDescription = document.querySelector('.header-text');
  gameDescription.innerHTML = '';
  gameDescription.append(input);
};

const runModulesOfGame = () => {
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
    };

    isSunk = () => {
      if (this.coordsWhereHit.length === this.coordsOccupied.length) {
        this.sunk = true;
        return this.name;
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
      this.gridArray = [];
      this.gridSquares = this.makeGridSquares();
      this.turnCount = 0;
      this.mostRecentComputerHit = null;
    }

    makeSquares = () => {
      const squaresArray = [];
      for (let x = 10; x >= 1; x--) {
        for (let y = 10; y >= 1; y--) {
          squaresArray.push(new Square([x, y]));
        }
      }
      return squaresArray;
    };

    makeGridSquares = () => {
      if (this.boardType === 'offensive') return;

      let assignedArea;

      if (this.player === 'HAL')
        assignedArea = document.querySelector('#offense-area');
      else assignedArea = document.querySelector('#defense-area');

      this.squares.forEach((square) => {
        let newSquare = document.createElement('div');
        newSquare.classList.add('square');
        newSquare.id =
          square.coordsOfSquare[0] +
          '-' +
          square.coordsOfSquare[1] +
          '-' +
          this.player +
          '-' +
          this.boardType;

        this.gridArray.push(newSquare);
        assignedArea.appendChild(newSquare);

        if (this.player === 'HAL') {
          ///////////////////////////////////////////////////////////////////////
          ////////////////////// PLAYER ONE ATTACKS /////////////////////////////
          ///////////////////////////////////////////////////////////////////////
          newSquare.addEventListener('click', function () {
            if (
              playerTwo.defensiveBoard.turnCount !==
                playerOne.defensiveBoard.turnCount &&
              playerOne.defensiveBoard.turnCount > 0
            )
              return;
            if (square.wasAttacked) return;

            let peg = document.createElement('div');

            if (square.isOccupiedBy) {
              const soughtShip = playerTwo.defensiveBoard.deployedShips.find(
                (ship) => ship.name === square.isOccupiedBy,
              );
              soughtShip.hit(square.coordsOfSquare);

              if (soughtShip.isSunk())
                fillUpdateArea(
                  playerTwo.name + "'s " + soughtShip.name + ' was sunk!',
                );
              else
                fillUpdateArea(
                  playerTwo.name + "'s " + soughtShip.name + ' was hit!',
                );

              peg.classList.add('hit-peg');
            } else {
              fillUpdateArea('That was a miss by ' + playerOne.name + '!');
              peg.classList.add('unhit-peg');
            }
            newSquare.appendChild(peg);
            square.wasAttacked = true;
            playerOne.defensiveBoard.turnCount++;

            if (playerTwo.defensiveBoard.checkForLoss()) return;

            ///////////////////////////////////////////////////////////////////////
            ////////////////// PLAYER TWO COUNTERATTACKS //////////////////////////
            ///////////////////////////////////////////////////////////////////////

            const playerTwoResponds = () => {
              const generateComputerMove = (player) => {
                let arrayOfLegalMoves = [];

                player.offensiveBoard.squares.forEach((square) => {
                  if (!square.wasAttacked) {
                    arrayOfLegalMoves.push(square);
                  }
                });

                if (playerOne.defensiveBoard.mostRecentComputerHit) {
                  let returnedValue;

                  // returnedValue = [
                  //   playerOne.defensiveBoard.mostRecentComputerHit[0],
                  //   playerOne.defensiveBoard.mostRecentComputerHit[1] + 1,
                  // ];
                  arrayOfLegalMoves.forEach((move) => {
                    if (
                      move.coordsOfSquare[0] ==
                        playerOne.defensiveBoard.mostRecentComputerHit[0] &&
                      move.coordsOfSquare[1] ==
                        playerOne.defensiveBoard.mostRecentComputerHit[1] + 1
                    )
                      returnedValue = [
                        playerOne.defensiveBoard.mostRecentComputerHit[0],
                        playerOne.defensiveBoard.mostRecentComputerHit[1] + 1,
                      ];
                    // else if (
                    //   move.coordsOfSquare[0] ==
                    //     playerOne.defensiveBoard.mostRecentComputerHit[0] + 1 &&
                    //   move.coordsOfSquare[1] ==
                    //     playerOne.defensiveBoard.mostRecentComputerHit[1]
                    // )
                    //   returnedValue = [
                    //     playerOne.defensiveBoard.mostRecentComputerHit[0] + 1,
                    //     playerOne.defensiveBoard.mostRecentComputerHit[1],
                    //   ];
                  });
                  //
                  //
                  //
                  if (returnedValue) {
                    console.log('test3');
                    playerOne.defensiveBoard.mostRecentComputerHit = null;
                    return returnedValue;
                  } else {
                    //
                    console.log('test2');
                    playerOne.defensiveBoard.mostRecentComputerHit = null;
                    return arrayOfLegalMoves[
                      Math.floor(Math.random() * arrayOfLegalMoves.length)
                    ].coordsOfSquare;
                  }
                }
                // only happens on moves until first hit
                else console.log('test1');
                return arrayOfLegalMoves[
                  Math.floor(Math.random() * arrayOfLegalMoves.length)
                ].coordsOfSquare;
              };

              let playerTwoCoords = generateComputerMove(playerTwo);

              let squareToRecieveAttack;

              playerOne.defensiveBoard.squares.forEach((soughtSq) => {
                if (soughtSq.coordsOfSquare[0] === playerTwoCoords[0]) {
                  if (soughtSq.coordsOfSquare[1] === playerTwoCoords[1]) {
                    squareToRecieveAttack = soughtSq;

                    let defensePeg = document.createElement('div');

                    if (squareToRecieveAttack.isOccupiedBy) {
                      playerOne.defensiveBoard.mostRecentComputerHit =
                        squareToRecieveAttack.coordsOfSquare;

                      let soughtDefenseShip =
                        playerOne.defensiveBoard.deployedShips.find(
                          (ship) =>
                            ship.name === squareToRecieveAttack.isOccupiedBy,
                        );

                      soughtDefenseShip.hit(
                        squareToRecieveAttack.coordsOfSquare,
                      );

                      fillUpdateArea(
                        playerOne.name +
                          "'s " +
                          soughtDefenseShip.name +
                          ' was hit!',
                      );

                      if (soughtDefenseShip.isSunk()) {
                        fillUpdateArea(
                          playerOne.name +
                            "'s " +
                            soughtDefenseShip.name +
                            ' was sunk!',
                        );
                      }

                      defensePeg.classList.add('hit-peg');
                    } else {
                      fillUpdateArea(
                        'That was a miss by ' + playerTwo.name + '!',
                      );

                      defensePeg.classList.add('unhit-peg');
                    }

                    const soughtSpaceToPeg = document.getElementById(
                      soughtSq.coordsOfSquare[0] +
                        '-' +
                        soughtSq.coordsOfSquare[1] +
                        '-' +
                        playerOne.name +
                        '-' +
                        'defensive',
                    );

                    soughtSpaceToPeg.innerHTML = '';

                    soughtSpaceToPeg.appendChild(defensePeg);

                    playerTwo.defensiveBoard.turnCount++;

                    squareToRecieveAttack.wasAttacked = true;

                    if (playerOne.defensiveBoard.checkForLoss()) return;
                  }
                }
              });
            };
            setTimeout(() => {
              playerTwoResponds();
            }, 500);
          });
        }
      });
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
        (startingCoord[0] + length > 11 && orientation === 'horizontal') ||
        (startingCoord[1] + length > 11 && orientation === 'vertical')
      )
        return;

      let coordsArray = [];

      if (orientation === 'vertical') {
        for (let i = 0; i < length; i++) {
          coordsArray.push([startingCoord[0], startingCoord[1] + i]);
        }
      } else
        for (let i = 0; i < length; i++) {
          coordsArray.push([startingCoord[0] + i, startingCoord[1]]);
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
      this.showShipOnscreen(ship);
      return ship;
    };

    showShipOnscreen = (ship) => {
      if (this.player === 'HAL' || this.boardType === 'Offensive') return;

      let possibleGridSquares = [];

      this.gridArray.forEach((gridSquare) => {
        const splitString = gridSquare.id.split('-');
        possibleGridSquares.push(splitString[0]);
      });

      ship.coordsOccupied.forEach((coord) => {
        const soughtSpace = this.gridArray.find(
          (element) =>
            element.id.split('-')[0] == coord[0] &&
            element.id.split('-')[1] == coord[1],
        );
        soughtSpace.classList.add('occupied-square');
        const pegSlot = document.createElement('div');
        pegSlot.classList = 'empty-peg';
        soughtSpace.appendChild(pegSlot);
      });
    };

    checkForLoss = () => {
      let winner;
      if (
        !playerTwo.defensiveBoard.deployedShips.find(
          (ship) => ship.sunk === false,
        )
      ) {
        winner = playerOne;
        fillUpdateArea(playerOne.name + ' won the game!');
      } else if (
        !playerOne.defensiveBoard.deployedShips.find(
          (ship) => ship.sunk === false,
        )
      ) {
        winner = playerTwo;
        fillUpdateArea(playerTwo.name + ' won the game!');
      }
      if (winner) {
        const body = document.querySelector('.body');
        body.innerHTML = '';

        const header = document.querySelector('.header');

        const playAgainButton = document.createElement('button');
        playAgainButton.classList.add('play-again');
        playAgainButton.append('PLAY AGAIN');
        header.appendChild(playAgainButton);

        playAgainButton.onclick = () => {
          window.location.reload();
        };
      }
      return winner;
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

  const playerOne = new Player('Hank');
  const playerTwo = new Player('HAL');

  (function setPiecesInPlace() {
    playerOne.defensiveBoard.placeShip(
      [1, 1],
      playerOne.defensiveBoard.setShipLengthToDeploy(),
      setShipOrientation(),
    );
    playerOne.defensiveBoard.placeShip(
      [7, 1],
      playerOne.defensiveBoard.setShipLengthToDeploy(),
      setShipOrientation(),
    );
    playerOne.defensiveBoard.placeShip(
      [2, 3],
      playerOne.defensiveBoard.setShipLengthToDeploy(),
      setShipOrientation('X'),
    );
    playerOne.defensiveBoard.placeShip(
      [5, 5],
      playerOne.defensiveBoard.setShipLengthToDeploy(),
      setShipOrientation(),
    );
    playerOne.defensiveBoard.placeShip(
      [5, 7],
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
};
runModulesOfGame();
