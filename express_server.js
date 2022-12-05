const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => Math.random().toString(36).slice(7);

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'aJ48lW'
  }
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
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const userID = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user: userID, prompt: 'Please login to use this service!' };

  //if a user is not logged in, redirect to login page
  if (!req.cookies['user_id']) return res.render('urls_login', templateVars);
  
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  //if a user is not logged in, respond with a message back to client
  if (!req.cookies['user_id']) return res.status(403).send('Please login to use this service!');

  const randomKey = generateRandomString();

  //append http:// to URL if it was not included
  if (!req.body.longURL.includes('http://')) {
    urlDatabase[randomKey] = {
      longURL: `http://${req.body.longURL}`,
      userID: req.cookies['user_id']
    };
  } else {
    urlDatabase[randomKey] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id']
    };
  }

  res.redirect(`/urls/${randomKey}`);
});

app.get('/urls/new', (req, res) => {
  const userID = users[req.cookies.user_id];
  const templateVars = { user: userID, prompt: 'Please login to use this service!' };

  //if a user is not logged in, redirect to login page
  if (!req.cookies['user_id']) return res.render('urls_login', templateVars);

  res.render('urls_new', templateVars);
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]['longURL'];

  if (!longURL) return res.status(404).send('URL not found!');

  res.redirect(longURL);
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]['longURL'];
  const userID = users[req.cookies.user_id];
  const templateVars = { id: shortURL, longURL: longURL, user: userID, prompt: 'Please login to modify this URL!' };

  //if a user is not logged in, redirect to login page
  if (!req.cookies['user_id']) return res.render('urls_login', templateVars);

  //if userid does not match URL's, redirect to login page
  if (req.cookies['user_id'] !== urlDatabase[shortURL]['userID']) return res.status(403).send('You don\'t have permission to modify this URL!  <a href="/urls">Click here to go back.</a>');

  if (!longURL) return res.status(404).send('URL not found!');

  const templateVars = { id: req.params.id, longURL: longURL, user: userID };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  //if a user is not logged in, respond with a message back to client
  if (!req.cookies['user_id']) return res.status(403).send('Please login to modify this URL!');
  
  const shortURL = req.params.id;
  delete urlDatabase[shortURL]; //pending implementation!
  res.redirect(`/urls`);
});

app.post('/urls/:id', (req, res) => {
  //if a user is not logged in, respond with a message back to client
  if (!req.cookies['user_id']) return res.status(403).send('Please login to modify this URL!');

  const shortURL = req.params.id;

  //append http:// to URL if it was not included
  if (!req.body.longURL.includes('http://')) {
    urlDatabase[shortURL] = `http://${req.body.longURL}`;
  } else {
    //add new URL to database
    urlDatabase[shortURL] = req.body.longURL;
  }

  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  //if a user is already logged in, redirect to urls page
  if (req.cookies['user_id']) return res.redirect('/urls');

  const userID = users[req.cookies.user_id];

  const templateVars = { user: userID };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const randomKey = generateRandomString();

  //return a 400 status code if email and/or password is empty
  if (req.body.email === '' || req.body.password === '') return res.status(400).send('Email and/or password cannot be blank! <a href="/register">Click here to go back.</a>');
  
  const userID = getUserByEmail(req.body.email);

  // //return a 400 status code if email is already existing
  if (userID && users[userID]['email'] === req.body.email) return res.status(400).send('Email already exist! Please <a href="/login">login</a> to continue.');

  //add new user information to users object if there is no error
  users[randomKey] = {
    id: randomKey,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie('user_id', randomKey);
  res.redirect(`/urls`);
});

app.get('/login', (req, res) => {
  //if a user is already logged in, redirect to urls page
  if (req.cookies['user_id']) return res.redirect('/urls');

  const userID = users[req.cookies.user_id];

  const templateVars = { user: userID, prompt: '' };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const userID = getUserByEmail(req.body.email);

  //return a 400 status code if email and/or password is empty
  if (req.body.email === '' || req.body.password === '') return res.status(400).send('Email and/or password cannot be blank! <a href="/login">Click here to go back.</a>');

  //return 403 if email does not exist
  if (!userID) return res.status(403).send('Email not found! Please <a href="/register">register</a> to continue.');

  //return 403 if password is incorrect
  if (users[userID]['password'] !== req.body.password) return res.status(403).send('Incorrect login! <a href="/login">Please try again.</a>');

  res.cookie('user_id', userID);
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});