import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Playlist() {
  const username = headers().get("username")
  if (!username) return redirect('/join')
  const playlists = await prisma.playlist.findMany({
    where: { creator: { username } },
    select: { id: true, name: true, creator: { select: { username: true } } },
  });
  return (
    <section className="px-2 sm:px-0">
      <Breadcrumb>
        <BreadcrumbList className="text-3xl font-bold">
          <BreadcrumbItem>
            <BreadcrumbLink href="/playlist">Playlist</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <Collection
            key={playlist.id}
            playlistId={playlist.id}
            playlistName={playlist.name}
            creator={playlist.creator.username}
          />
        ))}
      </div>
    </section>
  );
}

function Collection({
  creator,
  playlistId,
  playlistName,
}: {
  creator: string;
  playlistName: string;
  playlistId: string;
}) {
  return (
    <div>
      <div className="relative flex justify-center">
        <div className="w-[90%] aspect-video bg-pink-300 absolute rounded-md  translate-y-1"></div>
        <div className="w-[95%] aspect-video bg-yellow-200 absolute translate-y-2 rounded-md"></div>
        <img
          src="/thumbnail.jpg"
          alt="thumbnail"
          className="w-full object-cover aspect-video rounded-md translate-y-3"
        />
      </div>
      <div className="mt-4 text-sm">
        <p>{playlistName}</p>
        <div className="text-xs space-x-1">
          <span>+{creator}</span> <span>&#8226;</span> <span>playlist</span>
        </div>
        <Link href="/playlist/abc">
          <Link href={`/playlist/${playlistId}`} className="text-xs">
            view Playlist
          </Link>
        </Link>
      </div>
    </div>
  );
}
