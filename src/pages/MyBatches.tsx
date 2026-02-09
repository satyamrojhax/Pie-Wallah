import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, Calendar, Languages, Trash2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { getEnrolledBatches, unenrollFromBatch, type EnrolledBatch, getEnrollmentCount, getMaxEnrollments } from "@/lib/enrollmentUtils";
import { getEnrolledBatches as getRTEnrolledBatches, saveEnrolledBatch, trackBatchInteraction } from "@/services/realtimeDatabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DotsLoader from "@/components/ui/DotsLoader";
import "@/config/firebase";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MyBatches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledBatches, setEnrolledBatches] = useState<EnrolledBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  const handleBack = () => {
    navigate(-1);
  };

  // Sync localStorage batches to real-time database
  const syncBatchesToRealtimeDB = async (userId: string, localBatches: EnrolledBatch[]) => {
    try {
      for (const batch of localBatches) {
        await saveEnrolledBatch(userId, {
          batchId: batch._id,
          batchName: batch.name,
          status: 'active',
          progress: 0,
          totalLectures: 0,
          completedLectures: 0,
        });
      }
    } catch (error) {
      console.error('Error syncing batches to real-time database:', error);
    }
  };

  useEffect(() => {
    // Load enrolled batches from both localStorage and real-time database
    const loadBatches = async () => {
      let localBatches: EnrolledBatch[] = [];
      
      try {
        setIsLoading(true);
        setIsInitialLoad(true);
        
        // Get batches from localStorage first (immediate)
        localBatches = await getEnrolledBatches();
        
        // If we have local batches, show them immediately while syncing
        if (localBatches.length > 0) {
          setEnrolledBatches(localBatches);
          setIsInitialLoad(false); // Hide initial loading immediately
        }
        
        // If user is authenticated, sync with real-time database
        if (user?.id) {
          try {
            // Sync existing localStorage batches to real-time database
            if (localBatches.length > 0) {
              await syncBatchesToRealtimeDB(user.id, localBatches);
            }
            
            // Get batches from real-time database
            const rtBatches = await getRTEnrolledBatches(user.id);
            
            // Merge real-time database data with localStorage data
            const mergedBatches = localBatches.map(localBatch => {
              const rtBatch = rtBatches.find(rt => rt.batchId === localBatch._id);
              return {
                ...localBatch,
                // Add real-time database properties
                progress: rtBatch?.progress || 0,
                status: rtBatch?.status || 'active',
                completedLectures: rtBatch?.completedLectures || 0,
                totalLectures: rtBatch?.totalLectures || 0,
              };
            });
            
            setEnrolledBatches(mergedBatches);
          } catch (error) {
            console.error('Error syncing with real-time database:', error);
            // Keep local batches if real-time sync fails
            if (localBatches.length === 0) {
              setEnrolledBatches([]);
            }
          }
        } else {
          // Fallback to localStorage if user is not authenticated
          setEnrolledBatches(localBatches);
        }
      } catch (error) {
        console.error('Error loading enrolled batches:', error);
        setEnrolledBatches([]);
      } finally {
        // Only set loading to false after all operations complete
        setTimeout(() => {
          setIsLoading(false);
          setIsInitialLoad(false);
        }, localBatches.length > 0 ? 300 : 800); // Shorter delay if we have data
      }
    };
    
    loadBatches();
  }, [user?.id]);

  const [maxEnrollments, setMaxEnrollments] = useState<number>(3);

  // Update max enrollments based on device type
  useEffect(() => {
    setMaxEnrollments(getMaxEnrollments());
    
    const handleResize = () => {
      setMaxEnrollments(getMaxEnrollments());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle initial load state timing (same as Community)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleUnenroll = async (batchId: string, batchName: string) => {
    try {
      setIsLoading(true);
      setIsRefreshing(true); // Show refreshing state
      
      // Track unenroll action in real-time database
      if (user?.id) {
        await trackBatchInteraction(user.id, batchId, 'unenroll', {
          batchName,
          timestamp: Date.now(),
        });
      }
      
      const success = await unenrollFromBatch(batchId);
      if (success) {
        const batches = await getEnrolledBatches();
        setEnrolledBatches(batches);
        toast({
          title: "Unenrolled Successfully",
          description: `You've been unenrolled from ${batchName}`,
        });
      } else {
        toast({
          title: "Unenroll Failed",
          description: `Failed to unenroll from ${batchName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Unenroll Failed",
        description: `An error occurred while unenrolling from ${batchName}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Add small delay for better UX
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Track batch view when component mounts or batches change
  useEffect(() => {
    if (user?.id && enrolledBatches.length > 0) {
      enrolledBatches.forEach(batch => {
        trackBatchInteraction(user.id, batch._id, 'viewed', {
          batchName: batch.name,
          progress: (batch as any).progress || 0,
          timestamp: Date.now(),
        });
      });
    }
  }, [user?.id, enrolledBatches.length]); // Only track when user or count changes

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header with Back Button */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">My Batches</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
            <p className="text-sm sm:text-base">
              {enrolledBatches.length > 0
                ? `You're enrolled in ${enrolledBatches.length} ${enrolledBatches.length === 1 ? "batch" : "batches"}`
                : "Access your enrolled courses"}
            </p>
            {enrolledBatches.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {enrolledBatches.length}/{maxEnrollments} slots used
              </Badge>
            )}
          </div>
        </div>

        {isInitialLoad && enrolledBatches.length === 0 ? (
          /* Enhanced Loading State */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6">
                <DotsLoader size="lg" color="rgb(59, 130, 246)" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-foreground">Loading Your Batches</h1>
              <p className="mb-6 text-muted-foreground">
                {isLoading ? "Fetching your enrolled courses..." : "Almost done..."}
              </p>
              {/* Progress indicator */}
              <div className="w-full bg-secondary rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500" 
                  style={{ width: isLoading ? "60%" : "90%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Syncing with real-time database...
              </p>
            </div>
          </div>
        ) : enrolledBatches.length === 0 ? (
          /* Empty State */
          <Card className="p-8 sm:p-12 text-center shadow-card">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary-light">
              <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-foreground">
              No batches enrolled yet
            </h3>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">
              Explore our courses and start your learning journey
            </p>
            <Link to="/batches">
              <Button className="bg-gradient-primary hover:opacity-90">
                Browse Batches
              </Button>
            </Link>
          </Card>
        ) : (
          /* Enrolled Batches Grid */
          <div className="relative">
            {/* Refresh Overlay */}
            {isRefreshing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-full mb-2">
                    <div className="h-4 w-4 bg-primary-foreground rounded-full animate-spin border-2 border-transparent border-t-current" />
                  </div>
                  <p className="text-sm text-muted-foreground">Updating...</p>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledBatches.map((batch) => (
                <Card
                  key={batch._id}
                  className={`group overflow-hidden shadow-card transition-all hover:shadow-soft hover:-translate-y-1 ${isRefreshing ? 'opacity-50' : ''}`}
                >
                  {/* Batch Image */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    {batch.previewImage ? (
                      <img
                        src={`${batch.previewImage.baseUrl}${batch.previewImage.key}`}
                        alt={batch.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Book className="h-12 w-12 sm:h-16 sm:w-16 text-primary/30" />
                      </div>
                    )}
                  </div>

                  {/* Batch Info */}
                  <div className="p-3 sm:p-4">
                    <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                      {batch.language && (
                        <Badge variant="secondary" className="text-xs">
                          <Languages className="mr-1 h-3 w-3" />
                          {batch.language}
                        </Badge>
                      )}
                      {batch.class && (
                        <Badge variant="outline" className="text-xs">
                          <Book className="mr-1 h-3 w-3" />
                          Class {batch.class}
                        </Badge>
                      )}
                    </div>

                    <h3 className="mb-2 text-base sm:text-lg font-bold text-foreground line-clamp-2">
                      {batch.name}
                    </h3>

                    {(batch.startDate || batch.endDate) && (
                      <div className="mb-2 sm:mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                        </span>
                      </div>
                    )}

                    <p className="mb-3 sm:mb-4 text-xs text-muted-foreground">
                      Enrolled on {formatDate(batch.enrolledAt)}
                    </p>

                    {/* Progress Bar */}
                    {(batch as any).progress !== undefined && (batch as any).progress > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round((batch as any).progress)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(batch as any).progress}%` }}
                          />
                        </div>
                        {(batch as any).completedLectures !== undefined && (batch as any).totalLectures > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {(batch as any).completedLectures} of {(batch as any).totalLectures} lectures completed
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link to={`/batch/${batch._id}`} className="flex-1">
                        <Button 
                          className="w-full bg-gradient-primary hover:opacity-90 text-xs sm:text-sm" 
                          size="sm"
                          onClick={() => {
                            // Track continue learning action
                            if (user?.id) {
                              trackBatchInteraction(user.id, batch._id, 'continue_learning', {
                                batchName: batch.name,
                                progress: (batch as any).progress || 0,
                                timestamp: Date.now(),
                              });
                            }
                          }}
                        >
                          Continue Learning
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnenroll(batch._id, batch.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        title="Unenroll from batch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBatches;
