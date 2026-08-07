import React from "react"
import { createRoot } from 'react-dom/client';
import { SettingsDashboard } from "@/admin/components/settings-dashboard"
import { ThemeProvider } from "@/admin/components/theme-provider"
import { CloseConfirmationDialog } from "@/admin/components/close-confirmation-dialog"

// Mount the React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render( 
  <ThemeProvider defaultTheme="dark" forcedTheme="dark">
    <main className="app-stage app-grain relative dark flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <SettingsDashboard />
      </div>
      <CloseConfirmationDialog />
    </main>
  </ThemeProvider>
  );
}
