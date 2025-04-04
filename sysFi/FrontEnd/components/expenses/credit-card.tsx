"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { FormLabel } from "@/components/ui/form"

export function CreditCard() {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Limit to 16 digits
    const trimmed = digits.slice(0, 16)

    // Add spaces after every 4 digits
    const formatted = trimmed.replace(/(\d{4})(?=\d)/g, "$1 ")

    return formatted
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Limit to 4 digits
    const trimmed = digits.slice(0, 4)

    // Add slash after first 2 digits
    if (trimmed.length > 2) {
      return `${trimmed.slice(0, 2)}/${trimmed.slice(2)}`
    }

    return trimmed
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setExpiryDate(formatted)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit to 3 or 4 digits
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCvv(digits)
  }

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Card Number</FormLabel>
        <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={handleCardNumberChange} />
      </div>
      <div>
        <FormLabel>Cardholder Name</FormLabel>
        <Input placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel>Expiry Date</FormLabel>
          <Input placeholder="MM/YY" value={expiryDate} onChange={handleExpiryDateChange} />
        </div>
        <div>
          <FormLabel>CVV</FormLabel>
          <Input placeholder="123" value={cvv} onChange={handleCvvChange} type="password" />
        </div>
      </div>
    </div>
  )
}

