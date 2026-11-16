import { AdminNav } from "@/components/AdminNav";

/* Frame for the owner's pages (behind ADMIN_PASSWORD, middleware.ts): /admin/links (every invite link) and
   /admin/leads (contact details). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
