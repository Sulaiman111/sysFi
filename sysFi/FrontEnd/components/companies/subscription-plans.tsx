"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon } from "lucide-react"

interface FeatureProps {
  text: string
  included: boolean
}

const Feature = ({ text, included }: FeatureProps) => (
  <div className="flex items-center space-x-2 rtl:space-x-reverse">
    {included ? (
      <CheckIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XIcon className="h-5 w-5 text-gray-300" />
    )}
    <span className={included ? "font-medium" : "text-gray-500"}>{text}</span>
  </div>
)

interface SubscriptionPlansProps {
  onSelectPlan: (plan: string) => void
  currentPlan?: string
}

export function SubscriptionPlans({ onSelectPlan, currentPlan }: SubscriptionPlansProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className={currentPlan === "basic" ? "border-primary" : ""}>
        <CardHeader>
          <CardTitle>الخطة الأساسية</CardTitle>
          <CardDescription>مناسبة للشركات الصغيرة والناشئة</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">$50</span>
            <span className="text-muted-foreground"> / شهريًا</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Feature text="حتى 5 مستخدمين مصرح لهم" included={true} />
            <Feature text="حتى 50 عميل" included={true} />
            <Feature text="إدارة الفواتير الأساسية" included={true} />
            <Feature text="تقارير شهرية" included={true} />
            <Feature text="دعم عبر البريد الإلكتروني" included={true} />
            <Feature text="تخصيص التقارير" included={false} />
            <Feature text="تكامل مع أنظمة خارجية" included={false} />
            <Feature text="دعم على مدار الساعة" included={false} />
            <Feature text="نسخ احتياطي متقدم" included={false} />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant={currentPlan === "basic" ? "outline" : "default"}
            onClick={() => onSelectPlan("basic")}
          >
            {currentPlan === "basic" ? "الخطة الحالية" : "اختيار الخطة"}
          </Button>
        </CardFooter>
      </Card>

      <Card className={`${currentPlan === "premium" ? "border-primary" : ""} border-amber-500`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>الخطة المتميزة</CardTitle>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">الأكثر شعبية</span>
          </div>
          <CardDescription>مناسبة للشركات المتوسطة</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">$100</span>
            <span className="text-muted-foreground"> / شهريًا</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Feature text="حتى 15 مستخدم مصرح له" included={true} />
            <Feature text="حتى 200 عميل" included={true} />
            <Feature text="إدارة فواتير متقدمة" included={true} />
            <Feature text="تقارير أسبوعية" included={true} />
            <Feature text="دعم عبر البريد الإلكتروني والهاتف" included={true} />
            <Feature text="تخصيص التقارير" included={true} />
            <Feature text="تكامل مع أنظمة خارجية" included={true} />
            <Feature text="دعم على مدار الساعة" included={false} />
            <Feature text="نسخ احتياطي متقدم" included={false} />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant={currentPlan === "premium" ? "outline" : "default"}
            onClick={() => onSelectPlan("premium")}
          >
            {currentPlan === "premium" ? "الخطة الحالية" : "اختيار الخطة"}
          </Button>
        </CardFooter>
      </Card>

      <Card className={`${currentPlan === "enterprise" ? "border-primary" : ""} border-purple-500`}>
        <CardHeader>
          <CardTitle>خطة المؤسسات</CardTitle>
          <CardDescription>مناسبة للشركات الكبيرة والمؤسسات</CardDescription>
          <div className="mt-4">
            <span className="text-3xl font-bold">$200</span>
            <span className="text-muted-foreground"> / شهريًا</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Feature text="عدد غير محدود من المستخدمين" included={true} />
            <Feature text="عدد غير محدود من العملاء" included={true} />
            <Feature text="إدارة فواتير متقدمة" included={true} />
            <Feature text="تقارير مخصصة" included={true} />
            <Feature text="دعم متميز على مدار الساعة" included={true} />
            <Feature text="تخصيص التقارير" included={true} />
            <Feature text="تكامل مع أنظمة خارجية" included={true} />
            <Feature text="دعم على مدار الساعة" included={true} />
            <Feature text="نسخ احتياطي متقدم" included={true} />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant={currentPlan === "enterprise" ? "outline" : "default"}
            onClick={() => onSelectPlan("enterprise")}
          >
            {currentPlan === "enterprise" ? "الخطة الحالية" : "اختيار الخطة"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}