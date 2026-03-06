import { prisma } from "@/lib/prisma";
import VenueMap from "./VenueMap";

export const dynamic = "force-dynamic";

async function getVenues() {
  return prisma.venue.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

async function getVenueIntroSettings() {
  const list = await prisma.siteSetting.findMany({
    where: { key: { in: ["venueIntro", "venueIntroMapAddress"] } },
  });
  const map = Object.fromEntries(list.map((s) => [s.key, s.value]));
  return { intro: map.venueIntro ?? "", mapAddress: map.venueIntroMapAddress ?? "" };
}

export default async function VenuePage() {
  const [venues, venueSettings] = await Promise.all([getVenues(), getVenueIntroSettings()]);
  const { intro: venueIntro, mapAddress: venueIntroMapAddress } = venueSettings;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">대회 당구장 안내</h1>
      {venueIntro && (
        <div className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: venueIntro }} />
        </div>
      )}
      {venueIntroMapAddress && (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">위치</h2>
          <div className="h-80 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <iframe
              title="대회당구장 위치"
              src={`https://map.naver.com/v5/search/${encodeURIComponent(venueIntroMapAddress)}/place`}
              className="h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      )}
      <div className="space-y-12">
        {venues.map((v) => (
          <section key={v.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="grid md:grid-cols-2">
              {v.imageUrl && (
                <div className="relative h-48 md:h-64">
                  <img src={v.imageUrl} alt={v.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800">{v.name}</h2>
                <p className="mt-2 text-gray-600">{v.address}</p>
                {v.description && (
                  <div className="mt-4 prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: v.description }} />
                )}
                {v.lat != null && v.lng != null && (
                  <div className="mt-4 h-64">
                    <VenueMap lat={v.lat} lng={v.lng} name={v.name} />
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
