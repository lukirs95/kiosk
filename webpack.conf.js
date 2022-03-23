const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const bodyparser = require('body-parser');

// serve files stuff...

function serveFile(req, res) {
  const FILE_PATH = path.join(__dirname, req.url);
  const modifiedSince = req.headers['if-modified-since'];
  const mtime = fs.statSync(FILE_PATH).mtime.toUTCString();

  if (modifiedSince !== mtime) {
    res.sendFile(FILE_PATH);
  } else {
    res.sendStatus(304);
  }
}

function serveFileHead(req, res) {
  const FILE_PATH = path.join(__dirname, req.url);
  const modifiedSince = req.headers['if-modified-since'];
  const mtime = fs.statSync(FILE_PATH).mtime.toUTCString();

  if (modifiedSince !== mtime) {
    res.sendStatus(200);
  } else {
    res.sendStatus(304);
  }
}

module.exports = (env, argv) => {
  const PACKAGE = require(path.resolve(__dirname, './package.json'));
  const BUILD_PATH = argv.buildPath || path.resolve(__dirname, './build');
  const BUILD_DEBUG_PATH =
    argv.buildDebugPath || path.resolve(__dirname, './build-debug');
  const TITLE = env.title || PACKAGE.description;
  const AUTHOR = argv.author || PACKAGE.author;
  const isDevMode = argv.mode === 'development';

  const config = {
    mode: 'development',
    entry: {
      main: './display/src/index.js',
      admin: './admin/src/index.js'
    },
    output: {
      filename: '[name].js',
      path: isDevMode ? BUILD_DEBUG_PATH : BUILD_PATH,
      publicPath: ''
    },
    resolve: {
      modules: [path.resolve(__dirname, '*', 'src'), 'node_modules']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(le|c)ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader', // resolve url() and @imports inside CSS
              options: {
                sourceMap: isDevMode
              }
            },
            { loader: 'postcss-loader' },
            {
              loader: 'less-loader', // transform LESS to CSS
              options: {
                sourceMap: isDevMode,
                lessOptions: {
                  relativeUrls: true
                }
              }
            }
          ]
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)$/, // export fonts to 'font' folder
          loader: 'file-loader',
          options: {
            limit: false,
            encoding: false
          }
        }
      ]
    },
    plugins: [
      new ESLintPlugin({
        quiet: isDevMode,
        failOnError: !isDevMode
      }),
      // new StylelintPlugin({
      //   files: '**/*.less',
      //   quiet: isDevMode,
      //   failOnError: !isDevMode
      // }),
      new HtmlWebpackPlugin({
        // inject JS and CSS into HTML template
        title: TITLE,
        meta: {
          author: AUTHOR
        },
        filename: 'admin.html',
        // template: 'admin/src/index.html',
        chunks: ['admin'],
        minify: {
          removeComments: true,
          collapseWhitespace: !isDevMode
        }
      }),
      new HtmlWebpackPlugin({
        // inject JS and CSS into HTML template
        title: TITLE,
        meta: {
          author: AUTHOR
        },
        filename: 'index.html',
        template: 'display/index.html',
        chunks: ['main'],
        minify: {
          removeComments: true,
          collapseWhitespace: !isDevMode
        }
      }),
      new MiniCssExtractPlugin({ filename: '[name].css' })
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          fooStyles: {
            type: 'css/mini-extract',
            name: 'styles_admin',
            chunks: (chunk) => {
              return chunk.name === 'admin';
            },
            enforce: true
          },
          barStyles: {
            type: 'css/mini-extract',
            name: 'styles_main',
            chunks: (chunk) => {
              return chunk.name === 'main';
            },
            enforce: true
          }
        }
      },
      minimize: !isDevMode,
      minimizer: [
        new TerserPlugin(),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: ['default', { discardComments: { removeAll: true } }]
          }
        })
      ]
    },
    devServer: {
      static: {
        directory: isDevMode ? BUILD_DEBUG_PATH : BUILD_PATH
      },
      client: {
        logging: 'error',
        overlay: {
          errors: true,
          warnings: false
        }
      },
      allowedHosts: 'all',
      hot: isDevMode,
      port: 9000,
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        devServer.app.get('/resources/*', serveFile);

        devServer.app.put(
          '/resources/flavors.json',
          bodyparser.json(),
          (req, res) => {
            fs.writeFileSync(
              path.join(__dirname, req.url),
              JSON.stringify(req.body)
            );
            res.send('ok');
          }
        );

        devServer.app.head('/resources/flavors.json', serveFileHead);

        return middlewares;
      }
    }
  };

  if (isDevMode) {
    config.devtool = 'source-map';
  }
  return config;
};
