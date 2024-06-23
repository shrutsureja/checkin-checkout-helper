/**
 * @fileoverview This is the main file for the application.
 *
 * Overview:
 * 1. Checking if the Bearer token is present in the file '.header.txt' or not.
 * 2. If the Bearer token is not present, then notify that "Token is NOT Found".
 * 3. If the Bearer token is present, then request the data from the API.
 * 4. Do the necessary calculation's and give the notification in the system.
 *
 * To fit different scenarios we will use the process.argv handle them.
 */
import fs from "fs";
import { exec } from "child_process";

// CONSTANTS
const kekaAttendanceSummaryUrl =
  "https://kevit.keka.com/k/attendance/api/mytime/attendance/summary";
const TIME_TO_SPEND = 8 * 60 + 30; // 8 hours and 30 minutes

// MAIN FUNCTION
async function main() {
  try {
    const token = fs.readFileSync(".header.txt", "utf8");

    if (!token) {
      exec(
        "notify-send -u normal 'Token missing in file' 'Add token to the file.'"
      );
    }

    const entryTimestamps = await fetchTodayAttendanceData(token);
    // even positions is checkin time and odd are checkout time

    const commandLineScenario = process.argv[2];
    const currnetTimeInMinutes =
      new Date().getHours() * 60 + new Date().getMinutes();

    if (commandLineScenario === "TotalTimeSpent") {
      // time calculation needs to be done
      if (entryTimestamps.length % 2 !== 0) {
        let totalTimeSpent = 0;
        // either 1 entry or 3 entries
        if (entryTimestamps.length === 1) {
          totalTimeSpent = currnetTimeInMinutes - entryTimestamps[0];
        } else {
          // 3 entries
          totalTimeSpent =
            currnetTimeInMinutes -
            entryTimestamps[2] +
            entryTimestamps[1] -
            entryTimestamps[0];
        }
      } else {
        for (let i = 0; i < entryTimestamps.length; i += 2) {
          totalTimeSpent += entryTimestamps[i + 1] - entryTimestamps[i];
        }
      }
      const notifyed = notifyTimeInHoursAndMinutes(totalTimeSpent);
      if (!notifyed) {
        // logging the time in file
        fs.appendFileSync(
          "timeSpent.log",
          `${new Date().toLocaleDateString()} : ${entryTimestamps};\n`
        );
      }
    } else if (commandLineScenario === "TimeToLeave") {
      if (entryTimestamps.length !== 3) {
        exec(
          `notify-send -u normal 'Time to leave' 'Not enough data to calculate'`
        );
        return;
      }
      const firstHalfTimeSpent = entryTimestamps[1] - entryTimestamps[0];
      const timeLeft = TIME_TO_SPEND - firstHalfTimeSpent;
      const timeToLeave = entryTimestamps[2] + timeLeft;
      const notifyed = notifyTimeInHoursAndMinutes(timeToLeave);

      if (currnetTimeInMinutes >= timeToLeave) {
        exec(`notify-send -u normal 'Time to leave' 'You can leave now'`);
        return;
      }
      if (!notifyed) {
        // logging the time in file
        fs.appendFileSync(
          "timeToLeave.log",
          `${new Date().toLocaleDateString()} : ${entryTimestamps};
            `
        );
      }
    } else {
      exec(
        `notify-send -u normal 'Invalid command' 'Use either TotalTimeSpent or TimeToLeave'`
      );
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      exec(
        "notify-send -u normal 'Token file missing' 'Add a token in the file'"
      );
    } else {
      console.log(error);
      exec("notify-send -u normal 'Some error in reading file'");
    }
  }
}

async function fetchTodayAttendanceData(token) {
  const currentFormattedDate = new Date()
    .toLocaleDateString()
    .split("/")
    .join("-");
  const response = await fetch(
    kekaAttendanceSummaryUrl + "/" + currentFormattedDate,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status !== 200) {
    exec(
      `notify-send -u normal -t 50 'Error in fetching data' 'status code : ${response.status}'`
    );
    process.exit(1);
  } else {
    const { data, succeeded } = await response.json();
    if (!succeeded) {
      exec(
        `notify-send -u normal 'Error in fetching data' 'succeeded : ${succeeded}'`
      );
    }
    // since we are fetching the todays data only
    const entryTimestampsInMinutes = data[0].timeEntries.map((entry) =>
      extractMinutes(entry.actualTimestamp)
    );
    // testing
    // const entryTimestampsInMinutes = [583, 802, 833];
    return entryTimestampsInMinutes;
  }
}

function notifyTimeInHoursAndMinutes(timeInMinutes) {
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  if (hours > 24) {
    exec(
      `notify-send -u normal 'Some Error in Calculation' 'More than 24 hours'`
    );
    return false;
  }
  exec(
    `notify-send -u normal 'Total time spent' '${hours} hours and ${minutes} minutes'`
  );
  return true;
}

main();
