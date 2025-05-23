// const { User } = require("../../src/models");
const sequelize = require("../../src/config/database");
const { Accommodation, User } = require("../test-setup");
const { Op } = require("sequelize");

describe("Accommodation Model", () => {
  beforeEach(async () => {
    await Accommodation.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  it("Should create an accommodation", async () => {
    const accommodation = await Accommodation.create({
      address: "Baker Street 21B",
      city: "London",
      country: "England",
      zipCode: 936421,
      rent: 7000,
      room: 12,
    });
    expect(accommodation).toBeDefined();
    expect(accommodation.address).toBe("Baker Street 21B");
    expect(accommodation.city).toBe("London");
    expect(accommodation.zipCode).toBe(936421);
    expect(accommodation.rent).toBe(7000);
    expect(accommodation.room).toBe(12);
  });

  it("Should fail when required fields are missing", async () => {
    await expect(
      Accommodation.create({
        city: "London",
        country: "England",
        zipCode: 936421,
        rent: 7000,
        room: 12,
      })
    ).rejects.toThrow();
  });

  it("Should create accommodation with associated user", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const accommodation = await Accommodation.create({
      address: "Main Street 123",
      city: "Stockholm",
      country: "Sweden",
      zipCode: 12345,
      rent: 5000,
      room: 3,
      userId: user.id,
    });

    expect(accommodation.userId).toBe(user.id);

    // Test association
    const accommodationWithUser = await Accommodation.findByPk(
      accommodation.id,
      {
        include: [User],
      }
    );
    expect(accommodationWithUser.User).toBeDefined();
    expect(accommodationWithUser.User.username).toBe("testuser");
  });

  it("Should update accommodation properties", async () => {
    const accommodation = await Accommodation.create({
      address: "Old Street 100",
      city: "Berlin",
      country: "Germany",
      zipCode: 10115,
      rent: 8000,
      room: 4,
    });

    accommodation.rent = 9000;
    accommodation.room = 5;
    await accommodation.save();

    const updated = await Accommodation.findByPk(accommodation.id);
    expect(updated.rent).toBe(9000);
    expect(updated.room).toBe(5);
  });

  it("Should delete an accommodation", async () => {
    const accommodation = await Accommodation.create({
      address: "Delete Street 999",
      city: "Paris",
      country: "France",
      zipCode: 75001,
      rent: 12000,
      room: 6,
    });

    await accommodation.destroy();
    const deleted = await Accommodation.findByPk(accommodation.id);
    expect(deleted).toBeNull();
  });

  it("Should find accommodations by query", async () => {
    await Accommodation.create({
      address: "First Street 1",
      city: "London",
      country: "England",
      zipCode: 123456,
      rent: 7000,
      room: 3,
    });

    await Accommodation.create({
      address: "Second Street 2",
      city: "London",
      country: "England",
      zipCode: 654321,
      rent: 5000,
      room: 2,
    });

    const results = await Accommodation.findAll({
      where: { city: "London" },
    });
    expect(results.length).toBe(2);

    const expensive = await Accommodation.findAll({
      where: { rent: { [Op.gt]: 6000 } },
    });
    expect(expensive.length).toBe(1);
    expect(expensive[0].address).toBe("First Street 1");
  });

  it("Should automatically delete accommodations when user is deleted (CASCADE)", async () => {
    // Create a user
    const user = await User.create({
      username: "cascadeuser",
      email: "cascade@example.com",
      password: "password123",
    });

    // Create multiple accommodations for this user
    const accommodation1 = await Accommodation.create({
      address: "Cascade Street 1",
      city: "Stockholm",
      country: "Sweden",
      zipCode: 12345,
      rent: 5000,
      room: 2,
      userId: user.id,
    });

    const accommodation2 = await Accommodation.create({
      address: "Cascade Avenue 2",
      city: "Stockholm",
      country: "Sweden",
      zipCode: 12346,
      rent: 6000,
      room: 3,
      userId: user.id,
    });

    // Verify accommodations exist
    let accommodationsCount = await Accommodation.count({
      where: { userId: user.id },
    });
    expect(accommodationsCount).toBe(2);

    // Delete the user
    await user.destroy();

    // Verify the accommodations were automatically deleted
    accommodationsCount = await Accommodation.count({
      where: { userId: user.id },
    });
    expect(accommodationsCount).toBe(0);

    // Double-check that the specific accommodations no longer exist
    const checkAccommodation1 = await Accommodation.findByPk(accommodation1.id);
    const checkAccommodation2 = await Accommodation.findByPk(accommodation2.id);
    expect(checkAccommodation1).toBeNull();
    expect(checkAccommodation2).toBeNull();
  });
});
