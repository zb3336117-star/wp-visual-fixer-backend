export default async function handler(req, res) {
    // CORS headers taake tumhari extension is backend se baat kar sake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, class: className, html } = req.body;
        
        // Vercel ke dashboard se hum GEMINI_API_KEY uthayenge
        const apiKey = process.env.GEMINI_API_KEY; 
        
        // Google AI Studio (Gemini 1.5 Pro) ka endpoint URL
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        // Gemini ke liye professional system prompt
        const promptText = `You are an expert WordPress and CSS developer. I am giving you the HTML context of a broken element on a website.
        HTML Context: ${html}
        Element ID: ${id || 'None'}
        Element Class: ${className || 'None'}
        
        Output ONLY the clean, minified custom CSS that fixes this element's alignment, layout gaps, padding, or responsiveness. Do not write any explanations, markdown formatting, or code blocks. Just output raw CSS.`;

        // Gemini API ko request bhejna
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        
        // Gemini ka response extract karna
        const generatedCss = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ css: generatedCss.trim() });

    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
}