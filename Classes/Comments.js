module.exports = class Comment {
  constructor(firstName, lastName, id, content) {
    this.author = {
      firstName,
      lastName,
      id,
    };
    this.content = content;
  }
};
