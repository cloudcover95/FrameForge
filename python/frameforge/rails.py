"""Extension rails. Same ids in 2D extras, items catalog, and UE codegen."""

from __future__ import annotations

RAILS = {
    "input": ["x", "y", "jump", "attack", "shield", "grab"],
    "extras": ["plats", "parry", "dodge", "rage", "dashatk"],
    "items": ["bloom", "dusk", "slag", "ashbat", "prism", "core", "snare"],
    "cpu": ["bitnet_policy"],
    "net_predict": ["dead_reckon", "bitnet_input_guess", "soft_reconcile", "host_auth"],
    "clock": ["render_uncapped", "sim_120", "net_snapshot_20", "interp_100ms", "timeline_4d", "ip_netdriver", "rollback_8"],
    "online": ["listen_ip", "steam_iface", "eos_iface"],
    "skins": ["gltf_display", "albedo_T_Ff", "cub_local_png"],
    "look": ["lumen_reflections_off", "chaos_fighter_mesh_off", "bitnet_kb_scale_off"],
    "content": ["fighters", "stages", "moves", "anim_contract"],
    "emit": ["web_2d", "ue_generated", "gltf", "bitnet_pack", "proc_tex", "ramps"],
    "tex": ["cel_ramp", "wear_noise", "ink_ready", "T_Ff"],
    "ramp": ["half_lambert", "cheap_band", "season_lut", "T_FfRamp"],
    "shading": ["M_FfToon", "PP_FfInk", "no_lumen_gi", "custom_depth"],
    "ecosystem": ["juniorcloudllc", "juniorhome", "junioromega", "frameforge"],
    "lif": ["ternary_spike", "reset_subtract", "fflf_pack", "intent_only"],
    "quant_engine": ["absmean_keep", "ffbn", "ffcs", "fflf", "skip_zero_eval"],
    "trit_arm": ["original_isa", "mmio_intent", "guest_tas_only", "no_vendor_rom"],
    "trit_stack": ["lif", "ffbn", "trit_arm", "juniorllm_envelope"],
    "juniorllm": ["FieldCore", "AstraReason", "Fable", "text_only"],
}


def snapshot() -> dict:
    return {k: list(v) for k, v in RAILS.items()}
