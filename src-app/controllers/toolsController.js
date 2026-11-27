const process = require('child_process');
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
    return new Promise((resolve, reject) => {
        let output = "";
        console.log("Pinging " + JSON.stringify(host));

        let timer = setTimeout(() => {
            console.log("Ping timed out");
            output = "ping: unknown host " + host;
            reject(output);
        }, 5000);
        // Allowlist for valid hosts to prevent command injection
        const ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'example.com', 'google.com'];
        const hostIndex = ALLOWED_HOSTS.indexOf(host);
        if (hostIndex === -1) {
            console.log("Invalid host: " + JSON.stringify(host));
            reject("Invalid host specified");
            return;
        }
        const safeHost = ALLOWED_HOSTS[hostIndex];

        try {
            let pingProcess = process.spawn('ping', ['-c', '1', safeHost]);
            pingProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pingProcess.stderr.on('data', (data) => {
                console.log("Error: " + data.toString());
                clearTimeout(timer);
                reject(data.toString());
            });

            pingProcess.on('exit', (code) => {
                console.log("Exit code: " + code);
                clearTimeout(timer);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(`ping process exited with code ${code}`);
                }
            });
        } catch (err) {
            console.error("Error occured during ping: ", err);
            output = "ping: unknown host " + host;
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
        return new Promise((resolve, reject) => {
            // Allowlist for valid fortune files to prevent command injection
            const ALLOWED_FORTUNE_FILES = ['fortunes', 'riddles', 'literature', 'art', 'computers'];
            const fileIndex = ALLOWED_FORTUNE_FILES.indexOf(fortuneFile);
            if (fileIndex === -1) {
                console.log("Invalid fortune file: " + JSON.stringify(fortuneFile));
                reject("Invalid fortune file specified");
                return;
            }
            const safeFortuneFile = ALLOWED_FORTUNE_FILES[fileIndex];

            let output=""
            try{
                process.execFile('fortune', [safeFortuneFile], (error, stdout, stderr) => {
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


