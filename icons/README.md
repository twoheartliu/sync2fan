# PWA 图标生成说明

## 使用在线工具生成图标

1. 访问 [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator) 或 [RealFaviconGenerator](https://realfavicongenerator.net/)
2. 上传 `icon.svg` 文件
3. 下载生成的图标包
4. 将以下尺寸的图标复制到此目录：
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## 使用命令行工具生成 (需要安装 ImageMagick)

如果你已安装 ImageMagick，可以运行以下命令：

```bash
# 安装 ImageMagick (macOS)
brew install imagemagick

# 生成不同尺寸的图标
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

## 临时方案

在图标生成之前，应用仍然可以正常使用 PWA 功能，只是安装提示可能不会显示图标预览。
