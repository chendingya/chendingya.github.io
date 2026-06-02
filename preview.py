from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True, channel='chrome')
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        
        # 访问首页
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        
        # 等待页面加载完成
        time.sleep(2)
        
        # 截图首页
        page.screenshot(path='preview-home.png', full_page=True)
        print('首页截图已保存: preview-home.png')
        
        # 访问文章页
        page.goto('http://localhost:3000/2026/06/02/welcome-to-ai-blog/')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='preview-article.png', full_page=True)
        print('文章页截图已保存: preview-article.png')
        
        # 访问归档页
        page.goto('http://localhost:3000/archive/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='preview-archive.png', full_page=True)
        print('归档页截图已保存: preview-archive.png')
        
        # 访问标签页
        page.goto('http://localhost:3000/tags/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='preview-tags.png', full_page=True)
        print('标签页截图已保存: preview-tags.png')
        
        # 测试暗色模式
        dark_mode_button = page.locator('#darkModeToggle')
        if dark_mode_button:
            dark_mode_button.click()
            time.sleep(1)
            page.screenshot(path='preview-dark-mode.png', full_page=True)
            print('暗色模式截图已保存: preview-dark-mode.png')
        
        # 关闭浏览器
        browser.close()
        print('预览完成！')

if __name__ == '__main__':
    main()