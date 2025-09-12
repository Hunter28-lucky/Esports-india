"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, Building } from "lucide-react"

interface WalletSectionProps {
  walletBalance: number
  onAddMoney: () => void
}

export function WalletSection({ walletBalance, onAddMoney }: WalletSectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const quickAmounts = [100, 500, 1000, 2000, 5000]

  const transactions = [
    {
      id: "1",
      type: "credit",
      description: "Tournament Win - Free Fire Championship",
      amount: 1500,
      date: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      type: "debit",
      description: "Tournament Entry - PUBG Mobile Pro",
      amount: 100,
      date: "5 hours ago",
      status: "completed",
    },
    {
      id: "3",
      type: "credit",
      description: "Wallet Top-up",
      amount: 2000,
      date: "1 day ago",
      status: "completed",
    },
    {
      id: "4",
      type: "debit",
      description: "Tournament Entry - Free Fire Championship",
      amount: 50,
      date: "2 days ago",
      status: "completed",
    },
    {
      id: "5",
      type: "credit",
      description: "Tournament Win - Valorant Masters",
      amount: 800,
      date: "3 days ago",
      status: "completed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-0 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Wallet Balance</h2>
                <p className="text-cyan-100 text-sm">Available for tournaments</p>
              </div>
            </div>
            <Button onClick={onAddMoney} className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Money
            </Button>
          </div>
          <div className="text-3xl font-bold mb-2">₹{walletBalance.toLocaleString()}</div>
          <p className="text-cyan-100 text-sm">Last updated: Just now</p>
        </div>
      </Card>

      {/* Quick Add Money */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Add Money</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                className={`${
                  selectedAmount === amount
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => setSelectedAmount(amount)}
              >
                ₹{amount}
              </Button>
            ))}
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Enter custom amount"
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
              onChange={(e) => setSelectedAmount(Number(e.target.value))}
            />
            <Button onClick={onAddMoney} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Add Money
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
              <CreditCard className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-white font-medium">Credit/Debit Card</p>
                <p className="text-slate-400 text-sm">Instant payment</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
              <Smartphone className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-medium">UPI</p>
                <p className="text-slate-400 text-sm">Quick & secure</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
              <Building className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white font-medium">Net Banking</p>
                <p className="text-slate-400 text-sm">All major banks</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === "credit" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {transaction.type === "credit" ? (
                    <ArrowDownLeft className="w-5 h-5 text-white" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-slate-400 text-sm">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                    {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                  </p>
                  <Badge className="bg-green-600 text-white border-0 text-xs">{transaction.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
