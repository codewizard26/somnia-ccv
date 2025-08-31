"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Vault, 
  History, 
  Settings, 
  Wallet,
  TrendingUp,
  Shield
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navigation = [
  {
    name: "Vault",
    href: "/dashboard",
    icon: Vault,
    description: "Manage your vault deposits and withdrawals"
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: History,
    description: "View transaction history"
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configure your preferences"
  }
]

const stats = [
  {
    name: "Total Value Locked",
    value: "$1,234,567",
    icon: TrendingUp,
    change: "+12.5%",
    changeType: "positive"
  },
  {
    name: "APY",
    value: "8.5%",
    icon: Shield,
    change: "+0.2%",
    changeType: "positive"
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Vault</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs opacity-70">{item.description}</span>
                </div>
              </Button>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-4" />

      {/* Stats */}
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Vault Stats
        </h3>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.name}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className={cn(
                "text-sm font-medium",
                stat.changeType === "positive" ? "text-green-600" : "text-red-600"
              )}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
