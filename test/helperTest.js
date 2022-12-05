const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'aJ48lW'
  },
  ajkS28: {
    longURL: 'http://www.reddit.com',
    userID: 'oo6sZX'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
  it('should return undefined with non-existent email', () => {
    const user = getUserByEmail("invalid@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return urls owned by userID', () => {
    const user = urlsForUser("aJ48lW", urlDatabase);
    const expectedUserID = {
      b2xVn2: { longURL: 'http://www.lighthouselabs.ca' },
      '9sm5xK': { longURL: 'http://www.google.com' }
    };
    assert.deepEqual(user, expectedUserID);
  });
  it('should return an empty object if there is no match', () => {
    const user = urlsForUser("9as99l", urlDatabase);
    const expectedUserID = {};
    assert.deepEqual(user, expectedUserID);
  });
});