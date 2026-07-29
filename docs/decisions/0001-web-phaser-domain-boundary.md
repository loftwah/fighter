# ADR 0001: Desktop web, Phaser presentation, pure domain

Status: accepted

The first target is a desktop browser using TypeScript, Vite, and Phaser. Gameplay modules do not import Phaser. The domain produces semantic events; Phaser and the DOM render those events.

This supports deterministic headless tests, responsive semantic controls, future alternate renderers, and later mobile packaging without coupling combat rules to a scene.
