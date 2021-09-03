import {
  MAX_LENGTH,
  MIN_LENGTH,
  REQUIRED,
  passwordRegex,
  PATTERN,
  EMAIL,
  PASSWORD,
  MIN_VALUE,
  MAX_VALUE,
} from "../../constants";

import { validate } from "..";

const NAME = "name";
const GENRE = "genre";

export const alternatePasswordRegex = /^(?=.*[0-8])\S{8,99}$/;

const data = {
  [NAME]: "",
  [GENRE]: "classical",
  [EMAIL]: "abraham@lincoln.com",
};

const config = {
  [NAME]: {
    rules: {
      [REQUIRED]: true,
      [MAX_LENGTH]: 8,
      [MIN_LENGTH]: 3,
    },
  },
  [GENRE]: {
    rules: {
      [REQUIRED]: true,
      [MIN_LENGTH]: 3,
    },
  },
  [EMAIL]: {
    rules: {
      [EMAIL]: true,
    },
  },
};

describe("validator", () => {
  it("returns true when data is valid", () => {
    const newData = { ...data, [NAME]: "abraham" };
    expect(validate(newData, config)).toEqual({
      valid: true,
      errorState: { [NAME]: [], [GENRE]: [], [EMAIL]: [] },
    });
  });

  it("returns a required error when an associated value is falsy", () => {
    expect(validate(data, config)).toEqual({
      valid: false,
      errorState: {
        [NAME]: ["Name is required"],
        [GENRE]: [],
        [EMAIL]: [],
      },
    });
  });

  it("returns a min length error when an associated value length is smaller than the min length", () => {
    const newData = { ...data, [NAME]: "ab" };
    expect(validate(newData, config)).toEqual({
      valid: false,
      errorState: {
        [NAME]: ["Name must be at least 3 characters in length"],
        [GENRE]: [],
        [EMAIL]: [],
      },
    });
  });

  it("returns a max length error when an associated value length is larger than the max length", () => {
    const newData = { ...data, [NAME]: "abraham lincoln" };
    expect(validate(newData, config)).toEqual({
      valid: false,
      errorState: {
        [NAME]: ["Name must be less than 9 characters in length"],
        [GENRE]: [],
        [EMAIL]: [],
      },
    });
  });

  it("returns an email error when an associated email value doesnt match the regex pattern", () => {
    const newData = { ...data, [NAME]: "abraham", [EMAIL]: "abraham" };
    expect(validate(newData, config)).toEqual({
      valid: false,
      errorState: {
        [NAME]: [],
        [GENRE]: [],
        [EMAIL]: ["Email is not a valid email address"],
      },
    });
  });

  it("returns a password error when a custom password regex rule does not pass", () => {
    const newData = { ...data, [PASSWORD]: "abraham", [NAME]: "abraham" };
    const newConfig = {
      ...config,
      [PASSWORD]: {
        rules: {
          [PASSWORD]: true,
        },
      },
    };
    expect(
      validate(newData, newConfig, { [PASSWORD]: alternatePasswordRegex })
    ).toEqual({
      valid: false,
      errorState: {
        [NAME]: [],
        [GENRE]: [],
        [EMAIL]: [],
        [PASSWORD]: ["Password must contain 1 special character and 1 number"],
      },
    });
  });

  it("returns a required error when a nested object required validation fails", () => {
    const newData = {
      venue: {
        name: "blue",
        address: {
          street: "",
          city: "Denver",
        },
      },
      ...data,
      [NAME]: "abraham",
      [EMAIL]: "abraham@lincoln.com",
      [PASSWORD]: "",
    };

    const newConfig = {
      ...config,
      venue: {
        [NAME]: {
          rules: {
            [REQUIRED]: true,
            [MIN_LENGTH]: 3,
          },
        },
        address: {
          street: {
            label: "Super street",
            rules: {
              [REQUIRED]: true,
              [MIN_LENGTH]: 3,
            },
          },
        },
      },
      [PASSWORD]: {
        rules: {
          [PASSWORD]: true,
        },
      },
    };

    expect(validate(newData, newConfig)).toEqual({
      valid: false,
      errorState: {
        [NAME]: [],
        [EMAIL]: [],
        [GENRE]: [],
        venue: {
          name: [],
          address: {
            street: ["Super street is required"],
            city: [],
          },
        },
        [PASSWORD]: [],
      },
    });
  });

  it("returns false and a pattern error", () => {
    const newData = { ...data, [NAME]: "abraham", [PASSWORD]: PASSWORD };

    const newConfig = {
      ...config,
      [PASSWORD]: {
        rules: {
          [PATTERN]: passwordRegex,
        },
      },
    };

    expect(validate(newData, newConfig)).toEqual({
      valid: false,
      errorState: {
        [NAME]: [],
        [GENRE]: [],
        [EMAIL]: [],
        [PASSWORD]: [
          `Password input value does not conform to pattern: ${passwordRegex}`,
        ],
      },
    });
  });

  it("returns true and without a pattern error if password meets requirements", () => {
    const newData = {
      ...data,
      [NAME]: "abraham",
      [PASSWORD]: "validPassword1!",
      tickets: [
        {
          id: "ticket-id-1",
        },
      ],
    };

    const newConfig = {
      ...config,
      [PASSWORD]: {
        rules: {
          [PATTERN]: passwordRegex,
        },
      },
    };
    // @ts-ignore
    delete newConfig.email;

    expect(validate(newData, newConfig)).toEqual({
      valid: true,
      errorState: {
        [NAME]: [],
        [GENRE]: [],
        [PASSWORD]: [],
        [EMAIL]: [],
        tickets: [],
      },
    });
  });

  it("returns false and a password error", () => {
    const newData = { ...data, [NAME]: "abraham", [PASSWORD]: PASSWORD };

    const newConfig = {
      ...config,
      [PASSWORD]: {
        rules: {
          [PASSWORD]: true,
        },
      },
    };

    expect(validate(newData, newConfig)).toEqual({
      valid: false,
      errorState: {
        [NAME]: [],
        [GENRE]: [],
        [EMAIL]: [],
        [PASSWORD]: ["Password must contain 1 special character and 1 number"],
      },
    });
  });

  it("returns true and no error if a config rule doesnt exist in the switch statement", () => {
    const newData = {
      ...data,
      [NAME]: "abraham",
      [PASSWORD]: "validPassword1!",
      price: null,
      distance: null,
    };

    const newConfig = {
      ...config,
      [PASSWORD]: {
        rules: {
          anomolie: passwordRegex,
          [PASSWORD]: true,
        },
      },
      price: {
        rules: {
          [MAX_VALUE]: 20,
        },
      },
      distance: {
        rules: {
          [MIN_VALUE]: 40,
        },
      },
    };

    expect(validate(newData, newConfig)).toEqual({
      valid: true,
      errorState: {
        [NAME]: [],
        [GENRE]: [],
        [EMAIL]: [],
        [PASSWORD]: [],
        price: [],
        distance: [],
      },
    });
  });

  it("returns max value and min value errors", () => {
    const newData = {
      price: 50,
      distance: 30,
    };

    const newConfig = {
      price: {
        rules: {
          [MAX_VALUE]: 20,
        },
      },
      distance: {
        rules: {
          [MIN_VALUE]: 40,
        },
      },
    };

    expect(validate(newData, newConfig)).toEqual({
      valid: false,
      errorState: {
        price: ["Price must be less than 20 in value"],
        distance: ["Distance must be at least 40 in value"],
      },
    });
  });

  it("returns errors with override messages", () => {
    const newData = {
      ...data,
      [NAME]: "Giorgio Moroder",
      [PASSWORD]: "Password1",
      price: 50,
      distance: null,
      email: "password",
      city: "",
      state: "C",
      country: "United States of America",
      age: 80,
    };

    const newConfig = {
      ...config,
      [NAME]: {
        rules: {
          [REQUIRED]: true,
          [MAX_LENGTH]: {
            ruleProp: 8,
            messageOverride: "is way too long",
          },
          [MIN_LENGTH]: 3,
        },
      },
      [EMAIL]: {
        rules: {
          [EMAIL]: {
            ruleProp: true,
            messageOverride: "is not valid",
          },
        },
      },
      city: {
        rules: {
          [REQUIRED]: {
            ruleProp: true,
            messageOverride: "is very much required",
          },
        },
      },
      [PASSWORD]: {
        rules: {
          [PASSWORD]: {
            ruleProp: true,
            messageOverride: "is not a valid password",
          },
          [PATTERN]: {
            ruleProp: passwordRegex,
            messageOverride: "is not a valid password",
          },
        },
      },
      distance: {
        rules: {
          [MIN_VALUE]: 40,
        },
      },
      state: {
        rules: {
          [MIN_LENGTH]: {
            ruleProp: 2,
            messageOverride: "is not long enough",
          },
        },
      },
      country: {
        rules: {
          [MAX_LENGTH]: {
            ruleProp: 5,
            messageOverride: "is wayyy too long",
          },
        },
      },
      price: {
        rules: {
          [MIN_VALUE]: {
            ruleProp: 60,
            messageOverride: "is too great",
          },
        },
      },
      age: {
        rules: {
          [MAX_VALUE]: {
            ruleProp: 70,
            messageOverride: "is too high",
          },
        },
      },
    };

    expect(validate(newData, newConfig)).toEqual({
      valid: false,
      errorState: {
        [EMAIL]: ["Email is not valid"],
        price: ["Price is too great"],
        distance: [],
        [PASSWORD]: [
          "Password is not a valid password",
          "Password is not a valid password",
        ],
        genre: [],
        [NAME]: ["Name is way too long"],
        city: ["City is very much required"],
        state: ["State is not long enough"],
        country: ["Country is wayyy too long"],
        age: ["Age is too high"],
      },
    });
  });
});
