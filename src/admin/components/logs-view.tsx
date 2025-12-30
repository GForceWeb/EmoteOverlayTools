import React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/admin/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card"
import { ScrollArea } from "@/admin/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select"
import { RefreshCwIcon, CalendarIcon } from "lucide-react"
import type { LogEntry } from "@/shared/types"

interface LogsViewProps {
  overlayServerPort: number
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

// Format date for display
function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  const today = getTodayDateString()
  
  if (dateStr === today) {
    return "Today"
  }
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().split("T")[0]) {
    return "Yesterday"
  }
  
  return new Intl.DateTimeFormat("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function LogsView({ overlayServerPort }: LogsViewProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString())
  const [filter, setFilter] = useState<"all" | "info" | "warning" | "error">("all")
  const [sourceFilter, setSourceFilter] = useState<"all" | "main" | "overlay" | "admin">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const baseUrl = `http://localhost:${overlayServerPort || 3030}`

  // Fetch available log dates
  const fetchAvailableDates = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/logs`)
      if (response.ok) {
        const data = await response.json()
        setAvailableDates(data.dates || [])
        
        // If selected date is not in available dates and we have dates, select the first one
        if (data.dates?.length > 0 && !data.dates.includes(selectedDate)) {
          setSelectedDate(data.dates[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch available dates:", error)
    }
  }, [baseUrl, selectedDate])

  // Fetch logs for selected date
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${baseUrl}/api/logs/${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        // Reverse to show newest first
        setLogs((data.logs || []).reverse())
      } else {
        setLogs([])
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      setLogs([])
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }, [baseUrl, selectedDate])

  // Initial fetch of dates and logs
  useEffect(() => {
    fetchAvailableDates()
  }, [fetchAvailableDates])

  // Fetch logs when selected date changes
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Poll for updates when viewing today's logs
  useEffect(() => {
    const today = getTodayDateString()
    if (selectedDate !== today) {
      return // Don't poll for historical dates
    }

    const interval = setInterval(() => {
      fetchLogs()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [selectedDate, fetchLogs])

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    const typeMatch = filter === "all" || log.type === filter
    const sourceMatch = sourceFilter === "all" || log.source === sourceFilter
    return typeMatch && sourceMatch
  })

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat("default", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(timestamp))
  }

  const getLogTypeClass = (type: string) => {
    switch (type) {
      case "info":
        return "text-blue-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "main":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "overlay":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "admin":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const isToday = selectedDate === getTodayDateString()

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            View system logs and activity
            {isToday && (
              <span className="ml-2 text-xs text-muted-foreground">
                (auto-refreshing)
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[160px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.length === 0 ? (
                <SelectItem value={getTodayDateString()}>
                  {formatDateForDisplay(getTodayDateString())}
                </SelectItem>
              ) : (
                availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDateForDisplay(date)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex space-x-1">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "info" ? "default" : "outline"} size="sm" onClick={() => setFilter("info")}>
              Info
            </Button>
            <Button variant={filter === "warning" ? "default" : "outline"} size="sm" onClick={() => setFilter("warning")}>
              Warning
            </Button>
            <Button variant={filter === "error" ? "default" : "outline"} size="sm" onClick={() => setFilter("error")}>
              Error
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button variant={sourceFilter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setSourceFilter("all")}>
              All Sources
            </Button>
            <Button variant={sourceFilter === "main" ? "secondary" : "ghost"} size="sm" onClick={() => setSourceFilter("main")}>
              Main
            </Button>
            <Button variant={sourceFilter === "overlay" ? "secondary" : "ghost"} size="sm" onClick={() => setSourceFilter("overlay")}>
              Overlay
            </Button>
            <Button variant={sourceFilter === "admin" ? "secondary" : "ghost"} size="sm" onClick={() => setSourceFilter("admin")}>
              Admin
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4 bg-secondary/20">
          {isLoading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No logs to display
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <div key={`${log.timestamp}-${index}`} className="text-sm font-mono">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground shrink-0">
                      [{formatTimestamp(log.timestamp)}]
                    </span>
                    <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${getSourceBadgeClass(log.source)}`}>
                      {log.source}
                    </span>
                    <span className={`font-medium uppercase shrink-0 ${getLogTypeClass(log.type)}`}>
                      {log.type}:
                    </span>
                    <span className="flex-1 break-words">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-2 text-xs text-muted-foreground text-right">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
          {" | "}
          {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"}
        </div>
      </CardContent>
    </>
  )
}
