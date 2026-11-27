import { redirect } from "next/navigation";

/** /admin → the leads list (the only admin page so far). */
export default function Admin() {
  redirect("/admin/leads");
}
