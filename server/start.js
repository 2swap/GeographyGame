'use strict'

const express = require('express');
const {resolve} = require('path');

const app = express();

if(process.env.NODE_ENV !== 'prodction'){
	app.use(require('volleyball'));
}

module.exports = app
.use(express.static(resolve(__dirname, '..', 'public')))
.get('/*',(_, res) =>res.sendFile(resolve(__dirname, '..', 'public', 'index.html')))

var port = 10002;

app.listen(port, () => console.log('server listening on ' + port + '.'));
