"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { SubscriptionRenewalForm } from "@/components/companies/subscription-renewal-form"

// دالة للحصول على بيانات الشركة (محاكاة لطلب API)
const getCompanyData = (id: string) => {
  return {
    id,
    name: "Tech Solutions Inc.",
    subscriptionType: "premium" as const,
    subscriptionEndDate: "2024-12-31",
  }
}

export default function RenewSubscriptionPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company] = useState(getCompanyData(companyId))
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newEndDate, setNewEndDate] = useState("")

  const handleRenewSubscription = (data: any) => {
      setIsLoading(true);
      
      // محاكاة طلب API لتجديد الاشتراك
      setTimeout(() => {
        // حساب تاريخ انتهاء الاشتراك الجديد
        const currentEndDate = new Date(company.subscriptionEndDate);
        const durationInMonths = parseInt(data.duration);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + durationInMonths);
        
        setNewEndDate(newEndDate.toISOString().split('T')[0]);
        setIsSuccess(true);
        setIsLoading(false);
      }, 2000);
    };
  
  if (isSuccess) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">تجديد الاشتراك</h2>
        </div>
        
        <div className="max-w-3xl mx-auto mt-8 p-8 border rounded-lg bg-green-50 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">تم تجديد الاشتراك بنجاح!</h2>
          <p className="text-lg mb-4">
            تم تجديد اشتراك {company.name} بنجاح.
          </p>
          <p className="font-medium">
            تاريخ انتهاء الاشتراك الجديد: {new Date(newEndDate).toLocaleDateString('ar-SA')}
          </p>
          <div className="mt-8 space-x-4">
            <Button onClick={() => router.push(`/companies/${companyId}`)}>
              العودة إلى صفحة الشركة
            </Button>
            <Button variant="outline" onClick={() => router.push('/companies')}>
              العودة إلى قائمة الشركات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">تجديد الاشتراك</h2>
      </div>
      
      <div className="mt-8">
        <SubscriptionRenewalForm 
          company={company} 
          onSubmit={handleRenewSubscription} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}