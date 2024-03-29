// TODO: add table for move list

var gameBoard = new Board(); // board
var comp; // AI
var alg = "minimax"; // AI algorithm
var fromSq = null; // square to move from
var toSq = null; // square to move to
var inSelection = false;
var attrID = null;
var turn_white = true; // used in checkMove() for populating the table
var white_start = true;
var user_turn = true;

var sq1 = null;
var sq2 = null;

var tr = null;
var move_no = null;
var td_white = null;
var td_black = null;

var last_state = null;
var highlighted_moves = [];

var ai_on = false;
var searching = false;

// set up board, AI
$(document).ready(function () {
  gameBoard = new Board();
  updateBoard();
  comp = new AI(gameBoard);
  //   document.getElementById("side").checked = true;
});

// set up comp slider
document.addEventListener("DOMContentLoaded", function () {
  var comp_slider = document.querySelector('label > input[type="checkbox"]');

  comp_slider.addEventListener("change", function () {
    if (comp_slider.checked) {
      ai_on = true;
    } else {
      ai_on = false;
    }
  });
});

async function searchComp(comp, alg) {
  if (!gameBoard.gameOver) {
    var level = $("#levelSelect").val();
    comp.setMoves(level);

    let c_move = await comp.search();

    if (c_move == -1) {
      playSound("end");
      alert("Game is a draw [stalemate]");
    } else if (c_move == 0) {
      return;
    } else {
      try {
        var from_sq = gameBoard.printSq(c_move[0]);
        var to_sq = gameBoard.printSq(c_move[1]);
        gameBoard.move_list.push(from_sq + to_sq);

        makeMove(from_sq, to_sq);
        updateBoard();

        var stalemate = false;

        if (gameBoard.gameOver) {
          gameBoard.side = COLORS.WHITE;
          var valid_moves = gameBoard.generateMoveList();
          if (valid_moves.length == 0) {
            gameBoard.side = COLORS.BLACK;
            valid_moves = gameBoard.generateMoveList();
            if (valid_moves.length == 0) {
              stalemate = true;
            }
          }
        }

        if (stalemate) {
          console.log("game is a draw [stalemate]");
          playSound("end");
          setTimeout(function () {
            alert("game is a draw [stalemate]");
          }, 1500);

          var dom = document.getElementById("fenTitle");
          dom.style.backgroundImage =
            "-webkit-linear-gradient(top right, #af4038, #ffbcb7)";

          gameBoard.side = -1;
        }

        $("#lightbulb").attr("src", "img/lightbulb.png");
        $("#lightbulb").css("border", "2px solid black");

        playSound("move");
        // set last game state move to in-game move
        gameBoard.game[gameBoard.game.length - 1].move =
          gameBoard.move_list[gameBoard.move_list.length - 1];

        var table = document.querySelector("table");

        if (turn_white) {
          tr = document.createElement("tr");
          move_no = document.createElement("td");
          td_white = document.createElement("td");
          td_black = document.createElement("td");

          move_no.style.textAlign = "center";
          td_white.style.textAlign = "center";
          td_black.style.textAlign = "center";

          var move_white = document.createTextNode(
            gameBoard.move_list[gameBoard.move_list.length - 1]
          );
          var move_number = document.createTextNode(
            parseInt(gameBoard.move_list.length / 2) + 1
          );

          // is game over?
          if (gameBoard.gameOver) {
            move_white = document.createTextNode(
              gameBoard.move_list[gameBoard.move_list.length - 1] + "#"
            );
          } else {
            if (gameBoard.inCheck()) {
              move_white = document.createTextNode(
                gameBoard.move_list[gameBoard.move_list.length - 1] + "+"
              );
            }
          }

          move_no.appendChild(move_number);
          td_white.appendChild(move_white);

          tr.appendChild(move_no);
          tr.appendChild(td_white);
          tr.appendChild(td_black);

          table.appendChild(tr);
        } else {
          var move_black = document.createTextNode(
            gameBoard.move_list[gameBoard.move_list.length - 1]
          );

          // is game over?
          if (gameBoard.gameOver) {
            move_black = document.createTextNode(
              gameBoard.move_list[gameBoard.move_list.length - 1] + "#"
            );
          } else {
            if (gameBoard.inCheck()) {
              move_black = document.createTextNode(
                gameBoard.move_list[gameBoard.move_list.length - 1] + "+"
              );
            }
          }

          td_black.appendChild(move_black);
        }
      } catch (err) {
        console.log(c_move);
        gameBoard.side = -1;
        playSound("end");
        alert("An error occured :(");
      }
    }
    turn_white = !turn_white;
  }
}

// handle move highlighting
$(function () {
  $(".white_square").click(function (event) {
    if (gameBoard.side > -1) {
      $(this).css("border", "2px solid #FF0000");

      // no square selected yet
      if (sq1 == null) {
        sq1 = this;
      }
      // square already selected
      else if (sq2 == null) {
        sq2 = this;
        resetColors(sq1, sq2);
        sq1 = null;
        sq2 = null;
      }

      var img = $(this).find("img");

      // get name of square
      attrID = img.first().attr("id");

      checkMove();
      setTimeout(function () {
        if (searching == true) {
          searching = false;
          $("#lightbulb").attr("src", "img/lightbulb_on.png");
          $("#lightbulb").css("border", "2px solid #ffff00");
          setTimeout(function () {
            searchComp(comp, alg);
          }, 10);
        }
      }, 1000);
    }
  });

  $(".black_square").click(function () {
    if (gameBoard.side > -1) {
      $(this).css("border", "2px solid #FF0000");

      // no square selected yet
      if (sq1 == null) {
        sq1 = this;
      }
      // square already selected
      else if (sq2 == null) {
        sq2 = this;
        resetColors(sq1, sq2);
        sq1 = null;
        sq2 = null;
      }

      var img = $(this).find("img");

      // get name of square
      attrID = img.first().attr("id");

      checkMove();
      setTimeout(function () {
        if (searching == true) {
          searching = false;
          $("#lightbulb").attr("src", "img/lightbulb_on.png");
          $("#lightbulb").css("border", "2px solid #ffff00");
          setTimeout(function () {
            searchComp(comp, alg);
          }, 10);
        }
      }, 1000);
    }
  });

  $(".resetGame").click(function () {
    resetGame();

    turn_white = true;

    var dom = document.getElementById("fenTitle");
    dom.style.backgroundImage =
      "-webkit-linear-gradient(top right, #1a8203, #8ef20c)";

    var inner_html =
      "<th><strong>Move</strong></th><th><strong>White</strong></th><th><strong>Black</strong></th>";
    var header = document.getElementById("moveListTable").rows[0];
    header.innerHTML = inner_html;

    if (ai_on) {
      comp.setBoard(gameBoard.fen);
      searchComp(comp, alg);
    }
  });

  // TODO: fails when checks are played (side white) -- fix side black to start
  $(".takeBackLastMove").click(function () {
    if (!gameBoard.gameOver) {
      var tr_text =
        document.getElementById("moveListTable").lastChild.innerHTML;
      // not header
      if (!tr_text.includes("<th>")) {
        if (tr_text.includes('<td style="text-align: center;"></td>')) {
          /* side white */
          // remove last child
          document
            .getElementById("moveListTable")
            .removeChild(document.getElementById("moveListTable").lastChild);
        } else {
          /* side black */
          // don't delete, is referenced by td_black in checkMove()
          document.getElementById(
            "moveListTable"
          ).lastChild.lastChild.innerHTML = null;
        }

        // remove last FEN and move
        gameBoard.move_list.pop();
        gameBoard.boardStates.pop();

        // set state of board to last FEN
        gameBoard.fen = gameBoard.boardStates[gameBoard.boardStates.length - 1];
        parseFen(gameBoard.fen);

        // update GUI
        updateBoard();

        // updateBoard() pushes the current FEN -- has to be removed, otherwise there will be two consecutive identical fens
        gameBoard.boardStates.pop();
        gameBoard.fen = gameBoard.boardStates[gameBoard.boardStates.length - 1];

        updateFenGUI();
      }

      // invert turn
      gameBoard.side ^= 1;
      turn_white = !turn_white;
    }
  });

  $("#submitFen").click(function () {
    getUserFen();
  });

  $(".saveGameData").click(function () {
    // Create element with <a> tag
    const link = document.createElement("a");
    const content = gameBoard.move_list.join(" ");

    // Create a blog object with the file content which you want to add to the file
    const file = new Blob([content], { type: "text/plain" });

    // Add file content in the object URL
    link.href = URL.createObjectURL(file);

    // Add file name
    link.download = "moves.txt";

    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);

    console.log(gameBoard.move_list.join(" "));
  });

  $("#fenTitle").hover(function () {
    if (!gameBoard.gameOver) {
      $("#gameState").text("Game in progress!");
    } else {
      // adjust size of box a bit
      $("#gameState").text("Game has ended.");
      $("#gameState").css("right", "-50px");
      var dom = document.getElementById("gameState");
      // TODO: for now, user always plays as white -- add ability to play either side (as in flip board)
      var bg_image = turn_white
        ? "-webkit-linear-gradient(bottom left, #91250a, #6d4e23, #eda036, #ccc)"
        : "-webkit-linear-gradient(bottom left, #1b6b11, #6ddb3b, #eee)";
      dom.style.backgroundImage = bg_image;
    }
  });
});

function resetColors(sq1, sq2) {
  if ($(sq1).hasClass("white_square")) {
    $(sq1).css("border", "0px solid #FF0000");
  } else {
    $(sq1).css("border", "0px solid #FF0000");
  }

  if ($(sq2).hasClass("white_square")) {
    $(sq2).css("border", "0px solid #FF0000");
  } else {
    $(sq2).css("border", "0px solid #FF0000");
  }
}

function resetGame() {
  // set comp slider to off state
  $('label > input[type="checkbox"]').prop("checked", false);
  ai_on = false;

  gameBoard = new Board();
  comp = new AI(gameBoard);

  var table = document.querySelector("table");
  var table_len = table.rows.length;

  for (var i = 0; i < table_len - 1; i++) {
    table.removeChild(table.childNodes[table.childNodes.length - 1]);
  }

  updateBoard();
  gameBoard.createFen();
  updateFenGUI();
  gameBoard.side = COLORS.WHITE;
}

/**
 * Handles when a square should be highlighted and when a move is played.
 */
function checkMove() {
  if (inSelection) {
    toSq = attrID;
    inSelection = false;

    for (sq in highlighted_moves) {
      highlighted_moves[sq].style.border = "0px solid #000000";
    }

    highlighted_moves = [];

    var move_made = makeMove(fromSq, toSq);

    if (move_made) {
      playSound("move");

      // update game state
      gameBoard.move_list.push(fromSq + toSq);

      // set last game state move to in-game move
      gameBoard.game[gameBoard.game.length - 1].move =
        gameBoard.move_list[gameBoard.move_list.length - 1];

      var table = document.querySelector("table");
      var table_len = table.rows.length - 1;

      if (turn_white) {
        tr = document.createElement("tr");
        move_no = document.createElement("td");
        td_white = document.createElement("td");
        td_black = document.createElement("td");

        move_no.style.textAlign = "center";
        td_white.style.textAlign = "center";
        td_black.style.textAlign = "center";

        var move_white = document.createTextNode(
          gameBoard.move_list[gameBoard.move_list.length - 1]
        );
        var move_number = document.createTextNode(
          parseInt(gameBoard.move_list.length / 2) + 1
        );

        // is game over?
        if (gameBoard.gameOver) {
          move_white = document.createTextNode(
            gameBoard.move_list[gameBoard.move_list.length - 1] + "#"
          );
        } else {
          if (gameBoard.inCheck()) {
            move_white = document.createTextNode(
              gameBoard.move_list[gameBoard.move_list.length - 1] + "+"
            );
          }
        }

        move_no.appendChild(move_number);
        td_white.appendChild(move_white);

        tr.appendChild(move_no);
        tr.appendChild(td_white);
        tr.appendChild(td_black);

        table.appendChild(tr);
      } else {
        var move_black = document.createTextNode(
          gameBoard.move_list[gameBoard.move_list.length - 1]
        );

        // is game over?
        if (gameBoard.gameOver) {
          move_black = document.createTextNode(
            gameBoard.move_list[gameBoard.move_list.length - 1] + "#"
          );
        } else {
          if (gameBoard.inCheck()) {
            move_black = document.createTextNode(
              gameBoard.move_list[gameBoard.move_list.length - 1] + "+"
            );
          }
        }

        td_black.appendChild(move_black);
      }

      if (!gameBoard.gameOver) {
        gameBoard.checkState();
      }

      if (ai_on) {
        searching = true;
      }
      turn_white = !turn_white;
    }
  } else {
    fromSq = attrID;
    inSelection = true;
    var possible_moves = gameBoard.createMoves(
      SQUARES[fromSq.toUpperCase()],
      gameBoard.area[SQUARES[fromSq.toUpperCase()]].piece
    );
    for (var move in possible_moves) {
      try {
        var sq = document.getElementById(
          gameBoard.printSq(possible_moves[move][1])
        ).parentElement;
        var pce = gameBoard.area[possible_moves[move][1]].piece;

        if (pce != PIECES.EMPTY) {
          sq.style.border = "3px solid #3d8e2a";
        } else {
          sq.style.border = "3px solid #2a5f8e";
        }

        highlighted_moves.push(sq);
      } catch (err) {
        continue;
      }

      //            $("#" + gameBoard.printSq(possible_moves[move][1])).css('border', '2px solid #0000ff');
    }
  }
}

function getUserFen() {
  var user_fen = document.getElementById("userInputFen").value;
  // parse fen
  if (user_fen.length < 40) {
    parseFen(user_fen);
  } else {
    $("#userInputFen").css("border", "2px solid #c00");
    throw "FEN rejected due to length.";
  }

  updateBoard();
  gameBoard.createFen();
  updateFenGUI();

  $("#userInputFen").css("border", "2px solid #000");

  gameBoard.side = document.getElementById("side").checked;
  // gameBoard.whiteCastle = document.getElementById("WhiteCastle").checked;
  // gameBoard.blackCastle = document.getElementById("BlackCastle").checked;
  gameBoard.checkState();

  // quick check for check
  if (gameBoard.inCheck()) {
    var king_sq = "#" + gameBoard.printSq(gameBoard.findKingSq(gameBoard.side));
    king_pic =
      gameBoard.side == COLORS.WHITE ? "img/wK_check.png" : "img/bK_check.png";
    $(king_sq).attr("src", king_pic);
  }

  if (gameBoard.gameOver) {
    gameBoard.side = -1;
  } else {
    gameBoard.side ^= 1;
    gameBoard.checkState();

    if (gameBoard.gameOver) {
      gameBoard.side = -1;
    } else {
      gameBoard.side ^= 1;
    }
  }

  // clear move list
  gameBoard.move_list = [];
  console.log(gameBoard.move_list);
  // clear move list GUI
  $("#moveListTable > tr > td").remove();

  // is it black's turn to start? if so switch the order of the headers
  if (gameBoard.side == COLORS.BLACK) {
    var inner_html =
      "<th><strong>Move</strong></th><th><strong>Black</strong></th><th><strong>White</strong></th>";
    var header = document.getElementById("moveListTable").rows[0];
    header.innerHTML = inner_html;
    white_start = false;
  } else {
    var inner_html =
      "<th><strong>Move</strong></th><th><strong>White</strong></th><th><strong>Black</strong></th>";
    var header = document.getElementById("moveListTable").rows[0];
    header.innerHTML = inner_html;
  }
}

function parseFen(fen) {
  var i = SQUARES.A6;
  var valid_input = true;

  for (var letter = 0; letter < fen.length; letter++) {
    var current_letter = fen[letter];

    switch (current_letter) {
      case "P":
        gameBoard.area[i].piece = PIECES.PAWN;
        gameBoard.area[i].color = COLORS.WHITE;
        break;
      case "R":
        gameBoard.area[i].piece = PIECES.ROOK;
        gameBoard.area[i].color = COLORS.WHITE;
        break;
      case "N":
        gameBoard.area[i].piece = PIECES.KNIGHT;
        gameBoard.area[i].color = COLORS.WHITE;
        break;
      case "B":
        gameBoard.area[i].piece = PIECES.BISHOP;
        gameBoard.area[i].color = COLORS.WHITE;
        break;
      case "K":
        gameBoard.area[i].piece = PIECES.KING;
        gameBoard.area[i].color = COLORS.WHITE;
        break;
      case "Q":
        gameBoard.area[i].piece = PIECES.QUEEN;
        gameBoard.area[i].color = COLORS.WHITE;
        break;
      case "p":
        gameBoard.area[i].piece = PIECES.PAWN;
        gameBoard.area[i].color = COLORS.BLACK;
        break;
      case "r":
        gameBoard.area[i].piece = PIECES.ROOK;
        gameBoard.area[i].color = COLORS.BLACK;
        break;
      case "n":
        gameBoard.area[i].piece = PIECES.KNIGHT;
        gameBoard.area[i].color = COLORS.BLACK;
        break;
      case "b":
        gameBoard.area[i].piece = PIECES.BISHOP;
        gameBoard.area[i].color = COLORS.BLACK;
        break;
      case "k":
        gameBoard.area[i].piece = PIECES.KING;
        gameBoard.area[i].color = COLORS.BLACK;
        break;
      case "q":
        gameBoard.area[i].piece = PIECES.QUEEN;
        gameBoard.area[i].color = COLORS.BLACK;
        break;
      case "1":
        gameBoard.area[i].piece = PIECES.EMPTY;
        gameBoard.area[i].color = COLORS.NONE;
        break;
      case "2":
        for (var j = 0; j < 2; j++) {
          if (!gameBoard.area[i + j].offboard) {
            gameBoard.area[i + j].piece = PIECES.EMPTY;
            gameBoard.area[i + j].color = COLORS.NONE;
          } else {
            $("#userInputFen").css("border", "2px solid #c00");
            throw "Something went wrong parsing the FEN.";
          }
        }
        i += 1;
        break;
      case "3":
        for (var j = 0; j < 3; j++) {
          if (!gameBoard.area[i + j].offboard) {
            gameBoard.area[i + j].piece = PIECES.EMPTY;
            gameBoard.area[i + j].color = COLORS.NONE;
          } else {
            $("#userInputFen").css("border", "2px solid #c00");
            throw "Something went wrong parsing the FEN.";
          }
        }
        i += 2;
        break;
      case "4":
        for (var j = 0; j < 4; j++) {
          if (!gameBoard.area[i + j].offboard) {
            gameBoard.area[i + j].piece = PIECES.EMPTY;
            gameBoard.area[i + j].color = COLORS.NONE;
          } else {
            $("#userInputFen").css("border", "2px solid #c00");
            throw "Something went wrong parsing the FEN.";
          }
        }
        i += 3;
        break;
      case "/":
        i += 1;
        break;
      default:
        $("#userInputFen").css("border", "2px solid #c00");
        throw "Input not recognized.";
        valid_input = false;
        break;
    }
    i++;
  }
}

/**
 * Updates the GUI.
 */
function updateBoard() {
  var sq = null;
  for (var i = 0; i < gameBoard.area.length; i++) {
    sq = gameBoard.area[i];
    if (!sq.offboard) {
      sq_id = "#" + gameBoard.printSq(i);

      if (sq.color == COLORS.WHITE) {
        switch (sq.piece) {
          case PIECES.KING:
            $(sq_id).attr("src", "img/wK.png");
            break;
          case PIECES.ROOK:
            $(sq_id).attr("src", "img/wR.png");
            break;
          case PIECES.KNIGHT:
            $(sq_id).attr("src", "img/wN.png");
            break;
          case PIECES.BISHOP:
            $(sq_id).attr("src", "img/wB.png");
            break;
          case PIECES.PAWN:
            $(sq_id).attr("src", "img/wP.png");
            break;
          case PIECES.QUEEN:
            $(sq_id).attr("src", "img/wQ.png");
            break;
          case PIECES.EMPTY:
            $(sq_id).attr("src", "img/blank.gif");
        }
      } else {
        switch (sq.piece) {
          case PIECES.KING:
            $(sq_id).attr("src", "img/bK.png");
            break;
          case PIECES.ROOK:
            $(sq_id).attr("src", "img/bR.png");
            break;
          case PIECES.KNIGHT:
            $(sq_id).attr("src", "img/bN.png");
            break;
          case PIECES.BISHOP:
            $(sq_id).attr("src", "img/bB.png");
            break;
          case PIECES.PAWN:
            $(sq_id).attr("src", "img/bP.png");
            break;
          case PIECES.QUEEN:
            $(sq_id).attr("src", "img/bQ.png");
            break;
          case PIECES.EMPTY:
            $(sq_id).attr("src", "img/blank.gif");
        }
      }
    }
  }

  gameBoard.createFen();
  gameBoard.addNewBoardState();

  updateFenGUI();
}

/**
 * Updates the HTML FEN.
 */
function updateFenGUI() {
  // .text for text, .val for non-text objects
  $('h3[id="currentFen"]').text(gameBoard.fen);
}

function playSound(kind) {
  var audio;

  if (kind == "move") {
    audio = new Audio("sounds/move.wav");
  } else if (kind == "end") {
    audio = new Audio("sounds/end.wav");
  } else {
    return false;
  }

  audio.play();
}
