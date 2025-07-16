const { withPodfile } = require('@expo/config-plugins');

const packages = `
  # On-device video analysis SPM dependencies
  swift_package 'https://github.com/ml-explore/mlx-swift.git', :tag => 'v0.11.0'
  swift_package 'https://github.com/cyrilzakka/mlx-swift-examples.git', :branch => 'main'
`;

/**
 * Injects SPM package dependencies directly into the Podfile.
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
const withSpmPackagesInPodfile = (config) => {
  return withPodfile(config, (podfileConfig) => {
    const contents = podfileConfig.modResults.contents;
    const anchor = 'use_expo_modules!';

    // Ensure the dependencies aren't already added
    if (contents.includes("swift_package 'https://github.com/ml-explore/mlx-swift.git'")) {
      return podfileConfig;
    }

    const newContents = contents.replace(
      anchor,
      `${anchor}\n${packages}`
    );

    podfileConfig.modResults.contents = newContents;
    return podfileConfig;
  });
};

module.exports = withSpmPackagesInPodfile;
