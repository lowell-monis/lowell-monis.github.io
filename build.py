"""build.py — Static site builder."""
import os, shutil, sys
from pathlib import Path
import markdown, yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT          = Path(__file__).parent

def _load_dotenv():
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            val = val.strip().strip('"').strip("'")
            os.environ.setdefault(key.strip(), val)
TEMPLATES_DIR = ROOT / "templates"
STATIC_DIR    = ROOT / "static"
DOCS_DIR      = ROOT / "docs"
CONFIG_FILE   = ROOT / "portfolio_config.yaml"

def load_yaml(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)

def copy_static(src, dest):
    if not src.exists():
        return
    for item in src.rglob("*"):
        if item.is_file():
            rel = item.relative_to(src)
            tgt = dest / rel
            tgt.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, tgt)
            print(f"  copied  static/{rel}")

def build():
    print("=" * 50)
    print("  Building portfolio -> docs/")
    print("=" * 50)

    _load_dotenv()
    config      = load_yaml(CONFIG_FILE)
    theme       = config.get("theme", "editorial-dark")
    site_title  = config.get("site_title", "My Portfolio")
    student_rel = config.get("student_file", "content/my_profile.yaml")
    project_rel = config.get("projects", [])

    student = load_yaml(ROOT / student_rel)
    if student.get("about"):
        student["about"] = markdown.markdown(student["about"])
    token = os.environ.get("DISPATCH_TOKEN", "")
    if token:
        student["dispatch_token"] = token
    print(f"Loaded: {student.get('name')}")

    projects = []
    for rel in project_rel:
        p = ROOT / rel
        if p.exists():
            projects.append(load_yaml(p))
            print(f"  project: {p.name}")
        else:
            print(f"  [warn] not found: {rel}")

    DOCS_DIR.mkdir(exist_ok=True)

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html"]),
    )

    rendered = env.get_template("index.html").render(
        site_title=site_title,
        theme=theme,
        student=student,
        projects=projects,
    )

    (DOCS_DIR / "index.html").write_text(rendered, encoding="utf-8")
    print(f"Rendered -> docs/index.html")

    copy_static(STATIC_DIR, DOCS_DIR)
    print("\nDone. Run: python serve.py")
    print("=" * 50)

if __name__ == "__main__":
    build()
