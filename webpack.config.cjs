const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
      },
    optimization: {
        minimize: false
    },
    plugins: [
      // ... other plugins
  
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/index.html'), // path to your source HTML file
            to: path.resolve(__dirname, 'dist'), // path to your build destination
          },
          {
            from: path.resolve(__dirname, 'src/config.html'), // path to your source HTML file
            to: path.resolve(__dirname, 'dist'), // path to your build destination
          },
          {
            from: path.resolve(__dirname, 'src/css'), // path to your source CSS folder
            to: path.resolve(__dirname, 'dist/css'), // path to your build destination for CSS
          },
          {
            from: path.resolve(__dirname, 'src/lib'), // path to your source CSS folder
            to: path.resolve(__dirname, 'dist/lib'), // path to your build destination for CSS
          },
          // {
          //   from: path.resolve(__dirname, 'src/img'), // path to your source CSS folder
          //   to: path.resolve(__dirname, 'dist/img'), // path to your build destination for CSS
          // },
          // You can add more patterns for other files or folders as needed
        ],
      }),
    ],
    
  };

