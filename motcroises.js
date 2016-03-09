"use strict"
var $board;
var $selected;

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

function select(i, j){
  $selected = $($($board.children()[i]).children()[j]).toggleClass("selected");
}

function mouseSelect(e){
  var $newSelected = $(e.target);
  if(e.target.tagName == "DIV"
      && !$newSelected.hasClass("header")
      && !$newSelected.hasClass("black")) {
    $selected.removeClass("selected");
    $selected = $newSelected.addClass("selected");
  }
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
  $board.css("width", (content.length+1)*22 + "px");
}

var initializeClues = function (content) {
  var $across = $("<ol>");
  var $topdown = $("<ol>");
  for(var i = 0; i < content.numbers.length; ++i) {
    var row = content.numbers[i];
    
    for(var j = 0; j < row.length; ++j) {
      var clueIdx = row[j];
      var acrossClue = content.acrossClues[clueIdx];
      var topdownClue = content.downClues[clueIdx];
      
      if(acrossClue) {
        var $li = $("<li></li>").text(acrossClue);
        $across.append($li);
      }

      if(topdownClue) {
        var $li = $("<li></li>").text(topdownClue);
        $topdown.append($li);
      }
    }
  }
  $("#across").append($across);
  $("#topdown").append($topdown);
};

function keyStroke(e){
  var c = e.keyCode || e.which;
  if(c >= 37 && c <= 40){
    arrowStroke(c);
    updateHighlight();
    return e.preventDefault();
  }else if(c >= 65 && c <= 90){
    letterStroke(String.fromCharCode(c));
    updateHighlight();
    return e.preventDefault();
  }else if(c == 8){
    backspace();
    updateHighlight();
    return e.preventDefault();
  }else if(c == 46){
    del();
    updateHighlight();
    return e.preventDefault();
  }else if(c == 32){
    orientation = !orientation;
    updateHighlight();
    return e.preventDefault();
  }
 
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

function letterStroke(c){
  var $row = $selected.parent();
  var $rows = $row.siblings();
  var lenColumns = $selected.siblings().length;
  var key = c;
  var $span = $("span", $selected);
  $span.text(c);
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
  arrowStroke(orientation ? 39 : 40);
}

function backspace(){
  arrowStroke(orientation ? 37 : 38);
  letterStroke(' ');
  arrowStroke(orientation ? 37 : 38);
}

function del(){
  letterStroke(' ');
  arrowStroke(orientation ? 37 : 38);
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
  var height = motcroise.nRows;

  var header = createHeader(motcroise.nCols);

  var $row = $("<div>").addClass("row");
  for(var i in header) {
    $row.append($("<div>").addClass("header").append($("<span>").addClass("content").text("" + header[i])));
  }

  $board.append($row);

  // initialiser la table
  initialize(content);
  initializeClues(motcroise);
 
  // selection la 1ere case
  select(1, 1);

  // selection de la case par un clique
  $board.click(mouseSelect);

  $(document).keydown(keyStroke);

  updateHighlight();

  var $game = $("#game");
  $game.toggle();
  $("#submit").blur();
};

$(document).ready(() => {
  $board = $('#board');
  var $form = $('#form');
  var lastLoad = null;
  $form.on('submit', (e) => {
    var filename = $('input[name=filename]', $form).val();
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
});

