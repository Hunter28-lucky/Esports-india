"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

export default function TestTournaments() {
  const [message, setMessage] = useState("This is a test component that works")

  return (
    <div className="p-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Test Tournaments Component</h2>
        <p className="mb-4">{message}</p>
        <Button onClick={() => setMessage("Button clicked!")}>Test Button</Button>
      </Card>
    </div>
  )
}
