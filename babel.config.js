const config = (api) => {
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-env', {
        targets: {
          //node: 10,
        },
      }],
      '@babel/preset-typescript',
    ],
    plugins: [
      ['babel-plugin-module-resolver', {
        root: [
          './src',
        ],
        extensions: [
          '.ts',
        ],
      }],
      '@babel/plugin-transform-runtime',
    ],
    env: {
      test: {
        plugins: [
          '@babel/plugin-transform-runtime',
        ],
      },
    },
  };
};

module.exports = config;