$(document).ready(() => {
	var $board = $('.board');
	var $form = $('#form');
	var lastLoad = null;
	$form.on('submit', (e) => {
		var filename = $('input[name=filename]', $form).val();
		if(/\.json$/.test(filename)) {
			if(lastLoad && lastLoad == filename) {
				alert("File is already loaded!");
			}else{
				lastLoad = filename;
				$board.empty();
				$.ajax({
					url: filename,
					success: (data) => console.log(data),
					error: () => $board.append($('<p>').text("Error loading file"))
				});
			}
		}else
			alert('Not a json file');
		return e.preventDefault();	
	});
});
