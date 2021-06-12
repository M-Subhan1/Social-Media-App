const uniqueString = require("unique-string");

class NewUsers {
  constructor(firstName, lastName, gender, email, password) {
    // Custom Properties (depends on the input)
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.email = email;
    this.password = password;
    // default
    this.isVerified = false;
    this.tokenString = uniqueString();
    this.tokenTime = new Date();
    this.tokenIsValid = true;
    this.following = [];
    this.followers = [];
    this.posts = [];
    this.dateJoined = new Date();
  }
}

module.exports = NewUsers;
