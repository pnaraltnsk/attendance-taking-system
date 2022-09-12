import {createClient, createMicrophoneAndCameraTracks} from "agora-rtc-react";

const appId = "b7f1b7d0873b4a0a89de9f3fcb80abc2"
const token = "007eJxTYHiquqHfPqo4upqtWGxzIxvv3/zYSYmPd9xdcvnk8rIXu+UUGJLM0wyTzFMMLMyNk0wSDRItLFNSLdOM05KTLAwSk5KNmtnkkpki5JNNzzxmYIRCEJ+FITcxM4+BAQB5vyBl"

export const config = {mode: "rtc", codec: "vp8", appId: appId, token: token};
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";