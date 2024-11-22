import { oneLineTrim } from "common-tags";

const MODELS_PRIORITY = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
    "gpt-3.5",
    "gpt-3",
];

const OPENAI_API_URL = "https://api.openai.com/v1";

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
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: this.getSystemPrompt(options),
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const completion = await response.json();

            if (!completion.choices?.[0]?.message?.content) {
                throw new Error("Invalid response format from OpenAI API");
            }

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Error generating PR description:", error);
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
            throw new Error("No models available");
        }

        const model = MODELS_PRIORITY.find((model) => models?.includes(model));

        if (!model) {
            throw new Error("No suitable model found");
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
            throw new Error("Invalid response format from OpenAI API");
        }

        return result.data.map((model: { id: string }) => model.id);
    }
}

export type PRDescriptionOptions = {
    withContext?: boolean;
    withTemplate?: boolean;
};
