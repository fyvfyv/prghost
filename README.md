[![npm version](https://badge.fury.io/js/prghost.svg)](https://badge.fury.io/js/prghost)

# AI-Generated Pull Request Description

This repo contains a script that uses AI to automatically create helpful pull request (PR) descriptions based on the changes (diff), guidelines, and templates in the repo. It utilizes OpenAI to generate clear, concise summaries, making it easier for teams to collaborate and review code.

## Features

- Automatically generates PR descriptions based on the changes (diff) in the PR.
- Uses customizable PR description guidelines from `.pr_guidelines.md`.
- Checks for a pull request template located at `.github/pull_request_template.md` to structure the PR description.
- Enhances PR descriptions with AI-generated text via OpenAI.
- Handles GitHub authentication with a `GITHUB_TOKEN` and OpenAI authentication with an `OPENAI_TOKEN`.
- Utilizes a prioritized list of AI models for generating high-quality descriptions (details below).

## AI Models

The script uses the following OpenAI models in order of priority to generate the pull request descriptions:

```javascript
const MODELS_PRIORITY = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-3.5',
    'gpt-3',
];
```

### Important Notes:
- At least one of these models **must** be available, and your `OPENAI_TOKEN` needs to have the appropriate permissions to access the chosen model(s).
- The more advanced the model, the better the quality and clarity of the generated PR descriptions.
- If the higher-priority models (e.g., `gpt-4o` or `gpt-4-turbo`) are available, expect better and more context-aware PR summaries.
  Lower-priority models like `gpt-3` or `gpt-3.5` will still generate good results but may not be as sophisticated.

## Prerequisites

Before running the script, ensure you have the following:

1. **GitHub Token**: A GitHub token is required to interact with the GitHub API.
   - Set your GitHub token in the environment variable `GITHUB_TOKEN` or define it in the `.env` file **located in the root of the target repository where the script is executed**, not the script's folder.

2. **OpenAI Token**: An OpenAI API token is required to generate the PR descriptions.
   - Set your OpenAI token in the environment variable `OPENAI_TOKEN` or define it in the `.env` file **located in the root of the target repository where the script is executed**, not the script's folder.
   - Ensure your `OPENAI_TOKEN` has access to one of the AI models listed above.

> **Important**: The `.env` file, containing both `GITHUB_TOKEN` and `OPENAI_TOKEN`, must be located in the **target repository** (the repository where the script will be run). Do not place these tokens in the `.env` file of the script's folder.

## Usage

To run the script, follow these steps:

1. Ensure your PR guidelines file exists:
   - Make sure the `.pr_guidelines.md` file is located in the root of the repository. If it does not exist, a [fallback file](src/utils/guidelines/.pr_guidelines.md) will be used.

2. Ensure there is a PR template:
   - Check if the `.github/pull_request_template.md` file exists in your repository. This template will be used to structure the PR description. If not, the script will generate a more flexible PR description.

3. **Ensure your `.env` file in the target repository is correctly set up**:
   - Add both `GITHUB_TOKEN` and `OPENAI_TOKEN` to the `.env` file located in the root of the repository where the script is being executed.

4. Run the script:
   ```bash
   npx prghost run
   ```

5. The script will:
   - Retrieve the current branch name and repository information.
   - Get or create the corresponding PR.
   - Ask for additional context for the PR (if needed). This context will be used in prompt generation.
      You can add relevant information such as business logic, task details, or anything that might help the AI generate a more accurate description.
   - Fetch the PR diff.
   - Use the guidelines, template, and diff to generate a prompt for OpenAI.
   - Generate a PR description and update it on GitHub.

6. After successful execution, the script will automatically update the PR description on GitHub with the generated text.

## Configuration

- **PR Guidelines**: Located in `.pr_guidelines.md` in the root of the repository. If this file is missing, the script will use a [fallback](src/utils/guidelines/.pr_guidelines.md).
- **PR Template (optional)**: The script checks for `.github/pull_request_template.md` to structure the PR description.
- **Environment Variables**:
   - `GITHUB_TOKEN`: GitHub API token for authentication. Set this in the `.env` file located in the root of the **target repository** where the script will be executed.
   - `OPENAI_TOKEN`: OpenAI API token for generating PR descriptions and accessing one of the required models. Set this in the `.env` file located in the root of the **target repository** where the script will be executed.

## Example Workflow

1. Create a new branch and commit changes.
2. Push the branch and create a PR on GitHub (if a PR is not created, it will be created automatically).
3. Run the script to automatically generate and update the PR description with AI.
4. Review the PR with the generated description for clarity and context.

## Troubleshooting

- **Repository Information Not Found**:
  If the script cannot retrieve the repository information, ensure that you're inside a valid Git repository and have the necessary permissions to access it.

- **PR Number Not Found**:
  Make sure that the branch has been pushed to the remote repository and that the GitHub token has the correct permissions to create or retrieve PRs.

- **PR Description Not Generated**:
  Verify that your OpenAI token is valid, has access to at least one of the required models, and that the API quota hasn't been exceeded.

## License

This project is licensed under the MIT License.

## Contributions

Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute to this project.
