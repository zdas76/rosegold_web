const generatedNumbers = new Set();

export const getUniqueRandomNumber = () => {
    let randomNumber;
    do {
        randomNumber = Math.round(Math.random() * 5555);
    } while (generatedNumbers.has(randomNumber));

    generatedNumbers.add(randomNumber);
    return randomNumber;
};
