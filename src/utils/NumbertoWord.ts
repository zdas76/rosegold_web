export const numberToWrod = (n: number): string => {
    if (n === 0) return "Zero";
    if (n < 0) return "Minus " + numberToWrod(-n);
    if (!Number.isSafeInteger(n)) return "Number too Large";

    // const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

    // const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
        // "sixteen", "seventeen", "eighteen", "nineteen"];

    // const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    // const thousands = ["", " thousand", " million", " billion", " trillion", " quadrillion", " quintillion"];


    // const threeDigitToWord = (n: number): string => {
    //     let str = "";

    //     const hundrad = Math.floor(n / 100);
    //     if (hundrad > 0) {
    //         str += ones[hundrad] + " hundred";
    //     }

    //     const remainder = n % 100;
    //     if (remainder >= 20) {
    //         if (str) str += " ";
    //         str += tens[Math.floor(remainder / 10)];
    //         const onesDigit = remainder % 10;
    //         if (onesDigit > 0) {
    //             str += " " + ones[onesDigit];
    //         }
    //     } else if (remainder >= 10) {
    //         if (str) str += " ";
    //         str += teens[remainder - 10];
    //     } else if (remainder > 0) {
    //         if (str) str += " ";
    //         str += ones[remainder];
    //     }

    //     return str;
    // }

    return ""; // Default return to satisfy function signature
}
export default numberToWrod;