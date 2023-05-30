import axios from 'axios';

// const configuration = new Configuration({
//   apiKey: openaiToken,
// });
const chatgptApi = axios.create({
	baseURL: 'https://api.openai.com/v1/chat/completions'
});

export default async function askGpt({ prompt, token }: { prompt: string; token: string }) {
	if (!token) return;
	return (
		await chatgptApi.post(
			'',
			{
				max_tokens: 2000,
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: prompt }],
				temperature: 0.7
			},
			{
				headers: { Authorization: `Bearer ${token}` }
			}
		)
	).data.choices[0].message.content;
}
