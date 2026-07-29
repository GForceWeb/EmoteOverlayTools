import React from "react"
import { createRoot } from 'react-dom/client';
import { SettingsDashboard } from "@/admin/components/settings-dashboard"
import { ThemeProvider } from "@/admin/components/theme-provider"
import { CloseConfirmationDialog } from "@/admin/components/close-confirmation-dialog"
import { Footer } from "@/admin/components/footer"

// Mount the React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render( 
  <ThemeProvider defaultTheme="dark" forcedTheme="dark">
    <main className="min-h-screen bg-background px-4 pt-4 pb-28 md:px-8 md:pt-8 dark flex flex-col">
      <div className="flex-1">
        <SettingsDashboard />
      </div>
      <Footer />
      <CloseConfirmationDialog />
    </main>
  </ThemeProvider>
  );
}