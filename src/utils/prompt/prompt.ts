import { baseTemplate, contextTemplate, prLayoutTemplate } from './templates';

type PromptParams = {
    guidelines: string;
    diff: string;
    context?: string;
    prTemplate?: string;
};

export const getPrompt = ({
    guidelines,
    diff,
    context,
    prTemplate,
}: PromptParams) => {
    let template = baseTemplate
        .replace('%pr_guidelines%', guidelines)
        .replace('%diff%', diff);

    if (context) {
        template = `${template}\n\n${contextTemplate.replace('%context%', context)}`;
    }

    if (prTemplate) {
        template = `${template}\n\n${prLayoutTemplate.replace('%pr_template%', prTemplate)}`;
    }

    return template;
};
