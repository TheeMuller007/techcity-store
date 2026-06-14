import os
import glob

public_dir = r"c:\Users\Clyde T.M\Desktop\TECHCITY\public"
html_files = glob.glob(os.path.join(public_dir, "**", "*.html"), recursive=True)

font_awesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n'
bot_script = '<script src="/scripts/bot.js"></script>\n'
whatsapp_html = '<a href="https://wa.me/263783187312" class="whatsapp-button" target="_blank" aria-label="Chat with us on WhatsApp">\n    <i class="fab fa-whatsapp"></i>\n</a>\n'

for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        # Check font-awesome
        if "font-awesome" not in content and "all.min.css" not in content:
            content = content.replace('</head>', font_awesome + '</head>')
            modified = True
            
        # Check bot script
        if "bot.js" not in content:
            content = content.replace('</body>', bot_script + '</body>')
            modified = True
            
        # Check whatsapp
        if "whatsapp-button" not in content and "wa.me" not in content:
            content = content.replace('</body>', whatsapp_html + '</body>')
            modified = True
            
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
