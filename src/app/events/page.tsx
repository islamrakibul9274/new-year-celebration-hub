import type { Metadata } from "next";
import EventsView from "./EventsView";

export const metadata: Metadata = {
  title: "Midnight Gala Events & RSVP | New Year Celebration Hub",
  description: "Full New Year gala itinerary at New Park Hotel with instant digital RSVP passes.",
  alternates: { canonical: "/events" },
};

export default function Page() {
  return <EventsView />;
}
