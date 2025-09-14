"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type Message = {
    role: "user" | "assistant"
    content: string
}

export default function VaultAIChat() {
    const [question, setQuestion] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Hi! I’m your Vault AI. Ask me about deposits, APY (currently 5%), staking, governance, or recent activity.",
        },
    ])
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [messages, loading])

    async function handleAsk() {
        if (!question.trim() || loading) return
        const userMessage: Message = { role: "user", content: question.trim() }
        setMessages((prev) => [...prev, userMessage])
        setQuestion("")
        setLoading(true)
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMessage.content }),
            })
            const data = await res.json()
            const aiContent = data?.answer || "No response received."
            setMessages((prev) => [...prev, { role: "assistant", content: aiContent }])
        } catch (err) {
            console.error(err)
            setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
        } finally {
            setLoading(false)
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleAsk()
        }
    }

    return (
        <Card className="border-purple-100">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-purple-900">Vault AI Assistant</CardTitle>
                        <CardDescription>Ask about vault activity, APY, staking, governance</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    ref={scrollRef}
                    className="h-72 overflow-y-auto rounded-lg border border-purple-100 bg-white p-4 space-y-4"
                >
                    {messages.map((m, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                            <div
                                className={
                                    "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " +
                                    (m.role === "assistant"
                                        ? "bg-purple-50 text-purple-600"
                                        : "bg-purple-100 text-purple-700")
                                }
                            >
                                {m.role === "assistant" ? (
                                    <Bot className="w-4 h-4" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div
                                    className={
                                        "rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap " +
                                        (m.role === "assistant"
                                            ? "bg-purple-50 text-purple-900 border border-purple-100"
                                            : "bg-white text-purple-900 border border-purple-100")
                                    }
                                >
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center space-x-3 text-purple-600">
                            <Spinner size={18} />
                            <span className="text-sm">Thinking…</span>
                        </div>
                    )}
                </div>

                <div className="flex items-end space-x-3">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about deposits, withdrawals, APY (5%), staking, governance…"
                        className="flex-1 min-h-[48px] max-h-32 resize-y rounded-lg border border-purple-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <Button onClick={handleAsk} disabled={loading || !question.trim()} className="h-11 px-4 bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? (
                            <Spinner className="text-white" />
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Send className="w-4 h-4" />
                                <span>Ask</span>
                            </div>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}


