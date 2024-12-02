import { describe, expect, it, vi, afterEach } from 'vitest';
import { OpenAIService, type PRDescriptionOptions } from './openai';

describe('OpenAIService', () => {
    const mockApiKey = 'mock-api-key';
    let openAIService: OpenAIService;
    let fetchMock: any;

    beforeEach(() => {
        fetchMock = vi.fn();
        global.fetch = fetchMock;
        openAIService = new OpenAIService(mockApiKey);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getPRDescription', () => {
        it('should return PR description with default system prompt and correct temperature', async () => {
            const mockPrompt = 'Test prompt';
            fetchMock
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'gpt-4o' }] }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            choices: [
                                {
                                    message: {
                                        content: 'Generated PR description',
                                    },
                                },
                            ],
                        }),
                });

            const result = await openAIService.getPRDescription(mockPrompt);

            expect(result).toBe('Generated PR description');
            
            // Check models request
            expect(fetchMock).toHaveBeenNthCalledWith(
                1,
                'https://api.openai.com/v1/models',
                expect.objectContaining({
                    headers: {
                        'Authorization': 'Bearer mock-api-key',
                    },
                }),
            );

            // Check chat completion request
            const [, completionRequest] = fetchMock.mock.lastCall;
            const requestBody = JSON.parse(completionRequest.body);
            
            expect(completionRequest).toMatchObject({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-api-key',
                },
            });
            expect(requestBody).toMatchObject({
                model: 'gpt-4o',
                temperature: 0.2,
                messages: [
                    {
                        role: 'system',
                        content: expect.stringContaining('You are a technical reviewer'),
                    },
                    {
                        role: 'user',
                        content: mockPrompt,
                    },
                ],
            });

            // Verify key requirements in system prompt
            expect(requestBody.messages[0].content).toContain('keep it brief rather than making assumptions');
            expect(requestBody.messages[0].content).toContain('Include only factual, code-based information');
            expect(requestBody.messages[0].content).toContain('based on the provided PR description guidelines');
        });

        it('should provide strict context usage instructions when context is provided', async () => {
            const mockPrompt = 'Test prompt';
            const mockOptions: PRDescriptionOptions = { withContext: true };
            fetchMock
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'gpt-4o' }] }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            choices: [
                                {
                                    message: {
                                        content: 'Generated PR description with context',
                                    },
                                },
                            ],
                        }),
                });

            const result = await openAIService.getPRDescription(mockPrompt, mockOptions);

            expect(result).toBe('Generated PR description with context');
            
            const [, completionRequest] = fetchMock.mock.lastCall;
            const requestBody = JSON.parse(completionRequest.body);
            
            // Verify context usage instructions
            expect(requestBody.messages[0].content).toContain('In this case, there is additional context provided');
            expect(requestBody.messages[0].content).toContain('Use this context as the primary source');
            expect(requestBody.messages[0].content).toContain('Do not include any reasoning that isn\'t supported');
        });

        it('should enforce minimal speculation when no context is provided', async () => {
            const mockPrompt = 'Test prompt';
            const mockOptions: PRDescriptionOptions = { withContext: false };
            fetchMock
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'gpt-4o' }] }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            choices: [
                                {
                                    message: {
                                        content: 'Generated PR description without context',
                                    },
                                },
                            ],
                        }),
                });

            const result = await openAIService.getPRDescription(mockPrompt, mockOptions);

            expect(result).toBe('Generated PR description without context');
            
            const [, completionRequest] = fetchMock.mock.lastCall;
            const requestBody = JSON.parse(completionRequest.body);
            
            // Verify minimal speculation instructions
            expect(requestBody.messages[0].content).toContain('Focus solely on the technical changes');
            expect(requestBody.messages[0].content).toContain('Keep the related parts minimal');
            expect(requestBody.messages[0].content).toContain('strictly based on technical necessities');
        });



        it('should throw an error if no suitable models are available', async () => {
            const mockPrompt = 'Test prompt';
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: 'custom-model' }] }),
            });

            await expect(openAIService.getPRDescription(mockPrompt)).rejects.toThrow(
                'No suitable model found',
            );
        });

        it('should throw an error if no models are available', async () => {
            const mockPrompt = 'Test prompt';
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [] }),
            });

            await expect(openAIService.getPRDescription(mockPrompt)).rejects.toThrow(
                'No models available',
            );
        });

        it('should throw an error if models API request fails', async () => {
            const mockPrompt = 'Test prompt';
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
            });

            await expect(openAIService.getPRDescription(mockPrompt)).rejects.toThrow(
                'OpenAI API error: Unauthorized',
            );
        });

        it('should throw an error if chat completion API request fails', async () => {
            const mockPrompt = 'Test prompt';
            fetchMock
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'gpt-4o' }] }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    statusText: 'Bad Request',
                });

            await expect(openAIService.getPRDescription(mockPrompt)).rejects.toThrow(
                'OpenAI API error: Bad Request',
            );
        });

        it('should throw an error if chat completion response is malformed', async () => {
            const mockPrompt = 'Test prompt';
            fetchMock
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'gpt-4o' }] }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({}), // Missing choices array
                });

            await expect(openAIService.getPRDescription(mockPrompt)).rejects.toThrow(
                'Invalid response format from OpenAI API'
            );
        });
    });
});
