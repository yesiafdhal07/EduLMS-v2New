import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.FONNTE_API_KEY;
        if (!apiKey) {
            console.error('[WA Proxy] Missing FONNTE_API_KEY');
            // Log as dev_simulated if no key in dev
            if (process.env.NODE_ENV !== 'production') {
                return NextResponse.json({ success: true, status: 'dev_simulated' });
            }
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const body = await req.json();
        const { target, message } = body;

        if (!target || !message) {
            return NextResponse.json({ error: 'Missing target or message' }, { status: 400 });
        }

        const formData = new FormData();
        formData.append('target', target);
        formData.append('message', message);
        formData.append('countryCode', '62');

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: apiKey },
            body: formData,
        });

        const json = await response.json();
        
        if (!response.ok || !json.status) {
            return NextResponse.json({ success: false, error: json.reason ?? 'Fonnte error', status: json.status }, { status: 400 });
        }

        return NextResponse.json({ success: true, status: json.status });
    } catch (error) {
        console.error('[WA Proxy] Network error:', error);
        return NextResponse.json({ error: 'Network error' }, { status: 500 });
    }
}
