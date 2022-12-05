//randomString generator for shortURL
const generateRandomString = () => Math.random().toString(36).slice(7);

//lookup users object and return true if email is already existing
const getUserByEmail = (email, database) => Object.keys(database).find(user => database[user]['email'] === email);

//lookup URLs by userID
const urlsForUser = (id, database) => {
  const urlsObj = {};
  Object.keys(database).filter(x => {
    if (database[x]['userID'] === id) {
      urlsObj[x] = {longURL: database[x].longURL};
    }
  });
  return urlsObj;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };