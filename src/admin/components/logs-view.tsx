import React from "react"
import { useState } from "react"
import { Button } from "@/admin/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card"
import { ScrollArea } from "@/admin/components/ui/scroll-area"
import { Trash2Icon } from "lucide-react"
import type { LogEntry } from "@/shared/types"

interface LogsViewProps {
  logs: LogEntry[]
  onClearLogs: () => void
}

export function LogsView({ logs, onClearLogs }: LogsViewProps) {
  const [filter, setFilter] = useState<"all" | "info" | "warning" | "error">("all")

  const filteredLogs = filter === "all" ? logs : logs.filter((log) => log.type === filter)

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("default", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date)
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

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>View system logs and activity</CardDescription>
        </div>
        <Button variant="destructive" size="sm" onClick={onClearLogs}>
          <Trash2Icon className="h-4 w-4 mr-2" />
          Clear Logs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
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

        <ScrollArea className="h-[400px] rounded-md border p-4 bg-secondary/20">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">No logs to display</div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-start">
                    <span className="text-muted-foreground mr-2">[{formatTimestamp(new Date(log.timestamp))}]</span>
                    <span className={`font-medium uppercase mr-2 ${getLogTypeClass(log.type)}`}>{log.type}:</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  )
}

