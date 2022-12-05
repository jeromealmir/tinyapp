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
  aJ48lW: {
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

//lookup URLs by userID
const urlsForUser = (id) => {
  const urlsObj = {};
  Object.keys(urlDatabase).filter(x => {
    if (urlDatabase[x]['userID'] === id) {
      urlsObj[x] = {longURL: urlDatabase[x].longURL};
    }
  });
  return urlsObj;
};

app.get('/', (req, res) => {
  const userID = users[req.cookies.user_id];
  const templateVars = {user: userID, prompt: '' };
  res.render('urls_login', templateVars);
});

app.get('/urls', (req, res) => {
  const urls = urlsForUser(req.cookies['user_id']);
  const userID = users[req.cookies.user_id];
  const templateVars = { urls: urls, user: userID, prompt: '' };

  //if user is not logged in, redirect to login page
  if (!req.cookies['user_id']) {
    templateVars.prompt = 'Please login to use this service!';
    return res.render('urls_login', templateVars);
  }

  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  //if user is not logged in, respond with status code and error message
  if (!req.cookies['user_id']) return res.status(403).send('Please login to use this service!');

  const randomKey = generateRandomString();

  //append http:// to URL if it was not included in the input
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
  const templateVars = { user: userID, prompt: '' };

  //if user is not logged in, redirect to login page
  if (!req.cookies['user_id']) {
    templateVars.prompt = 'Please login to use this service!';
    return res.render('urls_login', templateVars);
  }

  res.render('urls_new', templateVars);
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;

  //if url id is not in database, respond with status code and error message
  if (!urlDatabase[shortURL]) return res.status(404).send('URL not found!');

  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;

  //if url id is not in database, respond with status code and error message
  if (!urlDatabase[shortURL]) return res.status(404).send('URL not found!');

  const longURL = urlDatabase[shortURL]['longURL'];
  const userID = users[req.cookies.user_id];
  const templateVars = { id: shortURL, longURL: longURL, user: userID, prompt: '' };

  //if user is not logged in, redirect to login page
  if (!req.cookies['user_id']) {
    templateVars.prompt = 'Please login to modify this URL!';
    return res.render('urls_login', templateVars);
  }

  //if userid does not match URL's, redirect to login page
  if (req.cookies['user_id'] !== urlDatabase[shortURL]['userID']) return res.status(403).send('You don\'t have permission to modify this URL!  <a href="/urls">Click here to go back.</a>');


  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;

  //if url id is not in database, respond with status code and error message
  if (!urlDatabase[shortURL]) return res.status(404).send('URL not found!');

  // //if a user is not logged in, respond with status code and error message
  if (!req.cookies['user_id']) return res.status(401).send('Please login to modify this URL!');
  
  //if user do not own the URL, respond with status code and error message
  if (req.cookies['user_id'] !== urlDatabase[shortURL]['userID']) return res.status(403).send('You don\'t have permission to modify this URL!');

  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;

  //if url id is not in database, respond with status code and error message
  if (!urlDatabase[shortURL]) return res.status(404).send('URL not found!');

  // //if user is not logged in, respond with status code and error message
  if (!req.cookies['user_id']) return res.status(401).send('Please login to modify this URL!');

  //if user do not own the URL, respond with status code and error message
  if (req.cookies['user_id'] !== urlDatabase[shortURL]['userID']) return res.status(403).send('You don\'t have permission to modify this URL!');

  //append http:// to URL if it was not included in the input
  if (!req.body.longURL.includes('http://')) {
    urlDatabase[shortURL] = {
      longURL: `http://${req.body.longURL}`,
      userID: req.cookies['user_id']
    };
  } else {
    //add new URL to database
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id']
    };
  }

  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  //if user is already logged in, redirect to urls page
  if (req.cookies['user_id']) return res.redirect('/urls');

  const userID = users[req.cookies.user_id];
  const templateVars = { user: userID, prompt: '' };

  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userID = users[req.cookies.user_id];
  const templateVars = { user: userID, prompt: '' };
  
  //return 400 status code if email and/or password is empty
  if (req.body.email === '' || req.body.password === '') {
    templateVars.prompt = 'Email and/or password cannot be blank!';
    return res.status(400).render('urls_register', templateVars);
  }

  const uID = getUserByEmail(req.body.email);
    
  //return 400 status code if email already exist
  if (uID && users[uID]['email'] === req.body.email) {
    templateVars.prompt = 'Email already exist! Please login instead.';
    return res.status(400).render('urls_register', templateVars);
  }

  const randomKey = generateRandomString();

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
  //if user is already logged in, redirect to urls page
  if (req.cookies['user_id']) return res.redirect('/urls');

  const userID = users[req.cookies.user_id];
  const templateVars = { user: userID, prompt: '' };

  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const userID = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user: userID, prompt: '' };
  
  //return 400 status code if email and/or password is empty
  if (req.body.email === '' || req.body.password === '') {
    templateVars.prompt = 'Email and/or password cannot be blank!';
    return res.status(400).render('urls_login', templateVars);
  }

  const uID = getUserByEmail(req.body.email);

  //return 403 status code if email does not exist
  if (!uID) {
    templateVars.prompt = 'Email not found! Please register to continue.';
    return res.status(403).render('urls_login', templateVars);
  }

  //return 403 status code if password is incorrect
  if (users[uID]['password'] !== req.body.password) {
    templateVars.prompt = 'Incorrect login! Please try again.';
    return res.status(403).render('urls_login', templateVars);
  }

  res.cookie('user_id', uID);
  res.redirect(`/urls`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});