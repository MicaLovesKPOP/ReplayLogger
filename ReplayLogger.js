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
      
      // Replace the desired output file name
      const eventNumber = fs.readdirSync(outputDirPath).length + 1;
      const gamemodeMatch = fs.readFileSync(replayFilePath, 'utf8').match(/gamevar=(\S+)/);
      const gamemodeValue = gamemodeMatch ? gamemodeMatch[1] : 'unknown';
      const outputFileName = `${outputDirName} ${getFormattedTime(replayFileModDate)} event${eventNumber} ${gamemodeValue}.log`;
      const outputFilePath = path.join(outputDirPath, outputFileName);

// Read the .rpl file
fs.readFile(replayFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Ignore the initial characters in the file
    const startIndex = data.indexOf('RP#');
    const trimmedTrackData = data.substring(startIndex);

    // Extract the track value
    const trackMatch = trimmedTrackData.match(/([0-9`~!@#$%^&()_+\-=[\]{};,. a-z]+?\.trk)/);
    // console.log('trackMatch:', trackMatch);
    const trackValue = trackMatch ? trackMatch[1] : 'unknown';

    // Ignore the initial characters in the file
    const endIndex = data.indexOf('\0', startIndex);
    let trimmedData = trimmedTrackData.substring(startIndex);

    // Remove blocks of null characters that are over 10 characters in size from trimmedData
    trimmedData = trimmedData.replace(/\0{10,}/g, '');
    console.log('trimmedData:', trimmedData.substring(0,2048));

        // Extract the replay event details
        const replayEventDetails = `Replay Event Details: ${outputFileName}\n\n`;
      
        // Extract the gamemode value
        const gamemodeValue = gamemodeMatch ? gamemodeMatch[1] : 'unknown';
      
        // Extract the gamemode values
        const gamemodeMatches = trimmedData.match(/gamemode\w+=(\d+)/g);
        const gamemodeValues = gamemodeMatches ? gamemodeMatches.map(match => match.split('=')[1]) : [];
      
        // Determine the gamemode value to display
        let gamemodeValueToDisplay = '';
        if (gamemodeValues.length === 0) {
          gamemodeValueToDisplay = 'unknown';
        } else if (gamemodeValues.every(value => value === 'unknown')) {
          gamemodeValueToDisplay = 'unknown';
        } else {
          gamemodeValueToDisplay = gamemodeValues.join(', ');
        }
      
        // Format the extracted values
        const gamemode = `Gamemode: ${gamemodeValue}, ${gamemodeValueToDisplay}\n`;
        const trackName = `Track: ${trackValue}\n\n`;
      
        // Extract the remaining non-player data
        const damageMatch = trimmedData.match(/damagerealism=(-?\d+)/);
        let damageValue;
        if (damageMatch) {
          switch (damageMatch[1]) {
            case '-1':
              damageValue = 'Disabled';
              break;
            case '0':
              damageValue = 'Low';
              break;
            case '1':
              damageValue = 'Medium';
              break;
            case '2':
              damageValue = 'High';
              break;
            default:
              damageValue = 'unknown';
          }
        } else {
          damageValue = 'unknown';
        }
      
        const missilesMatch = trimmedData.match(/forcemissile\[\*\]=(\S+)/);
        let missilesValue;
        if (missilesMatch) {
          switch (missilesMatch[1]) {
            case 'none':
              missilesValue = 'Disabled';
              break;
            case 'single':
              missilesValue = 'Enabled, single';
              break;
            case 'double':
              missilesValue = 'Enabled, double';
              break;
            default:
              missilesValue = 'unknown';
          }
        } else {
          missilesValue = 'unknown';
        }
      
        const minigunMatch = trimmedData.match(/forceminigun\[\*\]=(\S+)/);
        let minigunValue;
        if (minigunMatch) {
          switch (minigunMatch[1]) {
            case 'none':
              minigunValue = 'Disabled';
              break;
            case 'force':
              minigunValue = 'Enabled, single';
              break;
            case 'forcedouble':
              minigunValue = 'Enabled, double';
              break;
            default:
              minigunValue = 'unknown';
          }
        } else {
          minigunValue = 'unknown';
        }
      
        const pickupsMatch = trimmedData.match(/forcepickups=(\d+)/);
        let pickupsValue;
        if (pickupsMatch) {
          switch (pickupsMatch[1]) {
            case '0':
              pickupsValue = 'Disabled';
              break;
            case '1':
              pickupsValue = 'Enabled';
              break;
            default:
              pickupsValue = 'unknown';
          }
        } else {
          pickupsValue = 'unknown';
        }
      
        const nitroMatch = trimmedData.match(/forcenitro\[\*\]=(\S+)/);
        let nitroValue;
        if (nitroMatch) {
          switch (nitroMatch[1]) {
            case 'abnitro':
              nitroValue = 'Enabled';
              break;
            case 'none':
              nitroValue = 'Disabled';
              break;
            default:
              nitroValue = 'unknown';
          }
        } else {
          nitroValue = 'unknown';
        }
      
        // Extract the timeofday value
        const timeofdayMatch = trimmedData.match(/forcetimeofday=(\S+)/);
        const timeofdayValue = timeofdayMatch ? timeofdayMatch[1] : '';
      
        // Format the extracted value
        const timeofday = timeofdayValue ? `Ambience: ${timeofdayValue}\n` : '';
        const damage = `Damage: ${damageValue}\n`;
        const missiles = `Missiles: ${missilesValue}\n`;
        const minigun = `Minigun: ${minigunValue}\n\n`;
      
        const pickups = `Pickups: ${pickupsValue}\n`;
        const nitro = `Nitro: ${nitroValue}\n`;
      
        // Extract the additional data
        let additionalData = '';
        
        const additionalDataRegex = /(force\w+)\[(\d+|\*)\]=(\S+)/g;
        let match;
        while ((match = additionalDataRegex.exec(trimmedData)) !== null) {
          const [_, key, index, value] = match;
          if (!index.startsWith('76561') && key !== 'forcemines' && key !== 'forceaiskill' && key !== 'gamevar' && key !== 'gamemodevalue' && key !== 'timeofday' && key !== 'damagerealism' && key !== 'forcemissile' && key !== 'forceminigun' && key !== 'forcepickups' && key !== 'forcenitro') {
            additionalData += `${key}[${index}]: ${value}\n`;
          }
        }
        additionalData += '\n';
      
        // Extract the player data
        const playerData = extractPlayerData(trimmedData);
      
        // Format the players line
        let players;
        if (playerData && playerData.length > 0) {
          players = `Players (${playerData.length}):`;
        } else {
          players = 'Players (unknown):';
        }
      
        // Format the player list
        let playerList = '';
        if (playerData && playerData.length > 0) {
          for (const player of playerData) {
            const playerName = player.name.replace(/\\\d/g, '');
            const playerInfo = `\n- ${playerName}\n  Car: ${player.car}\n  Car Color: ${player.carcolor}\n  Cartunings: ${player.cartunings}\n  Wheels: ${player.wheel}\n  Analog Steering: ${player.analogsteering}\n  Steering Speed: ${player.steeringspeed}\n`; // excluded: Nitro Color: ${player.nitrocolor}\n  
            playerList += playerInfo;
          }
        } else {
          playerList += ' unknown';
        }
      
        // Combine the players line and player list
        const playersAndList = `${players}${playerList}`;
      
        // Combine all the extracted data
        const replayDetails = replayEventDetails + gamemode + trackName + damage + missiles + minigun + pickups + nitro + timeofday + additionalData + playersAndList;
      
        // Write the data to the output file
        fs.writeFile(outputFilePath, replayDetails, 'utf8', (err) => {
          if (err) {
            console.error(err);
            return;
          }
      
          console.log(`Replay details saved to ${outputFileName}`);
        });
      });
      
      // Helper function to get the formatted time
      function getFormattedTime(date) {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/:/g, '.');
      }
      
      // Helper function to extract the player data
      function extractPlayerData(data) {
        const playerData = [];
        const playerRegex = /forcecar\[(\d+)\]=(\S+) forcesteeringspeed\[\1\]=(\S+) forceanalogsteer\[\1\]=(\S+) forcedrivername\[\1\]=(.+?) forcecarcolor\[\1\]=(\S+) forcenitrocolor\[\1\]=(\S+) forcecartunings\[\1\]=(.+?) forcewheel\[\1\]=(.+?) /g;
        let match;
        while ((match = playerRegex.exec(data)) !== null) {
          const [_, id, car, steeringspeed, analogsteering, name, carcolor, nitrocolor, cartunings, wheel] = match;
          const playerName = name.replace(/\\./g, '').replace(/\|/g, ' ');
          playerData.push({ id, car, steeringspeed, analogsteering, name: playerName, carcolor, nitrocolor, cartunings, wheel });
        }
        return playerData.length > 0 ? playerData : null;
      }

	  // Move the replay file to the output directory
	  fs.renameSync(replayFilePath, path.join(outputDirPath, outputFileName.replace('.log', '.rpl')));
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log('Replay file not found');
  }
}, 10000);
