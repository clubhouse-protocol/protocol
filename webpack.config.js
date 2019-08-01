
const path = require('path');

const config = (type) => ({
  mode: 'production',
  entry: path.join(__dirname, 'src', 'index.ts'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `clubhouse.${type}.js`,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'babel-loader',
    }],
  },
});

module.exports = [
  config('commonjs')
];
