const { User } = require("../test-setup");

describe("User Model", () => {
  // Existing tests
  it("should create a user", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@test.com",
    });

    expect(user).toBeDefined();
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@test.com");
  });

  it("should validate email format", async () => {
    const user = User.build({ username: "testuser", email: "invalid-email" });
    await expect(user.validate()).rejects.toThrow();
  });

  // New tests for unique constraints
  it("should enforce unique username", async () => {
    // Create first user
    await User.create({ username: "uniqueuser", email: "unique1@test.com" });

    // Try creating second user with same username
    await expect(
      User.create({ username: "uniqueuser", email: "unique2@test.com" })
    ).rejects.toThrow();
  });

  it("should enforce unique email", async () => {
    // Create first user
    await User.create({ username: "emailuser1", email: "same@test.com" });

    // Try creating second user with same email
    await expect(
      User.create({ username: "emailuser2", email: "same@test.com" })
    ).rejects.toThrow();
  });

  // Tests for profilePicture field
  it("should store profilePicture URL", async () => {
    const imageUrl = "https://example.com/image.jpg";
    const user = await User.create({
      username: "picuser",
      email: "pic@test.com",
      profilePicture: imageUrl,
    });

    expect(user.profilePicture).toBe(imageUrl);
  });

  it("should allow null profilePicture", async () => {
    const user = await User.create({
      username: "nopicuser",
      email: "nopic@test.com",
    });

    expect(user.profilePicture).toBeNull();
  });
});
