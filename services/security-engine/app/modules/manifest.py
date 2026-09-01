"""Module Manifest and HMAC-SHA256 Integrity Verifier (Adapted from CRE)."""

from __future__ import annotations

import hashlib
import hmac
import json
from pathlib import Path
from pydantic import BaseModel, Field

from app.config import settings


class ModuleManifest(BaseModel):
    module_id: str
    version: str
    name: str
    category: str
    target_types: list[str] = Field(default_factory=list)
    description: str = ""
    min_engine_version: str = "0.1.0"
    signed_files: list[str] = Field(default_factory=list)

    def to_dict(self) -> dict[str, object]:
        return self.model_dump(mode="json")

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> ModuleManifest:
        return cls.model_validate(data)


class SignatureManifest(BaseModel):
    module_id: str
    version: str
    algorithm: str = "hmac-sha256"
    digest: str
    signed_files: list[str] = Field(default_factory=list)

    def to_dict(self) -> dict[str, object]:
        return self.model_dump(mode="json")

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> SignatureManifest:
        return cls.model_validate(data)


def compute_module_digest(module_path: Path, signed_files: list[str], secret_key: str | None = None) -> str:
    key = (secret_key or settings.module_signing_secret).encode("utf-8")
    pieces: list[str] = []

    for rel_path in sorted(signed_files):
        file_path = module_path / rel_path
        if not file_path.exists():
            raise ValueError(f"Signed file missing in test module: {rel_path}")
        file_digest = hashlib.sha256(file_path.read_bytes()).hexdigest()
        pieces.append(f"{rel_path}:{file_digest}")

    payload = "\n".join(pieces).encode("utf-8")
    return hmac.new(key, payload, hashlib.sha256).hexdigest()


def verify_module_integrity(module_path: Path, secret_key: str | None = None) -> SignatureManifest:
    sig_path = module_path / "signature.json"
    if not sig_path.exists():
        raise ValueError(f"Missing signature.json in test pack {module_path.name}")

    sig_data = json.loads(sig_path.read_text(encoding="utf-8"))
    signature = SignatureManifest.from_dict(sig_data)

    expected_digest = compute_module_digest(module_path, signature.signed_files, secret_key)
    if not hmac.compare_digest(expected_digest, signature.digest):
        raise ValueError(f"Module signature verification failed for test module '{signature.module_id}'.")

    return signature


def sign_module(module_path: Path, signed_files: list[str], secret_key: str | None = None) -> SignatureManifest:
    manifest_path = module_path / "manifest.json"
    manifest_data = json.loads(manifest_path.read_text(encoding="utf-8"))

    digest = compute_module_digest(module_path, signed_files, secret_key)
    signature = SignatureManifest(
        module_id=str(manifest_data["module_id"]),
        version=str(manifest_data["version"]),
        digest=digest,
        signed_files=signed_files,
    )
    (module_path / "signature.json").write_text(
        json.dumps(signature.to_dict(), indent=2) + "\n",
        encoding="utf-8",
    )
    return signature
