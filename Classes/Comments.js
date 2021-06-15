module.exports = class Comment {
  constructor(firstName, lastName, id, content) {
    this.author = new Object({
      firstName,
      lastName,
      id,
    });

    this.content = content;
  }
};
