const { User } = require("../../src/models");
const { expect } = require("chai");
const sequelize = require("../../src/config/database");

describe("User Model", () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  describe("Validations", () => {
    it("should require username", async () => {
      try {
        await User.create({ email: "test@example.com" });
        throw new Error("Should have failed");
      } catch (error) {
        expect(error.name).to.equal("SequelizeValidationError");
      }
    });

    it("should require email", async () => {
      try {
        await User.create({ username: "testuser" });
        throw new Error("Should have failed");
      } catch (error) {
        expect(error.name).to.equal("SequelizeValidationError");
      }
    });

    it("should validate email format", async () => {
      try {
        await User.create({ username: "testuser", email: "invalid-email" });
        throw new Error("Should have failed");
      } catch (error) {
        expect(error.name).to.equal("SequelizeValidationError");
      }
    });
  });

  describe("Uniqueness", () => {
    it("should enforce unique username", async () => {
      await User.create({ username: "uniqueuser", email: "user1@example.com" });
      try {
        await User.create({
          username: "uniqueuser",
          email: "user2@example.com",
        });
        throw new Error("Should have failed");
      } catch (error) {
        expect(error.name).to.equal("SequelizeUniqueConstraintError");
      }
    });

    it("should enforce unique email", async () => {
      await User.create({ username: "user1", email: "unique@example.com" });
      try {
        await User.create({ username: "user2", email: "unique@example.com" });
        throw new Error("Should have failed");
      } catch (error) {
        expect(error.name).to.equal("SequelizeUniqueConstraintError");
      }
    });
  });

  describe("Profile Picture", () => {
    it("should accept a valid URL", async () => {
      const user = await User.create({
        username: "withpic",
        email: "pic@example.com",
        profilePicture: "https://example.com/profile.jpg",
      });
      expect(user.profilePicture).to.equal("https://example.com/profile.jpg");
    });

    it("should allow null profile picture", async () => {
      const user = await User.create({
        username: "nopic",
        email: "nopic@example.com",
        profilePicture: null,
      });
      expect(user.profilePicture).to.be.null;
    });
  });
});
