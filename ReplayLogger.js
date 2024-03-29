const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'log.txt');

fs.unlink(logFilePath, (err) => {
    if (err) {
        return;
    }
});

const usernameFilePath = path.join(__dirname, 'username.ini');
let replayFilePath;

fs.readFile(usernameFilePath, 'utf8', (err, data) => {
    if (err) {
        return;
    }
    const username = data.trim();
    replayFilePath = `C:\\Users\\${username}\\AppData\\Local\\Crashday\\replays\\_!lastracereplay!_.rpl`;
    console.log(`username.ini file path: ${usernameFilePath}`);
    console.log(`Replay file path: ${replayFilePath}`);
});

let latestLogFilePath = null;

const interval = setInterval(() => {
    if (fs.existsSync(replayFilePath)) {
        try {
            // Get the modification date of the replay file
            const replayFileStats = fs.statSync(replayFilePath);
            const replayFileModDate = replayFileStats.mtime;

            // Create the output directory
            const outputDirName = replayFileModDate.toISOString().slice(0, 10);
            const outputDirPath = path.join(path.dirname(replayFilePath), outputDirName);
            if (!fs.existsSync(outputDirPath)) {
                fs.mkdirSync(outputDirPath);
            }

            // Find the next available sequential number for file names
            let nextNumber = 1;
            while (fs.existsSync(path.join(outputDirPath, `event${nextNumber}.log`))) {
                nextNumber++;
            }

            // Replace the desired output file name
            const gamemodeMatch = fs.readFileSync(replayFilePath, 'utf8').match(/gamevar=(\S+)/);
            const gamemodeValue = gamemodeMatch ? gamemodeMatch[1] : 'unknown';
            const outputFileName = `event${nextNumber} ${getFormattedTime(replayFileModDate)} ${gamemodeValue}.log`;
            latestLogFilePath = path.join(outputDirPath, outputFileName);

            // Read the .rpl file
            fs.readFile(replayFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // Process replay file data and extract relevant information

                // Write the data to the latest log file
                fs.writeFile(latestLogFilePath, replayDetails, 'utf8', (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    console.log(`Latest replay details saved to ${outputFileName}`);

                    // Remove older log files
                    removeOlderLogFiles(outputDirPath, latestLogFilePath);

                    // Update file names to remove gaps and ensure sequential numbering
                    updateFileNames(outputDirPath);
                });
            });

            // Helper function to remove older log files
            function removeOlderLogFiles(outputDirPath, latestLogFilePath) {
                fs.readdir(outputDirPath, (err, files) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    files.forEach((file) => {
                        if (file !== latestLogFilePath.split(path.sep).pop()) {
                            const filePath = path.join(outputDirPath, file);
                            fs.unlink(filePath, (err) => {
                                if (err) {
                                    console.error(`Error deleting file ${filePath}:`, err);
                                } else {
                                    console.log(`Deleted file: ${filePath}`);
                                }
                            });
                        }
                    });
                });
            }

// Function to update file names to remove gaps and ensure sequential numbering
function updateFileNames(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error(`Error reading folder ${folderPath}:`, err);
            return;
        }

        // Extract existing sequential numbers from file names with .log extension
        const existingNumbers = files
            .filter((file) => file.endsWith('.log'))
            .map((file) => {
                const match = file.match(/^event(\d+)\.log$/);
                return match ? parseInt(match[1]) : null;
            })
            .filter((number) => number !== null);

        // Find the maximum existing sequential number
        const maxNumber = Math.max(...existingNumbers);

        // Find the next available sequential number
        const nextNumber = maxNumber !== -Infinity ? maxNumber + 1 : 1;

        files.forEach((file) => {
            const expectedName = `event${nextNumber}.log`;
            if (file !== expectedName) {
                const oldFilePath = path.join(folderPath, file);
                const newFilePath = path.join(folderPath, expectedName);
                fs.rename(oldFilePath, newFilePath, (err) => {
                    if (err) {
                        console.error(`Error renaming file ${oldFilePath} to ${newFilePath}:`, err);
                    } else {
                        console.log(`Renamed file: ${oldFilePath} to ${newFilePath}`);
                    }
                });
            }
        });
    });
}

			
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log('Replay file not found');
    }
}, 10000);

// Helper function to get the formatted time
function getFormattedTime(date) {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/:/g, '.');
}
