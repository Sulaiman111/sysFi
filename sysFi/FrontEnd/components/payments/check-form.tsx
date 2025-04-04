"use client"

import { useState } from "react"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CheckFormProps {
  onChange: (data: any) => void
}

export function CheckForm({ onChange }: CheckFormProps) {
  const [chequeNumber, setChequeNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [branchName, setBranchName] = useState("")
  const [chequeDate, setChequeDate] = useState<Date | undefined>(undefined)
  const [accountNumber, setAccountNumber] = useState("")

  // Update parent component when any field changes
  const updateParent = () => {
    onChange({
      chequeNumber,
      bankName,
      branchName,
      chequeDate: chequeDate ? format(chequeDate, "yyyy-MM-dd") : "",
      accountNumber,
    })
  }

  return (
    <div className="space-y-4 ">
      <h3 className="font-medium">Cheque Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 ">
        <div>
          <FormLabel>Cheque Number</FormLabel>
          <Input 
            placeholder="Enter cheque number" 
            value={chequeNumber}
            onChange={(e) => {
              setChequeNumber(e.target.value)
              setTimeout(updateParent, 0)
            }}
            required
          />
        </div>
        <div>
          <FormLabel>Bank Name</FormLabel>
          <Input
            placeholder="Enter bank name"
            value={bankName}
            onChange={(e) => {
              setBankName(e.target.value)
              setTimeout(updateParent, 0)
            }}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel>Branch Name</FormLabel>
          <Input
            placeholder="Enter branch name"
            value={branchName}
            onChange={(e) => {
              setBranchName(e.target.value)
              setTimeout(updateParent, 0)
            }}
          />
        </div>
        <div>
          <FormLabel>Account Number</FormLabel>
          <Input
            placeholder="Enter account number"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value)
              setTimeout(updateParent, 0)
            }}
          />
        </div>
      </div>
      <div>
        <FormLabel>Cheque Date</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !chequeDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {chequeDate ? format(chequeDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={chequeDate}
              onSelect={(date) => {
                setChequeDate(date)
                setTimeout(() => {
                  onChange({
                    chequeNumber,
                    bankName,
                    branchName,
                    chequeDate: date ? format(date, "yyyy-MM-dd") : "",
                    accountNumber,
                  })
                }, 0)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}