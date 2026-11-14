# dev.html + css/js -> index.html (한 파일) + embed.html (붙여넣기용 iframe 코드)
import re, html, pathlib
d = pathlib.Path(__file__).parent
page = (d / "dev.html").read_text(encoding="utf-8")
for css in ["fonts.css", "style.css"]:
    page = page.replace(f'<link rel="stylesheet" href="{css}">', "<style>\n" + (d / css).read_text(encoding="utf-8") + "\n</style>")
page = re.sub(r'<script src="([^"/]+\.js)"></script>', lambda m: "<script>\n" + (d / m.group(1)).read_text(encoding="utf-8") + "\n</script>", page)
(d / "index.html").write_text(page, encoding="utf-8")
embed = ('<iframe title="SANTA ORION 1st anniversary" style="display:block;width:100%;max-width:860px;height:1500px;margin:0 auto;border:0" '
         'allow="clipboard-write" srcdoc="' + html.escape(page, quote=True) + '"></iframe>\n')
(d / "embed.html").write_text(embed, encoding="utf-8")
print("index.html", len(page), "/ embed.html", len(embed))
