import * as utils from "../utils";

describe("utils", () => {
  describe("booleanOptionOr", () => {
    it("should return the option if this one is true", () => {
      expect(utils.booleanOptionOr(true, false)).toBe(true);
    });

    it("should return the option if this one is false", () => {
      expect(utils.booleanOptionOr(false, true)).toBe(false);
    });

    it("should return the default the option is not a boolean", () => {
      expect(utils.booleanOptionOr(null, true)).toBe(true);
    });
  });

  describe("numberOptionOr", () => {
    it("should return the option if this one is a 10", () => {
      expect(utils.numberOptionOr(10, 42)).toBe(10);
    });

    it("should return the option if this one is 0", () => {
      expect(utils.numberOptionOr(0, 42)).toBe(0);
    });

    it("should return the default the option is not a number", () => {
      expect(utils.numberOptionOr(true, 42)).toBe(42);
    });
  });

  describe("pick", () => {
    it("should return a partial object", () => {
      const actual = utils.pick({ a: "a", b: "b", c: "c" }, ["a", "c"]);
      const expected = {
        a: "a",
        c: "c",
      };

      expect(actual).toEqual(expected);
    });
  });

  describe("withoutUndefinedKeys", () => {
    it("should remove undefined keys", () => {
      const actual = utils.withoutUndefinedKeys({ a: 1, b: undefined, c: "3" });
      const expected = {
        a: 1,
        c: "3",
      };

      expect(actual).toEqual(expected);
    });
  });
});
