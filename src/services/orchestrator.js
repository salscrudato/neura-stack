/* eslint-disable camelcase */
const GROQ_KEY   = process.env.REACT_APP_GROQ_API_KEY;
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
const XAI_KEY    = process.env.REACT_APP_XAI_API_KEY;
const PRO_TIER   = process.env.REACT_APP_PRO_TIER === 'true';

async function extractIntent(prompt) {
  const res = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You MUST respond ONLY with valid JSON containing the keys intent, entities, tone, length, and constraints. ' +
              'Do not include any text outside the JSON object. Example: {"intent": "query", "entities": [], "tone": "neutral", "length": "short", "constraints": []}'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 256,
        temperature: 0.2
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq intent extraction failed: ${err}`);
  }
  const data = await res.json();
  const content = data.choices[0].message.content.trim();
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Invalid JSON response from Groq:', content);
    throw new Error('Invalid JSON response from intent extraction');
  }
}

async function callGeminiFlash(prompt) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Flash error: ${err}`);
  }
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || ''
  );
}

async function callOpenAI35(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`OpenAI-3.5 error: ${err.error?.message || 'Unknown error'}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGrok(prompt) {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_KEY}`
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok synthesis error: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOpenAI4o(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a senior researcher.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GPT-4o error: ${err.error?.message || 'Unknown error'}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

export default async function orchestrator(originalPrompt) {
  const meta = await extractIntent(originalPrompt);

  const [flashDraft, turboDraft] = await Promise.all([
    callGeminiFlash(originalPrompt),
    callOpenAI4o(originalPrompt)
  ]);

  const grokPrompt = `
### USER INTENT
${JSON.stringify(meta, null, 2)}
---
### CANDIDATE A (Gemini Flash)
${flashDraft}
---
### CANDIDATE B (GPT-3.5 Turbo)
${turboDraft}
---
Merge into a single best answer. Then output {"confidence":0-1} on a new line.`;

  let finalAnswer = await callGrok(grokPrompt);
  let confidence = 0.9;
  const match = finalAnswer.match(/\\{[^}]*confidence[^}]*}/);
  if (match) {
    try {
      confidence = JSON.parse(match[0]).confidence;
    } catch {/* ignore */}
  }

  if (confidence < 0.6 && PRO_TIER) {
    finalAnswer = await callOpenAI4o(
      `Improve this low-confidence answer (${confidence}).\n\n${finalAnswer}`
    );
    confidence = 1;
  }

  return {
    flashDraft,
    turboDraft,
    finalAnswer,
    confidence
  };
}