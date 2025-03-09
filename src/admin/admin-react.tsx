import React from "react"
import { createRoot } from 'react-dom/client';
import { SettingsDashboard } from "@/admin/components/settings-dashboard"
import { ThemeProvider } from "@/admin/components/theme-provider"



// Mount the React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render( 
  <ThemeProvider defaultTheme="dark" forcedTheme="dark">
    <main className="min-h-screen bg-background p-4 md:p-8 dark">
      <SettingsDashboard />
    </main>
  </ThemeProvider>
  );
}