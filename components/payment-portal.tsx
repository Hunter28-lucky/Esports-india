"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, CreditCard, Shield, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"

interface PaymentPortalProps {
  isOpen: boolean
  onClose: () => void
  paymentType: "wallet" | "tournament"
  tournamentName?: string
  entryFee?: number
  onPaymentSuccess: (amount: number) => void
}

export function PaymentPortal({
  isOpen,
  onClose,
  paymentType,
  tournamentName,
  entryFee,
  onPaymentSuccess,
}: PaymentPortalProps) {
  const [amount, setAmount] = useState(entryFee?.toString() || "")
  const [selectedAmount, setSelectedAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const quickAmounts = ["100", "500", "1000", "2000", "5000"]

  const handleQuickAmountSelect = (value: string) => {
    setSelectedAmount(value)
    setAmount(value)
  }

  const generateOrderId = () => {
    // Use format: GA + 6 digit timestamp + 4 random chars (e.g., GA123456ABCD)
    const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
    const randomChars = Math.random().toString(36).substr(2, 4).toUpperCase() // 4 random uppercase chars
    return `GA${timestamp}${randomChars}`
  }

  const handlePayment = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage("")

    try {
      const orderId = generateOrderId()

      console.log("[v0] Starting payment process for amount:", amount)

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          order_id: orderId,
          customer_name: "Alex Chen",
          customer_email: "alex.chen@gamearena.com",
          customer_phone: "9876543210",
        }),
      })

      const result = await response.json()

      console.log("[v0] Payment API response:", result)

      if (!response.ok) {
        throw new Error(result.message || result.error || "Payment failed")
      }

      if (result.status === "success" || result.payment_url) {
        // If ZapUPI returns a payment URL, redirect to it
        if (result.payment_url) {
          window.open(result.payment_url, "_blank")
        }

        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setPaymentStatus("success")
        onPaymentSuccess(Number.parseFloat(amount))

        // Close modal after success
        setTimeout(() => {
          onClose()
          setPaymentStatus("idle")
          setAmount("")
          setSelectedAmount("")
        }, 2000)
      } else {
        throw new Error(result.message || "Payment failed")
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      setPaymentStatus("idle")
      setAmount("")
      setSelectedAmount("")
      setErrorMessage("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentType === "wallet" ? (
              <>
                <Wallet className="w-5 h-5 text-cyan-400" />
                Add Money to Wallet
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-green-400" />
                Join Tournament
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {paymentType === "wallet"
              ? "Add funds to your GameArena wallet securely"
              : `Pay entry fee for ${tournamentName}`}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
            <p className="text-slate-400">
              {paymentType === "wallet"
                ? `₹${amount} has been added to your wallet`
                : `You've successfully joined ${tournamentName}`}
            </p>
          </div>
        ) : paymentStatus === "error" ? (
          <div className="text-center py-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Payment Failed</h3>
            <p className="text-slate-400 mb-4">{errorMessage}</p>
            <Button
              onClick={() => setPaymentStatus("idle")}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 p-3 bg-slate-700 rounded-lg">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">Secured by ZapUPI Gateway</span>
              <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                SSL
              </Badge>
            </div>

            {/* Tournament Info */}
            {paymentType === "tournament" && (
              <Card className="bg-slate-700 border-slate-600 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-white">{tournamentName}</h4>
                    <p className="text-sm text-slate-400">Entry Fee</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-400">₹{entryFee}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Amount Selection */}
            {paymentType === "wallet" && (
              <div className="space-y-4">
                <Label className="text-white">Select Amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant={selectedAmount === quickAmount ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickAmountSelect(quickAmount)}
                      className={
                        selectedAmount === quickAmount
                          ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                          : "border-slate-600 text-slate-300 hover:bg-slate-700"
                      }
                    >
                      ₹{quickAmount}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-amount" className="text-white">
                    Or enter custom amount
                  </Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setSelectedAmount("")
                    }}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500"
                    min="1"
                  />
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-white">Payment Method</Label>
              <Select defaultValue="upi">
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="upi" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      UPI Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="card" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      Credit/Debit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="netbanking" className="text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      Net Banking
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{errorMessage}</span>
              </div>
            )}

            {/* Payment Summary */}
            <Card className="bg-slate-700 border-slate-600 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white">₹{amount || "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Processing Fee</span>
                  <span className="text-white">₹0</span>
                </div>
                <hr className="border-slate-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-cyan-400">₹{amount || "0"}</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${amount || "0"}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
