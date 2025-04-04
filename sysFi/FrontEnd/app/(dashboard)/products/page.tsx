"use client"

import { useState } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  BarChart2Icon,
  TrashIcon,
  PencilIcon,
  TagIcon,
  PackageIcon,
  BoxIcon,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ProductForm } from "@/components/products/product-form"
import { ProductDetails } from "@/components/products/product-details"

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  stock: number
  sku: string
  status: "active" | "inactive" | "low-stock"
  type: "physical" | "digital" | "service"
  taxable: boolean
  images?: string[]
}

const initialProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Premium Business Suite",
    description: "Complete business management solution",
    category: "Software",
    price: 299.99,
    cost: 50.0,
    stock: 100,
    sku: "SFT-BS-001",
    status: "active",
    type: "digital",
    taxable: true,
  },
  {
    id: "PROD-002",
    name: "Invoice Generator Pro",
    description: "Professional invoice creation tool",
    category: "Software",
    price: 149.99,
    cost: 30.0,
    stock: 200,
    sku: "SFT-IG-002",
    status: "active",
    type: "digital",
    taxable: true,
  },
  {
    id: "PROD-003",
    name: "Financial Analytics Dashboard",
    description: "Real-time financial data visualization",
    category: "Software",
    price: 199.99,
    cost: 40.0,
    stock: 50,
    sku: "SFT-FA-003",
    status: "active",
    type: "digital",
    taxable: true,
  },
  {
    id: "PROD-004",
    name: "Customer Management System",
    description: "Comprehensive CRM solution",
    category: "Software",
    price: 249.99,
    cost: 45.0,
    stock: 75,
    sku: "SFT-CM-004",
    status: "active",
    type: "digital",
    taxable: true,
  },
  {
    id: "PROD-005",
    name: "Inventory Tracker",
    description: "Real-time inventory management",
    category: "Software",
    price: 99.99,
    cost: 20.0,
    stock: 10,
    sku: "SFT-IT-005",
    status: "low-stock",
    type: "digital",
    taxable: true,
  },
  {
    id: "PROD-006",
    name: "Payment Gateway Integration",
    description: "Secure payment processing service",
    category: "Service",
    price: 49.99,
    cost: 10.0,
    stock: 0,
    sku: "SRV-PG-006",
    status: "inactive",
    type: "service",
    taxable: false,
  },
  {
    id: "PROD-007",
    name: "Cloud Storage Plan",
    description: "Secure cloud storage subscription",
    category: "Subscription",
    price: 19.99,
    cost: 5.0,
    stock: 1000,
    sku: "SUB-CS-007",
    status: "active",
    type: "digital",
    taxable: true,
  },
  {
    id: "PROD-008",
    name: "Wireless Keyboard",
    description: "Ergonomic wireless keyboard",
    category: "Hardware",
    price: 59.99,
    cost: 25.0,
    stock: 45,
    sku: "HW-KB-008",
    status: "active",
    type: "physical",
    taxable: true,
  },
  {
    id: "PROD-009",
    name: "Wireless Mouse",
    description: "Precision wireless mouse",
    category: "Hardware",
    price: 39.99,
    cost: 15.0,
    stock: 30,
    sku: "HW-MS-009",
    status: "active",
    type: "physical",
    taxable: true,
  },
  {
    id: "PROD-010",
    name: "24-inch Monitor",
    description: "High-resolution display monitor",
    category: "Hardware",
    price: 199.99,
    cost: 120.0,
    stock: 15,
    sku: "HW-MN-010",
    status: "low-stock",
    type: "physical",
    taxable: true,
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  // Get unique categories
  const categories = ["all", ...new Set(products.map((product) => product.category))]

  // Filter products based on search query, active tab, and category
  const filteredProducts = products.filter((product) => {
    // Filter by search query
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    const matchesTab = activeTab === "all" || product.status === activeTab

    // Filter by category
    const matchesCategory = activeCategory === "all" || product.category === activeCategory

    return matchesSearch && matchesTab && matchesCategory
  })

  // Calculate inventory value
  const totalInventoryValue = filteredProducts.reduce((sum, product) => {
    return sum + product.cost * product.stock
  }, 0)

  // Calculate retail value
  const totalRetailValue = filteredProducts.reduce((sum, product) => {
    return sum + product.price * product.stock
  }, 0)

  const handleCreateProduct = (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
    }
    setProducts([...products, product])
    setIsCreateDialogOpen(false)
  }

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
    setIsEditDialogOpen(false)
    setCurrentProduct(null)
  }

  const handleDeleteProduct = () => {
    if (currentProduct) {
      setProducts(products.filter((product) => product.id !== currentProduct.id))
      setIsDeleteDialogOpen(false)
      setCurrentProduct(null)
    }
  }

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (product: Product) => {
    setCurrentProduct(product)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {products.filter((p) => p.status === "active").length} active products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <BoxIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Based on cost price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retail Value</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRetailValue)}</div>
            <p className="text-xs text-muted-foreground">Based on selling price</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Manage your products, services, and subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <Tabs>
              <TabsList>
                <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger value="active" onClick={() => setActiveTab("active")}>
                  Active
                </TabsTrigger>
                <TabsTrigger value="low-stock" onClick={() => setActiveTab("low-stock")}>
                  Low Stock
                </TabsTrigger>
                <TabsTrigger value="inactive" onClick={() => setActiveTab("inactive")}>
                  Inactive
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs>
              <TabsList>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} onClick={() => setActiveCategory(category)}>
                    {category === "all" ? "All Categories" : category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{formatCurrency(product.cost)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : product.status === "inactive"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openViewDialog(product)}>
                            <FileTextIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart2Icon className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(product)}
                            className="text-destructive focus:text-destructive"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto h-90p">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Enter the product details below to create a new product.</DialogDescription>
          </DialogHeader>
          <ProductForm onSubmit={handleCreateProduct} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below.</DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <ProductForm
              product={currentProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto h-90p">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Detailed information about this product.</DialogDescription>
          </DialogHeader>
          {currentProduct && <ProductDetails product={currentProduct} />}
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

