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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//lookup users object and return true if email is already existing
const getUserByEmail = (email) => Object.keys(users).find(user => users[user]['email'] === email);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  // console.log(req.body.longURL);
  const randomKey = generateRandomString();

  //append http:// to URL if it is not included
  if (!req.body.longURL.includes('http://')) {
    urlDatabase[randomKey] = `http://${req.body.longURL}`;
  } else {
    urlDatabase[randomKey] = req.body.longURL;
  }

  // console.log(urlDatabase);
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id]};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const urlShortID = req.params.id;
  // console.log(req.body);
  urlDatabase[urlShortID] = req.body.editLongURL;
  // console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post('/urls/:id/delete', (req, res) => {
  const urlShortID = req.params.id;
  delete urlDatabase[urlShortID];
  // console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const randomKey = generateRandomString();

  //return a 400 status code if email and/or password is empty
  if (req.body.email === '' || req.body.password === '') return res.sendStatus(400); //res.send('Cannot proceed with empty email/password')
  
  const userID = getUserByEmail(req.body.email);

  // //return a 400 status code if email is already existing
  if (userID && users[userID]['email'] === req.body.email) return res.sendStatus(400); //res.send('Email is already registered!')

  //add new user information to users object if there is no error
  users[randomKey] = {
    id: randomKey,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('user_id', randomKey);
  // console.log(users);
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  // console.log(req.body);

  //finds userID from users object using the email provided
  const getUserID = Object.keys(users).find(user => {
    if (users[user]['email'] === req.body.email) return users[user]['id'];
  });

  //if getUserID returns undefined set user_id to null
  res.cookie('user_id', getUserID ? getUserID : undefined);
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  // console.log(req.body);
  res.clearCookie('user_id');
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