import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getToolsForRole } from "@/lib/ai-tools/tools.registry";
import { executeTool } from "@/lib/ai-tools/tools.executor";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { /* no-op */ },
                },
            }
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { messages, userRole, userId, schoolId } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new NextResponse("Invalid messages format", { status: 400 });
        }

        // 1. Ensure the requesting user is the authenticated user
        const targetUserId = userId || user.id;
        if (targetUserId !== user.id) {
             return new NextResponse("Forbidden", { status: 403 });
        }

        // 2. Load Tools for the Role
        const roleTools = getToolsForRole(userRole);

        // 3. Define System Prompt specifically for Tool Calling Agent
        const systemMessage = {
            role: "system",
            content: `Anda adalah asisten AI khusus untuk role ${userRole} di platform Klolakelas. 
Anda dilengkapi dengan TOOLS/FUNCTIONS yang memungkinkan Anda mengakses data riil dari database.

ATURAN PENGGUNAAN TOOL:
1. Jika pengguna menanyakan sesuatu yang memerlukan data aktual (misal: "tugas apa yang belum", "siapa siswa berisiko", "buatkan tugas dari materi"), ANDA WAJIB MENGGUNAKAN TOOL yang relevan.
2. JANGAN PERNAH mengarang data (halusinasi). Jika tool mengembalikan data kosong, beri tahu pengguna bahwa datanya belum tersedia.
3. Gunakan bahasa yang natural dan sesuai dengan persona Anda (${userRole === 'siswa' ? 'Tutor santai dan suportif' : userRole === 'guru' ? 'Asisten pedagogik profesional' : userRole === 'orang_tua' ? 'Mitra pendidikan yang sopan' : 'Penasihat strategis berbasis data'}).
4. Jika hasil tool berupa JSON yang panjang, rangkum bagian pentingnya saja ke pengguna kecuali diminta detail.
5. Untuk tool 'draft_assignment' atau 'generate_differentiated_tasks', tampilkan hasilnya secara terstruktur (gunakan markdown) agar mudah dibaca pengguna.`
        };

        const apiMessages = [systemMessage, ...messages];

        // 4. Call OpenRouter
        const agentModel = process.env.AI_AGENT_MODEL || "qwen/qwen-2.5-72b-instruct:free";
        const openRouterPayload: any = {
            model: agentModel,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1500,
        };

        if (roleTools.length > 0) {
            openRouterPayload.tools = roleTools;
            openRouterPayload.tool_choice = "auto";
        }

        let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "Klolakelas AI Agent",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(openRouterPayload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("[AI Agent] OpenRouter API Error:", err);
            return new NextResponse("Error from AI provider", { status: 500 });
        }

        let data = await response.json();
        let responseMessage = data.choices[0].message;

        // 5. Handle Tool Calls
        if (responseMessage.tool_calls) {
            console.log("[AI Agent] Model requested tool calls:", responseMessage.tool_calls.map((t:any)=>t.function.name));
            
            // Append the assistant's message with tool_calls to the conversation
            apiMessages.push(responseMessage);

            // Execute all requested tools
            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                
                // Execute the actual tool
                const toolResult = await executeTool(userRole, targetUserId, schoolId, functionName, functionArgs);
                
                // Append the tool result to the conversation
                apiMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(toolResult),
                });
            }

            // 6. Call OpenRouter again with the tool results
            const secondPayload = {
                model: agentModel,
                messages: apiMessages,
                temperature: 0.7,
            };

            const secondResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                    "X-Title": "Klolakelas AI Agent",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(secondPayload)
            });

            if (!secondResponse.ok) {
                const err = await secondResponse.text();
                console.error("[AI Agent] OpenRouter API 2nd Error:", err);
                return new NextResponse("Error from AI provider during tool resolution", { status: 500 });
            }

            data = await secondResponse.json();
            responseMessage = data.choices[0].message;
        }

        // Return the final response text
        return NextResponse.json({ 
            role: "assistant", 
            content: responseMessage.content 
        });

    } catch (error: any) {
        console.error("[AI Agent] Internal Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
