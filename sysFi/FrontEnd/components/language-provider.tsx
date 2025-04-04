"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { safeLocalStorage } from "@/lib/browser-utils"

type Language = "en" | "ar"

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// Expanded translation dictionary with more comprehensive entries
const translations = {
  en: {
    "app.title": "BillFlow - Comprehensive Billing System",
    "app.dashboard": "Dashboard",
    "app.orders": "Orders",
    "app.customers": "Customers",
    "app.delivery": "Delivery",
    "app.settings": "Settings",
    "app.profile": "Profile",
    "app.logout": "Logout",
    "app.login": "Login",
    "app.register": "Register",
    "app.forgotPassword": "Forgot Password",
    "app.search": "Search",
    "app.notifications": "Notifications",
    "app.noNotifications": "No notifications",
    "app.viewAll": "View all",
    "app.markAllAsRead": "Mark all as read",
    "app.language": "Language",
    "app.theme": "Theme",
    "app.light": "Light",
    "app.dark": "Dark",
    "app.system": "System",
    "app.english": "English",
    "app.arabic": "Arabic",
    "app.help": "Help",
    "app.account": "Account",
    "app.billing": "Billing",
    "app.invoices": "Invoices",
    "app.products": "Products",
    "app.payments": "Payments",
    "app.reports": "Reports",
    "app.welcome": "Welcome",
    "app.welcomeBack": "Welcome back",
    "app.email": "Email",
    "app.password": "Password",
    "app.confirmPassword": "Confirm Password",
    "app.rememberMe": "Remember me",
    "app.signIn": "Sign in",
    "app.signUp": "Sign up",
    "app.createAccount": "Create account",
    "app.alreadyHaveAccount": "Already have an account?",
    "app.dontHaveAccount": "Don't have an account?",
    "app.resetPassword": "Reset Password",
    "app.sendResetLink": "Send Reset Link",
    "app.backToLogin": "Back to login",
    "app.checkEmail": "Check your email",
    "app.resetLinkSent": "We've sent a password reset link to your email address",
    "delivery.assign": "Assign Orders",
    "delivery.map": "Delivery Map",
    "delivery.drivers": "Drivers",
    "delivery.history": "Delivery History",
    "delivery.dashboard": "Delivery Dashboard",
    "delivery.fleetOverview": "Fleet Overview",
    "delivery.activeDrivers": "Active Drivers",
    "delivery.pendingDeliveries": "Pending Deliveries",
    "delivery.completedDeliveries": "Completed Deliveries",
    "delivery.optimizeRoute": "Optimize Route",
    "delivery.viewMap": "View Map",
    "delivery.assignOrders": "Assign Orders",
    "delivery.confirmAssignment": "Confirm Assignment",
    "delivery.selectDriver": "Select a driver",
    "delivery.selectOrders": "Select Orders",
    "delivery.noOrdersSelected": "No orders selected",
    "delivery.totalOrders": "Total Orders",
    "delivery.totalItems": "Total Items",
    "delivery.reset": "Reset",
    "delivery.mapPreview": "Map Preview",
    "delivery.driverDetails": "Driver Details",
    "delivery.driverLocation": "Driver Location",
    "delivery.deliveryRoute": "Delivery Route",
    "delivery.deliveryList": "Delivery List",
    "delivery.noDeliveries": "No deliveries assigned",
    "delivery.priority": "Priority",
    "delivery.high": "High",
    "delivery.medium": "Medium",
    "delivery.low": "Low",
    "delivery.status": "Status",
    "delivery.pending": "Pending",
    "delivery.inTransit": "In Transit",
    "delivery.delivered": "Delivered",
    "delivery.failed": "Failed",
    "delivery.address": "Address",
    "delivery.orderId": "Order ID",
    "delivery.customer": "Customer",
    "delivery.vehicle": "Vehicle",
    "delivery.available": "Available",
    "delivery.busy": "Busy",
    "delivery.inactive": "Inactive",
    "delivery.lastUpdated": "Last updated",
    "delivery.estimatedArrival": "Estimated arrival",
    "delivery.distance": "Distance",
    "delivery.duration": "Duration",
    "delivery.loading": "Loading",
    "delivery.loadingMap": "Loading map",
    "delivery.zoomIn": "Zoom in",
    "delivery.zoomOut": "Zoom out",
    "delivery.optimizing": "Optimizing",
    "delivery.routeOptimized": "Route Optimized",
    "delivery.optimizationFailed": "Optimization Failed",
    "delivery.viewDetails": "View Details",
    "delivery.back": "Back",
    "delivery.mapView": "Map View",
    "delivery.listView": "List View",
    "delivery.operations": "Delivery Operations",
    "delivery.management": "Delivery Management",
    "delivery.trackDeliveries": "Track deliveries in real-time",
  },
  ar: {
    "app.title": "بيل فلو - نظام فواتير شامل",
    "app.dashboard": "لوحة التحكم",
    "app.orders": "الطلبات",
    "app.customers": "العملاء",
    "app.delivery": "التوصيل",
    "app.settings": "الإعدادات",
    "app.profile": "الملف الشخصي",
    "app.logout": "تسجيل الخروج",
    "app.login": "تسجيل الدخول",
    "app.register": "التسجيل",
    "app.forgotPassword": "نسيت كلمة المرور",
    "app.search": "بحث",
    "app.notifications": "الإشعارات",
    "app.noNotifications": "لا توجد إشعارات",
    "app.viewAll": "عرض الكل",
    "app.markAllAsRead": "تعليم الكل كمقروء",
    "app.language": "اللغة",
    "app.theme": "المظهر",
    "app.light": "فاتح",
    "app.dark": "داكن",
    "app.system": "النظام",
    "app.english": "الإنجليزية",
    "app.arabic": "العربية",
    "app.help": "المساعدة",
    "app.account": "الحساب",
    "app.billing": "الفواتير",
    "app.invoices": "الفواتير",
    "app.products": "المنتجات",
    "app.payments": "المدفوعات",
    "app.reports": "التقارير",
    "app.welcome": "مرحبًا",
    "app.welcomeBack": "مرحبًا بعودتك",
    "app.email": "البريد الإلكتروني",
    "app.password": "كلمة المرور",
    "app.confirmPassword": "تأكيد كلمة المرور",
    "app.rememberMe": "تذكرني",
    "app.signIn": "تسجيل الدخول",
    "app.signUp": "إنشاء حساب",
    "app.createAccount": "إنشاء حساب",
    "app.alreadyHaveAccount": "لديك حساب بالفعل؟",
    "app.dontHaveAccount": "ليس لديك حساب؟",
    "app.resetPassword": "إعادة تعيين كلمة المرور",
    "app.sendResetLink": "إرسال رابط إعادة التعيين",
    "app.backToLogin": "العودة لتسجيل الدخول",
    "app.checkEmail": "تحقق من بريدك الإلكتروني",
    "app.resetLinkSent": "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    "delivery.assign": "تعيين الطلبات",
    "delivery.map": "خريطة التوصيل",
    "delivery.drivers": "السائقين",
    "delivery.history": "سجل التوصيل",
    "delivery.dashboard": "لوحة تحكم التوصيل",
    "delivery.fleetOverview": "نظرة عامة على الأسطول",
    "delivery.activeDrivers": "السائقين النشطين",
    "delivery.pendingDeliveries": "التوصيلات المعلقة",
    "delivery.completedDeliveries": "التوصيلات المكتملة",
    "delivery.optimizeRoute": "تحسين المسار",
    "delivery.viewMap": "عرض الخريطة",
    "delivery.assignOrders": "تعيين الطلبات",
    "delivery.confirmAssignment": "تأكيد التعيين",
    "delivery.selectDriver": "اختر سائق",
    "delivery.selectOrders": "اختر الطلبات",
    "delivery.noOrdersSelected": "لم يتم اختيار طلبات",
    "delivery.totalOrders": "إجمالي الطلبات",
    "delivery.totalItems": "إجمالي العناصر",
    "delivery.reset": "إعادة تعيين",
    "delivery.mapPreview": "معاينة الخريطة",
    "delivery.driverDetails": "تفاصيل السائق",
    "delivery.driverLocation": "موقع السائق",
    "delivery.deliveryRoute": "مسار التوصيل",
    "delivery.deliveryList": "قائمة التوصيل",
    "delivery.noDeliveries": "لا توجد توصيلات معينة",
    "delivery.priority": "الأولوية",
    "delivery.high": "عالية",
    "delivery.medium": "متوسطة",
    "delivery.low": "منخفضة",
    "delivery.status": "الحالة",
    "delivery.pending": "معلق",
    "delivery.inTransit": "قيد التوصيل",
    "delivery.delivered": "تم التوصيل",
    "delivery.failed": "فشل",
    "delivery.address": "العنوان",
    "delivery.orderId": "رقم الطلب",
    "delivery.customer": "العميل",
    "delivery.vehicle": "المركبة",
    "delivery.available": "متاح",
    "delivery.busy": "مشغول",
    "delivery.inactive": "غير نشط",
    "delivery.lastUpdated": "آخر تحديث",
    "delivery.estimatedArrival": "الوصول المتوقع",
    "delivery.distance": "المسافة",
    "delivery.duration": "المدة",
    "delivery.loading": "جاري التحميل",
    "delivery.loadingMap": "جاري تحميل الخريطة",
    "delivery.zoomIn": "تكبير",
    "delivery.zoomOut": "تصغير",
    "delivery.optimizing": "جاري التحسين",
    "delivery.routeOptimized": "تم تحسين المسار",
    "delivery.optimizationFailed": "فشل تحسين المسار",
    "delivery.viewDetails": "عرض التفاصيل",
    "delivery.back": "رجوع",
    "delivery.mapView": "عرض الخريطة",
    "delivery.listView": "عرض القائمة",
    "delivery.operations": "عمليات التوصيل",
    "delivery.management": "إدارة التوصيل",
    "delivery.trackDeliveries": "تتبع التوصيلات في الوقت الفعلي",
  },
}

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
  t: (key: string) => key,
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "ui-language",
  ...props
}: LanguageProviderProps) {
  // Don't set state during initial render to avoid hydration issues
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<Language>(defaultLanguage)

  // Only run once on mount
  useEffect(() => {
    setMounted(true)

    // Get stored language
    const savedLanguage = safeLocalStorage.getItem(storageKey)
    if (savedLanguage && ["en", "ar"].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language)
    }
  }, [storageKey])

  // Apply language attributes to document
  useEffect(() => {
    if (!mounted) return

    const html = document.documentElement

    // Set language attributes
    html.setAttribute("lang", language)
    html.setAttribute("dir", language === "ar" ? "rtl" : "ltr")

    // Handle RTL class
    if (language === "ar") {
      html.classList.add("rtl")
    } else {
      html.classList.remove("rtl")
    }
  }, [language, mounted])

  // Translation function - memoize to prevent unnecessary re-renders
  const t = (key: string): string => {
    if (!mounted) return key

    // Get the translation for the current language
    const translationSet = translations[language] || {}

    // Return the translation or the key if not found
    return translationSet[key as keyof typeof translationSet] || key
  }

  const value = {
    language,
    setLanguage: (newLanguage: Language) => {
      // Only update if mounted and language is different
      if (mounted && newLanguage !== language) {
        safeLocalStorage.setItem(storageKey, newLanguage)
        setLanguage(newLanguage)
      }
    },
    t,
  }

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

