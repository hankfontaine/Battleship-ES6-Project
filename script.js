let firstBoatCoords;
let firstBoatOrientation;
let secondBoatCoords;
let secondBoatOrientation;
let thirdBoatCoords;
let thirdBoatOrientation;
let fourthBoatCoords;
let fourthBoatOrientation;
let fifthBoatCoords;
let fifthBoatOrientation;

let shipCounter = 0;

const setShipName = (input) => {
  if (input === 5) {
    shipCounter++;
    return 'carrier';
  }
  if (input === 4) {
    shipCounter++;
    return 'battleship';
  }
  if (input === 3 && shipCounter === 2) {
    shipCounter++;
    return 'submarine';
  }
  if (input === 3 && shipCounter === 3) {
    shipCounter++;
    return 'cruiser';
  }
  if (input === 2) {
    shipCounter++;
    return 'destroyer';
  }
};

const setShipOrientation = (input) => {
  if (input !== 'vertical') return 'horizontal';
  return 'vertical';
};

const fillUpdateArea = (input) => {
  const gameDescription = document.querySelector('.header-text');
  gameDescription.innerHTML = '';
  gameDescription.append(input);
};

const initializeDom = () => {
  // const main = document.querySelector('.main');
  // main.innerHTML = '';

  const mainContainer = document.querySelector('.container');
  mainContainer.innerHTML = '';

  ///////////////////////////////////////////////////////////////////////
  ///////////////// BEGIN DOM MANIPULATION LOGIC MODULES ///////////////////////
  ///////////////////////////////////////////////////////////////////////

  const header = document.querySelector('.header');
  header.innerHTML = '';
  const gameUpdates = document.createElement('div');
  gameUpdates.classList.add('header-text');
  gameUpdates.append('B A T T L E S H I P');
  header.appendChild(gameUpdates);

  const topGameplayWindow = document.createElement('div');
  topGameplayWindow.classList.add('main-gameplay-window');
  mainContainer.appendChild(topGameplayWindow);

  const bottomGameplayWindow = document.createElement('div');
  bottomGameplayWindow.classList.add('main-gameplay-window');
  mainContainer.appendChild(bottomGameplayWindow);

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
  ///////////////// END DOM MANIPULATION LOGIC MODULES //////////////////
  ///////////////////////////////////////////////////////////////////////

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

              let arrayOfLegalMoves = [];

              playerOne.defensiveBoard.squares.forEach((square) => {
                if (!square.wasAttacked) {
                  arrayOfLegalMoves.push(square);
                }
              });

              const playerTwoResponds = () => {
                const generateComputerMove = (player) => {
                  if (playerOne.defensiveBoard.mostRecentComputerHit) {
                    let returnedValue;

                    arrayOfLegalMoves.forEach((move) => {
                      if (
                        move.coordsOfSquare[0] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[0] -
                            1 &&
                        move.coordsOfSquare[1] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[1] &&
                        playerOne.defensiveBoard.mostRecentComputerHit[0] - 1 >=
                          1
                      ) {
                        returnedValue = [
                          playerOne.defensiveBoard.mostRecentComputerHit[0] - 1,
                          playerOne.defensiveBoard.mostRecentComputerHit[1],
                        ];
                        return returnedValue;
                      } else if (
                        move.coordsOfSquare[0] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[0] &&
                        move.coordsOfSquare[1] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[1] +
                            1 &&
                        playerOne.defensiveBoard.mostRecentComputerHit[1] + 1 <=
                          10
                      ) {
                        returnedValue = [
                          playerOne.defensiveBoard.mostRecentComputerHit[0],
                          playerOne.defensiveBoard.mostRecentComputerHit[1] + 1,
                        ];
                        return returnedValue;
                      } else if (
                        move.coordsOfSquare[0] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[0] +
                            1 &&
                        move.coordsOfSquare[1] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[1] &&
                        playerOne.defensiveBoard.mostRecentComputerHit[1] + 1 <=
                          10
                      ) {
                        returnedValue = [
                          playerOne.defensiveBoard.mostRecentComputerHit[0] + 1,
                          playerOne.defensiveBoard.mostRecentComputerHit[1],
                        ];
                        return returnedValue;
                      } else if (
                        move.coordsOfSquare[0] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[0] &&
                        move.coordsOfSquare[1] ===
                          playerOne.defensiveBoard.mostRecentComputerHit[1] -
                            1 &&
                        playerOne.defensiveBoard.mostRecentComputerHit[1] + 1 >=
                          1
                      ) {
                        returnedValue = [
                          playerOne.defensiveBoard.mostRecentComputerHit[0],
                          playerOne.defensiveBoard.mostRecentComputerHit[1] - 1,
                        ];
                        return returnedValue;
                      }
                    });

                    if (returnedValue) {
                      return returnedValue;
                    }
                  }
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
                          playerOne.defensiveBoard.mostRecentComputerHit = null;

                          fillUpdateArea(
                            playerOne.name +
                              "'s " +
                              soughtDefenseShip.name +
                              ' was sunk!',
                          );
                        }

                        defensePeg.classList.add('hit-peg');
                      } else {
                        // ideally find a way to revert to previous hit, but currently acts buggy w/o this:
                        // playerOne.defensiveBoard.mostRecentComputerHit = null;

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

                      squareToRecieveAttack.wasAttacked = true;

                      playerTwo.defensiveBoard.turnCount++;
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
          const mainContainer = document.querySelector('.container');
          mainContainer.innerHTML = '';

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

    const playerOne = new Player('Hank');
    const playerTwo = new Player('HAL');

    (function setPiecesInPlace() {
      playerOne.defensiveBoard.placeShip(
        firstBoatCoords,
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(firstBoatOrientation),
      );
      playerOne.defensiveBoard.placeShip(
        secondBoatCoords,
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(secondBoatOrientation),
      );
      playerOne.defensiveBoard.placeShip(
        thirdBoatCoords,
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(thirdBoatOrientation),
      );
      playerOne.defensiveBoard.placeShip(
        fourthBoatCoords,
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(fourthBoatOrientation),
      );
      playerOne.defensiveBoard.placeShip(
        fifthBoatCoords,
        playerOne.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(fifthBoatOrientation),
      );

      playerTwo.defensiveBoard.placeShip(
        [1, 1],
        playerTwo.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(firstBoatOrientation),
      );
      playerTwo.defensiveBoard.placeShip(
        [6, 1],
        playerTwo.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(),
      );
      playerTwo.defensiveBoard.placeShip(
        [2, 2],
        playerTwo.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation('X'),
      );
      playerTwo.defensiveBoard.placeShip(
        [5, 5],
        playerTwo.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation(),
      );
      playerTwo.defensiveBoard.placeShip(
        [5, 6],
        playerTwo.defensiveBoard.setShipLengthToDeploy(),
        setShipOrientation('X'),
      );
    })();
  };
  runModulesOfGame();
};

const createBoatSetupModal = () => {
  (function setUpSetupBoard() {
    const header = document.querySelector('.header');

    const setupUpdates = document.createElement('div');
    setupUpdates.classList.add('header-text');
    setupUpdates.append('Place your ships! Get ready!');
    header.appendChild(setupUpdates);

    const mainContainer = document.querySelector('.container');

    const containerForSetup = document.createElement('div');
    containerForSetup.classList.add('container-for-setup');
    mainContainer.appendChild(containerForSetup);

    const dragContainer = document.createElement('div');
    dragContainer.classList.add('drag-container');
    containerForSetup.appendChild(dragContainer);

    const dropContainer = document.createElement('div');
    dropContainer.classList.add('player-defense-board-container');
    containerForSetup.appendChild(dropContainer);

    const placementGridArea = document.createElement('div');
    placementGridArea.classList.add('grid-area');
    dropContainer.classList.add('main-gameplay-window');
    placementGridArea.id = 'defense-area';
    dropContainer.appendChild(placementGridArea);

    for (let x = 10; x >= 1; x--) {
      for (let y = 10; y >= 1; y--) {
        const setupSquare = document.createElement('div');
        setupSquare.classList.add('square');
        setupSquare.classList.add('empty');
        setupSquare.id = x + '-' + y;
        placementGridArea.appendChild(setupSquare);
      }
    }
  })();

  let dummyShipCounter = 1;

  const setDummyShipLength = () => {
    if (dummyShipCounter === 1) {
      return 5;
    }
    if (dummyShipCounter === 2) {
      return 4;
    }
    if (dummyShipCounter === 3) {
      return 3;
    }
    if (dummyShipCounter === 4) {
      return 3;
    }
    if (dummyShipCounter === 5) {
      return 2;
    }
  };

  function createDummyShipToDrag(input) {
    const area = document.querySelector('.drag-container');
    area.innerHTML = '';

    const dummyShip = document.createElement('div');
    dummyShip.classList.add('dummy-ship');
    dummyShip.classList.add('dummy-ship-vertical');
    dummyShip.id = 'dummy-ship-' + setShipName(setDummyShipLength());
    area.appendChild(dummyShip);
    dummyShip.setAttribute('draggable', 'true');
    dummyShip.classList.add('fill');

    for (let i = 1; i <= input; i++) {
      const squareOfShip = document.createElement('div');
      squareOfShip.classList.add('occupied-square-setup');

      const pegOfSquare = document.createElement('div');
      pegOfSquare.classList.add('empty-peg-setup');
      squareOfShip.appendChild(pegOfSquare);

      if (i === input) {
        squareOfShip.classList.add('setter-square');
      }
      dummyShip.appendChild(squareOfShip);
    }

    dummyShip.addEventListener('click', () => {
      if (dummyShip.classList.contains('dummy-ship-vertical')) {
        dummyShip.classList.add('dummy-ship-horizontal');
        dummyShip.classList.remove('dummy-ship-vertical');
      } else {
        dummyShip.classList.remove('dummy-ship-horizontal');
        dummyShip.classList.add('dummy-ship-vertical');
      }
    });
  }

  (function getShipPlacementFromUser() {
    createDummyShipToDrag(setDummyShipLength());
    let dummyBoatCoords;
    let dummyBoatOrientation;

    const dummyCarrier = document.querySelector('#dummy-ship-carrier');
    const dummyBattleship = document.querySelector('#dummy-ship-battleship');
    const dummySubmarine = document.querySelector('#dummy-ship-submarine');
    const dummyCruiser = document.querySelector('#dummy-ship-cruiser');
    const dummyDestroyer = document.querySelector('#dummy-ship-destroyer');

    const fill = document.querySelector('.fill');
    const setter = document.querySelector('.setter-square');
    const empties = document.querySelectorAll('.empty');

    fill.addEventListener('dragstart', dragStart);
    fill.addEventListener('dragend', dragEnd);

    for (const empty of empties) {
      empty.addEventListener('dragover', dragOver);
      empty.addEventListener('dragenter', dragEnter);
      empty.addEventListener('dragleave', dragLeave);
      empty.addEventListener('drop', dragDrop);
    }

    function dragStart() {
      this.classList.add('hold');
      setTimeout(() => {
        this.classList.add('invisible');
      }, 0);
    }

    function dragEnd() {
      this.classList.remove('hold');
      this.classList.remove('invisible');
    }

    function dragOver(e) {
      e.preventDefault();
    }
    function dragEnter(e) {
      e.preventDefault();
      this.classList.add('hover');
    }
    function dragLeave() {
      this.classList.remove('hover');
    }

    function dragDrop() {
      this.classList.remove('hover');

      // console.log(this.id);
      // needs to account for placement of fill - cannot be outside borders
      // this.append(fill);

      const horizontalShip = document.querySelector('.dummy-ship-horizontal');
      if (horizontalShip) dummyBoatOrientation = 'horizontal';
      else dummyBoatOrientation = 'vertical';

      dummyBoatCoords = [
        Number(this.id.split('-')[0]),
        Number(this.id.split('-')[1]),
      ];

      console.log(dummyCarrier);

      if (!dummyCarrier) {
        // console.log(dummyBoatCoords);

        firstBoatCoords = dummyBoatCoords;
        firstBoatOrientation = dummyBoatOrientation;

        dummyShipCounter++;
        // console.log(firstBoatCoords, firstBoatOrientation);
      } else if (!dummyBattleship) {
        secondBoatCoords = dummyBoatCoords;
        secondBoatOrientation = dummyBoatOrientation;

        dummyShipCounter++;
        // console.log(secondBoatCoords, secondBoatOrientation);
      } else if (!dummySubmarine) {
        thirdBoatCoords = dummyBoatCoords;
        thirdBoatOrientation = dummyBoatOrientation;

        dummyShipCounter++;
        // console.log(thirdBoatCoords, thirdBoatOrientation);
      } else if (!dummyCruiser) {
        fourthBoatCoords = dummyBoatCoords;
        fourthBoatOrientation = dummyBoatOrientation;

        dummyShipCounter++;
        // console.log(fourthBoatCoords, fourthBoatOrientation);
      } else if (!dummyDestroyer) {
        fifthBoatCoords = dummyBoatCoords;
        fifthBoatOrientation = dummyBoatOrientation;

        dummyShipCounter++;
        // console.log(fifthBoatCoords, fifthBoatOrientation);
      }

      // dummyShipCounter++;

      // console.log(dummyShipCounter);

      // function removeAttributesFromDummyShip(ship) {
      //   ship.classList.remove('dummy-ship');
      //   ship.classList.remove('dummy-ship-vertical');
      //   ship.classList.remove('dummy-ship-horizontal');
      //   ship.classList.remove('fill');
      //   ship.setAttribute('draggable', 'false');
      // }
      // removeAttributesFromDummyShip(fill);

      // this.classList.remove('empty');

      console.log(firstBoatCoords);

      if (dummyShipCounter > 5) return initializeDom();

      createDummyShipToDrag(setDummyShipLength());
    }

    // coords need to be adjusted to END not start of ship

    // // needs to remove classes from object
    // // needs way to "reset which boat is being placed"

    // store returned values
    // display returned values on dummy board by looking up
    // corresponding squares
  })();
};

createBoatSetupModal();
