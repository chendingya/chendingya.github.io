const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

class ImageProcessor {
  constructor(config) {
    this.config = config;
    this.processedImages = new Map(); // 缓存已处理的图片
  }

  async processImage(imagePath, outputDir) {
    try {
      // 检查是否是外部URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return this.processExternalImage(imagePath);
      }
      
      // 检查是否是绝对路径
      let fullImagePath;
      if (imagePath.startsWith('/')) {
        fullImagePath = path.resolve(this.config.assets.dir, imagePath.substring(1));
      } else {
        fullImagePath = path.resolve(outputDir, imagePath);
      }
      
      // 检查文件是否存在
      if (!await fs.pathExists(fullImagePath)) {
        console.warn(`图片不存在: ${fullImagePath}`);
        return this.generatePlaceholderImage(imagePath);
      }
      
      // 检查缓存
      const cacheKey = fullImagePath;
      if (this.processedImages.has(cacheKey)) {
        return this.processedImages.get(cacheKey);
      }
      
      // 处理图片
      const result = await this.processLocalImage(fullImagePath, outputDir);
      
      // 缓存结果
      this.processedImages.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`处理图片失败 ${imagePath}:`, error.message);
      return this.generatePlaceholderImage(imagePath);
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
    // 生成占位图片数据
    return {
      original: imagePath,
      width: 800,
      height: 600,
      format: 'jpeg',
      sizes: [],
      placeholder: true,
      url: '/images/placeholder.jpg'
    };
  }

  generateImageTag(imageData, alt = '', className = '') {
    if (!imageData) {
      return '';
    }
    
    // 如果是外部图片
    if (imageData.external) {
      return `<img src="${imageData.original}" alt="${alt}" class="${className}" loading="lazy">`;
    }
    
    // 如果是占位图片
    if (imageData.placeholder) {
      return `<img src="${imageData.url}" alt="${alt}" class="${className} placeholder" loading="lazy">`;
    }
    
    // 生成响应式图片标签
    const srcset = this.generateSrcset(imageData);
    const sizes = this.generateSizes(imageData);
    
    let imgTag = '<img';
    
    // 添加srcset
    if (srcset) {
      imgTag += ` srcset="${srcset}"`;
    }
    
    // 添加sizes
    if (sizes) {
      imgTag += ` sizes="${sizes}"`;
    }
    
    // 添加src（默认图片）
    imgTag += ` src="${imageData.optimized?.url || imageData.original}"`;
    
    // 添加alt
    imgTag += ` alt="${alt}"`;
    
    // 添加class
    if (className) {
      imgTag += ` class="${className}"`;
    }
    
    // 添加loading="lazy"
    if (this.config.images.lazyLoad) {
      imgTag += ' loading="lazy"';
    }
    
    // 添加宽度和高度（避免布局偏移）
    if (imageData.width && imageData.height) {
      imgTag += ` width="${imageData.width}" height="${imageData.height}"`;
    }
    
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