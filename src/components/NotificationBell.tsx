import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  Mail, 
  ShoppingCart, 
  CheckCheck, 
  Search, 
  ArrowRight,
  Inbox,
  CreditCard,
  Trash2,
} from "lucide-react";
import { fetchNotifications, markRead, markAllRead, removeNotification } from "@/context/Notification";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Unified Notification Query
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60000, // Poll every minute
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: removeNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Filter logic
  const filteredNotifications = notifications.filter(
    (n: any) => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const contactNotifications = filteredNotifications.filter((n: any) => n.type === "contact");
  const paymentNotifications = filteredNotifications.filter((n: any) => n.type === "payment");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full h-10 w-10 transition-all duration-300"
        >
          <Bell className={cn("w-5 h-5 text-neutral-600 dark:text-neutral-300", unreadCount > 0 && "animate-pulse")} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full border-l border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <SheetHeader className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Notification Center
            </SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 px-2"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Search notifications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-neutral-50 dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-800 focus-visible:ring-primary/50"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {/* Section: Messages */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                  <Inbox className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm">Messages</h3>
                <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {contactNotifications.filter((n: any) => n.status === "unread").length} NEW
                </span>
              </div>
              <Link to="/admin/messages" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {contactNotifications.length > 0 ? (
                contactNotifications.map((notif: any) => (
                  <div 
                    key={notif._id}
                    className={cn(
                      "group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                      notif.status === "unread" 
                        ? "border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10" 
                        : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50"
                    )}
                    onClick={() => notif.status === "unread" && markAsReadMutation.mutate(notif._id)}
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm truncate">{notif.title}</span>
                          <span className="text-[10px] text-neutral-400 tabular-nums">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Link to={notif.link} className="text-[10px] text-primary hover:underline">View details</Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notif._id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <Mail className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400 font-medium">No message notifications</p>
                </div>
              )}
            </div>
          </section>

          {/* Section: Payments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm">Payments</h3>
                <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {paymentNotifications.filter((n: any) => n.status === "unread").length} NEW
                </span>
              </div>
              <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {paymentNotifications.length > 0 ? (
                paymentNotifications.map((notif: any) => (
                  <div 
                    key={notif._id}
                    className={cn(
                      "group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                      notif.status === "unread" 
                        ? "border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10" 
                        : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/50"
                    )}
                    onClick={() => notif.status === "unread" && markAsReadMutation.mutate(notif._id)}
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm truncate">{notif.title}</span>
                          <span className="text-[10px] text-neutral-400 tabular-nums">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Link to={notif.link} className="text-[10px] text-primary hover:underline">View details</Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notif._id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <ShoppingCart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400 font-medium">No payment notifications</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
          <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98]">
            <Link to="/admin/messages" className="flex items-center justify-center gap-2">
              Open Full Inbox
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-center text-[10px] text-neutral-400 mt-4 leading-normal">
            You're currently viewing active notifications.
            <br />
            Historical data is available in the respective modules.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
