#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import time
import uuid
from pathlib import Path
from typing import Any

import requests

BASE_URL = "http://127.0.0.1:7860"
TXT2IMG_FN_INDEX = 648
MODEL_SWITCH_FN_INDEX = 1600
STATE_HOOK_FN_INDICES = [137, 189, 241, 293, 358, 449, 540]

SCRIPT_DEFAULTS = {
    "script_txt2img_xyz_plot_x_type": "Nothing",
    "script_txt2img_xyz_plot_y_type": "Nothing",
    "script_txt2img_xyz_plot_z_type": "Nothing",
    "script_txt2img_xyz_plot_draw_legend": False,
    "script_txt2img_prompt_matrix_prompt_type": "positive",
    "script_txt2img_prompt_matrix_variations_delimiter": "comma",
    "script_txt2img_prompts_from_file_or_textbox_prompt_position": "start",
    "txt2img_override_settings": [],
}


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped:
            rows.append(json.loads(stripped))
    return rows


def parse_size(size: str) -> tuple[int, int]:
    width, height = size.lower().split("x", 1)
    return int(width), int(height)


def post_predict(base_url: str, fn_index: int, data: list[Any], timeout: int = 3600) -> dict[str, Any]:
    response = requests.post(
        f"{base_url}/run/predict",
        json={
            "fn_index": fn_index,
            "data": data,
            "session_hash": uuid.uuid4().hex[:11],
        },
        timeout=timeout,
    )
    response.raise_for_status()
    return response.json()


def switch_model(base_url: str, model: str, settle_seconds: float) -> None:
    post_predict(base_url, MODEL_SWITCH_FN_INDEX, [model], timeout=3600)
    time.sleep(settle_seconds)


class ForgeTxt2ImgSession:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.config = requests.get(f"{base_url}/config", timeout=120).json()
        self.components = {str(component["id"]): component for component in self.config["components"]}
        self.dep = self.config["dependencies"][TXT2IMG_FN_INDEX]
        self.state_values = self._initialize_states()
        self.template_data, self.index_by_elem = self._build_template()

    def _initialize_states(self) -> dict[int, Any]:
        state_values: dict[int, Any] = {}
        for dep_index in STATE_HOOK_FN_INDICES:
            hook_dep = self.config["dependencies"][dep_index]
            hook_data = [self.components[str(component_id)].get("props", {}).get("value") for component_id in hook_dep["inputs"]]
            hook_result = post_predict(self.base_url, dep_index, hook_data, timeout=600)
            state_values[hook_dep["outputs"][0]] = hook_result["data"][0] if hook_result.get("data") else None
        return state_values

    def _build_template(self) -> tuple[list[Any], dict[str, int]]:
        data: list[Any] = []
        index_by_elem: dict[str, int] = {}
        for position, component_id in enumerate(self.dep["inputs"]):
            component = self.components[str(component_id)]
            value = self.state_values.get(component_id, component.get("props", {}).get("value"))
            data.append(value)
            elem_id = component.get("props", {}).get("elem_id")
            if elem_id:
                index_by_elem[elem_id] = position
        return data, index_by_elem

    def render(self, job: dict[str, Any], output_dir: Path) -> dict[str, Any]:
        data = list(self.template_data)
        prompt = job["prompt"]
        negative = job.get(
            "negative_prompt",
            "worst quality, low quality, blurry, deformed face, extra fingers, extra arms, bad hands, "
            "cropped head, multiple people, modern clothes, sci-fi, neon, child, busy background, text, watermark, logo",
        )
        width, height = parse_size(job.get("size", "832x1216"))

        def setv(elem_id: str, value: Any) -> None:
            if elem_id in self.index_by_elem:
                data[self.index_by_elem[elem_id]] = value

        setv("txt2img_prompt", prompt)
        setv("txt2img_neg_prompt", negative)
        setv("txt2img_steps", job.get("steps", 24))
        setv("txt2img_width", width)
        setv("txt2img_height", height)
        setv("txt2img_cfg_scale", job.get("cfg_scale", 6.5))
        setv("txt2img_sampling", job.get("sampler", "DPM++ 2M"))
        setv("txt2img_scheduler", job.get("scheduler", "Karras"))
        setv("txt2img_batch_count", 1)
        setv("txt2img_batch_size", 1)
        setv("txt2img_seed", job.get("seed", -1))
        setv("txt2img_checkpoint", "")

        for elem_id, value in SCRIPT_DEFAULTS.items():
            setv(elem_id, value)

        result = post_predict(self.base_url, TXT2IMG_FN_INDEX, data)
        source_name = result["data"][0][0]["name"].split("?", 1)[0]
        source_path = Path(source_name)
        destination = output_dir / job["out"]
        output_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, destination)

        metadata = json.loads(result["data"][1])
        metadata_path = destination.with_suffix(".json")
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

        return {
            "out": job["out"],
            "source": str(source_path),
            "destination": str(destination),
            "metadata": metadata,
        }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a portrait batch against a local Forge instance.")
    parser.add_argument("--input", required=True, help="Path to a JSONL batch file.")
    parser.add_argument("--output-dir", required=True, help="Directory to copy generated PNG files into.")
    parser.add_argument("--base-url", default=BASE_URL, help="Forge base URL.")
    parser.add_argument("--match", action="append", default=[], help="Only render jobs whose out filename contains this text.")
    parser.add_argument("--limit", type=int, default=0, help="Maximum number of jobs to render.")
    parser.add_argument("--model", default="", help="Optional global model name to switch to before rendering.")
    parser.add_argument("--settle-seconds", type=float, default=8.0, help="How long to wait after a model switch.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    jobs = load_jsonl(input_path)

    if args.match:
        lowered = [entry.lower() for entry in args.match]
        jobs = [job for job in jobs if any(token in job["out"].lower() for token in lowered)]

    if args.limit > 0:
        jobs = jobs[: args.limit]

    if args.model:
        switch_model(args.base_url, args.model, args.settle_seconds)

    session = ForgeTxt2ImgSession(args.base_url)
    results = []
    for job in jobs:
        result = session.render(job, output_dir)
        model_name = result["metadata"].get("sd_model_name", "unknown")
        print(f"{job['out']} -> {result['destination']} [{model_name}]")
        results.append(result)

    summary_path = output_dir / "_batch-summary.json"
    summary_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
