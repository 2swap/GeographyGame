'use strict'

const express = require('express');
const {resolve} = require('path');

const app = express();

if(process.env.NODE_ENV !== 'prodction'){
	app.use(require('volleyball'));
}

module.exports = app
.use(express.static(resolve(__dirname, '..', 'public')))
.get('/*',(_, res) =>res.sendFile(resole(__dirname, '..', 'public', 'index.html')))

app.listen(7500, () => console.log('server listening on 7500.'));
