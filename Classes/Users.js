const uniqueString = require("unique-string");

class User {
  constructor(firstName, lastName, gender, password, email) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.password = password;
    this.email = email;

    this.isVerified = false;
    this.tokenString = uniqueString();
    this.tokenTime = new Date.now();
    this.tokenIsValid = true;
    this.following = [];
    this.followers = [];
    this.posts = [];
    this.dateJoined = new Date.now();
  }
}

module.exports = User;
