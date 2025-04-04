"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

// بيانات تجريبية للشركات
const companiesData = [
  {
    id: "COMP-001",
    name: "Tech Solutions Inc.",
    subscriptionType: "premium",
    subscriptionStatus: "active",
    subscriptionEndDate: "2024-12-31",
    registrationDate: "2023-01-15",
    customers: 28,
    revenue: 12500,
  },
  {
    id: "COMP-002",
    name: "Global Enterprises",
    subscriptionType: "enterprise",
    subscriptionStatus: "active",
    subscriptionEndDate: "2024-10-15",
    registrationDate: "2023-02-20",
    customers: 45,
    revenue: 28750,
  },
  {
    id: "COMP-003",
    name: "Startup Innovations",
    subscriptionType: "basic",
    subscriptionStatus: "trial",
    subscriptionEndDate: "2024-06-30",
    registrationDate: "2023-05-10",
    customers: 7,
    revenue: 2200,
  },
  {
    id: "COMP-004",
    name: "Digital Solutions",
    subscriptionType: "premium",
    subscriptionStatus: "expired",
    subscriptionEndDate: "2024-04-15",
    registrationDate: "2023-03-05",
    customers: 19,
    revenue: 8500,
  },
  {
    id: "COMP-005",
    name: "Future Technologies",
    subscriptionType: "enterprise",
    subscriptionStatus: "active",
    subscriptionEndDate: "2024-11-20",
    registrationDate: "2023-04-12",
    customers: 32,
    revenue: 22000,
  },
]

// بيانات للرسم البياني للاشتراكات
const subscriptionTypeData = [
  { name: "أساسي", value: 8 },
  { name: "متميز", value: 15 },
  { name: "مؤسسة", value: 7 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

// بيانات للرسم البياني للإيرادات الشهرية
const revenueData = [
  { name: "يناير", revenue: 12500 },
  { name: "فبراير", revenue: 15000 },
  { name: "مارس", revenue: 18000 },
  { name: "أبريل", revenue: 16500 },
  { name: "مايو", revenue: 21000 },
  { name: "يونيو", revenue: 19500 },
]

export default function CompaniesDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // تصفية الشركات بناءً على البحث والتبويب النشط
  const filteredCompanies = companiesData.filter((company) => {
    // تصفية حسب البحث
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())

    // تصفية حسب التبويب
    if (activeTab === "all") return matchesSearch
    return matchesSearch && company.subscriptionStatus === activeTab
  })

  // حساب إحصائيات الشركات
  const totalCompanies = companiesData.length
  const activeCompanies = companiesData.filter((c) => c.subscriptionStatus === "active").length
  const expiringCompanies = companiesData.filter(
    (c) => 
      c.subscriptionStatus === "active" && 
      new Date(c.subscriptionEndDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length
  const totalRevenue = companiesData.reduce((sum, company) => sum + company.revenue, 0)

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
        <h2 className="text-3xl font-bold tracking-tight">لوحة تحكم الشركات</h2>
        <Button asChild>
          <Link href="/companies">عرض جميع الشركات</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الشركات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(totalCompanies * 0.1)} منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشركات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompanies}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeCompanies / totalCompanies) * 100)}% من إجمالي الشركات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اشتراكات ستنتهي قريبًا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringCompanies}</div>
            <p className="text-xs text-muted-foreground">
              خلال الـ 30 يومًا القادمة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +${Math.floor(totalRevenue * 0.15).toLocaleString()} منذ الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
            <CardDescription>إجمالي الإيرادات من اشتراكات الشركات شهريًا</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'الإيرادات']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>توزيع أنواع الاشتراكات</CardTitle>
            <CardDescription>توزيع الشركات حسب نوع الاشتراك</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'عدد الشركات']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الشركات</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="البحث عن شركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="active">نشط</TabsTrigger>
                <TabsTrigger value="trial">تجريبي</TabsTrigger>
                <TabsTrigger value="expired">منتهي</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الشركة</TableHead>
                <TableHead>نوع الاشتراك</TableHead>
                <TableHead>حالة الاشتراك</TableHead>
                <TableHead>تاريخ انتهاء الاشتراك</TableHead>
                <TableHead>العملاء</TableHead>
                <TableHead>الإيرادات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <Link href={`/companies/${company.id}`} className="hover:underline">
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell>{getSubscriptionTypeBadge(company.subscriptionType)}</TableCell>
                  <TableCell>{getSubscriptionStatusBadge(company.subscriptionStatus)}</TableCell>
                  <TableCell>{formatDate(company.subscriptionEndDate)}</TableCell>
                  <TableCell>{company.customers}</TableCell>
                  <TableCell>${company.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}