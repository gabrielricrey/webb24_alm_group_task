// const { User } = require("../../src/models");
const sequelize = require("../../src/config/database");
const { Accommodation } = require("../test-setup");

describe("Accommodation Model", () => {
    it("Should create an accommodation", async () => {
        const accommodation = await Accommodation.create({
            address: "Baker Street 21B",
            city: "London",
            country: "England",
            zipCode: 936421,
            rent: 7000,
            room: 12,
        })
        expect(accommodation).toBeDefined();
        expect(accommodation.address).toBe("Baker Street 21B");
        expect(accommodation.city).toBe("London");
        expect(accommodation.zipCode).toBe(936421);
        expect(accommodation.rent).toBe(7000);
        expect(accommodation.room).toBe(12);
    })
});