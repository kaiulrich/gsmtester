$(document).ready(function(){
	// WebSocket


	var socket = io.connect();
	// neue tester.info Nachricht
	socket.on('tester.info', function (data) {
		var zeit = new Date(data.zeit);
			
		$('#apn').val(data.apn);	
		$('#username').val(data.username);
		$('#passwort').val(data.passwort);
		$('#serverurl').val(data.serverurl);
		
		infoline(zeit, data.title,  data.text);
		showConf(zeit, data);
			
		// nach unten scrollen
		$('html, body').animate({scrollTop:$(document).height()}, 'slow');
	});


	function showConf(zeit, data){
		if(zeit, data.showconf){
			infoline(zeit, '', 'apn: ' + data.apn);
			infoline(zeit, '', 'username: ' + data.username);		
			infoline(zeit, '', 'passwort: '+ data.passwort);
			infoline(zeit, '', 'serverurl: ' + data.serverurl);
		}
	}
	
	function infoline(zeit, title, value){
		 var lines = value.split("\n");
           	 $.each(lines, function(n, elem) {
                     $('#content').append(
			$('<li></li>').append(
				// Uhrzeit
				$('<span>').text('[' +
					(zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
					+ ':' +
					(zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
					+ '] '
				),
				// Title
				$('<b>').text(title),
				// Text
				$('<span>').text(elem)
	
			)
		     );
            	 });

		
		$('html, body').animate({scrollTop:$(document).height()}, 'slow');
	} 

	// Nachricht senden
	function connect(){
		// Eingabefelder auslesen
		var apn = $('#apn').val();
		var username = $('#username').val();
		var passwort = $('#passwort').val();
		var serverurl = $('#serverurl').val();

		// Socket senden
		socket.emit('tester.gsm_connect', { apn: apn, username: username, passwort: passwort, serverurl: serverurl });
	}
	function disconnect(){
		// Eingabefelder auslesen
		var apn = $('#apn').val();
		var username = $('#username').val();
		var passwort = $('#passwort').val();
		var serverurl = $('#serverurl').val();

		// Socket senden
		socket.emit('tester.gsm_disconnect', { apn: apn, username: username, passwort: passwort, serverurl: serverurl });
	}
	function clear(){
		$('#content').empty();
	}

	// bei einem Klick
	$('#connect').click(connect);
	$('#disconnect').click(disconnect);
	$('#clear').click(clear);

});
