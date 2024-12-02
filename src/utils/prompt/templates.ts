import { stripIndent } from 'common-tags';

export const baseTemplate = stripIndent`
  Generate a PR description based on the following information.
  Focus on concrete technical changes and avoid assumptions about business impact unless explicitly stated.

  PR Guidelines:
  %pr_guidelines%

  Code Changes:
  %diff%

  Requirements:
  - Keep descriptions factual and based solely on the provided information
  - Include technical details that are visible in the code changes
  - Avoid speculative improvements or impacts
`;

export const contextTemplate = stripIndent`
  Additional Context (use this as the primary source for business justification):
  %context%
`;

export const prLayoutTemplate = stripIndent`
  Fill in the following PR template, preserving all existing formatting and sections:
  %pr_template%

  Note: Only modify the sections meant to be filled. Keep all other parts of the template unchanged.
`;
