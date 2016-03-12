"use strict"

var $board;
var $selected;
var wordsref;
var $soluce;

var orientation = true;

var handler = function (nextCase, nextRow, idxCase, idxRow) {
  return function() {
    var nc = nextCase();
    if(!nc) {
      var nr = nextRow(idxRow);
      nc = $(nr.children()[idxCase]);
    }
    return nc;
  };
};

function genIndex(motcroise){
  var format = motcroise.diagram;
  var numbs = motcroise.numbers;
  var acclues = motcroise.acrossClues;
  var doclues = motcroise.downClues;
  var result = Array(motcroise.nRows);
  var countrow = 0;
  var countcol = 0;
  var next;
  for(var i = 0; i < result.length; i++) {
    next = true;
    countrow = 0;
    result[i] = Array(motcroise.nCols);
    for(var j = 0; j < result[i].length; j++){
      result[i][j] = {};
      if(acclues[numbs[i][j]]){
        next = false;
        countrow++;
      }else if(format[i][j] == "."){
        next = true;
      }
      result[i][j]["across"] = next ? 0 : countrow;
    }  
  }
  if(motcroise.nRows > 0)
    for(var j = 0; j < result[0].length; j++){
      next = true;
      countcol = 0;
      for(var i = 0; i < result.length; i++){
        if(doclues[numbs[i][j]]){
          next = false;
          countcol++;
        }else if(format[i][j] == "."){
          next = true;
        }
        result[i][j]["downTop"] = next ? 0 : countcol;
      }
    }
  return result;
}

function select(i, j){
  if($selected)
    $selected.removeClass("selected");
  $selected = $($($board.children()[i]).children()[j]).addClass("selected");
  updateHighlight();
  selectClue(i-1,j-1);
}

function mouseSelect(e){
  var $newSelected = $(e.target);
  console.log(e.target == $selected[0])
  if($selected[0] == e.target) {
    keyStroke({keyCode: 32, which: 32, preventDefault: ()=>false}); 
  }
  else{
    if(e.target.tagName == "SPAN")
      $newSelected = $newSelected.parent();
    if($newSelected[0].tagName == "DIV"
        && !$newSelected.hasClass("header")
        && !$newSelected.hasClass("black")
        && $newSelected.hasClass("case")) {
      $selected.removeClass("selected");
      $selected = $newSelected.addClass("selected");
    }
  }
  selectClue($selected.parent().index()-1, $selected.index()-1);
  updateHighlight();
}

function initialize(content){
  var $row;
  for(var i = 0; i < content.length; ++i) {
    var line = content[i];
    $row = $("<div>").addClass("row");
    $row.append($("<div>").addClass("header").append($("<span>").addClass("content").text(""+(i+1))));
    for(var j = 0; j<line.length; ++j) {
      var $c = $("<div>").addClass("case");
      var sym = line.charAt(j);
      if(sym == '.') {
        $c.addClass("black");
      } else {
        var $content = $("<span>").addClass("content");
        $c.append($content);
      }
      $row.append($c);
    }
    $board.append($row);
  }
}

var initializeClues = function (content) {
  var $across = $("#across").empty();
  var $topdown = $("#topdown").empty();
  for(var i = 0; i < content.numbers.length; ++i) {
    var row = content.numbers[i];

    for(var j = 0; j < row.length; ++j) {
      var clueIdx = row[j];
      var acrossClue = content.acrossClues[clueIdx];
      var topdownClue = content.downClues[clueIdx];

      if(acrossClue) {
        var $li = $("#across"+i);
        if($li[0]) {
          $li.append(" &mdash; ");
        } else {
          $li = $("<div></div>").append($("<span></span>").text(""+(i+1))).append(": ").attr("id", "across"+i);
        }
        $li.append($("<span></span>").text(acrossClue));
        $across.append($li);
      }

      if(topdownClue) {
        var $li = $("#down"+j);
        if($li[0]) {
          $li.append(" &mdash; ");
        } else {
          $li = $("<div></div>").append($("<span></span>").text(""+(j+1))).append(": ").attr("id", "down"+j);
        }
        $li.append($("<span></span>").text(topdownClue));
        $topdown.append($li);
      }
    }
  }
  var array = $topdown.children();

  array.sort(function(a, b) {
    var idA = parseInt($(a).attr("id").substr(4));
    var idB = parseInt($(b).attr("id").substr(4));
    if(idA < idB) {
      return -1;
    }else if(idA > idB) {
      return 1;
    } else {
      return 0;
    }
  });
  $topdown.empty();
  $topdown.append(array);
  var height = 22*(content.nRows+1)
  $topdown.css("height", height);
  $across.css("height", height);
};

function keyStroke(e){
  var c = e.keyCode || e.which;
  if(c >= 37 && c <= 40){
    arrowStroke(c);
  }else if(c >= 65 && c <= 90){
    letterStroke(String.fromCharCode(c));
  }else if(c == 8){
    backspace();
  }else if(c == 46){
    del();
  }else if(c == 32){
    orientation = !orientation;
  }else if(String.fromCharCode(e.which) == '?'){
    cheat();
  }else return;
  selectClue($selected.parent().index()-1, $selected.index()-1);
  updateHighlight();
  return e.preventDefault();

}

function arrowStroke(key){
  var $row = $selected.parent();
  var $rows = $row.siblings();
  var lenColumns = $selected.siblings().length;
  var next;
  switch(key) {
    case 37:
      var prevCase = () => {
        var $p = $selected.prev();
        return $p[0] ? $p : undefined;
      };
      var prevRow = () => {
        $row = $row.prev();
        if(!$row[0]) {
          $row = $($rows[$rows.length-1]);
        }
        return $row;
      };
      next = handler(prevCase, prevRow, lenColumns, $rows.length);
      break;
    case 38:
      var nextCase = () => {
        var i = $selected.index();
        $row = $row.prev();
        if(!$row[0]) {
          $row = $($rows[$rows.length - 1]);
        }
        return $($row.children()[i]);
      };
      var nextRow = (e) => {
        return $row;
      };
      next = handler(nextCase, nextRow, 0, 0);
      break;
    case 39:
      var nextCase = function() {
        var $n = $selected.next();
        return $n[0] ? $n : undefined;
      };
      var nextRow = function(idxRow) {
        $row = $row.next();
        if(!$row[0]) {
          $row = $($rows[1]);
        }
        return $row;
      };
      next = handler(nextCase, nextRow, 0, $rows.length);
      break;
    case 40:
      var nextCase = () => {
        var i = $selected.index();
        $row = $row.next();
        if(!$row[0]) {
          $row = $($rows[1]);
        }
        return $($row.children()[i]);
      };
      var nextRow = (e) => {
        return $row;
      };
      next = handler(nextCase, nextRow, 0, 0);
  }

  var $next;
  $selected.removeClass("selected");
  do {
    $selected = next();
  } while($selected.hasClass("black")
      || $selected.hasClass("header"));
  $selected.addClass("selected");
}

function selectClue(ligne, colonne) {
  var nmot;
  var $element;
  var $lastSelected;
  if(orientation) { // Horizontal
    nmot = wordsref[ligne][colonne].across;
    $element = $("#across");
    $lastSelected = $element.find(".selected");
    if(!$lastSelected[0]) $lastSelected = $("#topdown").find(".selected");
    $element = $element.find("#across"+ligne);
    $element = $element.find("span");
    $element = $($element[nmot]);
  } else { // Vertical
    nmot = wordsref[ligne][colonne].downTop;
    $element = $("#topdown");
    $lastSelected = $element.find(".selected");
    if(!$lastSelected.removeClass("selected")[0]) $lastSelected = $("#across").find(".selected");
    $element = $element.find("#down"+colonne);
    $element = $element.find("span");
    $element = $($element[nmot]);
  }
  if($element) {
    $lastSelected.removeClass("selected");
    if(nmot) $element.addClass("selected");
  }
}

function letterStroke(c){
  $selected.removeClass("wrong");
  var $row = $selected.parent();
  var $rows = $row.siblings();
  var lenColumns = $selected.siblings().length;
  var key = c;
  var $span = $("span", $selected);
  if(!$selected.hasClass("cheat") && !$selected.hasClass("done")){
    $span.text(c);
    if(c != soluceAt() && c != ' '){
      $selected.addClass("wrong");
    }
  }
  var nextCase = function() {
    var $n = $selected.next();
    return $n[0] ? $n : undefined;
  };
  var nextRow = function(idxRow) {
    $row = $row.next();
    if(!$row[0]) {
      $row = $($rows[1]);
    }
    return $row;
  };
  verifyWordsAt();
  arrowStroke(orientation ? 39 : 40);
}

function verifyWordsAt(){
  //orientation
  $selected.addClass("semiselect");
  var word = $(".semiselect");
  if(verifyWord(word)) stroke(word);
  //!orientation
  orientation = !orientation;
  selectClue($selected.parent().index()-1, $selected.index()-1);
  updateHighlight();
  $selected.addClass("semiselect");
  word = $(".semiselect");
  if(verifyWord(word)) stroke(word);
  orientation = !orientation;
  selectClue($selected.parent().index()-1, $selected.index()-1);
  updateHighlight();
}

function verifyWord(word){
  var bool = true;
  var c;

  for(var i = 0; i < word.length; i++){
    c = $(word[i]);
    bool = bool && c.text() != "" && !c.hasClass("wrong");
  }
  return bool;
}

function stroke(word){
  var ligne = $selected.parent().index()-1;
  var colonne = $selected.index()-1;
  var nmot = wordsref[ligne][colonne][orientation ? "across" : "downTop"];
  for(var i = 0; i < word.length; i++){
    $(word[i]).addClass("done");
  }
  $($(orientation ? "#across" + ligne : "#down" + colonne).find("span")[nmot]).addClass("stroke");
}

function backspace(){
  arrowStroke(orientation ? 37 : 38);
  del();
}

function del(){
  letterStroke(' ');
  arrowStroke(orientation ? 37 : 38);
}

function soluceAt(){
  var col = $selected.index()-1;
  var row = $selected.parent().index()-1;
  return $soluce[row].charAt(col);
}

function cheat(){
  letterStroke(soluceAt());
  arrowStroke(orientation ? 37 : 38);
  $selected.addClass("cheat");
  arrowStroke(orientation ? 39 : 40);
}

var updateHighlight = function() {
  var doneover = false;
  var doneunder = false;
  var $semiselect = $(".semiselect");
  if($semiselect[0])
    $semiselect.removeClass("semiselect");
  if(orientation){
    $selected.siblings().each(function(index) {
      if(index > 0) {
        $(this).addClass("semiselect");
      }
    });
  } else {
    var idx = $selected.index();
    $(".row", $("#board")).each(function(index) {
      if(index > 0) {
        $(this).children().eq(idx).addClass("semiselect");
      }
    });
  }
  $selected.addClass("semiselect");
  $semiselect = $(".semiselect");
  $semiselect.removeClass("semiselect");
  for(var i = $semiselect.index($selected)+1; i < $semiselect.length && !doneover; i++){
    if($semiselect.eq(i).hasClass("black")){
      doneover = true;
    }else{
      $semiselect.eq(i).addClass("semiselect");
    }
  }
  for(var i = $semiselect.index($selected)-1; i >= 0 && !doneunder; i--){
    if($semiselect.eq(i).hasClass("black")){
      doneunder = true;
    }else{
      $semiselect.eq(i).addClass("semiselect");
    }
  }
  $(".case").removeClass("selected");
  $selected.addClass("selected");
  $("#currentClues").text($(".selected", $(orientation? "#across":"#topdown")).text());
}

var createHeader = function(length) {
  var header = [' '];
  var i = 0;
  while(i < length) {
    header.push(i+1);
    ++i;
  }
  return header;
}

var load = function(motcroise) {
  var content = motcroise.diagram;
  var width = motcroise.nCols;
  var height = motcroise.nRows;
  $soluce = motcroise.solution;

  wordsref = genIndex(motcroise);

  var header = createHeader(motcroise.nCols);

  $board.empty();

  var $row = $("<div>").addClass("row");
  for(var i in header) {
    $row.append($("<div>").addClass("header").append($("<span>").addClass("content").text("" + header[i])));
  }

  $board.append($row);

  // initialiser la table
  initialize(content);
  initializeClues(motcroise);

  $(".auteur").css("width", (22*(width+1)) + "px");

  $("#auteur").text(motcroise.author);

  // selection la 1ere case
  select(1, 1);

  // selection de la case par un clique


  updateHighlight();

  var $game = $("#game");
  $game.show();
  $("#submit").blur();
  $("#game").css("height", (22*height) + "px");
};

function positionAt(){
  return new Array($selected.index(), $selected.parent().index());
}

function verifyAll(e){
  if($board){
    $selected.addClass("mark");
    do{
      if($selected.text() != soluceAt()){
        letterStroke(soluceAt());
        arrowStroke(37);
        $selected.addClass("cheat");
        arrowStroke(39);
      }else{
        arrowStroke(39);
      }
    }while(!$selected.hasClass("mark"));
    $selected.removeClass("mark");

  }
}

$(document).ready(() => {
  $board = $('#board');
  var $form = $('#form');
  var lastLoad = null;
  $form.on('submit', (e) => {
    var filename = $form[0]['request'].value;
    if(/\.json$/.test(filename)) {
      if(lastLoad && lastLoad == filename) {
        alert("File is already loaded!"); //reload
      }else{
        lastLoad = filename;
        $board.empty();
        $.ajax({
          url: filename,
          success: load,
          error: function(){ $board.append($('<p>').text("Error loading file")); }
        });
      }
    }else
      alert('Not a json file');
    return e.preventDefault();	
  });
  $board.click(mouseSelect);
  $(document).keydown(keyStroke);
  $(document).keypress(keyStroke);

  var clueSelection = function(e) {
    var newOrientation = e.currentTarget.id != "topdown";
    if(e.target.tagName == "SPAN") {
      var $span = $(e.target);
      if($span.index() == 0)
        return ;

      $(".selected", $(orientation ? "#across":"#topdown")).removeClass("selected");
      var position = parseInt($($span.siblings()[0]).text())-1;
      var nmot = $span.index();
      if(newOrientation) { // Horizontal
        var length = wordsref[position].length;
        for(var i = 0; i < length; ++i) {
          if(wordsref[position][i].across == nmot) {
            select((position+1), (i+1));
            break;
          }
        }
      }else {
        for(var i = 0; i < wordsref.length; ++i) {
          if(wordsref[i][position].downTop == nmot) {
            select((i+1), (position+1));
            break;
          }
        }
      }
      orientation = newOrientation;
      $span.addClass("selected");
      updateHighlight();
    }
  };

  $("#across").click(clueSelection);
  $("#topdown").click(clueSelection);
  $("#solve").click(verifyAll);
});

