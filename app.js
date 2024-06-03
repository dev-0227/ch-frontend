const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const login = require('./routes/login');
const pages = require('./routes/pages');
const settings = require('./routes/settings');
const loaders = require('./routes/loaders');
const hedis = require('./routes/hedis');
const patients = require('./routes/patients');
const insurance = require('./routes/insurance');
const database = require('./routes/database');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Config middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static Pages
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', login);
app.use('/pages', pages);
app.use('/settings', settings);
app.use('/loaders', loaders);
app.use('/patients', patients);
app.use('/hedis', hedis);
app.use('/insurance', insurance);
app.use('/database', database);

app.use('*', (req, res) => {
    res.redirect('../');
});

module.exports = app;
