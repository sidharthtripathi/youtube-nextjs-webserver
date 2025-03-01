import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoSuggestionCard } from "@/components/ui/VideoSuggestionCard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { timeAgo } from "@/lib/time";
import { BookmarkIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Playlist } from "@/components/Playlist";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import Link from "next/link";
import { CommentForm, Comment } from "@/components/Comment";
import { headers } from "next/headers";

export default async function Video({
  params: { videoid },
}: {
  params: { videoid: string };
}) {
  await prisma.video.update({
    data: { views: { increment: 1 } },
    where: { id: videoid },
  });
  const username = headers().get("username");
  const video = await prisma.video.findUnique({
    where: { id: videoid },
    select: {
      hlsVideoUrl: true,
      title: true,
      description: true,
      createdAt: true,
      views: true,
      comments: {
        select: {
          author: { select: { username: true, avatar: true } },
          createdAt: true,
          comment: true,
          id: true,
          replyCount: true,
        },
      },
      uploader: {
        select: {
          username: true,
          avatar: true,
          subscribersCount: true,
        },
      },
    },
  });

  const videoSuggestion = await prisma.video.findUnique({
    where: { id: videoid },
    select: {
      uploader: {
        select: {
          videos: {
            where: { isPublished: true },
            select: {
              thumbnailUrl: true,
              title: true,
              id: true,
              createdAt: true,
              views: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          username: true,
        },
      },
    },
  });
  if (!video) return notFound();
  return (
    <div className="flex gap-4 p-4 items-start">
      <div className="lg:basis-2/3">
        {/* @ts-ignore */}
        <VideoPlayer
          src={video.hlsVideoUrl}
          autoPlay={true}
          controls={true}
          width="100%"
          className="aspect-video rounded-md"
        />
        {/* <video src={video.hlsVideoUrl}controls className="aspect-video rounded-md w-full"/> */}
        <div className="space-y-2">
          <p className="line-clamp-2 font-bold text-2xl">{video.title}</p>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage
                  src={video.uploader.avatar!}
                  className="rounded-full size-12"
                />
                <AvatarFallback>
                  {video.uploader.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <Link
                  href={`/channels/${video.uploader.username}`}
                  className="font-semibold"
                >
                  {video.uploader.username}
                </Link>
                <p className="text-sm text-gray-300">
                  {video.uploader.subscribersCount} Subscribers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger>
                  <BookmarkIcon className="size-6 hover:cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Video</DialogTitle>
                    <DialogDescription>
                      Select the playlist you want to add the video to
                    </DialogDescription>
                  </DialogHeader>
                  <Playlist videoId={videoid} />
                </DialogContent>
              </Dialog>

              <SubscriptionStatus username={video.uploader.username} />
            </div>
          </div>
        </div>
        <div className="bg-secondary rounded-lg mt-2 p-2">
          <div className="text-sm text-card-foreground space-x-2">
            <span>{video.views} Views</span>
            <span>&#8226;</span>
            <span>{timeAgo.format(video.createdAt)}</span>
          </div>
          <p className="text-sm">{video.description}</p>
        </div>
        <div className="mt-4">
          {username && (
            <CommentForm
              videoId={videoid}
              username={username}
              userAvatar="someavatar"
            />
          )}
          <div>
            {video.comments.map(
              ({ author, comment, createdAt, replyCount, id }) => (
                <Comment
                  id={id}
                  comment={comment}
                  time={createdAt}
                  replyCount={replyCount}
                  key={id}
                  userAvatar={author.avatar!}
                  username={author.username}
                />
              )
            )}
          </div>
        </div>
      </div>
      <div className="hidden lg:grid grid-cols-1 gap-4">
        {/* Better create a paralle route for this */}
        {videoSuggestion &&
          videoSuggestion?.uploader.videos.map((video) => (
            <VideoSuggestionCard
              id={video.id}
              title={video.title}
              thumbnailUrl={video.thumbnailUrl}
              createdAt={video.createdAt}
              views={video.views}
              username={videoSuggestion.uploader.username}
              key={video.id}
            />
          ))}
      </div>
    </div>
  );
}
