"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Building,
  Calendar,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  FileText,
  CreditCard,
  Trash,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { CompanyForm } from "@/components/companies/company-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// دالة للحصول على بيانات الشركة (محاكاة لطلب API)
const getCompanyData = (id: string) => {
  return {
    id,
    name: "Tech Solutions Inc.",
    contactEmail: "info@techsolutions.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
    website: "https://techsolutions.com",
    taxNumber: "TAX-12345678",
    subscriptionType: "premium" as const,
    subscriptionStatus: "active" as const,
    subscriptionEndDate: "2024-12-31",
    registrationDate: "2023-01-15",
    authorizedUsers: [
      { id: "user1", name: "John Doe", email: "john@example.com", role: "Admin" },
      { id: "user2", name: "Jane Smith", email: "jane@example.com", role: "Manager" },
    ],
    customers: 28,
    notes: "Key enterprise client with multiple departments. Prefers email communication for technical issues.",
    logo: "",
  }
}

// دالة للحصول على عملاء الشركة (محاكاة لطلب API)
const getCompanyCustomers = (id: string) => {
  return [
    {
      id: "CUST-001",
      name: "Acme Corporation",
      email: "contact@acme.com",
      phone: "+1 (555) 111-2222",
      totalSpent: 12500,
      lastInvoice: "2024-05-10",
    },
    {
      id: "CUST-002",
      name: "Globex Industries",
      email: "info@globex.com",
      phone: "+1 (555) 333-4444",
      totalSpent: 8750,
      lastInvoice: "2024-05-05",
    },
    {
      id: "CUST-003",
      name: "Initech LLC",
      email: "support@initech.com",
      phone: "+1 (555) 555-6666",
      totalSpent: 5200,
      lastInvoice: "2024-04-28",
    },
  ]
}

// دالة للحصول على فواتير الشركة (محاكاة لطلب API)
const getCompanyInvoices = (id: string) => {
  return [
    {
      id: "INV-001",
      customer: "Acme Corporation",
      amount: 2500,
      status: "paid",
      date: "2024-05-10",
      dueDate: "2024-05-24",
    },
    {
      id: "INV-002",
      customer: "Globex Industries",
      amount: 1750,
      status: "pending",
      date: "2024-05-05",
      dueDate: "2024-05-19",
    },
    {
      id: "INV-003",
      customer: "Initech LLC",
      amount: 3200,
      status: "overdue",
      date: "2024-04-28",
      dueDate: "2024-05-12",
    },
  ]
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState(getCompanyData(companyId))
  const [customers, setCustomers] = useState(getCompanyCustomers(companyId))
  const [invoices, setInvoices] = useState(getCompanyInvoices(companyId))
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Create a properly typed company object for the form
  // Update the companyFormData to include all required properties
  const companyFormData = {
    id: company.id,
    name: company.name,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    address: company.address,
    website: company.website,
    taxNumber: company.taxNumber,
    subscriptionType: company.subscriptionType,
    subscriptionStatus: company.subscriptionStatus,
    subscriptionEndDate: company.subscriptionEndDate,
    customers: company.customers,
    notes: company.notes,
    logo: company.logo,
    // Add the missing properties
    registrationDate: company.registrationDate,
    authorizedUsers: company.authorizedUsers.length // Convert array to number count
  }

  const handleEditCompany = (updatedCompany: any) => {
    setIsLoading(true)
    // محاكاة طلب API
    setTimeout(() => {
      setCompany({ ...company, ...updatedCompany })
      setIsEditDialogOpen(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleDeleteCompany = () => {
    setIsLoading(true)
    // محاكاة طلب API
    setTimeout(() => {
      router.push('/companies')
    }, 1000)
  }

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">نشط</Badge>
      case "expired":
        return <Badge className="bg-red-500">منتهي</Badge>
      case "trial":
        return <Badge className="bg-blue-500">تجريبي</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getSubscriptionTypeBadge = (type: string) => {
    switch (type) {
      case "basic":
        return <Badge variant="outline">أساسي</Badge>
      case "premium":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">متميز</Badge>
      case "enterprise":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">مؤسسة</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">تفاصيل الشركة</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            تعديل
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>معلومات الشركة</CardTitle>
            <CardDescription>عرض وإدارة تفاصيل الشركة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Avatar className="h-24 w-24">
                {company.logo ? (
                  <AvatarImage src={company.logo} alt={company.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {company.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{company.name}</h3>
                <p className="text-sm text-muted-foreground">
                  تاريخ التسجيل: {formatDate(company.registrationDate)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{company.contactEmail}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{company.contactPhone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{company.address}</span>
              </div>
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{company.website}</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>الرقم الضريبي: {company.taxNumber}</span>
              </div>
            </div>

            {company.notes && (
              <div>
                <h4 className="font-medium mb-2">ملاحظات</h4>
                <p className="text-sm text-muted-foreground">{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>معلومات الاشتراك</CardTitle>
            <CardDescription>عرض وإدارة تفاصيل اشتراك الشركة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">نوع الاشتراك</h4>
                <div>{getSubscriptionTypeBadge(company.subscriptionType)}</div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">حالة الاشتراك</h4>
                <div>{getSubscriptionStatusBadge(company.subscriptionStatus)}</div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">تاريخ انتهاء الاشتراك</h4>
                <div className="font-medium">{formatDate(company.subscriptionEndDate)}</div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">عدد العملاء</h4>
                <div className="font-medium">{company.customers}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">المستخدمون المصرح لهم</h4>
                <Button variant="outline" size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  إضافة مستخدم
                </Button>
              </div>
              <div className="space-y-2">
                {company.authorizedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
        </TabsList>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>عملاء الشركة</CardTitle>
              <CardDescription>قائمة بجميع عملاء الشركة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>إجمالي المبيعات</TableHead>
                    <TableHead>آخر فاتورة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(customer.lastInvoice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>فواتير الشركة</CardTitle>
              <CardDescription>قائمة بجميع فواتير الشركة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإصدار</TableHead>
                    <TableHead>تاريخ الاستحقاق</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            invoice.status === "paid"
                              ? "bg-green-500"
                              : invoice.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        >
                          {invoice.status === "paid"
                            ? "مدفوعة"
                            : invoice.status === "pending"
                            ? "معلقة"
                            : "متأخرة"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* حوار تعديل الشركة */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل الشركة</DialogTitle>
            <DialogDescription>قم بتعديل معلومات الشركة.</DialogDescription>
          </DialogHeader>
          <CompanyForm
            company={companyFormData}
            onSubmit={handleEditCompany}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* حوار حذف الشركة */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الشركة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الشركة؟ سيؤدي هذا إلى حذف جميع البيانات المرتبطة بها. هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany} disabled={isLoading}>
              {isLoading ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار إضافة مستخدم */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم مصرح له</DialogTitle>
            <DialogDescription>
              أضف مستخدمًا جديدًا للوصول إلى معلومات هذه الشركة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="user" className="text-sm font-medium">المستخدم</label>
              <select id="user" className="w-full p-2 border rounded-md">
                <option value="">اختر مستخدمًا...</option>
                <option value="user3">محمد أحمد (mohamed@example.com)</option>
                <option value="user4">سارة خالد (sarah@example.com)</option>
                <option value="user5">أحمد محمود (ahmed@example.com)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">الدور</label>
              <select id="role" className="w-full p-2 border rounded-md">
                <option value="">اختر دورًا...</option>
                <option value="admin">مدير</option>
                <option value="manager">مشرف</option>
                <option value="user">مستخدم</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              إلغاء
            </Button>
            <Button>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// استيراد مكونات الجدول
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"