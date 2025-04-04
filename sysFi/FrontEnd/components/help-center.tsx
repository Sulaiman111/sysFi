"use client"

import { useState, useEffect } from "react"
import { HelpCircle, ChevronRight, Book, Lightbulb, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/components/language-provider"

export function HelpCenter() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState("guides")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const faqs = [
    {
      question: "How do I assign orders to a driver?",
      answer:
        "Go to the Delivery > Assign Orders page, select a driver from the dropdown, then check the orders you want to assign. Click 'Confirm Assignment & View Map' to proceed.",
    },
    {
      question: "How does route optimization work?",
      answer:
        "After assigning orders to a driver, you'll be taken to the map view. Click the 'Optimize Route' button to calculate the most efficient delivery route based on distance and estimated travel time.",
    },
    {
      question: "Can I track drivers in real-time?",
      answer:
        "Yes, the map view shows the real-time location of the driver. The location is updated automatically every few seconds.",
    },
    {
      question: "How do I switch between dark and light mode?",
      answer:
        "Click the sun/moon icon in the top navigation bar to toggle between light and dark mode, or select your preference from the dropdown menu.",
    },
    {
      question: "How do I change the language?",
      answer:
        "Click the globe icon in the top navigation bar and select your preferred language from the dropdown menu.",
    },
  ]

  const guides = [
    {
      title: "Getting Started",
      description: "Learn the basics of the delivery management system",
      icon: Book,
      content:
        "This guide will walk you through the essential features of the delivery management system, including order management, driver assignment, and route optimization.",
    },
    {
      title: "Optimizing Delivery Routes",
      description: "Learn how to use the route optimization feature",
      icon: Lightbulb,
      content:
        "The route optimization feature helps you find the most efficient delivery route for your drivers. This guide explains how to use it effectively.",
    },
    {
      title: "Managing Drivers",
      description: "Learn how to manage your delivery drivers",
      icon: Video,
      content:
        "This guide covers everything you need to know about managing your delivery drivers, including assignment, tracking, and performance monitoring.",
    },
  ]

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Help Center</span>
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Help Center</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={language === "ar" ? "left" : "right"} className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Help Center</SheetTitle>
          <SheetDescription>Find guides, tutorials, and answers to common questions</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="guides" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {guides.map((guide, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{guide.title}</CardTitle>
                          <CardDescription>{guide.description}</CardDescription>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <guide.icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">{guide.content}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        Read Guide <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="faq" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

