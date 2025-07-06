import * as Localization from "expo-localization";

/**
 * 주어진 시간 "HH:mm"을 특정 타임존 기준의 Date 유형으로 변환
 */
export function parseTimeWithTimezone(
  time: string,
  timezoneOverride?: string
): Date {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10) || 0);
  const now = new Date();

  const calendars = Localization.getCalendars();
  const deviceTz = calendars[0]?.timeZone; // e.g. "Asia/Seoul"
  const timezone = timezoneOverride || deviceTz || "UTC";

  const local = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    0
  );
  if (local.getTime() <= now.getTime()) local.setDate(local.getDate() + 1);

  console.log(
    `[parse] time=${time}, tz=${timezone}, result=${local.toString()}`
  );
  return local;
}
