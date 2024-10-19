import { stripIndent } from 'common-tags';
import { getPrompt } from './prompt';

describe('getPrompt', () => {
    const guidelines = "Follow the team's coding standards.";
    const diff = 'Modified function getPrompt to handle edge cases.';
    const context =
        'The change addresses issue #123 and improves code quality.';
    const prTemplate =
        'Please mention the issue number and provide testing instructions.';

    it('should generate the correct prompt when all inputs are provided', () => {
        const result = getPrompt({
            guidelines,
            diff,
            context,
            prTemplate,
        });

        const expectedOutput = stripIndent`
          Generate a PR description to be set on GitHub based on the following guidelines:

          PR Guidelines:
          Follow the team's coding standards.

          Code Diff:
          Modified function getPrompt to handle edge cases.

          Context:
          The change addresses issue #123 and improves code quality.

          Please fill the PR description into the provided PR template:
          Please mention the issue number and provide testing instructions.
        `;

        expect(result).toEqual(expectedOutput);
    });

    it('should generate the correct prompt when context is not provided', () => {
        const result = getPrompt({
            guidelines,
            diff,
            context: undefined,
            prTemplate,
        });

        const expectedOutput = stripIndent`
          Generate a PR description to be set on GitHub based on the following guidelines:

          PR Guidelines:
          Follow the team's coding standards.

          Code Diff:
          Modified function getPrompt to handle edge cases.

          Please fill the PR description into the provided PR template:
          Please mention the issue number and provide testing instructions.
        `;

        expect(result).toBe(expectedOutput);
    });

    it('should generate the correct prompt when prTemplate is not provided', () => {
        const result = getPrompt({
            guidelines,
            diff,
            context,
            prTemplate: undefined,
        });

        const expectedOutput = stripIndent`
          Generate a PR description to be set on GitHub based on the following guidelines:

          PR Guidelines:
          Follow the team's coding standards.

          Code Diff:
          Modified function getPrompt to handle edge cases.

          Context:
          The change addresses issue #123 and improves code quality.
        `;

        expect(result).toBe(expectedOutput);
    });

    it('should generate the correct prompt when neither context nor prTemplate are provided', () => {
        const result = getPrompt({
            guidelines,
            diff,
            context: undefined,
            prTemplate: undefined,
        });

        const expectedOutput = stripIndent`
          Generate a PR description to be set on GitHub based on the following guidelines:

          PR Guidelines:
          Follow the team's coding standards.

          Code Diff:
          Modified function getPrompt to handle edge cases.
        `;

        expect(result).toBe(expectedOutput);
    });
});
