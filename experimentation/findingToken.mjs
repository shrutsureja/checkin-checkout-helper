import axios from "axios";
import { writeHTMLtoFile, writeJSONtoFile } from "./utils.mjs";
// console.log(
// `URL : https://{{subdomain}}.{{environment}}.com/api/v1/time/attendance`
// );

async function makingRequest() {
  const token = `....`;
  const newToken = `...`;
  const wtoken = `....`;

  const url =
    // "https://kevit.keka.com/k/attendance/api/mytime/attendance/attendancemodulestatus";
    // "";
    // "https://kevit.keka.com/k/attendance/api/mytime/attendance/attendancerequests?fromDate=2024-05-23&toDate=2024-06-22";
    // "https://kevit.keka.com/k/attendance/api/mytime/attendance/shiftweekoffdetails";
    "https://kevit.keka.com/k/attendance/api/mytime/attendance/summary";
  const currentFormattedDate = new Date("2024-06-21")
    .toLocaleDateString()
    .split("/")
    .join("-");
  const response = await fetch(url + "/" + currentFormattedDate, {
    method: "GET",
    // params: {
    //   fromDate: "2024-06-21",
    //   toDate: "2024-06-21",
    // },
    headers: {
      Accept: "application/json",
      Authorization: newToken,
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) {
    console.log(response);
    return;
  }
  const data = await response.json();
  // console.log(response.statusCode !== 200);
  console.log(data);
  writeJSONtoFile("logtime21-06-2024.json", data);
}

makingRequest();

// ! This has the logs
// TODO : log
// fetch("https://kevit.keka.com/k/attendance/api/mytime/attendance/summary"

// ! this has the overall summary of the attendance
// fetch(
//   "https://kevit.keka.com/k/attendance/api/mytime/attendance/lastweekstats?fromDate=2024-06-10&toDate=2024-06-16",
//
