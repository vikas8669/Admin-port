"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Check, MessageSquare } from "lucide-react"
import { fetchAllContacts, markRead, sendReply } from "@/context/Contact"

type ContactType = {
  _id: string
  name: string
  email: string
  message: string
  status: "Unread" | "Read" | "Replied"
}

export default function ContactsTable() {
  const [selectedContact, setSelectedContact] = React.useState<ContactType | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = React.useState(false)
  const [replyMessage, setReplyMessage] = React.useState("")

  // Fetch contacts
  const { data, isLoading, refetch } = useQuery<ContactType[]>({
    queryKey: ["contacts"],
    queryFn: fetchAllContacts,
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Contacts</h2>

      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right ">Actions</TableHead>
          </TableRow>
        </TableHeader>

        {isLoading ? (
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
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
                  className="border-b last:border-b-0"
                >
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell className="truncate max-w-xs">{contact.message}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      contact.status === "Unread"
                        ? "bg-red-100 text-red-800"
                        : contact.status === "Read"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {contact.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    {contact.status === "Unread" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(contact._id)}
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button className="cursor-pointer"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContact(contact)
                        setReplyDialogOpen(true)
                        setReplyMessage("")
                      }}
                      title="Reply"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        )}
      </Table>

      {/* ================= Reply Dialog ================= */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-lg ">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <Input
              value={selectedContact?.email || ""}
              readOnly
              className="cursor-not-allowed"
            />
            <Textarea
              placeholder="Type your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSendReply}>Send Reply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}