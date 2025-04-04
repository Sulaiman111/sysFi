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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, CreditCard } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  subscriptionType: z.enum(["basic", "premium", "enterprise"]),
  duration: z.enum(["1", "6", "12"]),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "paypal"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  cardName: z.string().optional(),
});

interface SubscriptionRenewalFormProps {
  company: {
    id: string;
    name: string;
    subscriptionType: "basic" | "premium" | "enterprise";
    subscriptionEndDate: string;
  };
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

export function SubscriptionRenewalForm({ company, onSubmit, isLoading = false }: SubscriptionRenewalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionType: company.subscriptionType,
      duration: "12",
      paymentMethod: "credit_card",
    },
  });

  const watchPaymentMethod = form.watch("paymentMethod");
  const watchSubscriptionType = form.watch("subscriptionType");
  const watchDuration = form.watch("duration");

  // حساب سعر الاشتراك
  const getSubscriptionPrice = () => {
    const basePrice = {
      basic: 50,
      premium: 100,
      enterprise: 200,
    }[watchSubscriptionType];

    const durationMultiplier = {
      "1": 1,
      "6": 5.5,  // 6 months with a small discount
      "12": 10,  // 12 months with a larger discount
    }[watchDuration];

    return basePrice * durationMultiplier;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>تجديد اشتراك {company.name}</CardTitle>
        <CardDescription>
          تاريخ انتهاء الاشتراك الحالي: {new Date(company.subscriptionEndDate).toLocaleDateString('ar-SA')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                        <SelectItem value="basic">أساسي - $50/شهر</SelectItem>
                        <SelectItem value="premium">متميز - $100/شهر</SelectItem>
                        <SelectItem value="enterprise">مؤسسة - $200/شهر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      اختر نوع الاشتراك المناسب لاحتياجات شركتك.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مدة الاشتراك</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مدة الاشتراك" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">شهر واحد</SelectItem>
                        <SelectItem value="6">6 أشهر (خصم 8%)</SelectItem>
                        <SelectItem value="12">سنة كاملة (خصم 16%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      اختر مدة الاشتراك للحصول على خصومات على الاشتراكات طويلة المدى.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium mb-2">ملخص الاشتراك</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>نوع الاشتراك:</span>
                    <span>{watchSubscriptionType === "basic" ? "أساسي" : watchSubscriptionType === "premium" ? "متميز" : "مؤسسة"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المدة:</span>
                    <span>{watchDuration === "1" ? "شهر" : watchDuration === "6" ? "6 أشهر" : "سنة"}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>الإجمالي:</span>
                    <span>${getSubscriptionPrice()}</span>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>طريقة الدفع</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit_card" id="credit_card" />
                          <Label htmlFor="credit_card">بطاقة ائتمان</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                          <Label htmlFor="bank_transfer">تحويل بنكي</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPaymentMethod === "credit_card" && (
                <div className="space-y-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم على البطاقة</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكامل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم البطاقة</FormLabel>
                        <FormControl>
                          <Input placeholder="0000 0000 0000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cardExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الانتهاء</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardCvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز الأمان (CVC)</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {watchPaymentMethod === "bank_transfer" && (
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">معلومات التحويل البنكي</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    يرجى تحويل المبلغ إلى الحساب التالي:
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">اسم البنك:</span>
                      <span>البنك التجاري الدولي</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">اسم الحساب:</span>
                      <span>شركة إدارة الأنظمة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">رقم الحساب:</span>
                      <span>1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">IBAN:</span>
                      <span>SA1234567890123456789012</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    بعد إتمام التحويل، يرجى إرسال إيصال التحويل إلى البريد الإلكتروني: payments@example.com
                  </p>
                </div>
              )}

              {watchPaymentMethod === "paypal" && (
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    سيتم تحويلك إلى موقع PayPal لإتمام عملية الدفع بعد النقر على زر "تجديد الاشتراك".
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري المعالجة..." : "تجديد الاشتراك"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}