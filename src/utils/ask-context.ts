import readline from 'node:readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export const askForContext = () => {
    return new Promise((resolve) => {
        rl.question('Please write some context: ', (inputText) => {
            rl.close();
            resolve(inputText);
        });
    });
};
