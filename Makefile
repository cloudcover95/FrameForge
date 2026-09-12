# FrameForge studio gate. Stdlib + optional Blender. No pip install.
PYTHON ?= python3
.PHONY: test audit gate
test:
	$(PYTHON) -m python.frameforge.cli test
audit:
	$(PYTHON) scripts/audit_stdlib_compliance.py python/frameforge --recursive --strict
gate:
	$(PYTHON) scripts/gate.py

.PHONY: grok-check
grok-check:
	node web3d-grok/check.mjs
