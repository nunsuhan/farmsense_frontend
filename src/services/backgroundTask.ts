
import BackgroundFetch from 'react-native-background-fetch';
import { checkAndAutoUpload } from '../utils/autoUploader';

/**
 * 백그라운드 작업 초기화
 */
export const initBackgroundFetch = async () => {
    try {
        const status = await BackgroundFetch.configure(
            {
                minimumFetchInterval: 15, // 15분마다 (OS 최소값)
                stopOnTerminate: false,   // 앱 종료 후에도 실행 (Android)
                startOnBoot: true,        // 부팅 시 자동 실행 (Android)
                enableHeadless: true,     // Headless 모드 (Android)
                requiredNetworkType: BackgroundFetch.NETWORK_TYPE_UNMETERED, // WiFi 권장 (하지만 WiFiOnly는 내부 로직에서도 체크함)
            },
            async (taskId) => {
                console.log('[BackgroundFetch] 작업 시작:', taskId);

                // 실제 작업 실행
                await checkAndAutoUpload();

                // 작업 완료 신호
                BackgroundFetch.finish(taskId);
            },
            (error) => {
                console.error('[BackgroundFetch] 설정 실패:', error);
            }
        );

        console.log('[BackgroundFetch] 초기화 완료, 상태:', status);

        // Headless Task 등록 (Android 앱 종료 시)
        BackgroundFetch.registerHeadlessTask(HeadlessCheckTask);

    } catch (error) {
        console.error('[BackgroundFetch] 초기화 에러:', error);
    }
};

/**
 * Headless Task (Android, iOS 일부)
 * 앱이 종료된 상태에서 호출될 때 실행
 */
const HeadlessCheckTask = async (event: any) => {
    console.log('[BackgroundFetch] Headless Task 시작:', event.taskId);

    // 작업 실행
    const result = await checkAndAutoUpload();
    console.log('[BackgroundFetch] Headless 결과:', result);

    // 작업 완료 신호 (Headless에서는 필수 아닐 수 있지만 권장)
    if (event.taskId) {
        BackgroundFetch.finish(event.taskId);
    }
};
