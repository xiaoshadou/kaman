module.exports = {
    css: {
        loaderOptions: {
            less: {
                // 若 less-loader 版本小于 6.0，请移除 lessOptions 这一级，直接配置选项。
                modifyVars: {
                    // 直接覆盖变量
                    '@grid-item-content-padding': '5px',
                    '@pagination-item-default-color': '#4C4C4C',
                    '@pagination-item-width': '34px',
                    '@pagination-height': '30px',
                    '@popover-action-width': '70px',
                    '@popover-action-height': '28px',
                    '@popover-border-radius': '2px',
                    '@field-text-area-min-height': '50px'
                    // 或者可以通过 less 文件覆盖（文件路径为绝对路径）
                    // hack: `true; @import "your-less-file-path.less";`,
                },
            },
        },
    },
    // chainWebpack: config => {
    //     config
    //         .plugin('webpack-bundle-analyzer')
    //         .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    // },
    // // publicPath: '/',
    // configureWebpack: {
    //     // 打包忽略文件
    //     externals: {
    //         vue: "Vue",
    //         "vue-router": "VueRouter",
    //         vuex: "Vuex",
    //     }
    // },
    // productionSourceMap: false, // 生产打包时不输出map文件，增加打包速度

    devServer: {
        // overlay: { // 让浏览器 overlay 同时显示警告和错误
        //   warnings: true,
        //   errors: true
        // },
        // open: false, // 是否打开浏览器
        // host: "localhost",
        // port: "8080", // 代理断就
        // https: false,
        // hotOnly: false, // 热更新
        proxy: {
            "/socket.io": {
                // target: "http://47.100.242.91:3001", // 目标代理接口地址
                target: "http://localhost:3001", // 目标代理接口地址
                secure: false,
                changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
                ws: true, // 是否启用websockets
            }
        }
    }
}