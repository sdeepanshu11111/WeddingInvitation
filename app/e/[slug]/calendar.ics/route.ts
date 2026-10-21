import { getLiveProject, getShare } from "@/lib/server/share";
import { icsFile, inviteDetails } from "@/lib/inviteDetails";
import { SITE_URL } from "@/lib/site";

/* "Add to calendar" on iPhones: an .ics with every function of the invite (Apple Calendar shows "Add All").
   Android and laptops use a Google Calendar link instead (app/e/[slug]/GuestDetails.tsx). The details are the
   ones already printed on the invite. A share never changes, so the file can be cached. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const share = await getShare(params.slug).catch(() => null);
  const project = share?.kind === "live" ? await getLiveProject(share.token).catch(() => null) : null;
  if (!share || !project) return new Response("Invitation not found", { status: 404 });
  const { events } = inviteDetails(project.templateId, project.data);
  if (!events.length) return new Response("This invitation has no date yet", { status: 404 });
  const origin = process.env.SITE_URL ? SITE_URL : new URL(req.url).origin;
  const body = icsFile(events, share.title, origin + "/e/" + share.token, share.token);
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="invitation.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
