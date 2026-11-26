const process = require('child_process');
const { spawn, execFile } = process;
const fortuneRiddle = require('../utils/fortuneData.js');

// Loads tools page
function showTools(req, res) {
    res.render('tools.hbs', {});
}
// Performs actions on tools page
async function processTools(req, res) {
    console.log("Request body:", JSON.stringify(req.body)); // Log the entire request body
    let host = req.body.host;
    let fortuneFile = req.body.fortuneFile;

    res.locals['ping'] = await ((host != null) ? ping(host).catch(function () { console.log("Promise rejected"); }) : "");

    if (!fortuneFile) {
        fortuneFile = "fortunes";
    }
    console.log("Selected fortune file:", JSON.stringify(fortuneFile));
    
    res.locals['fortunes'] = await fortune(fortuneFile).catch(function () { console.log("Promise rejected"); });
    
    return res.render('tools', {host});
}
// Pings selected host based on user input, then outputs the results
async function ping(host) {
    // Allowlist validation for host parameter
    const ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'example.com', 'google.com', '8.8.8.8'];
    const hostIndex = ALLOWED_HOSTS.indexOf(host);

    if (hostIndex === -1) {
        return Promise.reject('Invalid host selection');
    }

    // Use the allowlist value, not the user input
    const safeHost = ALLOWED_HOSTS[hostIndex];

    return new Promise((resolve, reject) => {
        let output = "";
        console.log("Pinging " + JSON.stringify(safeHost));

        let timer = setTimeout(() => {
            console.log("Ping timed out");
            output = "ping: unknown host " + safeHost;
            reject(output);
        }, 5000);
        try {
            execFile('ping', ['-c', '1', safeHost], (error, stdout, stderr) => {
                clearTimeout(timer);
                if (error) {
                    console.log("Error: " + stderr);
                    reject(stderr || `ping process exited with code ${error.code}`);
                } else {
                    console.log("Exit code: 0");
                    resolve(stdout);
                }
            });
        } catch (err) {
            console.error("Error occured during ping: ", err);
            clearTimeout(timer);
            output = "ping: unknown host " + safeHost;
            resolve(output);
        }
    });
}

// Produces a fortune based on selection
async function fortune(fortuneFile) {
    
    if (fortuneFile === "fortunes") {
        console.log(JSON.stringify(fortuneFile))
        console.log(JSON.stringify(fortuneRiddle.FortuneData()))
        return fortuneRiddle.FortuneData();
    }
    else if (fortuneFile === "riddles") {
        console.log(JSON.stringify(fortuneFile))
        console.log(JSON.stringify(fortuneRiddle.RiddleData()))
        return fortuneRiddle.RiddleData();
    } else {
        // Allowlist validation for fortune file argument
        const ALLOWED_FORTUNE_FILES = ['fortunes', 'riddles', 'literature', 'art', 'computers'];
        const fileIndex = ALLOWED_FORTUNE_FILES.indexOf(fortuneFile);

        if (fileIndex === -1) {
            return Promise.reject('Invalid fortune file selection');
        }

        // Use the allowlist value, not the user input
        const safeFortuneFile = ALLOWED_FORTUNE_FILES[fileIndex];

        return new Promise((resolve, reject) => {
            let output=""
            try{
                execFile('fortune', [safeFortuneFile], (error, stdout, stderr) => {
                    if (error) {
                      console.error(`exec error: ${error}`);
                      reject(output);
                    }
                    resolve(stdout)
                });
            }
            catch(err)
            {
                console.log(err);
                resolve(output);
            }
        })
    }
}


module.exports = {showTools, processTools,}


