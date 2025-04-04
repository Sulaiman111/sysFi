"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Building, CreditCard, Globe, Mail, Save, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 5000)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      {showSuccessAlert && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your settings have been saved successfully.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="md:w-1/4">
            <TabsList className="flex flex-col h-full space-y-1 w-full bg-transparent p-0">
              <TabsTrigger value="general" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                <User className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="company" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                <Building className="mr-2 h-4 w-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="billing" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                <Mail className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted">
                <Globe className="mr-2 h-4 w-4" />
                Appearance
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 md:w-3/4">
            <TabsContent value="general" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage your account settings and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="text-sm text-muted-foreground">Upload a new profile picture</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Upload
                          </Button>
                          <Button size="sm" variant="outline">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" defaultValue="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="utc-8">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-12">UTC-12:00</SelectItem>
                          <SelectItem value="utc-11">UTC-11:00</SelectItem>
                          <SelectItem value="utc-10">UTC-10:00</SelectItem>
                          <SelectItem value="utc-9">UTC-09:00</SelectItem>
                          <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                          <SelectItem value="utc-7">UTC-07:00 (Mountain Time)</SelectItem>
                          <SelectItem value="utc-6">UTC-06:00 (Central Time)</SelectItem>
                          <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                          <SelectItem value="utc-4">UTC-04:00</SelectItem>
                          <SelectItem value="utc-3">UTC-03:00</SelectItem>
                          <SelectItem value="utc-2">UTC-02:00</SelectItem>
                          <SelectItem value="utc-1">UTC-01:00</SelectItem>
                          <SelectItem value="utc">UTC+00:00</SelectItem>
                          <SelectItem value="utc+1">UTC+01:00</SelectItem>
                          <SelectItem value="utc+2">UTC+02:00</SelectItem>
                          <SelectItem value="utc+3">UTC+03:00</SelectItem>
                          <SelectItem value="utc+4">UTC+04:00</SelectItem>
                          <SelectItem value="utc+5">UTC+05:00</SelectItem>
                          <SelectItem value="utc+6">UTC+06:00</SelectItem>
                          <SelectItem value="utc+7">UTC+07:00</SelectItem>
                          <SelectItem value="utc+8">UTC+08:00</SelectItem>
                          <SelectItem value="utc+9">UTC+09:00</SelectItem>
                          <SelectItem value="utc+10">UTC+10:00</SelectItem>
                          <SelectItem value="utc+11">UTC+11:00</SelectItem>
                          <SelectItem value="utc+12">UTC+12:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="company" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Manage your company details and business information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" defaultValue="Acme Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-website">Website</Label>
                      <Input id="company-website" defaultValue="https://acme.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-address">Address</Label>
                      <Textarea
                        id="company-address"
                        defaultValue="123 Business St, Suite 100, San Francisco, CA 94107"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company-phone">Phone</Label>
                        <Input id="company-phone" defaultValue="(555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-email">Email</Label>
                        <Input id="company-email" type="email" defaultValue="info@acme.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Tax ID / VAT Number</Label>
                      <Input id="tax-id" defaultValue="US123456789" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="billing" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Settings</CardTitle>
                  <CardDescription>Manage your subscription and payment methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Current Plan: Professional</h3>
                          <p className="text-sm text-muted-foreground">$49/month, billed monthly</p>
                        </div>
                        <Button variant="outline">Change Plan</Button>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Payment Methods</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-md border p-4">
                          <div className="flex items-center gap-4">
                            <CreditCard className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Billing Information</h3>
                      <div className="space-y-2">
                        <div className="space-y-2">
                          <Label htmlFor="billing-email">Billing Email</Label>
                          <Input id="billing-email" type="email" defaultValue="billing@acme.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-address">Billing Address</Label>
                          <Textarea
                            id="billing-address"
                            defaultValue="123 Business St, Suite 100, San Francisco, CA 94107"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Invoice Created</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when a new invoice is created
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Payment Received</Label>
                          <p className="text-sm text-muted-foreground">Receive an email when a payment is received</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Invoice Overdue</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when an invoice becomes overdue
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Customer Created</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when a new customer is created
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Weekly Summary</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive a weekly summary of your business activity
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="appearance" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look and feel of your billing system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="border rounded-md p-2 w-full h-24 bg-background">
                            <div className="h-4 w-3/4 rounded-sm bg-primary mb-2"></div>
                            <div className="h-3 w-full rounded-sm bg-muted mb-2"></div>
                            <div className="h-3 w-full rounded-sm bg-muted"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="theme-light" className="text-sm font-normal">
                              Light
                            </Label>
                            <input
                              type="radio"
                              id="theme-light"
                              name="theme"
                              defaultChecked
                              className="accent-primary"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                          <div className="border rounded-md p-2 w-full h-24 bg-zinc-950">
                            <div className="h-4 w-3/4 rounded-sm bg-blue-500 mb-2"></div>
                            <div className="h-3 w-full rounded-sm bg-zinc-800 mb-2"></div>
                            <div className="h-3 w-full rounded-sm bg-zinc-800"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="theme-dark" className="text-sm font-normal">
                              Dark
                            </Label>
                            <input type="radio" id="theme-dark" name="theme" className="accent-primary" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                          <div className="border rounded-md p-2 w-full h-24 bg-background">
                            <div className="h-4 w-3/4 rounded-sm bg-primary mb-2"></div>
                            <div className="h-3 w-full rounded-sm bg-muted mb-2"></div>
                            <div className="h-3 w-full rounded-sm bg-muted"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="theme-system" className="text-sm font-normal">
                              System
                            </Label>
                            <input type="radio" id="theme-system" name="theme" className="accent-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="grid grid-cols-6 gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer border-2 border-blue-500"></div>
                          <span className="text-xs mt-1">Blue</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer"></div>
                          <span className="text-xs mt-1">Green</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer"></div>
                          <span className="text-xs mt-1">Purple</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-red-500 cursor-pointer"></div>
                          <span className="text-xs mt-1">Red</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-orange-500 cursor-pointer"></div>
                          <span className="text-xs mt-1">Orange</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-pink-500 cursor-pointer"></div>
                          <span className="text-xs mt-1">Pink</span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Invoice Template</Label>
                      <Select defaultValue="modern">
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md border flex items-center justify-center bg-muted">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <Button size="sm" variant="outline">
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Recommended size: 200x200px. Max file size: 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

