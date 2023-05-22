module.exports = {
  resolve: {
    // 定义 import 引用时可省略的文件后缀名
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        // 编译处理 js 和 jsx 文件
        test: /(\.js(x?))$/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
        exclude: /node_modules/, // 只解析 src 目录下的文件
      },
      {
        // 编译处理 js 和 jsx 文件
        test: /(\.ts(x?))$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
        exclude: /node_modules/, // 只解析 src 目录下的文件
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "url-loader",
            // options: {
            //     name: 'images/[name].[ext]',
            //     esModule: false,
            // },
          },
        ],
        // type: 'javascript/auto'
      },
    ],
  },
};
