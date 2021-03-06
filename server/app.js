'use strict';
// const  express = require('express');
// const  debug = require('debug')('main-index');
// const  path = require('path');
// const  app = express();
// const  Twit = require('twit');
// const  cors = require('cors');
// const  fs = require('fs');
// const  compress = require('compress');
// const  json = require('json');

//const  methodOverride = require('methodOverride');
//const  urlencoded = require('urlencoded');
//const server = require('http').createServer(app);
// const  http = require('http');
// const  https = require('https');
// const  privateKey  = fs.readFileSync('./cert/privatekey.pem', 'utf8');
// const  certificate = fs.readFileSync('./cert/certificate.pem', 'utf8');
// const  credentials = {key: privateKey, cert: certificate};
// const  httpServer = http.createServer(app);
// const  httpsServer = https.createServer(credentials, app);
//const io = require('socket.io')(server);
// const io = require('socket.io')(httpServer);
// const ios = require('socket.io')(httpsServer);

// const PORT = 1080;
// const SSLPORT = 1443;

const  Twit = require('twit');
const io = require('socket.io')(8081, {
    path: '/globeapi',
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});


let  tweet_stream_staus = false;
//let  socket_staus = false ;


// httpServer.listen(PORT, function() {
//     console.log('HTTP Server is running on:  ', PORT);
// });

// httpsServer.listen(SSLPORT, function() {
//     console.log('HTTPS Server is running on:  ', SSLPORT);
// });

// app.use(cors());
// app.use(express.static(__dirname + '/project'));

//amormaid_bot
const twitter = new Twit({
  consumer_key:         'AClGTCLYhkTpkJ0yUcK5bOXJ0',
  consumer_secret:      'gTuhr97hTaY9MjIZ1ivm8P5VDyb44mf01sM3fMa2F2joNrXXyR',
  access_token:         '4776855367-dPenCEyU4UryxL0OFHiqn2VtpEj1mGAJnUZQmL0',
  access_token_secret:  'GHx8nNvDImkjhanzWLBhGQ4GdhDEACjoXguG1Yr3MJRN1',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

let stream;
let  settimeout_id;

function io_socket(socket) {
    // console.log('start')
    let tweetPayload = [];
    // stream  turn on  and  turn off  at  61 seconds later
    if(!tweet_stream_staus){
        stream = twitter.stream('statuses/filter', { locations: [ '-180','-90','180','90' ] });
        tweet_stream_staus = true;
        console.log("stream open !");
        stream.on('connect', function (request) {
            console.log("stream connect !");
        })
        
		stream.on('tweet', function (tweet) {
		
			if(tweetPayload.length > 19 ) {
				//socket.on('tweets_request', function (data) {
                socket.emit('tweets_response',tweetPayload);
                console.log(tweetPayload.length,'  tweets  send !');
                tweetPayload = [];
				//});
			} else if( tweet.geo && tweet.user.lang == 'en') {
                tweetPayload.push(tweet);
                //console.log(tweetPayload.length);
				
			}
		});		
		
		stream.on('disconnect', function (disconnectMessage) {
			stream.stop();
            tweet_stream_staus = false;
			console.log("disconnected ,so stream stop ~");
			socket.emit('tweets_response',tweetPayload);
		});
    }
    clearTimeout(settimeout_id);
    settimeout_id = setTimeout(function(){
        stream.stop();
        tweet_stream_staus = false;
        console.log("stream stop !");
        socket.emit('tweets_response',tweetPayload);
    },61000);
    
	socket.on('tweets_request',function () {
        
	});
}

io.on('connection', io_socket);
// ios.on('connection', io_socket);

io.on('disconnect',function(){
    stream.stop();
    tweet_stream_staus = false;
    console.log("stream stop !");
	console.log('socket disconnect ;');
});

// ios.on('disconnect',function(){
//     stream.stop();
//     tweet_stream_staus = false;
//     console.log("stream stop !");
// 	console.log('socket disconnect;');
// });

// START SERVER
//server.listen(80);
//console.log('listening on port', app.get('port'));
