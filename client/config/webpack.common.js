const paths = require('./paths')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  /**
   * Entry
   *
   * The first place Webpack looks to start building the bundle.
   */
  entry: {
    main: paths.src + '/index.ts',
  },
  devtool: 'inline-source-map',
  /**
   * Output
   *
   * Where Webpack outputs the assets and bundles.
   */
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
  },

  /**
   * Plugins
   *
   * Customize the Webpack build process.
   */
  plugins: [
    /**
     * CleanWebpackPlugin
     *
     * Removes/cleans build folders and unused assets when rebuilding.
     */
    new CleanWebpackPlugin(),

    /**
     * CopyWebpackPlugin
     *
     * Copies files from target to destination folder.
     */
    new CopyWebpackPlugin([
      {
        from: paths.static,
        to: 'assets',
        ignore: ['*.DS_Store'],
      },
    ]),

    /**
     * HtmlWebpackPlugin
     *
     * Generates an HTML file from a template.
     */
    new HtmlWebpackPlugin({
      title: 'Webpack Boilerplate',
      favicon: paths.src + '/images/favicon.png',
      template: paths.src + '/template.html', // template file
      filename: 'index.html', // output file
    }),

    /**
     * DefinePlugin PLugin
     * 
     * replaces variables in our code with other values or expressions at compile time.
     */
    new webpack.DefinePlugin({
      'process.env': {
        'SERVER_URL': process.env.NODE_ENV == 'development'?
        JSON.stringify('http://127.0.0.1:5000/') :
        JSON.stringify('https://escapeling-lobby.herokuapp.com/')
      }
    })
  ],

  /**
   * Module
   *
   * Determine how modules within the project are treated.
   */
  module: {
    rules: [
      // TypeScript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      /**
       * JavaScript
       *
       * Use Babel to transpile JavaScript files.
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
      },

      /**
       * Styles
       *
       * Inject CSS into the head with source maps.
       */
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },

      /**
       * Images
       *
       * Copy image files to build folder.
       */
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          context: 'src', // prevent display of src/ in filename
        },
      },

      /**
       * Fonts
       *
       * Inline font files.
       */
      {
        test: /\.(woff(2)?|eot|ttf|otf|)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[path][name].[ext]',
          context: 'src', // prevent display of src/ in filename
        },
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  }
}
