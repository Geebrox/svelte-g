// Import dependencies =========================================================

const dotenv = require('dotenv')
const { resolve } = require('path')
const { readdirSync } = require('fs')
const {
  HotModuleReplacementPlugin,
  ProgressPlugin,
  DefinePlugin
} = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Paths declaration ===========================================================

const SRC_DIR = resolve(__dirname, 'src')

const PATHS = {
  SVELTE_DIR: resolve(__dirname, 'node_modules', 'svelte'),
  DOTENV_FILE: resolve(__dirname, '.env'),
  ASSETS_DIR: resolve(SRC_DIR, 'assets'),
  UTILS_DIR: resolve(SRC_DIR, 'utils'),
  COMPONENTS_DIR: resolve(SRC_DIR, 'components'),
  PAGES_DIR: resolve(SRC_DIR, 'pages'),
  SERVICES_DIR: resolve(SRC_DIR, 'services'),
  PUBLIC_DIR: resolve(__dirname, 'public'),
  DIST_DIR: resolve(__dirname, 'dist'),
  HTML_TEMPLATE: resolve(SRC_DIR, 'template.html')
}

// Resolve .env variables ======================================================

dotenv.config({
  path: PATHS.DOTENV_FILE
})

// Assign global variables =====================================================

const MODE = process.env.NODE_ENV || 'development'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Decalre functions ===========================================================

const resolveEnvKeys = () => {
  const envConfig = dotenv.config({
    path: PATHS.DOTENV_FILE
  }).parsed

  const envKeys = Object.keys(envConfig).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(envConfig[next])
    return prev
  }, {})

  return envKeys
}

const getEntryFiles = () => {
  const entries = {}

  readdirSync(PATHS.PAGES_DIR).forEach((file) => {
    entries[file.replace(/\.(?:svelte|m?js)$/, '')] = resolve(
      PATHS.PAGES_DIR,
      file
    )
  })

  return entries
}

const generateHtmlFiles = () => {
  const pluginsList = []

  const entryFiles = getEntryFiles()

  Object.keys(entryFiles).forEach((key) =>
    pluginsList.push(
      new HtmlWebpackPlugin({
        title: `PAGE | ${key}`,
        template: PATHS.HTML_TEMPLATE,
        inject: true,
        chunks: [key],
        filename: resolve(PATHS.PUBLIC_DIR, `${key}.html`)
      })
    )
  )

  return pluginsList
}

const getFirstAvaiablePage = () => {
  const entryFiles = getEntryFiles()

  return `${Object.keys(entryFiles)[0]}.html`
}

// Declare webpack rules =======================================================

const ESLINT_HANDLERS = [
  {
    enforce: 'pre',
    test: /\.(?:svelte|m?js)$/,
    exclude: /node_modules/,
    loader: 'eslint-loader',
    options: {
      formatter: 'table',
      emitWarning: !IS_PRODUCTION,
      failOnError: IS_PRODUCTION
    }
  }
]

const SCRIPT_HANDLERS = [
  IS_PRODUCTION && {
    test: /\.(?:svelte|m?js)$/,
    include: [SRC_DIR, PATHS.SVELTE_DIR],
    use: {
      loader: 'babel-loader'
    }
  },
  {
    test: /\.svelte$/,
    use: {
      loader: 'svelte-loader',
      options: {
        hotReload: !IS_PRODUCTION
      }
    }
  }
].filter(Boolean)

const STYLE_HANDLERS = [
  {
    test: /\.s?css$/,
    exclude: /\.module\.s?css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: !IS_PRODUCTION
        }
      },
      'postcss-loader',
      'sass-loader'
    ]
  },
  {
    test: /\.module\.s?css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: !IS_PRODUCTION,
          modules: {
            localIdentName: '[local]_[hash:base64:5]'
          }
        }
      },
      'postcss-loader',
      'sass-loader'
    ]
  }
]

// Configure webpack ===========================================================

module.exports = {
  mode: MODE,
  entry: getEntryFiles(),
  output: {
    path: IS_PRODUCTION ? PATHS.DIST_DIR : PATHS.PUBLIC_DIR,
    filename: '[name].js',
    chunkLoadTimeout: 30000
  },
  resolve: {
    alias: {
      '@svelte': PATHS.SVELTE_DIR,
      '@assets': PATHS.ASSETS_DIR,
      '@components': PATHS.COMPONENTS_DIR,
      '@pages': PATHS.PAGES_DIR,
      '@utils': PATHS.UTILS_DIR,
      '@services': PATHS.SERVICES_DIR
    },
    modules: ['src', 'node_modules'],
    extensions: ['.mjs', '.js', '.svelte', '.json', '.scss', '.css', '*'],
    mainFields: ['svelte', 'browser', 'module', 'main']
  },
  module: {
    rules: [...ESLINT_HANDLERS, ...SCRIPT_HANDLERS, ...STYLE_HANDLERS]
  },
  plugins: [
    new ProgressPlugin(),
    new DefinePlugin(resolveEnvKeys()),
    ...(IS_PRODUCTION
      ? [new CleanWebpackPlugin()]
      : [...generateHtmlFiles(), new HotModuleReplacementPlugin()])
  ],
  devServer: {
    contentBase: PATHS.PUBLIC_DIR,
    host: 'localhost',
    port: process.env.APP_PORT || 8080,
    hot: true,
    openPage: getFirstAvaiablePage(),
    compress: true,
    historyApiFallback: {
      index: `/${getFirstAvaiablePage()}`
    },
    overlay: {
      warnings: true,
      errors: true
    }
  }
}

// =============================================================================
