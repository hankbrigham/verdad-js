# verdad-js

A dynamic and scalable validation library for javascript/typescript applications. Execute any combination of built-in and custom validation rules for your js code in any node environment.

## Installation

Using Yarn:

```shell
$ yarn add verdad-js
```

Using NPM:

```shell
$ npm i -g npm
$ npm i verdad-js
```

Verdad receives arguments for data and validation rule configuration to execute on said data, and returns arrays of strings with default or custom validation errors depending on configuration.

```js
import validate, { MAX_VALUE } from "verdad-js";

const data = {
  MPH: 70,
};

const config = {
  MPH: {
    rules: {
      [MAX_VALUE]: 60,
    },
  },
};

const { valid, errorState } = validate(data, config);
console.log(valid); // false
console.log(errorState); // { MPH: ["MPH must be less than 61" ]}
```

VerdadJS is perfect for forms where input values need to remain controlled and state is complex.

Have to validate an object's key that may not be ideal for users to see? No problem! VerdadJS allows for overriding error messages with custom labels and messageOverrides.

```js
import validate, { EMAIL, MAX_VALUE, MIN_VALUE, PATTERN, REQUIRED } from "verdad-js";

const data = {
  name: 'Harry Hood',
  email: 'harryhood',
  address: {
      streetOne: '171 Mr. Miner Road',
      streetTwo: '',
      city: 'Denver',
      state: 'CO',
      zipCode: 80030',
  }
};

const config = {
    name: {
        rules: {
            [REQUIRED]: true,
            [MAX_LENGTH]: 8,
            [MIN_LENGTH]: 3,
        },
    },
    email: {
        rules: {
            [REQUIRED]: true,
            [EMAIL]: true,
            [MIN_LENGTH]: 3,
        },
    },
    address: {
        streetOne: {
            rules: {
                [REQUIRED]: true,
                [MAX_LENGTH]: 8,
                [MIN_LENGTH]: 3,
            },
        },
        city: {
            rules: {
                [REQUIRED]: true,
            },
        },
        state: {
            rules: {
                [REQUIRED]: true,
            },
        },
    zipCode: {
        label: 'zip code',
        rules: {
            [REQUIRED]: true,
            [PATTERN]: {
                ruleProp: '/^\d{5}(-\d{4})?$/',
                messageOverride: "must conform to this format: 78746-3043",
            },
        },
    },'
};

const { valid, errorState } = validate(data, config);
console.log(valid); // false
console.log(errorState);
/*
    {
        name: [],
        email: ['email is not a valid email address', 'email must be less than 9 characters in length],
        address: {
            streetOne: [],
            streetTwo: [],
            city: []
            state: [],
            zipCode: ['zip code must conform to this format: 78746-3043'],
        }
    }
*/
```

# Why VerdadJS?

    * scales for object configuration of any nesting depth
    * fast and light-weight
    * extremely customizable
    * 100% test coverage

Take your validation code to the next level with VerdadJS!
