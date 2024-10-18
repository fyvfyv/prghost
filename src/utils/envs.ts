import dotenv from 'dotenv';
dotenv.config();

export const envs = () => {
    const github = process.env.GITHUB_TOKEN;
    const openai = process.env.OPENAI_TOKEN;

    if (!github) {
        throw new Error('GITHUB_TOKEN is not set');
    }

    if (!openai) {
        throw new Error('OPENAI_TOKEN is not set');
    }

    return {
        github,
        openai,
    };
};
