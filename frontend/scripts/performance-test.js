#!/usr/bin/env node

/**
 * パフォーマンステストスクリプト
 * 翻訳実装後のバンドルサイズとパフォーマンス影響を測定
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 パフォーマンステストを開始します...\n');

// ビルドディレクトリをクリーンアップ
console.log('📁 ビルドディレクトリをクリーンアップ中...');
if (fs.existsSync('build')) {
  fs.rmSync('build', { recursive: true, force: true });
}

// プロダクションビルドを実行
console.log('🔨 プロダクションビルドを実行中...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ ビルドに失敗しました:', error.message);
  process.exit(1);
}

// バンドルサイズを分析
console.log('\n📊 バンドルサイズを分析中...');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ビルドディレクトリのサイズを測定
const buildSize = getDirectorySize('build');
console.log(`📦 総ビルドサイズ: ${formatBytes(buildSize)}`);

// 静的ファイルのサイズを詳細分析
const staticDir = path.join('build', 'static');
if (fs.existsSync(staticDir)) {
  console.log('\n📋 静的ファイルの詳細:');
  
  // JavaScript ファイル
  const jsDir = path.join(staticDir, 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    let totalJsSize = 0;
    
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const size = fs.statSync(filePath).size;
      totalJsSize += size;
      console.log(`  📄 ${file}: ${formatBytes(size)}`);
    });
    
    console.log(`  📊 JavaScript総サイズ: ${formatBytes(totalJsSize)}`);
  }
  
  // CSS ファイル
  const cssDir = path.join(staticDir, 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    let totalCssSize = 0;
    
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const size = fs.statSync(filePath).size;
      totalCssSize += size;
      console.log(`  🎨 ${file}: ${formatBytes(size)}`);
    });
    
    console.log(`  📊 CSS総サイズ: ${formatBytes(totalCssSize)}`);
  }
}

// 翻訳関連ファイルのサイズを分析
console.log('\n🌐 翻訳関連ファイルの分析:');

const localizationDir = path.join('src', 'localization');
if (fs.existsSync(localizationDir)) {
  const localizationSize = getDirectorySize(localizationDir);
  console.log(`  📁 翻訳ディレクトリサイズ: ${formatBytes(localizationSize)}`);
  
  // 翻訳定数ファイルの詳細
  const constantsDir = path.join(localizationDir, 'constants');
  if (fs.existsSync(constantsDir)) {
    const constantFiles = fs.readdirSync(constantsDir).filter(file => file.endsWith('.ts'));
    let totalConstantsSize = 0;
    
    constantFiles.forEach(file => {
      const filePath = path.join(constantsDir, file);
      const size = fs.statSync(filePath).size;
      totalConstantsSize += size;
      console.log(`    📝 ${file}: ${formatBytes(size)}`);
    });
    
    console.log(`    📊 翻訳定数総サイズ: ${formatBytes(totalConstantsSize)}`);
  }
  
  // 翻訳ユーティリティファイルの詳細
  const utilsDir = path.join(localizationDir, 'utils');
  if (fs.existsSync(utilsDir)) {
    const utilFiles = fs.readdirSync(utilsDir).filter(file => file.endsWith('.ts'));
    let totalUtilsSize = 0;
    
    utilFiles.forEach(file => {
      const filePath = path.join(utilsDir, file);
      const size = fs.statSync(filePath).size;
      totalUtilsSize += size;
      console.log(`    🔧 ${file}: ${formatBytes(size)}`);
    });
    
    console.log(`    📊 翻訳ユーティリティ総サイズ: ${formatBytes(totalUtilsSize)}`);
  }
}

// パフォーマンス推定値を計算
console.log('\n⚡ パフォーマンス影響の推定:');

const estimatedLoadTime = buildSize / (1024 * 1024) * 0.5; // 1MB/秒の接続を想定
console.log(`  ⏱️  推定ロード時間 (1Mbps): ${estimatedLoadTime.toFixed(2)}秒`);

const estimatedParseTime = buildSize / (1024 * 1024) * 0.1; // JavaScriptパース時間の推定
console.log(`  🧠 推定パース時間: ${estimatedParseTime.toFixed(2)}秒`);

// 推奨事項を表示
console.log('\n💡 推奨事項:');

if (buildSize > 5 * 1024 * 1024) { // 5MB以上
  console.log('  ⚠️  バンドルサイズが大きいです。コード分割を検討してください');
}

if (buildSize > 10 * 1024 * 1024) { // 10MB以上
  console.log('  🚨 バンドルサイズが非常に大きいです。最適化が必要です');
}

// 翻訳実装の影響を評価
const localizationImpact = getDirectorySize(localizationDir) / buildSize * 100;
console.log(`  🌐 翻訳実装の影響: 総サイズの${localizationImpact.toFixed(2)}%`);

if (localizationImpact > 5) {
  console.log('  📝 翻訳データが大きな割合を占めています。最適化を検討してください');
}

console.log('\n✅ パフォーマンステストが完了しました!');

// 結果をJSONファイルに保存
const results = {
  timestamp: new Date().toISOString(),
  totalBuildSize: buildSize,
  totalBuildSizeFormatted: formatBytes(buildSize),
  localizationSize: fs.existsSync(localizationDir) ? getDirectorySize(localizationDir) : 0,
  localizationImpact: localizationImpact,
  estimatedLoadTime: estimatedLoadTime,
  estimatedParseTime: estimatedParseTime,
  recommendations: []
};

if (buildSize > 5 * 1024 * 1024) {
  results.recommendations.push('バンドルサイズが大きいため、コード分割を検討');
}

if (localizationImpact > 5) {
  results.recommendations.push('翻訳データの最適化を検討');
}

fs.writeFileSync('performance-test-results.json', JSON.stringify(results, null, 2));
console.log('📄 結果をperformance-test-results.jsonに保存しました');