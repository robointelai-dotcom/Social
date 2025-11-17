import axios, { AxiosResponse } from "axios";
import CONFIG from "@/config";
import { IAccountDto, IPhoneDto, ISocialPlatform } from "@shared/types";
import logger from "@/common/logger";
import { v4 as uuid } from "uuid";
import { Task } from "@/task/task.model";
import { TASK_STATUS_MAPPINGS, TASK_TYPE_MAPPINGS } from "../constants";
import { readFile } from "fs/promises";
import { BadRequest } from "../custom-error";

const api = axios.create({
  baseURL: CONFIG.GEELARK_BASE_URL,
});

api.interceptors.request.use(req => {
  req.headers.set("Authorization", `Bearer ${CONFIG.GEELARK_TOKEN}`)
  req.headers.set("traceId", uuid());
  return req;
}, err => Promise.reject(err))

export class GeelarkAPI {

  public async getPhones(pagination = { page: 1, pageSize: 100 }) {
    logger.info("Fetching mobile phones from geelark api");

    const res = await api.post<IPhoneDto>("/v1/phone/list", pagination);
    const { items } = res.data.data;

    return items.map((item) => ({
      mobileId: item.id,
      serialName: item.serialName,
      brand: item.equipmentInfo.deviceBrand,
      model: item.equipmentInfo.deviceModel,
      osVersion: item.equipmentInfo.osVersion,
    }));
  }

  public async warmup(acc: IAccountDto, keyword: string[], scheduleAt = Date.now()) {
    // to warmup the accounts (scrolling through the platform so they doesn't think that this is automated)
    logger.info("Started warming up");

    scheduleAt = Math.floor(scheduleAt / 1000);

    const url = this.getWarmupUrl(acc.platform);

    let warmupRes: AxiosResponse<any, any>;

    logger.info(`Warming up for the platform ${acc.platform}`);

    switch (acc.platform) {
      case "tik-tok":
        warmupRes = await axios.post(url, { scheduleAt, envId: acc.mobileId, action: "browse video", duration: Math.random() * 10 });
        break;
      case "facebook":
        warmupRes = await axios.post(url, { scheduleAt, id: acc.mobileId, browsePostsNum: Math.random() * 10, keyword, name: `${acc.platform} warmup` });
        break;
      case "instagram":
        warmupRes = await axios.post(url, { scheduleAt, id: acc.mobileId, browseVideo: Math.random() * 10, name: `${acc.platform} warmup` });
        break;
      case "youtube":
        warmupRes = await axios.post(url, { scheduleAt, id: acc.mobileId, browseVideoNum: Math.random() * 10, keyword, name: `${acc.platform} warmup` });
        break;
      default:
        throw new Error(`${acc.platform} has no warump`);
    }

    if (warmupRes.data.code === 0) {
      await Task.create({
        taskId: warmupRes.data.data.taskId,
        traceId: warmupRes.headers["traceid"],
        mobileId: acc.mobileId,
        scheduledAt: new Date(scheduleAt)
      });
    }


    return warmupRes.data;
  }

  public async autoLogin(acc: IAccountDto, scheduleAt = Date.now()) {
    logger.info("Started auto login")

    let url = "/v1/rpa/task";

    scheduleAt = Math.floor(scheduleAt / 1000);

    logger.info(`Scheduling login of ${acc.username} into ${acc.platform} at timestamp: ${new Date(scheduleAt * 1000).toISOString()}`);

    const payload: Record<string, string | number> = {
      name: `Login ${acc.username.slice(0, 6)} into ${acc.platform}`,
      scheduleAt,
      password: acc.password,
      id: acc.mobileId,
    };

    switch (acc.platform) {
      case "instagram":
        url += "/instagramLogin";
        payload["username"] = acc.username;
        break;
      case "facebook":
        url += "/faceBookLogin";
        payload["email"] = acc.username;
        break;
      case "tik-tok":
        url += "/tiktokLogin";
        payload["account"] = acc.username;
        break;
      case "youtube":
        url += "/googleLogin";
        payload["email"] = acc.username;
        break;
      default:
        throw new Error("Unsupported platform");
    }

    logger.info(`Sending login request to Geelark API for platform: ${acc.platform}`);

    const res = await api.post(url, payload);

    logger.info(`Received response from Geelark API ${JSON.stringify(res.data)}`);

    if (res.data.code === 0) {
      await Task.create({
        taskId: res.data.data.taskId,
        traceId: res.headers["traceid"],
        mobileId: acc.mobileId,
        scheduledAt: new Date(scheduleAt)
      });
    }

    return res.data;
  }

  public async uploadMedia(mediaPath: string, fileType: string) {
    logger.info("Uploading media");

    const fileUrlRes = await api.post("/v1/upload/getUrl", { fileType });

    if (fileUrlRes.data.code !== 0) {
      throw new BadRequest("Failed to get upload URL from Geelark API");
    }

    const { uploadUrl, resourceUrl } = fileUrlRes.data.data as { uploadUrl: string, resourceUrl: string };

    logger.info(`Got upload url ${uploadUrl} and resource url ${resourceUrl}`);

    const fileContent = await readFile(mediaPath);

    if (!fileContent) {
      throw new BadRequest("Failed to read media file for upload");
    }

    logger.info("Uploading media to the uploadUrl now");

    await axios.put(uploadUrl, fileContent);

    logger.info("Media upload done");

    return resourceUrl;
  }

  public async checkUploadStatus(taskId: string) {
    const uploadStatusRes = await api.post("/v1/phone/uploadFile/result", { taskId });
    return uploadStatusRes.data.code === 0 ? uploadStatusRes.data.data.status : uploadStatusRes.data;
  }

  public async publishVideo(mediaUrl: string, caption: string, acc: IAccountDto, scheduleAt: number
  ) {
    logger.info("Started publishing video");

    scheduleAt = Math.floor(scheduleAt / 1000);

    const payload: Record<string, any> = {
      name: `publising video to ${acc.platform}`,
      id: acc.mobileId,
      video: [mediaUrl],
      description: caption,
      scheduleAt
    };

    const url = this.getVideoUploadUrl(acc.platform);
    let publishRes: AxiosResponse<any, any>;

    if (acc.platform === "tik-tok") {
      // Publish Video:1, Warmup:2, Publish Image Set: 3
      publishRes = await api.post(url, { taskType: 1, list: [{ envId: acc.mobileId, video: mediaUrl, scheduleAt }] })
    } else if (acc.platform === "facebook") {
      // Publish Video:1, Warmup:2, Publish Image Set: 3
      payload['video'] = mediaUrl;
      publishRes = await api.post(url, payload);
    } else if (acc.platform === "youtube") {
      // Publish Video:1, Warmup:2, Publish Image Set: 3
      payload['video'] = mediaUrl;
      publishRes = await api.post(url, payload);
    } else {
      publishRes = await api.post(url, payload);
    }

    logger.info(`Got a reponse from geelark api when posting video : ${JSON.stringify(publishRes.data)}`);

    await Task.create({
      taskId: publishRes.data.data.taskId,
      traceId: publishRes.headers["traceid"],
      mobileId: acc.mobileId,
      scheduledAt: new Date(scheduleAt)
    })

    return publishRes;
  }


  public async publishPhoto(mediaUrl: string, caption: string, acc: IAccountDto, scheduleAt: number) {
    logger.info("Started publishing video");

    scheduleAt = Math.floor(scheduleAt / 1000);

    const payload = {
      name: `publishing photo to ${acc.platform}`,
      id: acc.mobileId,
      image: [mediaUrl],
      description: caption,
      scheduleAt
    };

    const url = this.getImageUploadUrl(acc.platform);
    let publishRes: AxiosResponse<any, any>;

    if (acc.platform === "tik-tok") {
      // Publish Video:1, Warmup:2, Publish Image Set: 3
      publishRes = await api.post(url, { taskType: 3, list: [{ envId: acc.mobileId, images: [mediaUrl], scheduleAt }] })
    } else {
      publishRes = await api.post(url, payload);
    }

    logger.info(`Got a reponse from geelark api when posting photo : ${JSON.stringify(publishRes.data)}`);

    if (publishRes.data.code === 0) {
      await Task.create({
        taskId: publishRes.data.data.taskId,
        traceId: publishRes.headers["traceid"],
        mobileId: acc.mobileId,
        scheduledAt: new Date(scheduleAt)
      })
    }

    return publishRes;
  }

  public async queryTasks(taskIds: string[] = []) {
    logger.info("Querying tasks from Geelark API");

    const res = await api.post("/v1/task/query", { ids: taskIds });

    if (res.data.code !== 0) {
      return res.data;
    }

    const finalTasks = res.data.data.items.map((task: any) => {
      return {
        ...task,
        status: TASK_STATUS_MAPPINGS[task.status as keyof typeof TASK_STATUS_MAPPINGS] || task.status,
        taskType: TASK_TYPE_MAPPINGS[task.taskType as keyof typeof TASK_TYPE_MAPPINGS] || task.taskType,
      }
    });

    return finalTasks;
  }

  public async cancelTask(taskId: string) {
    logger.info(`Cancelling task with id: ${taskId}`);

    const res = await api.post("/v1/task/cancel", { ids: [taskId] });

    return res.data;
  }

  public async retryTask(taskId: string) {
    logger.info(`Retrying task with id: ${taskId}`);

    const res = await api.post("/v1/task/retry", { ids: [taskId] });

    return res.data;
  }


  // PRIVATE METHODS FOR INTERNAL ACCESS
  private getVideoUploadUrl(platform: ISocialPlatform) {
    let url = "/v1/rpa/task";

    switch (platform) {
      case "instagram":
        url += "/instagramPubReels";
        break;
      case "facebook":
        url += "/faceBookPubReels";
        break;
      case "tik-tok":
        url += "/add";
        break;
      case "youtube":
        url += "/youtubePubShort";
        break;
      default:
        throw new Error("Unsupported platform");
    }

    return url;
  }


  private getImageUploadUrl(platform: ISocialPlatform) {
    let url = "/v1/rpa/task";

    switch (platform) {
      case "instagram":
        url += "/instagramPubReelsImages";
        break;
      case "tik-tok":
        url += "/add";
        break;
      default:
        throw new Error(`${platform} has no image posting option`);
    }

    return url;
  }

  private getWarmupUrl(platform: ISocialPlatform) {
    let url = "/v1/rpa/task";

    switch (platform) {
      case "facebook":
        url += "/faceBookActiveAccount";
        break;
      case "instagram":
        url += "/instagramWarmup";
        break;
      case "youtube":
        url += "/youTubeActiveAccount";
        break;
      case "tik-tok":
        url += "/add";
        break;
      default:
        throw new Error(`${platform} has no warup capabilities`);
    }

    return url;
  }
}