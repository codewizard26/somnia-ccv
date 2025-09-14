"use client"

import { useState } from "react"
import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">
          Configure your vault preferences and account settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600">Receive updates about your vault activity</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Security</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              >
                Enable
              </Button>
            </div>
            <Separator className="bg-slate-200" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Session Management</p>
                <p className="text-sm text-slate-600">View and manage active sessions</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              >
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
