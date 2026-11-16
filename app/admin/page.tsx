import { redirect } from "next/navigation";

/** /admin → every invite link (/admin/links); contact details are on /admin/leads. */
export default function Admin() {
  redirect("/admin/links");
}
