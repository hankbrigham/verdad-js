export type ErrorPair = string[];

export type ErrorNode = {
  [key: string]: ErrorPair | ErrorNode;
};

export type ErrorState = {
  [key: string]: ErrorNode | ErrorPair;
};
