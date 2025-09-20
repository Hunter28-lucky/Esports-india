"use client"

import { useState, useEffect } from "react"
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
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [verificationAttempts, setVerificationAttempts] = useState(0)

  const quickAmounts = ["100", "500", "1000", "2000", "5000"]

  const handleQuickAmountSelect = (value: string) => {
    setSelectedAmount(value)
    setAmount(value)
  }

  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomChars = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `GA${timestamp}${randomChars}`
  }

  const verifyPayment = async (orderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId }),
      })

      const result = await response.json()
      return result.status === "success"
    } catch (error) {
      console.error("[v0] Payment verification error:", error)
      return false
    }
  }

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (currentOrderId && paymentStatus === "processing") {
      pollInterval = setInterval(async () => {
        const isVerified = await verifyPayment(currentOrderId)

        if (isVerified) {
          console.log("[v0] Payment verified successfully")
          setPaymentStatus("success")
          onPaymentSuccess(Number.parseFloat(amount))
          setCurrentOrderId(null)
          setVerificationAttempts(0)

          setTimeout(() => {
            onClose()
            setPaymentStatus("idle")
            setAmount("")
            setSelectedAmount("")
          }, 2000)
        } else {
          setVerificationAttempts((prev) => prev + 1)

          if (verificationAttempts >= 30) {
            setPaymentStatus("error")
            setErrorMessage("Payment verification timeout. Please contact support if payment was deducted.")
            setCurrentOrderId(null)
            setVerificationAttempts(0)
          }
        }
      }, 10000)
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [currentOrderId, paymentStatus, verificationAttempts, amount, onPaymentSuccess, onClose])

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
      setCurrentOrderId(orderId)

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
        if (result.payment_url) {
          window.open(result.payment_url, "_blank")
        }

        console.log("[v0] Payment URL opened, waiting for verification...")
        setIsProcessing(false)
      } else {
        throw new Error(result.message || "Payment failed")
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      setPaymentStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.")
      setCurrentOrderId(null)
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing && paymentStatus !== "processing") {
      onClose()
      setPaymentStatus("idle")
      setAmount("")
      setSelectedAmount("")
      setErrorMessage("")
      setCurrentOrderId(null)
      setVerificationAttempts(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-black border-red-900/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentType === "wallet" ? (
              <>
                <Wallet className="w-5 h-5 text-red-400" />
                Add Money to Wallet
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-red-400" />
                Join Tournament
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {paymentType === "wallet"
              ? "Add funds to your GameArena wallet securely"
              : `Pay entry fee for ${tournamentName}`}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-400">
              {paymentType === "wallet"
                ? `₹${amount} has been added to your wallet`
                : `You've successfully joined ${tournamentName}`}
            </p>
          </div>
        ) : paymentStatus === "error" ? (
          <div className="text-center py-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Payment Failed</h3>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <Button
              onClick={() => {
                setPaymentStatus("idle")
                setCurrentOrderId(null)
                setVerificationAttempts(0)
              }}
              variant="outline"
              className="border-red-900/20 text-gray-300 hover:bg-gray-900"
            >
              Try Again
            </Button>
          </div>
        ) : paymentStatus === "processing" ? (
          <div className="text-center py-6">
            <Loader2 className="w-16 h-16 text-red-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Verifying Payment...</h3>
            <p className="text-gray-400 mb-2">Please complete the payment in the opened window</p>
            <p className="text-sm text-gray-500">Checking payment status... (Attempt {verificationAttempts + 1}/30)</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-900 rounded-lg border border-red-900/20">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">Secured by ZapUPI Gateway</span>
              <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                SSL
              </Badge>
            </div>

            {paymentType === "tournament" && (
              <Card className="bg-gray-900 border-red-900/20 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-white">{tournamentName}</h4>
                    <p className="text-sm text-gray-400">Entry Fee</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-400">₹{entryFee}</p>
                  </div>
                </div>
              </Card>
            )}

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
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "border-red-900/20 text-gray-300 hover:bg-gray-900"
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
                    className="bg-gray-900 border-red-900/20 text-white placeholder:text-gray-400 focus:border-red-500"
                    min="1"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white">Payment Method</Label>
              <Select defaultValue="upi">
                <SelectTrigger className="bg-gray-900 border-red-900/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-red-900/20">
                  <SelectItem value="upi" className="text-white hover:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      UPI Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="card" className="text-white hover:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      Credit/Debit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="netbanking" className="text-white hover:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      Net Banking
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{errorMessage}</span>
              </div>
            )}

            <Card className="bg-gray-900 border-red-900/20 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">₹{amount || "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee</span>
                  <span className="text-white">₹0</span>
                </div>
                <hr className="border-red-900/20" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-red-400">₹{amount || "0"}</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 border-red-900/20 text-gray-300 hover:bg-gray-900 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
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
