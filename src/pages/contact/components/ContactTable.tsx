"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Check, MessageSquare, ShieldAlert, MailOpen, CornerDownRight, Smartphone, Laptop, Globe } from "lucide-react"
import { fetchAllContacts, markRead, sendReply } from "@/context/Contact"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type ContactType = {
  _id: string
  name: string
  email: string
  mobile: number
  description: string
  status: "Unread" | "Read" | "Replied"
  device?: string
  browser?: string
  reply?: string
  createdAt: string
}

interface ContactTableProps {
  statusFilter?: "All" | "Unread" | "Read" | "Replied"
  title: string
  description: string
}

export default function ContactTable({ statusFilter = "All", title, description }: ContactTableProps) {
  const [selectedContact, setSelectedContact] = React.useState<ContactType | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = React.useState(false)
  const [replyMessage, setReplyMessage] = React.useState("")

  // Fetch contacts
  const { data, isLoading, refetch } = useQuery<ContactType[]>({
    queryKey: ["contacts", statusFilter],
    queryFn: () => fetchAllContacts(statusFilter === "All" ? undefined : statusFilter),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  // Mark as read
  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id)
      toast.success("Marked as read")
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark as read")
    }
  }

  // Send reply
  const handleSendReply = async () => {
    if (!selectedContact) return
    if (!replyMessage.trim()) return toast.error("Reply cannot be empty")
    try {
      await sendReply(selectedContact._id, replyMessage)
      toast.success("Reply sent")
      setReplyMessage("")
      setSelectedContact(null)
      setReplyDialogOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reply")
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Unread":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20"><ShieldAlert className="w-3.5 h-3.5" />{status}</span>
      case "Read":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20"><MailOpen className="w-3.5 h-3.5" />{status}</span>
      case "Replied":
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><CornerDownRight className="w-3.5 h-3.5" />{status}</span>
    }
  }

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-slate-950/50">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80">Date</TableHead>
                <TableHead className="font-semibold text-foreground/80">Name & Contact</TableHead>
                <TableHead className="font-semibold text-foreground/80">Message</TableHead>
                <TableHead className="font-semibold text-foreground/80">Platform</TableHead>
                <TableHead className="font-semibold text-foreground/80 text-center">Status</TableHead>
                <TableHead className="font-semibold text-foreground/80 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <TableBody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                    <TableCell><div className="space-y-2"><Skeleton className="h-5 w-32 rounded-md" /><Skeleton className="h-4 w-40 rounded-md" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-[300px] rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                    <TableCell className="text-right flex justify-end gap-2"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <AnimatePresence>
                  {data?.map((contact) => (
                    <motion.tr
                      key={contact._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-sm font-medium text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{contact.name}</span>
                          <span className="text-xs text-muted-foreground">{contact.email}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Smartphone className="w-3 h-3" /> {contact.mobile}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex flex-col gap-1">
                          <p className="truncate text-sm text-muted-foreground" title={contact.description}>{contact.description}</p>
                          {contact.reply && (
                            <p className="text-xs text-emerald-600 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10 flex items-start gap-1">
                              <CornerDownRight className="w-3 h-3 mt-0.5" />
                              <span className="italic">Replied: {contact.reply}</span>
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-help">
                                  {contact.device === "Desktop" ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Device: {contact.device || "Unknown"}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-help">
                                  <Globe className="w-4 h-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Browser: {contact.browser || "Unknown"}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(contact.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {contact.status === "Unread" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleMarkRead(contact._id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => {
                              setSelectedContact(contact)
                              setReplyDialogOpen(true)
                              setReplyMessage(contact.reply || "")
                            }}
                            title="Reply"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="p-3 rounded-full bg-muted/50">
                            <MailOpen className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No {statusFilter.toLowerCase()} messages found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            )}
          </Table>
        </div>
      </Card>

      {/* ================= Reply Dialog ================= */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Send an email reply directly from the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Original Message</label>
              <div className="p-3 rounded-md bg-muted/30 border text-xs text-muted-foreground italic">
                "{selectedContact?.description}"
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">To Email</label>
              <Input
                value={selectedContact?.email || ""}
                readOnly
                className="bg-muted text-muted-foreground border-transparent shadow-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Your Reply</label>
              <Textarea
                placeholder="Type your reply here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendReply} className="px-6 text-white font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
              Send Reply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
