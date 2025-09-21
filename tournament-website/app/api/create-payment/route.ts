import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
  const { amount, order_id, customer_phone, customer_mobile, remark } = body

    // Validate required fields
    if (!amount || !order_id) {
      return NextResponse.json({ error: "Amount and order_id are required" }, { status: 400 })
    }

    // Prefer env vars; fall back to provided keys if not set (server-side only)
    const tokenKey = process.env.ZAPUPI_TOKEN_KEY || "c104bb9e5a72a5bc9bbd8b15ee18641f"
    const secretKey = process.env.ZAPUPI_SECRET_KEY || "9b2ed95f353a62ca2af39a25bf29b4e4"

    if (!tokenKey || !secretKey) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })
    }

    // Prepare form data for ZapUPI API (use documented params)
    const formData = new URLSearchParams()
    formData.set("token_key", tokenKey)
    formData.set("secret_key", secretKey)
    formData.set("amount", Math.round(Number(amount)).toString())
    formData.set("order_id", String(order_id))
    // docs use the key name "custumer_mobile"
    const mobile = customer_mobile || customer_phone || "9999999999"
    if (mobile) formData.set("custumer_mobile", String(mobile))
    // Redirect to site root to avoid non-existent page
    const siteRoot = process.env.NEXT_PUBLIC_SITE_URL || "https://esports-india.vercel.app"
    formData.set("redirect_url", siteRoot)
    if (remark) formData.set("remark", String(remark))

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

    if (!response.ok || result?.status === "error") {
      throw new Error(result?.message || "Payment gateway error")
    }

    // Return only what's needed by the client
    return NextResponse.json({
      status: result.status,
      message: result.message,
      payment_url: result.payment_url,
      order_id: result.order_id || order_id,
    })
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
