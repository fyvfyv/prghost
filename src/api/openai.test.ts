import OpenAI from 'openai';
import { describe, expect, it, vi } from 'vitest';
import { OpenAIService, type PRDescriptionOptions } from './openai';

vi.mock('openai');

describe('OpenAIService', () => {
    const mockApiKey = 'mock-api-key';
    let openAIService: OpenAIService;
    let mockOpenAI: any;

    beforeEach(() => {
        mockOpenAI = {
            chat: {
                completions: {
                    create: vi.fn(),
                },
            },
            models: {
                list: vi.fn(),
            },
        };
        (OpenAI as any).mockImplementation(() => mockOpenAI);
        openAIService = new OpenAIService(mockApiKey);
    });

    describe('getPRDescription', () => {
        it('should return PR description with default system prompt', async () => {
            const mockPrompt = 'Test prompt';
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'Generated PR description',
                        },
                    },
                ],
            };
            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'gpt-4o' }],
            });
            mockOpenAI.chat.completions.create.mockResolvedValueOnce(
                mockResponse,
            );

            const result = await openAIService.getPRDescription(mockPrompt);

            expect(result).toBe('Generated PR description');
            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: expect.stringContaining(
                            'You are a technical reviewer',
                        ),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });
        });

        it('should return PR description with system prompt including additional context', async () => {
            const mockPrompt = 'Test prompt';
            const mockOptions: PRDescriptionOptions = { withContext: true };
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'Generated PR description with context',
                        },
                    },
                ],
            };
            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'gpt-4o' }],
            });
            mockOpenAI.chat.completions.create.mockResolvedValueOnce(
                mockResponse,
            );

            const result = await openAIService.getPRDescription(
                mockPrompt,
                mockOptions,
            );

            expect(result).toBe('Generated PR description with context');
            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: expect.stringContaining(
                            'there is additional context provided',
                        ),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });
        });

        it('should return PR description with system prompt without business context', async () => {
            const mockPrompt = 'Test prompt';
            const mockOptions: PRDescriptionOptions = { withContext: false };
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'Generated PR description without context',
                        },
                    },
                ],
            };
            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'gpt-4o' }],
            });
            mockOpenAI.chat.completions.create.mockResolvedValueOnce(
                mockResponse,
            );

            const result = await openAIService.getPRDescription(
                mockPrompt,
                mockOptions,
            );

            expect(result).toBe('Generated PR description without context');
            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: expect.stringContaining(
                            'No specific business context is provided',
                        ),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });
        });

        it('should return PR description with template in system prompt', async () => {
            const mockPrompt = 'Test prompt';
            const mockOptions: PRDescriptionOptions = { withTemplate: true };
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'Generated PR description with template',
                        },
                    },
                ],
            };
            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'gpt-4o' }],
            });
            mockOpenAI.chat.completions.create.mockResolvedValueOnce(
                mockResponse,
            );

            const result = await openAIService.getPRDescription(
                mockPrompt,
                mockOptions,
            );

            expect(result).toBe('Generated PR description with template');
            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: expect.stringContaining(
                            'provided PR template',
                        ),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });
        });

        it('should return PR description with additional context and template in system prompt', async () => {
            const mockPrompt = 'Test prompt';
            const mockOptions: PRDescriptionOptions = {
                withContext: true,
                withTemplate: true,
            };
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content:
                                'Generated PR description with context and template',
                        },
                    },
                ],
            };
            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'gpt-4o' }],
            });
            mockOpenAI.chat.completions.create.mockResolvedValueOnce(
                mockResponse,
            );

            const result = await openAIService.getPRDescription(
                mockPrompt,
                mockOptions,
            );

            expect(result).toBe(
                'Generated PR description with context and template',
            );
            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content:
                            expect.stringContaining(
                                'In this case, there is additional context provided',
                            ) &&
                            expect.stringContaining(
                                'Ensure that the generated PR description follows the provided PR template',
                            ),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });
        });

        it('should return PR description using gpt-3.5-turbo if gpt-4o is unavailable', async () => {
            const mockPrompt = 'Test prompt';
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content:
                                'Generated PR description with gpt-3.5-turbo',
                        },
                    },
                ],
            };

            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'gpt-3.5-turbo' }],
            });
            mockOpenAI.chat.completions.create.mockResolvedValueOnce(
                mockResponse,
            );

            const result = await openAIService.getPRDescription(mockPrompt);

            expect(result).toBe('Generated PR description with gpt-3.5-turbo');
            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: expect.stringContaining(
                            'You are a technical reviewer',
                        ),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });
        });

        it('should throw an error if no models are available', async () => {
            const mockPrompt = 'Test prompt';

            mockOpenAI.models.list.mockResolvedValueOnce({
                data: [{ id: 'custom-model' }],
            });

            await expect(
                openAIService.getPRDescription(mockPrompt),
            ).rejects.toThrow('No suitable model found');
        });

        it('should throw an error if no models are available', async () => {
            const mockPrompt = 'Test prompt';

            mockOpenAI.models.list.mockResolvedValueOnce({ data: [] });

            await expect(
                openAIService.getPRDescription(mockPrompt),
            ).rejects.toThrow('No models available');
        });
    });
});
