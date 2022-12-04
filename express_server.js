const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => Math.random().toString(36).slice(7);

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body.longURL);
  const randomKey = generateRandomString();
  //append http:// to URL if it is not included
  if (!req.body.longURL.includes('http://')) {
    urlDatabase[randomKey] = `http://${req.body.longURL}`;
  } else {
    urlDatabase[randomKey] = req.body.longURL;
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${randomKey}`);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // console.log(longURL);
  res.redirect(longURL);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const urlShortID = req.params.id;
  console.log(req.body);
  urlDatabase[urlShortID] = req.body.editLongURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post('/urls/:id/delete', (req, res) => {
  const urlShortID = req.params.id;
  delete urlDatabase[urlShortID];
  // console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render('urls_register', templateVars)
})

app.post('/login', (req, res) => {
  // console.log(req.body);
  res.cookie('username', req.body.username)
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  // console.log(req.body);
  res.clearCookie('username')
  res.redirect(`/urls`);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});