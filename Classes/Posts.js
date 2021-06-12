const Comments = require("./Comments");

module.exports = class Posts extends Comments {
  constructor(firstName, lastName, id, content) {
    // Calling Comment constructor
    super(firstName, lastName, id, content);
    // extending data members for posts
    this.time = new Date();
    this.comments = [];
    this.image = "";
  }
};
