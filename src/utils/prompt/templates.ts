import { stripIndent } from 'common-tags';

export const baseTemplate = stripIndent`
  Generate a PR description to be set on GitHub based on the following guidelines:

  PR Guidelines:
  %pr_guidelines%

  Code Diff:
  %diff%
`;

export const contextTemplate = stripIndent`
  Context:
  %context%
`;

export const prLayoutTemplate = stripIndent`
  Please fill the PR description into the provided PR template:
  %pr_template%
`;
