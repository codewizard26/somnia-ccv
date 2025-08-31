"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SnapshotModalProps {
    trigger: React.ReactNode
    title?: string
    data: Record<string, unknown>
    rootHash?: string
}

export function SnapshotModal({ trigger, title = "Snapshot Data", data, rootHash }: SnapshotModalProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{title}</span>
                        {rootHash && (
                            <span className="text-sm font-normal text-muted-foreground">
                                Root: {rootHash.slice(0, 8)}...{rootHash.slice(-8)}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 z-10"
                        >
                            {copied ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{JSON.stringify(data, null, 2)}</code>
                        </pre>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
