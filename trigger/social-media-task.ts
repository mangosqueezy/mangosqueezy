import { logger, task, wait } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const socialMediaTask = task({
  id: "social-media-metrics-collector",
  run: async (payload: any, { ctx }) => {
    logger.log("Social media profile metrics collector...", { payload, ctx });

    const { ytChannelHandle, igChannelHandle } = payload;
    let ytChannelStats = {};
    let ytChannelId = "";

    if (ytChannelHandle) {
      logger.log("running yt metrics collector...", { ytChannelHandle });
      const parameters = {
        part: "statistics,snippet,topicDetails,status,brandingSettings,contentDetails",
        key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!,
        forHandle: ytChannelHandle,
      };
      const queryParameter = new URLSearchParams(parameters);
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?${queryParameter.toString()}`,
        {
          method: "GET",
        }
      );

      const result = await response.json();
      ytChannelStats = result.items;

      ytChannelId = result.items[0].id;

      logger.log("yt metrics collector output is ...", { ytChannelStats });
    }

    await wait.for({ seconds: 5 });

    let igChannelStats = {};
    if (igChannelHandle) {
      logger.log("running ig metrics collector...", { igChannelHandle });
      const igBusinessId = process.env.IG_BUSINESS_ID;
      const igAccessToken = process.env.IG_ACCESS_TOKEN;
      const parameters = {
        fields: `business_discovery.username(${igChannelHandle}){followers_count,media_count,media{comments_count,like_count},name,biography,website}`,
        access_token: igAccessToken!,
      };
      const queryParameter = new URLSearchParams(parameters);
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${igBusinessId}?${queryParameter.toString()}`,
        {
          method: "GET",
        }
      );

      igChannelStats = await response.json();

      logger.log("igChannelStats metrics collector output is ...", { igChannelStats });
    }

    return {
      ytChannelId,
      ytChannelStats,
      igChannelStats,
    };
  },
  onSuccess: async (payload, output) => {
    const { affiliatorId } = payload;
    // store the metrics data that we receive from youtube and instagram into database
    logger.log("social media metrics collector task output is with payload ", {
      payload,
      output,
    });

    const affiliatProfileInfo = await prisma.affiliates.findUnique({
      where: {
        id: affiliatorId,
      },
    });

    let socialMediaProfiles = affiliatProfileInfo?.social_media_profiles;

    if (output?.ytChannelId) {
      socialMediaProfiles = {
        ...(affiliatProfileInfo?.social_media_profiles as Prisma.JsonObject),
        youtube: output?.ytChannelId,
      };
    }

    await prisma.affiliates.update({
      where: {
        id: affiliatorId,
      },
      data: {
        metadata: output as Prisma.JsonObject,
        social_media_profiles: socialMediaProfiles as Prisma.JsonObject,
      },
    });
  },
});
