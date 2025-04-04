"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { CompanyForm } from "@/components/companies/company-form"

interface Company {
  id: string
  name: string
  contactEmail: string
  contactPhone: string
  subscriptionType: "basic" | "premium" | "enterprise"
  subscriptionStatus: "active" | "expired" | "trial"
  subscriptionEndDate: string
  registrationDate: string
  authorizedUsers: number
  customers: number
}

// بيانات تجريبية للشركات
const initialCompanies: Company[] = [
  {
    id: "COMP-001",
    name: "Tech Solutions Inc.",
    contactEmail: "info@techsolutions.com",
    contactPhone: "+1 (555) 123-4567",
    subscriptionType: "premium",
    subscriptionStatus: "active",
    subscriptionEndDate: "2024-12-31",
    registrationDate: "2023-01-15",
    authorizedUsers: 5,
    customers: 28,
  },
  {
    id: "COMP-002",
    name: "Global Enterprises",
    contactEmail: "contact@globalent.com",
    contactPhone: "+1 (555) 987-6543",
    subscriptionType: "enterprise",
    subscriptionStatus: "active",
    subscriptionEndDate: "2024-10-15",
    registrationDate: "2023-02-20",
    authorizedUsers: 12,
    customers: 45,
  },
  {
    id: "COMP-003",
    name: "Startup Innovations",
    contactEmail: "hello@startupinnovations.com",
    contactPhone: "+1 (555) 456-7890",
    subscriptionType: "basic",
    subscriptionStatus: "trial",
    subscriptionEndDate: "2024-06-30",
    registrationDate: "2023-05-10",
    authorizedUsers: 3,
    customers: 7,
  },
  {
    id: "COMP-004",
    name: "Digital Solutions",
    contactEmail: "support@digitalsolutions.com",
    contactPhone: "+1 (555) 234-5678",
    subscriptionType: "premium",
    subscriptionStatus: "expired",
    subscriptionEndDate: "2024-04-15",
    registrationDate: "2023-03-05",
    authorizedUsers: 8,
    customers: 19,
  },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateCompany = (newCompany: Omit<Company, "id" | "authorizedUsers" | "customers">) => {
    const company: Company = {
      ...newCompany,
      id: `COMP-${String(companies.length + 1).padStart(3, "0")}`,
      authorizedUsers: 1, // المستخدم الذي أنشأ الشركة
      customers: 0,
    }
    setCompanies([...companies, company])
    setIsCreateDialogOpen(false)
  }

  const handleEditCompany = (updatedCompany: Company) => {
    setCompanies(companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)))
    setIsEditDialogOpen(false)
    setCurrentCompany(null)
  }

  const handleDeleteCompany = () => {
    if (currentCompany) {
      setCompanies(companies.filter((c) => c.id !== currentCompany.id))
      setIsDeleteDialogOpen(false)
      setCurrentCompany(null)
    }
  }

  const openEditDialog = (company: Company) => {
    setCurrentCompany(company)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (company: Company) => {
    setCurrentCompany(company)
    setIsDeleteDialogOpen(true)
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
        <h2 className="text-3xl font-bold tracking-tight">إدارة الشركات</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          إضافة شركة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">الشركات</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="البحث عن شركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Button size="icon" variant="ghost">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الشركة</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>نوع الاشتراك</TableHead>
                <TableHead>حالة الاشتراك</TableHead>
                <TableHead>تاريخ انتهاء الاشتراك</TableHead>
                <TableHead>المستخدمون</TableHead>
                <TableHead>العملاء</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
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
                  <TableCell>{company.contactEmail}</TableCell>
                  <TableCell>{getSubscriptionTypeBadge(company.subscriptionType)}</TableCell>
                  <TableCell>{getSubscriptionStatusBadge(company.subscriptionStatus)}</TableCell>
                  <TableCell>{formatDate(company.subscriptionEndDate)}</TableCell>
                  <TableCell>{company.authorizedUsers}</TableCell>
                  <TableCell>{company.customers}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">فتح القائمة</span>
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={`/companies/${company.id}`} className="flex w-full">
                            عرض التفاصيل
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(company)}>
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(company)}
                        >
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* حوار إنشاء شركة جديدة */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>إضافة شركة جديدة</DialogTitle>
            <DialogDescription>أدخل معلومات الشركة الجديدة هنا.</DialogDescription>
          </DialogHeader>
          <CompanyForm onSubmit={handleCreateCompany} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* حوار تعديل شركة */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل الشركة</DialogTitle>
            <DialogDescription>قم بتعديل معلومات الشركة.</DialogDescription>
          </DialogHeader>
          {currentCompany && (
            <CompanyForm
              company={currentCompany}
              onSubmit={handleEditCompany}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* حوار حذف شركة */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الشركة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الشركة؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}