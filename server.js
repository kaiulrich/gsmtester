var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   https = require('https')
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,   sys = require('sys')
,   os = require('os')
,   exec = require('child_process').exec;

io.set('log level',3);

// APN und emobility backend parameter
var apn = conf.apn;
var username = conf.username;
var passwort =  conf.passwort;
var serverurl = conf.serverurl;

// Webserver
// auf den Port x schalten
server.listen(conf.port);

app.configure(function(){
	// statische Dateien ausliefern
	app.use(express.static(__dirname + '/public'));
});

app.get('/tester', function (req, res) {
	io.sockets.emit('tester.info', { zeit: new Date(), title: '', text: 'Emobility backend answered.', showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
	io.sockets.emit('tester.info', { zeit: new Date(), title: 'SIMCARD NETWORK IS OK', text: '', showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
	res.end( "{\"status\":\"success\"}");   
})


// Websocket
io.sockets.on('connection', function (socket) {
	// der Client ist verbunden
	socket.emit('tester.info', { zeit: new Date(), title: 'Simcard Tester Configuration.', text: '', showconf: true, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
	// wenn ein Benutzer einen Text senden
	socket.on('tester.gsm_connect', function (data) {
		// so wird dieser Text an alle anderen Benutzer gesendet
		apn = data.apn;
		username = data.username;
		passwort =  data.passwort;
		serverurl = data.serverurl;
		io.sockets.emit('tester.info', { zeit: new Date(), title: 'Connecting modem....', text: '', showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		
		exec("sakis3g connect --console --nostorage --pppd APN=\"CUSTOM_APN\" CUSTOM_APN=\"" + apn + "\" APN_USER=\""+username+"\" APN_PASS=\""+passwort+"\" USBINTERFACE=\"0\" USBDRIVER=\"option\" OTHER=\"USBMODEM\" USBMODEM=\""+conf.usbmodem+"\"", 
			function (error, stdout, stderr) {
			  
		    io.sockets.emit('tester.info', { zeit: new Date(), text: stdout, showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		  		 	
 		    io.sockets.emit('tester.info', { zeit: new Date(), text: 'Connecting host ' + serverurl + ' ...', showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		    //making the https get call
		    if(os.networkInterfaces().ppp0 == null){
			io.sockets.emit('tester.info', { zeit: new Date(), title: 'Error: ', text: 'No modem found.', showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
			return;
		    }
		    var ppp0Ip = os.networkInterfaces().ppp0[0].address
		    var options = {
			host :  serverurl,
			port : 443,
			path : '/tester/' + ppp0Ip + '/' + conf.port,
			//path: '/status',			
			method : 'GET',
			rejectUnauthorized: false
		    }
		    var getReq = https.request(options, function(res) {
			var mesg = '';
			var title = ''
		        if(res.statusCode == '200'){
				title = 'SIMCARD CONFIGURATION OK'
				mesg = 'emobility server is reachable (status=200)' ; 
				io.sockets.emit('tester.info', { zeit: new Date(),  title: '', text: mesg,  showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
			        io.sockets.emit('tester.info', { zeit: new Date(),  title: title, text: '',  showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});			
				io.sockets.emit('tester.info', { zeit: new Date(),  title: '', text: 'Waiting for Backend ....',  showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});				
			}else{
				title = 'SIMCARD CONFIGURATION NOT OK'
				mesg = 'emobility server is not reachable (status=' + res.statusCode + ')' ; 	
				io.sockets.emit('tester.info', { zeit: new Date(),  title: '', text: mesg,  showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
				io.sockets.emit('tester.info', { zeit: new Date(),  title: title, text: '',  showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
			}
			
			
		    });
		 
		    //end the request
		    getReq.end();
		    getReq.on('error', function(err){
			var title = 'SIMCARD CONFIGURATION NOT OK'
			io.sockets.emit('tester.info', { zeit: new Date(), title: '', text: '' + err, showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		      	io.sockets.emit('tester.info', { zeit: new Date(),  title: title, text: '',  showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		    }); 
		});

		
	});
	socket.on('tester.gsm_disconnect', function (data) {
		// so wird dieser Text an alle anderen Benutzer gesendet
		apn = data.apn;
		username = data.username;
		passwort =  data.passwort;
		serverurl = data.serverurl;
		io.sockets.emit('tester.info', { zeit: new Date(), title: 'Disconnect modem ...', text: '', showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		exec("sakis3g disconnect --console --nostorage USBDRIVER=\"option\" OTHER=\"USBMODEM\" USBMODEM=\"12d1:1001\"", 
			function (error, stdout, stderr) {
			  io.sockets.emit('tester.info', { zeit: new Date(), text: stdout, showconf: false, apn: apn, username: username, passwort: passwort, serverurl: serverurl});
		});
	});
});


// Portnummer in die Konsole schreiben
console.log('Der Server läuft nun unter http://127.0.0.1:' + conf.port + '/');
