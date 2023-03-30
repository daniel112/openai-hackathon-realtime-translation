export interface Translation {
  text: string;
  transcriptionTime: number;
  translationTime: number;
}

/**
 * Example:
 * {
 *   0: {text: "foobar", translationTime: 1234, transcriptionTime: 1234},
 *   1: {text: "Hello there", translationTime: 1234, transcriptionTime: 1234},
 *    ...
 * }
 */
export interface TranslationMap {
  /**
   * key is group number
   */
  [key: number]: Translation;
}
// saying: "the cat jumps"
// { 0: {text: "the"}}
// { 0: {text: "the c"}}
// { 0: {text: "the cat"}}
// pause
// { 1: {text: "the cat"}}
// { 1: {text: "ju"}}
// { 1: {text: "jumps"}}

/**
 * Function to take the average of all translationTime
 * @param translationMap
 * @returns {number} - time in seconds fixed to 3 decimal places
 */
export const averageTranslationTime = (
  translationMap: TranslationMap
): number => {
  const translationTimes = Object.values(translationMap).map(
    (item: Translation) => item.translationTime
  );
  const sum = translationTimes.reduce((acc, cur) => acc + cur, 0);
  const average = sum / translationTimes.length;
  return parseFloat(average.toFixed(3));
};

/**
 * Function to take the average of all translationTime
 * @param translationMap
 * @returns {number} - time in seconds fixed to 3 decimal places
 */
export const averageTranscriptionTime = (
  translationMap: TranslationMap
): number => {
  const transcriptionTimes = Object.values(translationMap).map(
    (item: Translation) => item.transcriptionTime
  );
  const sum = transcriptionTimes.reduce((acc, cur) => acc + cur, 0);
  const average = sum / transcriptionTimes.length;
  return parseFloat(average.toFixed(3));
};

/**
 * Combines the translated string values in order of grouping
 * @param obj
 * @returns {string} - combined translated string
 */
export const combineValuesInOrder = (obj: TranslationMap) => {
  // Get an array of the object keys in numerical order
  const keys = Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b);

  // Loop through the array of keys and concatenate the corresponding values into a string
  let result = '';
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result += obj[key].text + ' ';
  }

  // Return the resulting string
  return result.trim();
};
