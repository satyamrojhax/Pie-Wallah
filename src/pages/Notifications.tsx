import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { fetchNotifications, type Notification } from "@/services/notificationService";
import { getEnrolledBatches } from "@/lib/enrollmentUtils";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [enrolledBatches, setEnrolledBatches] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleBack = () => {
    navigate(-1);
  };

  // Get enrolled batches on mount
  useEffect(() => {
    const loadEnrolledBatches = async () => {
      try {
        const enrolled = await getEnrolledBatches();
        setEnrolledBatches(enrolled);
        if (enrolled.length > 0 && !selectedBatchId) {
          setSelectedBatchId(enrolled[0]._id);
        }
      } catch (error) {
        setEnrolledBatches([]);
      }
    };
    
    loadEnrolledBatches();
  }, []);

  // Handle initial load state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadNotifications();
    }
  }, [selectedBatchId]);

  const loadNotifications = async () => {
    if (!selectedBatchId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(selectedBatchId);
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read or handle click
    console.log("Notification clicked:", notification);
  };

  const unreadCount = notifications.filter(n => !n.isSentNotification).length;

  // Show loading state during initial load
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (enrolledBatches.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-foreground">No Enrolled Batches</h1>
              <p className="mb-6 text-muted-foreground">
                You need to enroll in at least one batch to view notifications.
              </p>
              <Button asChild className="bg-gradient-primary hover:opacity-90">
                <a href="/batches">Browse Batches</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              View announcements from your enrolled batches
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount > 99 ? '99+' : unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Batch Selector */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Batch
              </label>
              <Select value={selectedBatchId} onValueChange={handleBatchChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Choose a batch..." />
                </SelectTrigger>
                <SelectContent>
                  {enrolledBatches.map((batch) => (
                    <SelectItem 
                      key={batch._id} 
                      value={batch._id}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary font-semibold">
                            {batch.name?.charAt(0)?.toUpperCase() || 'B'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium text-foreground text-sm">
                            {batch.name || 'Unknown Batch'}
                          </div>
                          {batch.class && (
                            <div className="text-xs text-muted-foreground">
                              Class {batch.class}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {enrolledBatches.length} enrolled batch{enrolledBatches.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadNotifications} className="mt-4">
              Try Again
            </Button>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              You're all caught up! We'll notify you when there are new announcements.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Header */}
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-semibold text-foreground text-sm">
                        {notification.heading}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <div 
                      className="line-clamp-3 [&>a]:text-primary [&>a]:underline hover:[&>a]:text-primary/80 [&>a]:break-all"
                      dangerouslySetInnerHTML={{
                        __html: notification.announcement.replace(
                          /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g,
                          (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
                        )
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
