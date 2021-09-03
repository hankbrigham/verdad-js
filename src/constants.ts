export const MAX_LENGTH = "maxLength";
export const MIN_LENGTH = "minLength";
export const REQUIRED = "required";
export const PATTERN = "pattern";
export const MIN_VALUE = "minValue";
export const MAX_VALUE = "maxValue";
export const EMAIL = "email";
export const PASSWORD = "password";
// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line

// eslint-disable-next-line no-useless-escape
export const passwordRegex =
  /^(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&/,><\’:;|_~`])\S{8,99}$/;
