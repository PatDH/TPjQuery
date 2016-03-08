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

function keyStroke(e){
  var c = e.keyCode || e.which;
  if(c >= 37 && c <= 40){
    arrowStroke(c);
    return e.preventDefault();
  }else if(c >= 65 && c <= 90){
    letterStroke(String.fromCharCode(c));
    return e.preventDefault();
  }else if(c == 8){
    backspace();
    return e.preventDefault();
  }else if(c == 46){
    del();
    return e.preventDefault();
  }else if(c == 32){
    orientation = !orientation;
    //update();
    return e.preventDefault();
  }
 
}

function arrowStroke(key){
  var $row = $selected.parent();
//  var $column = $row.index($selected.index()); TODO
  if(orientation){
    $row.removeClass("semiselect");
//  }else{
//  $column.removeClass("semiselect");
  }
  var $rows = $row.siblings();
  var lenColumns = $selected.siblings().length;
  var next;
  console.log(key);
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
  $row = $selected.parent();
//  $column = $row.index($selected.index()); TODO
  if(orientation){
    $row.addClass("semiselect");
//  }else{
//    $column.addClass("semiselect");
  }
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

var createHeader = function(length) {
  var header = [' '];
  var i = 0;
  while(i < length) {
    header.push(i+1);
    ++i;
  }
  return header;
}

// Monstre pas beau à arranger je saigne des yeux...

var load = function(motcroise) {
  var content = motcroise.diagram;
console.log($board);
  $board.css("display", "block");
console.log($board);
  var height = motcroise.nRows;

  var header = createHeader(motcroise.nCols);

  var $row = $("<div>").addClass("row");
  for(var i in header) {
    $row.append($("<div>").addClass("header").append($("<span>").addClass("content").text("" + header[i])));
  }

  $board.append($row);

  // initialiser la table
  initialize(content);

  // selection la 1ere case
  select(1, 1);

  // selection de la case par un clique
  $board.click(mouseSelect);

  $(document).keydown(keyStroke);
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

