const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

class ImageProcessor {
  constructor(config) {
    this.config = config;
    this.processedImages = new Map();
    this.missingImages = new Set(); // 去重统计
  }

  async processImage(imagePath, outputDir) {
    try {
      // 外部URL / 内联 SVG
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return this.processExternalImage(imagePath);
      }
      if (imagePath.startsWith('data:')) {
        return { original: imagePath, width: 800, height: 400, format: 'svg', sizes: [], placeholder: true, url: imagePath };
      }

      // Windows 绝对路径 (Typora 遗留)
      if (/^[A-Za-z]:[/\\]/.test(imagePath)) {
        return this.generatePlaceholderImage(imagePath);
      }

      // URL 解码（Typora 会对中文路径编码）
      let decoded = imagePath;
      try { decoded = decodeURIComponent(imagePath); } catch (e) { /* 不解码也能用 */ }

      let fullImagePath;
      let fromPosts = false;

      const tryPath = (base) => {
        if (decoded.startsWith('/')) {
          return path.resolve(base, decoded.substring(1));
        }
        return path.resolve(outputDir, decoded);
      };

      fullImagePath = tryPath(this.config.assets.dir);
      if (!await fs.pathExists(fullImagePath)) {
        const altPath = tryPath(this.config.posts.dir);
        if (await fs.pathExists(altPath)) {
          fullImagePath = altPath;
          fromPosts = true;
        }
      }

      if (!await fs.pathExists(fullImagePath)) {
        this.missingImages.add(imagePath);
        return this.generatePlaceholderImage(imagePath);
      }

      // posts 目录下的图片直接透传，不处理（由 copyImages 统一复制到 dist）
      if (fromPosts || fullImagePath.startsWith(path.resolve(this.config.posts.dir))) {
        const postsDir = path.resolve(this.config.posts.dir);
        const relPath = path.relative(postsDir, fullImagePath).replace(/\\/g, '/');
        return {
          original: imagePath, width: 0, height: 0, format: path.extname(fullImagePath).slice(1),
          sizes: [], passthrough: true, url: '/' + relPath
        };
      }

      // assets 目录下的图片正常处理
      const cacheKey = fullImagePath;
      if (this.processedImages.has(cacheKey)) {
        return this.processedImages.get(cacheKey);
      }

      const result = await this.processLocalImage(fullImagePath, outputDir);
      this.processedImages.set(cacheKey, result);
      return result;
    } catch (error) {
      this.missingImages.add(imagePath);
      return this.generatePlaceholderImage(imagePath);
    }
  }

  summary() {
    if (this.missingImages.size > 0) {
      console.warn(`图片缺失 ${this.missingImages.size} 张（已用占位图替代）`);
    }
  }

  async processLocalImage(imagePath, outputDir) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    const results = {
      original: imagePath,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      sizes: []
    };
    
    // 如果启用了响应式图片
    if (this.config.images.responsive) {
      for (const size of this.config.images.sizes) {
        if (size <= metadata.width) {
          const resizedImage = await this.resizeImage(image, size, outputDir, imagePath);
          results.sizes.push(resizedImage);
        }
      }
    }
    
    // 如果启用了WebP转换
    if (this.config.images.webp) {
      const webpImage = await this.convertToWebP(image, outputDir, imagePath);
      results.webp = webpImage;
    }
    
    // 生成优化后的原图
    const optimizedImage = await this.optimizeImage(image, outputDir, imagePath);
    results.optimized = optimizedImage;
    
    return results;
  }

  async resizeImage(image, width, outputDir, originalPath) {
    const ext = path.extname(originalPath);
    const baseName = path.basename(originalPath, ext);
    const outputFileName = `${baseName}-${width}w${ext}`;
    const outputFilePath = path.join(outputDir, 'images', outputFileName);
    
    // 确保输出目录存在
    await fs.ensureDir(path.dirname(outputFilePath));
    
    // 调整大小
    const resizedBuffer = await image
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: this.config.images.quality })
      .toBuffer();
    
    // 写入文件
    await fs.writeFile(outputFilePath, resizedBuffer);
    
    return {
      width,
      path: outputFilePath,
      url: `/images/${outputFileName}`,
      size: resizedBuffer.length
    };
  }

  async convertToWebP(image, outputDir, originalPath) {
    const baseName = path.basename(originalPath, path.extname(originalPath));
    const outputFileName = `${baseName}.webp`;
    const outputFilePath = path.join(outputDir, 'images', outputFileName);
    
    // 确保输出目录存在
    await fs.ensureDir(path.dirname(outputFilePath));
    
    // 转换为WebP
    const webpBuffer = await image
      .webp({ quality: this.config.images.quality })
      .toBuffer();
    
    // 写入文件
    await fs.writeFile(outputFilePath, webpBuffer);
    
    return {
      path: outputFilePath,
      url: `/images/${outputFileName}`,
      size: webpBuffer.length
    };
  }

  async optimizeImage(image, outputDir, originalPath) {
    const ext = path.extname(originalPath);
    const baseName = path.basename(originalPath, ext);
    const outputFileName = `${baseName}-optimized${ext}`;
    const outputFilePath = path.join(outputDir, 'images', outputFileName);
    
    // 确保输出目录存在
    await fs.ensureDir(path.dirname(outputFilePath));
    
    let optimizedBuffer;
    
    // 根据格式优化
    switch (ext.toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        optimizedBuffer = await image
          .jpeg({ quality: this.config.images.quality, mozjpeg: true })
          .toBuffer();
        break;
      case '.png':
        optimizedBuffer = await image
          .png({ quality: this.config.images.quality })
          .toBuffer();
        break;
      case '.gif':
        optimizedBuffer = await image.gif().toBuffer();
        break;
      default:
        optimizedBuffer = await image.toBuffer();
    }
    
    // 写入文件
    await fs.writeFile(outputFilePath, optimizedBuffer);
    
    return {
      path: outputFilePath,
      url: `/images/${outputFileName}`,
      size: optimizedBuffer.length
    };
  }

  processExternalImage(imageUrl) {
    // 外部图片直接返回URL，不进行处理
    return {
      original: imageUrl,
      width: null,
      height: null,
      format: null,
      sizes: [],
      external: true
    };
  }

  generatePlaceholderImage(imagePath) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">'
      + '<rect width="800" height="400" fill="#F0E3D5"/>'
      + '<text x="400" y="185" text-anchor="middle" fill="#C4A882" font-size="16" font-family="sans-serif">图片缺失</text>'
      + '<text x="400" y="215" text-anchor="middle" fill="#E8D5C4" font-size="12" font-family="sans-serif">image not found</text>'
      + '</svg>';
    return {
      original: imagePath,
      width: 800, height: 400,
      format: 'svg',
      sizes: [],
      placeholder: true,
      url: 'data:image/svg+xml,' + encodeURIComponent(svg)
    };
  }

  generateImageTag(imageData, alt = '', className = '') {
    if (!imageData) return '';

    if (imageData.external) {
      return `<img src="${imageData.original}" alt="${alt}" class="${className}" loading="lazy">`;
    }

    // 占位图 或 posts 透传图 — 直接使用 url
    if (imageData.placeholder || imageData.passthrough) {
      return `<img src="${imageData.url}" alt="${alt}" class="${className}" loading="lazy">`;
    }

    // 响应式 + 优化后图片
    const srcset = this.generateSrcset(imageData);
    const sizes = this.generateSizes(imageData);
    let imgTag = '<img';
    if (srcset) imgTag += ` srcset="${srcset}"`;
    if (sizes) imgTag += ` sizes="${sizes}"`;
    imgTag += ` src="${imageData.optimized?.url || imageData.original}"`;
    imgTag += ` alt="${alt}"`;
    if (className) imgTag += ` class="${className}"`;
    if (this.config.images.lazyLoad) imgTag += ' loading="lazy"';
    imgTag += '>';
    return imgTag;
  }

  generateSrcset(imageData) {
    if (!imageData.sizes || imageData.sizes.length === 0) {
      return '';
    }
    
    const srcsetParts = imageData.sizes.map(size => {
      return `${size.url} ${size.width}w`;
    });
    
    return srcsetParts.join(', ');
  }

  generateSizes(imageData) {
    if (!imageData.sizes || imageData.sizes.length === 0) {
      return '';
    }
    
    // 默认sizes属性
    return '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }

  async processContentImages(htmlContent, filePath) {
    // 处理内容中的所有图片
    const imageRegex = /<img([^>]*)src="([^"]*)"([^>]*)>/g;
    let processedContent = htmlContent;
    let match;
    
    while ((match = imageRegex.exec(htmlContent)) !== null) {
      const [fullMatch, before, src, after] = match;
      
      try {
        const imageData = await this.processImage(src, path.dirname(filePath));
        const altMatch = before.match(/alt="([^"]*)"/);
        const alt = altMatch ? altMatch[1] : '';
        const classMatch = before.match(/class="([^"]*)"/);
        const className = classMatch ? classMatch[1] : '';
        
        const newImageTag = this.generateImageTag(imageData, alt, className);
        processedContent = processedContent.replace(fullMatch, newImageTag);
      } catch (error) {
        console.error(`处理图片标签失败: ${fullMatch}`, error.message);
      }
    }
    
    return processedContent;
  }

  async copyImagesToOutput(sourceDir, outputDir) {
    // 复制图片到输出目录
    const imagesDir = path.join(sourceDir, 'images');
    
    if (!await fs.pathExists(imagesDir)) {
      return;
    }
    
    const outputImagesDir = path.join(outputDir, 'images');
    await fs.ensureDir(outputImagesDir);
    
    await fs.copy(imagesDir, outputImagesDir);
  }
}

module.exports = ImageProcessor;