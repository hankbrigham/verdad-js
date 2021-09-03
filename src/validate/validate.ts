/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import {
  MAX_LENGTH,
  MIN_LENGTH,
  REQUIRED,
  PATTERN,
  EMAIL,
  PASSWORD,
  emailRegex,
  // passwordRegex,
  MIN_VALUE,
  MAX_VALUE,
  passwordRegex,
} from "../constants";
import { capitalizeFirstLetter } from "../utils";

const OBJECT = "object";

const noErrorState = { error: false, message: "" };

type RuleProp = string | number | boolean | RegExp;
type RuleData = {
  ruleProp: RuleProp;
  messageOverride: string;
};

type RequiredRule = {
  [REQUIRED]: boolean | RuleData;
};

type MaxLengthRule = {
  [MAX_LENGTH]: number | RuleData;
};

type MinLengthRule = {
  [MIN_LENGTH]: number | RuleData;
};

type MaxValueRule = {
  [MAX_VALUE]: number | RuleData;
};

type MinValueRule = {
  [MIN_VALUE]: number | RuleData;
};

type EmailRule = {
  [EMAIL]: boolean | RuleData;
};

type PatternRule = {
  [PATTERN]: RegExp | RuleData;
};

type PasswordRule = {
  [PASSWORD]: boolean | RuleData;
};

type Rules =
  | RequiredRule
  | MaxLengthRule
  | MinLengthRule
  | MinValueRule
  | EmailRule
  | PatternRule
  | PasswordRule
  | MaxValueRule;

type RuleOverrides = {
  [key: string]: RegExp;
};

type ValidationResponse<T> = {
  valid: boolean;
  errorState: ErrorState<T>;
};

type EdgeCase = [rule: string, ruleData: RuleData];

type RuleConfig = {
  label?: string;
  rules: Rules;
};

export type ValidationConfig<T> = {
  [Property in keyof T]?: RuleConfig | ValidationConfig<T[Property]>;
};

export type ErrorState<T> = {
  [Property in keyof T]?: T[Property] extends []
    ? ErrorState<T[Property]>
    : string[];
} & {
  [X: string]: any; // this should be string[] but loooot of code to change
};

type Tuple<T> = [keyof T, unknown];

export const validate = <T = any>(
  data: T,
  validationConfig: ValidationConfig<T>,
  ruleOverrides?: RuleOverrides
): ValidationResponse<T> => {
  let valid = true;
  const keyPairs = Object.entries(data) as Array<Tuple<T>>;

  const runValidations = (
    edgeCases: EdgeCase[],
    key: keyof T,
    value: unknown,
    label: string
  ) => {
    const errors: Array<string> = [];
    edgeCases.forEach((edgeCase) => {
      const [rule, ruleData] = edgeCase;
      const ruleProp = ruleData.ruleProp || ruleData;
      const messageOverride = ruleData.messageOverride || null;

      const { error, message } = executeValidation(
        rule,
        value,
        ruleProp,
        messageOverride,
        ruleOverrides
      );

      if (error) {
        if (valid) {
          valid = false;
        }
        const displayLabel = capitalizeFirstLetter(label || (key as string));
        errors.push(`${displayLabel} ${message}`);
      }
    });
    return errors;
  };

  const findErrors = (
    pairs: Array<Tuple<T>>,
    configNode: ValidationConfig<T>
  ) => {
    const errorState: ErrorState<T> = {};

    for (let i = 0; i < pairs.length; i++) {
      const [key, value] = pairs[i] as Tuple<T>;

      if (typeof configNode !== OBJECT || Array.isArray(value)) {
        (errorState[key] as string[]) = [];
        continue;
      }

      if (value && typeof value === OBJECT) {
        const errors = findErrors(
          Object.entries(value) as Array<Tuple<T>>,
          configNode[key] as ValidationConfig<typeof key>
        );
        (errorState[key] as ErrorState<T>) = errors;
        continue;
      }

      const validationNode = configNode[key];

      if (!validationNode) {
        (errorState[key] as string[]) = [];
        continue;
      }

      const { rules, label } = validationNode as RuleConfig;
      const edgeCases: EdgeCase[] = Object.entries(rules);

      const errors = runValidations(edgeCases, key, value, label);
      (errorState[key] as string[]) = errors;
    }
    return errorState;
  };

  const errorState = findErrors(keyPairs, validationConfig);
  return { valid, errorState };
};

const checkIsRequired = (value?: string | number, override?: string) => {
  if (!value) {
    if (override) {
      return { error: true, message: override };
    }
    return { error: true, message: "is required" };
  }
  return noErrorState;
};

const checkMaxLength = (
  ruleProp: number,
  value?: string,
  override?: string
) => {
  if (value && value.length > ruleProp) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: `must be less than ${ruleProp + 1} characters in length`,
    };
  }
  return noErrorState;
};

const checkMinLength = (
  ruleProp: RuleProp,
  value?: string,
  override?: string
) => {
  if (value && value.length < ruleProp) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: `must be at least ${ruleProp} characters in length`,
    };
  }
  return noErrorState;
};

const checkMinValue = (ruleProp: number, value?: number, override?: string) => {
  if (value && value < ruleProp) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: `must be at least ${ruleProp} in value`,
    };
  }
  return noErrorState;
};

const checkMaxValue = (ruleProp: number, value?: number, override?: string) => {
  if (value && value > ruleProp) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: `must be less than ${ruleProp} in value`,
    };
  }
  return noErrorState;
};

const checkValidEmail = (value?: string, override?: string) => {
  if (value && !emailRegex.test(String(value).toLowerCase())) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: "is not a valid email address",
    };
  }
  return noErrorState;
};

const checkValidPassword = (
  value?: string,
  override?: string,
  ruleOverride?: RegExp
) => {
  const regexToTest = ruleOverride ? ruleOverride : passwordRegex;
  if (value && !regexToTest.test(String(value))) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: "must contain 1 special character and 1 number",
    };
  }
  return noErrorState;
};

const checkAgainstPattern = (
  pattern: RegExp,
  value?: string,
  override?: string
) => {
  if (value && !pattern.test(String(value))) {
    if (override) {
      return { error: true, message: override };
    }
    return {
      error: true,
      message: `input value does not conform to pattern: ${pattern}`,
    };
  }
  return noErrorState;
};

const executeValidation = (
  rule: string,
  value?: any,
  ruleProp?: any,
  override?: string,
  ruleOverrides?: RuleOverrides
) => {
  switch (rule) {
    case REQUIRED:
      return checkIsRequired(value, override);
    case MIN_LENGTH:
      return checkMinLength(ruleProp, value, override);
    case MAX_LENGTH:
      return checkMaxLength(ruleProp, value, override);
    case EMAIL:
      return checkValidEmail(value, override);
    case PASSWORD:
      return checkValidPassword(value, override, ruleOverrides?.password);
    case PATTERN:
      return checkAgainstPattern(ruleProp, value, override);
    case MIN_VALUE:
      return checkMinValue(ruleProp, value, override);
    case MAX_VALUE:
      return checkMaxValue(ruleProp, value, override);
    default:
      return { error: false, message: "" };
  }
};
