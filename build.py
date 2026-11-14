import re, pathlib
root = pathlib.Path(__file__).parent
src, out = root / "src", root / "dist"
out.mkdir(exist_ok=True)
html = (src / "index.html").read_text()
for css in ["fonts.css", "style.css"]:
    html = html.replace(f'<link rel="stylesheet" href="{css}">', "<style>\n" + (src / css).read_text() + "\n</style>")
html = re.sub(r'<script src="(js/[^"]+)"></script>', lambda m: "<script>\n" + (src / m.group(1)).read_text() + "\n</script>", html)
(out / "anniversary.html").write_text(html)
print(len(html))
