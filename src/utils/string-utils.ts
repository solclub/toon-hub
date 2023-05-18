export const toPascalCase = (str: string): string => {
  return str
    .replace(/(\w)(\w*)/g, (_, firstLetter, rest) => {
      return firstLetter.toUpperCase() + rest.toLowerCase();
    })
    .replace(/\s/g, "");
};
