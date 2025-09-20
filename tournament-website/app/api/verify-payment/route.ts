import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const tokenKey = process.env.ZAPUPI_TOKEN_KEY
    const secretKey = process.env.ZAPUPI_SECRET_KEY

    if (!tokenKey || !secretKey) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })
    }

    const formData = new URLSearchParams({
      token_key: tokenKey,
      secret_key: secretKey,
      order_id: order_id,
    })

    console.log("[v0] Verifying payment for order:", order_id)

    const response = await fetch("https://api.zapupi.com/api/check-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const responseText = await response.text()
    console.log("[v0] Raw API response:", responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[v0] Failed to parse API response as JSON:", parseError)
      throw new Error("Invalid response from payment gateway")
    }

    console.log("[v0] Payment verification response:", result)

    if (!response.ok) {
      throw new Error(result.message || "Payment verification failed")
    }

    return NextResponse.json({
      status: result.status,
      order_id: order_id,
      amount: result.amount,
      transaction_id: result.transaction_id,
    })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json(
      {
        error: "Payment verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
