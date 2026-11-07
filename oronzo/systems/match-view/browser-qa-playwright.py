"""R04 browser QA — run from repo checkout, no main runtime edits.

    python -m pip install playwright
    python oronzo/systems/match-view/browser-qa-playwright.py --browser /usr/bin/chromium

Serves the real ES modules and atlas images over localhost, captures screenshots
in full/broadcast at 640x360, 800x360, 844x390 and fails if atlas are unavailable.
"""
import argparse
import hashlib
import http.server
import json
import pathlib
import threading
from datetime import datetime, timezone

SCENARIOS = ("opening", "left", "right", "running", "restart", "halftime", "paused", "replay", "late")
VIEWPORTS = ((640, 360), (800, 360), (844, 390))
REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]


def main():
    parser = argparse.ArgumentParser(description="ORONZO 05: real-browser camera QA")
    parser.add_argument("--browser", help="Chromium executable; omit for bundled Playwright")
    parser.add_argument("--output", default="/tmp/oronzo-match-view-r04-qa")
    parser.add_argument("--allow-fallback", action="store_true",
                        help="geometry diagnostics only; NOT the real sprite gate")
    args = parser.parse_args()
    output = pathlib.Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit("PLAYWRIGHT_UNAVAILABLE: python -m pip install playwright") from exc

    handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(
        *a, directory=str(REPO_ROOT), **k)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = ("http://127.0.0.1:" + str(server.server_port) +
           "/oronzo/systems/match-view/browser-qa.html")
    rows, errors = [], []
    try:
        with sync_playwright() as playwright:
            opts = {"headless": True,
                    "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
            if args.browser:
                opts["executable_path"] = args.browser
            browser = playwright.chromium.launch(**opts)
            try:
                for width, height in VIEWPORTS:
                    context = browser.new_context(
                        viewport={"width": width, "height": height},
                        device_scale_factor=1)
                    page = context.new_page()
                    page.on("pageerror", lambda err: errors.append(str(err)))
                    try:
                        page.goto(url, wait_until="load", timeout=12000)
                        page.wait_for_function(
                            "window.ORONZO_MATCH_VIEW_QA?.run", timeout=12000)
                        page.evaluate("() => window.ORONZO_MATCH_VIEW_QA.ready")
                        for mode in ("full", "broadcast"):
                            for scenario in SCENARIOS:
                                data = page.evaluate(
                                    "([scenario,mode])=>window.ORONZO_MATCH_VIEW_QA.run(scenario,mode)",
                                    [scenario, mode])
                                filename = (str(width)+"x"+str(height)+"-"+mode+
                                            "-"+scenario+".png")
                                png = output / filename
                                page.screenshot(path=str(png), animations="disabled")
                                checks = {
                                    "buffer_640x360": data["canvas"] == {"width":640,"height":360},
                                    "drawn_22": data["drawn"] >= 22 and data["players"] == 22,
                                    "ball_visible": data["ballVisible"],
                                    "score_unchanged": data["snapshotScoreUnchanged"],
                                    "source_unchanged": data["sourceIntact"],
                                    "camera_mode": data["mode"] == mode,
                                    "camera_zoom": data["camera"]["zoom"] == (1 if mode=="full" else 2),
                                    "pause_stable": scenario != "paused" or data["pauseCameraStable"] is True,
                                    "replay_overlay_cleared":
                                        scenario != "replay" or data["rewindOverlayCleared"] is True,
                                    "real_assets": data["assetState"] == "ready" and data["allRealSprites"],
                                }
                                if args.allow_fallback:
                                    checks.pop("real_assets")
                                rows.append({
                                    "viewport": [width,height], "mode":mode, "scenario":scenario,
                                    "checks":checks, "assetState":data["assetState"],
                                    "realSprites":data["realSprites"], "drawn":data["drawn"],
                                    "screenshot":filename,
                                    "sha256":hashlib.sha256(png.read_bytes()).hexdigest(),
                                })
                                print(("PASS" if all(checks.values()) else "FAIL"),
                                      str(width)+"x"+str(height),mode,scenario,flush=True)
                    finally:
                        context.close()
            finally:
                browser.close()
    except Exception as exc:
        errors.append(type(exc).__name__ + ": " + str(exc))
        print("BROWSER_GATE_BLOCKED:", str(exc), flush=True)
    finally:
        server.shutdown()
        (output / "results.json").write_text(json.dumps({
            "timestampUTC":datetime.now(timezone.utc).isoformat(),
            "url":url, "allowFallback":args.allow_fallback,
            "scenarios":rows, "errors":errors,
            "passed":bool(rows) and not errors and
                     all(all(row["checks"].values()) for row in rows),
        },ensure_ascii=False,indent=2))

    passed=(len(rows)==len(VIEWPORTS)*2*len(SCENARIOS)
            and not errors and all(all(x["checks"].values()) for x in rows))
    if passed and args.allow_fallback:
        print("DIAGNOSTIC_ONLY: fallback sprites accepted; visual gate NOT passed")
    else:
        print("R04 BROWSER GATE:", "PASS" if passed else "FAIL/BLOCKED",
              "screenshots:",len(rows), "report:",output/"results.json")
    if not passed:
        raise SystemExit(1)


if __name__=="__main__":
    main()
