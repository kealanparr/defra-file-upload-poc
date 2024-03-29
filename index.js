var express = require("express");
var cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
require("dotenv").config();
const NodeClam = require("clamscan");
const ClamScan = new NodeClam().init({
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  scanLog: null, // Path to a writeable log file to write scan results into
  debugMode: false, // Whether or not to log info/debug/error msgs to the console
  fileList: null, // path to file containing list of files to scan (for scanFiles method)
  scanRecursively: true, // If true, deep scanZ folders recursively
  clamscan: {
    path: "/usr/bin/clamscan", // Path to clamscan binary on your server
    db: null, // Path to a custom virus definition database
    scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    active: true, // If true, this module will consider using the clamscan binary
  },
  clamdscan: {
    socket: false, // Socket file for connecting via TCP
    host: "localhost", // IP of host to connect to TCP interface
    port: 3310, // Port of host to use when connecting via TCP interface
    timeout: 60000, // Timeout for scanning files
    localFallback: true, // Use local preferred binary to scan if socket/tcp fails
    path: "/usr/bin/clamdscan", // Path to the clamdscan binary on your server
    configFile: null, // Specify config file if it's in an unusual place
    multiscan: true, // Scan using all available cores! Yay!
    reloadDb: false, // If true, will re-load the DB on every call (slow)
    active: true, // If true, this module will consider using the clamdscan binary
    bypassTest: false, // Check to see if socket is available when applicable
  },
  preference: "clamdscan", // If clamdscan is found and active, it will be used by default
});

var app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.post(
  "/api/fileanalyse",
  upload.single("upfile"),
  function (req, res, next) {
    // Get instance by resolving ClamScan promise object
    ClamScan.then(async (clamscan) => {
      try {
        const version = await clamscan.getVersion();
        debugger;
        //console.log(`ClamAV Version: ${version}`);
        const { isInfected, file, viruses } = await clamscan.isInfected(
          __dirname + "/uploads/a.txt"
        );
        if (isInfected) {
          console.log(`${file} is infected with ${viruses}!`);
        } else {
          console.log("it worked!");
          console.log(viruses);
          console.log(isInfected);
        }
      } catch (err) {
        // Handle any errors raised by the code in the try block
        console.log(err);
      }
    }).catch((err) => {
      // Handle errors that may have occurred during initialization
      console.log(err);
    });

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      })
    );
  }
);

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(7001, () => {
  console.log("Your app is listening on port 7001"); // 7000 chosen as all our DEFRA services use 3000, and I kept "overlapping" and having to kill one service
});
