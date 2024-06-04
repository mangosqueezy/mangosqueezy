import Image from "next/image";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import Chat from "./components/chat";
import { Separator } from "@/components/ui/separator";

export default async function SingleAffiliatePage({
  params,
}: {
  params: { slug: Array<string> };
}) {
  const profileParameters = {
    part: "statistics,snippet,topicDetails,status,brandingSettings,contentDetails",
    id: params.slug[0],
    key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!,
  };
  const profileQueryParameter = new URLSearchParams(profileParameters);
  const profileResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?${profileQueryParameter.toString()}`,
  );

  const videoParameters = {
    part: "snippet,contentDetails,statistics",
    id: params.slug[1],
    key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!,
  };
  const videoQueryParameter = new URLSearchParams(videoParameters);
  const videoResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?${videoQueryParameter.toString()}`,
  );
  const [profile, video] = await Promise.all([
    profileResponse.json(),
    videoResponse.json(),
  ]);

  return (
    <div className="grid h-full w-full min-h-[100vh]">
      <div className="flex flex-col">
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative flex-col items-start gap-8 md:flex">
            <article>
              <div>
                <div>
                  <Image
                    className="h-auto w-full object-cover lg:h-48 rounded-lg"
                    src={
                      profile.items[0].brandingSettings.image.bannerExternalUrl
                    }
                    width={200}
                    height={128}
                    alt=""
                  />
                </div>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                  <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      <Image
                        className="h-auto w-auto rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                        src={profile.items[0].snippet.thumbnails.high.url}
                        width={100}
                        height={100}
                        alt=""
                      />
                    </div>
                    <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                      <div className="mt-6 min-w-0 flex-1 sm:hidden 2xl:block">
                        <h1 className="truncate text-2xl font-bold text-gray-900">
                          {profile.items[0].snippet.title}
                        </h1>
                      </div>
                      <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <button
                          type="button"
                          className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          <EnvelopeIcon
                            className="-ml-0.5 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden">
                    <h1 className="truncate text-2xl font-bold text-gray-900">
                      {profile.items[0].snippet.title}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
                <h1 className="font-bold my-2">Channel Stats</h1>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                  {Object.keys(profile.items[0].statistics).map((field) => {
                    return (
                      field !== "hiddenSubscriberCount" && (
                        <div key={field} className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            {field}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {profile.items[0].statistics[field]}
                          </dd>
                        </div>
                      )
                    );
                  })}
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">About</dt>
                    <dd
                      className="mt-1 max-w-prose space-y-5 text-sm text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: profile.items[0].snippet.description,
                      }}
                    />
                  </div>
                </dl>
              </div>

              <Separator className="my-4" />

              <div className="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
                <h1 className="font-bold my-2">Video Stats</h1>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                  {Object.keys(video.items[0].statistics).map((field) => {
                    return (
                      field !== "hiddenSubscriberCount" && (
                        <div key={field} className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            {field}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {video.items[0].statistics[field]}
                          </dd>
                        </div>
                      )
                    );
                  })}
                </dl>
              </div>
            </article>
          </div>
          <div className="relative flex h-full max-h-screen flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Chat profile={profile} video={video} />
          </div>
        </main>
      </div>
    </div>
  );
}
