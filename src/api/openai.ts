import { oneLineTrim } from 'common-tags';

const MODELS_PRIORITY = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-3.5',
    'gpt-3',
];

const OPENAI_API_URL = 'https://api.openai.com/v1';

export class OpenAIService {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async getPRDescription(
        prompt: string,
        options: PRDescriptionOptions = {},
    ): Promise<string> {
        try {
            const model = await this.getModel();

            const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
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
                    temperature: 0.3,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const completion = await response.json();

            if (!completion.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from OpenAI API');
            }

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating PR description:', error);
            throw error;
        }
    }

    private getSystemPrompt({
        withContext,
        withTemplate,
    }: PRDescriptionOptions) {
        let systemPrompt = oneLineTrim`
            You are a technical reviewer helping to draft a precise and structured PR description.
            Your task is to analyze the provided code diff and PR guidelines to create a well-organized PR description.

            Key requirements:
            1. If any part lacks sufficient information, keep it brief rather than making assumptions.
            2. Preserve any existing template structure, formatting, or additional sections exactly as provided.
        `;

        if (withContext) {
            systemPrompt += oneLineTrim`
                In this case, there is additional context provided.
                Use this context as the primary source for the business benefits and technical justification.
                Do not include any reasoning that isn't supported by the provided context.
            `;
        } else {
            systemPrompt += oneLineTrim`
                No specific business context is provided.
                Focus solely on the technical changes visible in the diff.
                Keep the related parts minimal and strictly based on technical necessities shown in the code.
            `;
        }

        if (withTemplate) {
            systemPrompt += oneLineTrim`
                A PR template is provided.
                Fill ONLY the designated sections while preserving all other template parts exactly as they are.
                Maintain all formatting, whitespace, and special characters from the template.
                Do not modify or remove any template sections that aren't meant to be filled.
            `;
        } else {
            systemPrompt += oneLineTrim`
                Structure the PR description with clear sections based on the provided PR description guidelines.
                Include only factual, code-based information in each section.
                Add a "Technical Notes" section only if there are important implementation details or considerations.
            `;
        }

        return systemPrompt;
    }

    private async getModel(): Promise<string> {
        const models = await this.fetchModelsList();

        if (!models || models.length === 0) {
            throw new Error('No models available');
        }

        const model = MODELS_PRIORITY.find((model) => models?.includes(model));

        if (!model) {
            throw new Error('No suitable model found');
        }

        return model;
    }

    private async fetchModelsList(): Promise<string[]> {
        const response = await fetch(`${OPENAI_API_URL}/models`, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const result = await response.json();

        if (!Array.isArray(result?.data)) {
            throw new Error('Invalid response format from OpenAI API');
        }

        return result.data.map((model: { id: string }) => model.id);
    }
}

export type PRDescriptionOptions = {
    withContext?: boolean;
    withTemplate?: boolean;
};
