/**
 * @file Manages the root configuration settings for webpack.
 * @see {@link https://webpack.js.org/} For further information.
 */

const path = require('path');
const childProcess = require('child_process');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const camelCase = require('lodash/camelCase');
const globalObject = require('webpack-global-object-x');
const PACKAGE = require('./package.json');

const filename = PACKAGE.name.replace('@xotic750/', '');
const library = camelCase(filename);
const dist = path.resolve(__dirname, 'dist');

/**
 * The NODE_ENV environment variable.
 *
 * @type {!object}
 */
const {NODE_ENV} = process.env;

/**
 * The production string.
 *
 * @type {string}
 */
const PRODUCTION = 'production';

/**
 * The development string.
 *
 * @type {string}
 */
const DEVELOPMENT = 'development';

/**
 * The default include paths.
 *
 * @type {string}
 */
const DEFAULT_INCLUDE = [path.resolve(__dirname, 'src'), path.resolve(__dirname, '__tests__')];

/**
 * Allows you to pass in as many environment variables as you like using --env.
 * See {@link http://webpack.js.org/guides/environment-variables}.
 *
 * @param {!object} [env={}] - The env object.
 * @returns {undefined} Default.
 */
module.exports = function generateConfig(env) {
  /**
   * The reference created bu git describe --dirty`.
   *
   * @type {string}
   * @see {@link https://git-scm.com/docs/git-describe}
   */
  //TODO:此处代码报错无法打包
  // const DESCRIBE = childProcess
  //   .spawnSync('git', ['describe', '--dirty'])
  //   .output[1].toString()
  //   .trim();

  /**
   * The date as of now.
   *
   * @type {string}
   */
  const NOW = new Date().toISOString();

  const base = {
    /**
     * This option controls if and how source maps are generated.
     *
     * Nosources-source-map - A SourceMap is created without the sourcesContent in it.
     * It can be used to map stack traces on the client without exposing all of the
     * source code. You can deploy the Source Map file to the web-server.
     *
     * Eval-source-map - Each module is executed with eval() and a SourceMap is added as
     * a DataUrl to the eval(). Initially it is slow, but it provides fast rebuild speed
     * and yields real files. Line numbers are correctly mapped since it gets mapped to
     * the original code. It yields the best quality SourceMaps for development.
     *
     * Source-map - A full SourceMap is emitted as a separate file. It adds a reference
     * comment to the bundle so development tools know where to find it.
     *
     * @type {string}
     * @see {@link https://webpack.js.org/configuration/devtool/}
     */
    devtool: 'source-map',

    /**
     * Define the entry points for the application.
     *
     * @type {Array.<string>}
     * @see {@link https://webpack.js.org/concepts/entry-points/}
     */
    entry: PACKAGE.module,

    mode: NODE_ENV === PRODUCTION ? PRODUCTION : DEVELOPMENT,

    /**
     * In modular programming, developers break programs up into discrete chunks of functionality
     * called a module. Each module has a smaller surface area than a full program, making verification,
     * debugging, and testing trivial. Well-written modules provide solid abstractions and encapsulation
     * boundaries, so that each module has a coherent design and a clear purpose within the overall
     * application.
     *
     * Webpack supports modules written in a variety of languages and preprocessors, via loaders.
     * Loaders describe to webpack how to process non-JavaScript modules and include these dependencies
     * into your bundles.
     *
     * @type {Array.<!object>}
     * @see {@link https://webpack.js.org/configuration/module/#module-rules}
     */
    module: {
      rules: [
        /**
         * Extract sourceMappingURL comments from modules and offer it to webpack.
         *
         * @see {@link https://github.com/webpack-contrib/source-map-loader}
         */
        {
          enforce: 'pre',
          loader: 'source-map-loader',
          test: /\.js$/,
        },

        /**
         * Eslint-loader options.
         *
         * @type {!object}
         * @see {@link https://github.com/MoOx/eslint-loader}
         */
        {
          enforce: 'pre',
          include: DEFAULT_INCLUDE,
          loader: 'eslint-loader',
          options: {
            emitError: true,
            emitWarning: false,
            failOnError: true,
            failOnWarning: false,
            formatter: eslintFriendlyFormatter,
            quiet: true,
          },
          test: /\.(js|json)$/,
        },

        /**
         * This package allows transpiling JavaScript files using Babel and webpack.
         *
         * @see {@link https://webpack.js.org/loaders/babel-loader/}
         */
        {
          include: DEFAULT_INCLUDE,
          loader: 'babel-loader',
          test: /\.js$/,
        },
      ],
    },

    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    node: {
      child_process: 'empty',
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      // prevent webpack from injecting useless setImmediate polyfill.
      setImmediate: false,
      tls: 'empty',
    },

    /**
     * Configuring the output configuration options tells webpack how to write the compiled
     * files to disk.
     *
     * @type {!object}
     * @see {@link https://webpack.js.org/configuration/output/}
     */
    output: {
      // https://github.com/webpack/webpack/issues/6525
      globalObject: `(${globalObject.toString()}())`,
      library,
      libraryTarget: 'umd',
      path: dist,
    },

    /**
     * Plugins are the backbone of webpack. Webpack itself is built on the same plugin system
     * that you use in your webpack configuration!
     *
     * A webpack plugin is a JavaScript object that has an apply property. This apply property
     * is called by the webpack compiler, giving access to the entire compilation lifecycle.
     *
     */
    plugins: [
      /**
       * Use the shorthand version.
       *
       * @type {!object}
       * @see {@link https://webpack.js.org/plugins/environment-plugin/}
       */
      new webpack.EnvironmentPlugin({
        DEBUG: false, // use 'false' unless process.env.DEBUG is defined.
        NODE_ENV: DEVELOPMENT, // use 'development' unless process.env.NODE_ENV is defined.
      }),

      /**
       * Smaller lodash builds. We are not opting in to path feature.
       *
       * @type {!object}
       * @see {@link https://github.com/lodash/lodash-webpack-plugin}
       */
      new LodashModuleReplacementPlugin({
        paths: true,
      }),

      /**
       * Adds a banner to the top of each generated chunk.
       *
       * @type {!object}
       * @see {@link https://webpack.js.org/plugins/banner-plugin/}
       */
      new webpack.BannerPlugin({
        banner: `/*!\n${JSON.stringify(
          {
            author: PACKAGE.author.name,
            copywrite: PACKAGE.copyright,
            date: NOW,
            //TODO:此处代码报错无法打包
            describe: 'DESCRIBE', //DESCRIBE,
            description: PACKAGE.description,
            file: '[file]',
            hash: '[hash]',
            license: PACKAGE.license,
            version: PACKAGE.version,
          },
          null,
          2,
        )}\n*/`,
        raw: true,
      }),
    ],

    /**
     * These options change how modules are resolved.
     *
     * @type {!object}
     * @see {@link https://webpack.js.org/configuration/resolve/}
     */
    resolve: {
      /**
       * Create aliases to import or require certain modules more easily.
       *
       * @type {!object}
       * @see {@link https://webpack.js.org/configuration/resolve/#resolve-alias}
       */
      alias: {
        RootDir: path.resolve(__dirname, '.'),
        dist: path.resolve(__dirname, './dist'),
        src: path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.json'],
    },
  };

  const browser = merge(base, {
    optimization: {
      minimize: false,
    },

    output: {
      filename: `${filename}.js`,
    },
  });

  const minified = merge(browser, {
    output: {
      filename: `${filename}.min.js`,
    },

    /**
     * Webpack plugin and CLI utility that represents bundle content as convenient
     * interactive zoomable treemap.
     *
     * @see {@link https://github.com/webpack-contrib/webpack-bundle-analyzer}
     */
    plugins: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        terserOptions: {
          ecma: 5,
        },
      }),

      ...(env && env.report ? [new BundleAnalyzerPlugin()] : []),
    ],
  });

  return [browser, minified];
};
