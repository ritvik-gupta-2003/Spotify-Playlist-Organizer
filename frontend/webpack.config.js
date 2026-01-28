const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://spotify-playlist-backend-a0e8b9eecd59.herokuapp.com' : 'http://localhost:5000')),
        'process.env.REACT_APP_STREAMING_SERVICE': JSON.stringify(process.env.REACT_APP_STREAMING_SERVICE || 'spotify')
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html'
      }),
      ...(isProduction ? [] : [new webpack.HotModuleReplacementPlugin()])
    ],
    resolve: {
      extensions: ['.js', '.jsx']
    },
    devServer: {
      historyApiFallback: true,
      hot: true,
      open: false,
      port: 8080,
      static: {
        directory: path.join(__dirname, 'public')
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
}; 