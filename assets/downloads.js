/**
 * 下载数据配置
 * ------------------------------------------------------------------
 * 每个对象是一张下载卡片，字段说明：
 *   name     资源名称（必填）
 *   version  版本号，页面会自动加上 "v" 前缀
 *   category 分类：software（软件包）/ doc（文档）/ asset（素材）
 *   desc     简介
 *   updated  更新时间，建议使用 YYYY-MM-DD 格式
 *   files    下载文件列表，每项包含：
 *              platform  平台名称（Windows / macOS / Linux），文档、素材可省略
 *              name      文件名，用于展示与下载时的默认文件名
 *              url       文件地址。文件放在 files/ 目录时用相对路径；
 *                        文件超过 100MB（GitHub 单文件上限）时，请上传到
 *                        GitHub Releases，这里改填 Release 的下载地址
 * ------------------------------------------------------------------
 */
window.DOWNLOADS = [
  {
    name: '刷课工作台 · 便携版',
    version: '0.2.8',
    category: 'software',
    desc: '免安装版本，双击即可运行，不写入系统安装目录，适合临时使用或随身携带。',
    updated: '2026-10-27',
    files: [
      {
        platform: 'Windows',
        name: '刷课工作台便携版.exe',
        url: 'https://github.com/Yizhilizishu/RU330K/releases/download/v0.2.8/Workbench-Portable-0.2.8.exe'
      }
    ]
  },
  {
    name: '刷课工作台 · 安装版',
    version: '0.2.8',
    category: 'software',
    desc: '标准安装程序，引导安装到系统并创建开始菜单快捷方式，适合长期固定使用。',
    updated: '2026-10-27',
    files: [
      {
        platform: 'Windows',
        name: '刷课工作台安装版.exe',
        url: 'https://github.com/Yizhilizishu/RU330K/releases/download/v0.2.8/Workbench-Setup-0.2.8.exe'
      }
    ]
  }
];
