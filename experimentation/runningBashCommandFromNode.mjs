import { exec } from "node:child_process";
const time = "12:00";

exec(
  `notify-send -u normal -t 1 'Time to Leave is' 'We can leave at this time ${time}'`
);

// ls.stdout.on("data", (data) => {
//   console.log(`stdout: ${data}`);
// });

// ls.stderr.on("data", (data) => {
//   console.error(`stderr: ${data}`);
// });

// ls.on("close", (code) => {
//   console.log(`child process exited with code ${code}`);
// });
