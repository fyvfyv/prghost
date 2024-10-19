import { oneLineTrim } from 'common-tags';
import OpenAI from 'openai';

const MODELS_PRIORITY = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-3.5',
    'gpt-3',
];

export class OpenAIService {
    private readonly api: OpenAI;

    constructor(apiKey: string) {
        this.api = new OpenAI({ apiKey });
    }

    public async getPRDescription(
        prompt: string,
        options: PRDescriptionOptions = {},
    ): Promise<string | null> {
        try {
            const model = await this.getModel();

            const completion = await this.api.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(options),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating PR description');
            throw error;
        }
    }

    private getSystemPrompt({
        withContext,
        withTemplate,
    }: PRDescriptionOptions) {
        let systemPrompt = oneLineTrim`
          You are a technical reviewer helping to draft a detailed, concious and structured PR description.
          Your task is to analyze the provided code diff and PR guidelines, and create a well-organized PR description.
      `;

        if (withContext) {
            systemPrompt += oneLineTrim`
                In this case, there is additional context provided.
                Use it to make the PR description more relevant to the business logic.
            `;
        } else {
            systemPrompt += oneLineTrim`
                No specific business context is provided,
                so focus solely on the technical changes.
            `;
        }

        if (withTemplate) {
            systemPrompt += oneLineTrim`
                Ensure that the generated PR description follows the provided PR template.
            `;
        } else {
            systemPrompt += oneLineTrim`
                There is no specific PR template provided. Generate
                a general PR description that includes a problem description,
                the solution implemented, and testing details.
            `;
        }

        return systemPrompt;
    }

    private async getModel(): Promise<string> {
        const models = await this.fetchModelsList();

        if (!models || models.length === 0) {
            throw new Error('No models available');
        }

        // Get the highest priority model that is available
        const model = MODELS_PRIORITY.find((model) => models?.includes(model));

        if (!model) {
            throw new Error('No suitable model found');
        }

        return model;
    }

    private async fetchModelsList(): Promise<string[]> {
        try {
            const models = await this.api.models.list();
            return models.data.map((model) => model.id);
        } catch (error) {
            console.error('Error getting models list');
            throw error;
        }
    }
}

export type PRDescriptionOptions = {
    withContext?: boolean;
    withTemplate?: boolean;
};
