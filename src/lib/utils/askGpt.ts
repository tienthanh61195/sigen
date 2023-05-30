import axios from 'axios';

const openaiToken = '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';

// const configuration = new Configuration({
//   apiKey: openaiToken,
// });
const chatgptApi = axios.create({
	baseURL: 'https://api.openai.com/v1/chat/completions',
	headers: { Authorization: `Bearer ${openaiToken}` }
});

export default async function askGpt(prompt: string) {
	return (
		await chatgptApi.post('', {
			max_tokens: 2000,
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.7
		})
	).data.choices[0].message.content;
}
