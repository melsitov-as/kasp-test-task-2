export const escapedQuoteInsideDoubleQuotesRegex: RegExp =
  /"(?:[^"\\]|\\.)*?\\"(?:[^"\\]|\\.)*?"/g;
export const regularQuotesRegex: RegExp = /"([^"]*)"/g;

export const escapedQuoteInsideTypographicQuotesRegex: RegExp =
  /“(?:[^“\\]|\\.)*?\\“(?:[^“\\]|\\.)*?“/g;

export const typographicQuotesRegex: RegExp = /“([^”]*)”/g;

export const regexBetweenQuotes: RegExp = /"([^"]*)"(.*?)"([^"]*)"/;

export const logicalOperatorsRegex: RegExp = /\b(OR|AND|NOT)\b/g;
