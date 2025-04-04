"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

const formSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يحتوي اسم الشركة على حرفين على الأقل" }),
  contactEmail: z.string().email({ message: "يرجى إدخال بريد إلكتروني صالح" }),
  contactPhone: z.string().min(5, { message: "يرجى إدخال رقم هاتف صالح" }),
  address: z.string().optional(),
  website: z.string().optional(),
  taxNumber: z.string().optional(),
  subscriptionType: z.enum(["basic", "premium", "enterprise"]),
  subscriptionEndDate: z.date({
    required_error: "يرجى اختيار تاريخ انتهاء الاشتراك",
  }),
  notes: z.string().optional(),
})

interface CompanyFormProps {
  company?: {
    id: string
    name: string
    contactEmail: string
    contactPhone: string
    address?: string
    website?: string
    taxNumber?: string
    subscriptionType: "basic" | "premium" | "enterprise"
    subscriptionStatus: "active" | "expired" | "trial"
    subscriptionEndDate: string
    registrationDate: string
    authorizedUsers: number
    customers: number
    notes?: string
  }
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CompanyForm({ company, onSubmit, onCancel, isLoading = false }: CompanyFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company?.name || "",
      contactEmail: company?.contactEmail || "",
      contactPhone: company?.contactPhone || "",
      address: company?.address || "",
      website: company?.website || "",
      taxNumber: company?.taxNumber || "",
      subscriptionType: company?.subscriptionType || "basic",
      subscriptionEndDate: company?.subscriptionEndDate ? new Date(company.subscriptionEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: company?.notes || "",
    },
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (company) {
      // إذا كنا نقوم بتعديل شركة موجودة
      onSubmit({
        ...company,
        ...values,
        subscriptionEndDate: values.subscriptionEndDate.toISOString().split("T")[0],
      })
    } else {
      // إذا كنا نقوم بإنشاء شركة جديدة
      onSubmit({
        ...values,
        subscriptionEndDate: values.subscriptionEndDate.toISOString().split("T")[0],
        subscriptionStatus: "active",
        registrationDate: new Date().toISOString().split("T")[0],
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الشركة</FormLabel>
                <FormControl>
                  <Input placeholder="اسم الشركة" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input placeholder="example@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl>
                  <Input placeholder="عنوان الشركة" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الموقع الإلكتروني</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرقم الضريبي</FormLabel>
                <FormControl>
                  <Input placeholder="الرقم الضريبي" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subscriptionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الاشتراك</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الاشتراك" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basic">أساسي</SelectItem>
                    <SelectItem value="premium">متميز</SelectItem>
                    <SelectItem value="enterprise">مؤسسة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subscriptionEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ انتهاء الاشتراك</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ar })
                        ) : (
                          <span>اختر تاريخًا</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أي ملاحظات إضافية حول الشركة"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : company ? "تحديث" : "إنشاء"}
          </Button>
        </div>
      </form>
    </Form>
  )
}