import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, order_id, customer_name, customer_email, customer_phone } = body

    // Validate required fields
    if (!amount || !order_id) {
      return NextResponse.json({ error: "Amount and order_id are required" }, { status: 400 })
    }

    const tokenKey = process.env.ZAPUPI_TOKEN_KEY
    const secretKey = process.env.ZAPUPI_SECRET_KEY

    if (!tokenKey || !secretKey) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })
    }

    // Prepare form data for ZapUPI API
    const formData = new URLSearchParams({
      token_key: tokenKey,
      secret_key: secretKey,
      amount: amount.toString(),
      order_id: order_id,
      customer_name: customer_name || "GameArena User",
      customer_email: customer_email || "user@gamearena.com",
      customer_phone: customer_phone || "9999999999",
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment-success`,
      webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment-webhook`,
    })

    console.log("[v0] Making payment request to ZapUPI API")

    // Make request to ZapUPI API
    const response = await fetch("https://api.zapupi.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const result = await response.json()

    console.log("[v0] ZapUPI API response:", result)

    if (!response.ok) {
      throw new Error(result.message || "Payment gateway error")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Payment API error:", error)
    return NextResponse.json(
      {
        error: "Payment processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
