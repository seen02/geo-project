"""Opt-in, process-local transport for FRAME's geo-sleuth worker only."""
import os
if os.environ.get("FRAME_PYTHON_HTTPS") == "1":
    from frame_https import install
    install()
