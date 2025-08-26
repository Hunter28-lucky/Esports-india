import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()

    const orderId = body.get("order_id") as string
    const status = body.get("status") as string
    const amount = body.get("amount") as string
    const transactionId = body.get("transaction_id") as string

    console.log("[v0] Payment webhook received:", {
      orderId,
      status,
      amount,
      transactionId,
    })

    // Verify the webhook signature here in production
    // const signature = body.get('signature') as string
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    // }

    if (status === "success") {
      // Update user wallet or tournament registration in database
      console.log("[v0] Payment successful, updating user account")

      // In a real app, you would:
      // 1. Update user's wallet balance in database
      // 2. Register user for tournament if applicable
      // 3. Send confirmation email/notification
      // 4. Log the transaction
    }

    return NextResponse.json({ status: "received" })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
