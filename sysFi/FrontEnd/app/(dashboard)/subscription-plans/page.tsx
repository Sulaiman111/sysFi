"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionPlans } from "@/components/companies/subscription-plans"

export default function SubscriptionPlansPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan)
  }

  const handleProceed = () => {
    if (selectedPlan) {
      // في التطبيق الحقيقي، يمكن توجيه المستخدم إلى صفحة الدفع أو صفحة تجديد الاشتراك
      router.push(`/companies/new?plan=${selectedPlan}`)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">خطط الاشتراك</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اختر الخطة المناسبة لاحتياجاتك</CardTitle>
          <CardDescription>
            قارن بين خطط الاشتراك المختلفة واختر الخطة التي تناسب احتياجات شركتك.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
              <TabsTrigger value="monthly">دفع شهري</TabsTrigger>
              <TabsTrigger value="yearly">دفع سنوي (خصم 16%)</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <SubscriptionPlans onSelectPlan={handleSelectPlan} />
            </TabsContent>
            <TabsContent value="yearly">
              <SubscriptionPlans onSelectPlan={handleSelectPlan} />
            </TabsContent>
          </Tabs>

          {selectedPlan && (
            <div className="flex justify-center mt-8">
              <Button size="lg" onClick={handleProceed}>
                المتابعة مع الخطة {selectedPlan === "basic" ? "الأساسية" : selectedPlan === "premium" ? "المتميزة" : "المؤسسية"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الأسئلة الشائعة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">هل يمكنني تغيير خطتي لاحقًا؟</h3>
            <p className="text-muted-foreground">
              نعم، يمكنك ترقية خطتك في أي وقت. إذا قمت بالترقية، سيتم احتساب الفرق بين الخطتين على أساس تناسبي للفترة المتبقية من اشتراكك الحالي.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">هل هناك فترة تجريبية مجانية؟</h3>
            <p className="text-muted-foreground">
              نعم، نقدم فترة تجريبية مجانية لمدة 14 يومًا لجميع الخطط. يمكنك تجربة جميع الميزات خلال هذه الفترة قبل الالتزام بالدفع.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">ما هي طرق الدفع المقبولة؟</h3>
            <p className="text-muted-foreground">
              نقبل بطاقات الائتمان الرئيسية (Visa، MasterCard، American Express)، والتحويلات البنقية، وPayPal. إذا كنت بحاجة إلى طريقة دفع أخرى، يرجى الاتصال بفريق المبيعات.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">هل يمكنني إلغاء اشتراكي في أي وقت؟</h3>
            <p className="text-muted-foreground">
              نعم، يمكنك إلغاء اشتراكك في أي وقت. إذا قمت بالإلغاء، ستظل خطتك نشطة حتى نهاية فترة الفوترة الحالية.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">هل هناك خصومات للمؤسسات التعليمية أو غير الربحية؟</h3>
            <p className="text-muted-foreground">
              نعم، نقدم خصومات خاصة للمؤسسات التعليمية والمنظمات غير الربحية. يرجى الاتصال بفريق المبيعات للحصول على مزيد من المعلومات.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>هل تحتاج إلى مساعدة في اختيار الخطة المناسبة؟</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            فريق المبيعات لدينا جاهز لمساعدتك في اختيار الخطة المناسبة لاحتياجات شركتك. اتصل بنا اليوم للصول على استشارة مجانية.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline">
              جدولة مكالمة مع فريق المبيعات
            </Button>
            <Button variant="outline">
              الدردشة مع ممثل المبيعات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}