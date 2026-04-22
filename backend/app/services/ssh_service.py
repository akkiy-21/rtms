from __future__ import annotations

import shlex
from pathlib import Path

import paramiko


class SSHExecutionError(RuntimeError):
    pass


def _connect(host: str, username: str, password: str, timeout: int = 20) -> paramiko.SSHClient:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=host,
        username=username,
        password=password,
        look_for_keys=False,
        allow_agent=False,
        timeout=timeout,
        banner_timeout=timeout,
        auth_timeout=timeout,
    )
    return client


def _sudo_prefix(username: str) -> str:
    return "" if username == "root" else "sudo -n "


def _run_command(client: paramiko.SSHClient, command: str, timeout: int = 120) -> str:
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    stdout_text = stdout.read().decode("utf-8", errors="replace").strip()
    stderr_text = stderr.read().decode("utf-8", errors="replace").strip()
    if exit_code != 0:
        raise SSHExecutionError(stderr_text or stdout_text or f"Remote command failed with exit code {exit_code}")
    return stdout_text


def reboot_device(host: str, username: str, password: str) -> dict:
    client = _connect(host, username, password)
    try:
        command = (
            f"{_sudo_prefix(username)}bash -lc "
            + shlex.quote("nohup sh -c 'sleep 1; /sbin/reboot || reboot' >/dev/null 2>&1 &")
        )
        _run_command(client, command, timeout=30)
        return {"message": "Reboot command submitted"}
    finally:
        client.close()


def shutdown_device(host: str, username: str, password: str) -> dict:
    client = _connect(host, username, password)
    try:
        command = (
            f"{_sudo_prefix(username)}bash -lc "
            + shlex.quote("nohup sh -c 'sleep 1; /sbin/shutdown -h now || shutdown -h now' >/dev/null 2>&1 &")
        )
        _run_command(client, command, timeout=30)
        return {"message": "Shutdown command submitted"}
    finally:
        client.close()


def deploy_rtms_client(host: str, username: str, password: str, artifact_path: str, artifact_filename: str) -> dict:
    client = _connect(host, username, password)
    remote_artifact_path = f"/tmp/{artifact_filename}"
    previous_target = ""

    try:
        previous_target = _run_command(client, "readlink -f /usr/bin/rtms-client || true", timeout=30)
        with client.open_sftp() as sftp:
            sftp.put(str(Path(artifact_path)), remote_artifact_path)

        remote_script = "\n".join(
            [
                "set -euo pipefail",
                f"{_sudo_prefix(username)}systemctl stop gdm || true",
                f"{_sudo_prefix(username)}mkdir -p /opt/rtms-client",
                "cd /opt/rtms-client",
                f"{_sudo_prefix(username)}unzip -o {shlex.quote(remote_artifact_path)}",
                f"{_sudo_prefix(username)}chown -R mmi:mmi /opt/rtms-client",
                f"{_sudo_prefix(username)}chmod -R +x /opt/rtms-client",
                "if [ ! -f /opt/rtms-client/rtms-client-linux-arm64/rtms-client ]; then echo 'rtms-client binary not found after unzip' >&2; exit 1; fi",
                f"{_sudo_prefix(username)}ln -sf /opt/rtms-client/rtms-client-linux-arm64/rtms-client /usr/bin/rtms-client",
                "if [ -f /etc/mmi-kiosk.conf ]; then",
                f"  if grep -q '^KIOSK_APP_BIN=' /etc/mmi-kiosk.conf; then { _sudo_prefix(username)}sed -i 's|^KIOSK_APP_BIN=.*|KIOSK_APP_BIN=/usr/bin/rtms-client|' /etc/mmi-kiosk.conf; else echo 'KIOSK_APP_BIN=/usr/bin/rtms-client' | { _sudo_prefix(username)}tee -a /etc/mmi-kiosk.conf >/dev/null; fi",
                "fi",
                f"rm -f {shlex.quote(remote_artifact_path)}",
                f"{_sudo_prefix(username)}systemctl start gdm || {_sudo_prefix(username)}systemctl restart gdm",
            ]
        )
        _run_command(client, "bash -lc " + shlex.quote(remote_script), timeout=240)
        return {
            "message": "rtms-client deployed successfully",
            "remote_artifact_path": remote_artifact_path,
            "previous_target": previous_target or None,
        }
    except Exception:
        if previous_target:
            rollback_script = "\n".join(
                [
                    "set -euo pipefail",
                    f"{_sudo_prefix(username)}ln -sf {shlex.quote(previous_target)} /usr/bin/rtms-client",
                    f"{_sudo_prefix(username)}systemctl start gdm || {_sudo_prefix(username)}systemctl restart gdm || true",
                ]
            )
            try:
                _run_command(client, "bash -lc " + shlex.quote(rollback_script), timeout=120)
            except Exception:
                pass
        raise
    finally:
        client.close()