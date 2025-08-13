const { withInfoPlist, withDangerousMod } = require('expo/config-plugins');
const plist = require('@expo/plist');

/**
 * Custom Expo config plugin to forcibly remove UIBackgroundModes
 * This fixes the Apple App Store rejection for Guideline 2.5.4
 */
const withRemoveUIBackgroundModes = (config) => {
  // Method 1: Remove from config during Info.plist processing
  config = withInfoPlist(config, (config) => {
    if (config.modResults.UIBackgroundModes) {
      console.log('🔍 Found UIBackgroundModes:', config.modResults.UIBackgroundModes);
      delete config.modResults.UIBackgroundModes;
      console.log('✅ Removed UIBackgroundModes from Info.plist config');
    }
    return config;
  });

  // Method 2: Use dangerous mod to directly edit the Info.plist file
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const infoPlistPath = config.modRequest.projectRoot + '/ios/' + config.name + '/Info.plist';
      
      // Read and modify the actual Info.plist file
      const fs = require('fs');
      if (fs.existsSync(infoPlistPath)) {
        let infoPlistContent = fs.readFileSync(infoPlistPath, 'utf8');
        let infoPlist = plist.parse(infoPlistContent);
        
        if (infoPlist.UIBackgroundModes) {
          console.log('🔍 Found UIBackgroundModes in actual Info.plist file:', infoPlist.UIBackgroundModes);
          delete infoPlist.UIBackgroundModes;
          
          // Write back the modified plist
          const newContent = plist.build(infoPlist);
          fs.writeFileSync(infoPlistPath, newContent);
          console.log('✅ Forcibly removed UIBackgroundModes from actual Info.plist file');
        }
      }
      
      return config;
    },
  ]);

  return config;
};

module.exports = withRemoveUIBackgroundModes;