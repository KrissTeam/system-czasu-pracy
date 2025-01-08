const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

// Ładujemy zmienne środowiskowe z pliku .env
dotenv.config();

// Funkcja eksportująca konfigurację Webpack
module.exports = (env = {}, argv = { mode: 'development' }) => {  // Domyślny tryb 'development'
  const isEnvProduction = argv.mode === 'production';
  const isEnvDevelopment = argv.mode === 'development';

  return {
    // Ustawienia punktu wejścia
    entry: './src/index.js',  // Dostosuj ścieżkę wejścia do swoich plików

    // Ustawienia wyjścia
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'static/js/[name].[contenthash:8].js',
      publicPath: '/',
    },

    // Rozwiązywanie rozszerzeń plików
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // Dodaj odpowiednie rozszerzenia
    },

    // Moduły i reguły dla loaderów
    module: {
      rules: [
        // Przykładowa reguła dla plików JS
        {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        // Dodaj inne reguły (np. dla CSS, obrazów itp.)
      ],
    },

    // Pluginy
    plugins: [
      // Przykład pluginu do ustawienia środowiska produkcyjnego
      new (require('html-webpack-plugin'))({
        template: './public/index.html',
      }),

      // Ustawienie zmiennych środowiskowych przez Webpack
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env), // Dostęp do zmiennych środowiskowych w aplikacji
      }),
    ],

    // Opcje dotyczące narzędzi do generowania map źródeł
    devtool: isEnvProduction ? 'source-map' : 'cheap-module-source-map',

    // Serwer deweloperski
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      historyApiFallback: true,
      hot: true,
      port: 3000,  // Dostosuj port
    },

    // Dodatkowe ustawienia wydajności
    performance: {
      hints: false,  // Możesz to dostosować w zależności od wymagań
    },

    // Ustawienie trybu
    mode: argv.mode || 'development', // Dodajemy tryb (development lub production)
  };
};
