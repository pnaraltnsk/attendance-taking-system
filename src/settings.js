import {createClient, createMicrophoneAndCameraTracks} from "agora-rtc-react";

const appId = "b7f1b7d0873b4a0a89de9f3fcb80abc2"
const token = "007eJxTYCj/4PcrOqjMWniRU/Y0ZgnmKP7zK+QrnnO96rbZ5zX10GoFhiTzNMMk8xQDC3PjJJNEg0QLy5RUyzTjtOQkC4PEpGSjbVfkks3UFJJPvXzMyMgAgSA+C0NuYmYeAwMAEKsgEg=="

export const config = {mode: "rtc", codec: "vp8", appId: appId, token: token};
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";