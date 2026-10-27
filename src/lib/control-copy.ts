/**
 * English control copy for the filter editor, translated from the vanilla
 * Korean `CONTROL_COPY` in script.js:27-64.
 *
 * Object shape and keys are IDENTICAL to the vanilla map so the group mapping
 * (Block/Bloom/Ribs/Fringe, plus the later Ink group) and the `resetGroup` key-set derivation are
 * unchanged: `key -> [group, label, help]` with the group as element [0].
 */
export type ControlGroup = 'block' | 'bloom' | 'ribs' | 'fringe' | 'ink';

export const GROUP_LABELS: Record<ControlGroup, string> = Object.freeze({
  block: 'Block',
  bloom: 'Bloom',
  ribs: 'Ribs',
  fringe: 'Fringe',
  ink: 'Ink',
});

export const CONTROL_COPY: Record<string, readonly [ControlGroup, string, string]> = Object.freeze({
  blockPercent: ['block', 'Block size', "Block size as a percentage of the target image's shorter side. Recalculated for each export size."],
  posterization: ['block', 'Posterization', 'Skips quantization at 0. Higher values reduce the number of saturation and value steps.'],
  contrast: ['block', 'Contrast', 'Contrast applied in linear light before block samples are averaged.'],
  contrastEnabled: ['block', 'Contrast enabled', 'Turns the pre-reduction contrast adjustment on or off.'],
  bloom: ['bloom', 'Bloom', 'Strength of the four-way glow around bright blocks.'],
  bloomEnabled: ['bloom', 'Bloom enabled', 'Turns the bloom step for bright areas on or off.'],
  bloomHighlightLow: ['bloom', 'Bloom highlight low', 'Linear luminance where the bloom highlight gate begins.'],
  bloomHighlightHigh: ['bloom', 'Bloom highlight high', 'Linear luminance where the bloom highlight gate fully opens.'],
  ribAngle: ['ribs', 'Rib angle', '0° is vertical; larger values rotate the rib direction.'],
  ribPitch: ['ribs', 'Rib pitch', 'Logical-unit (lu) spacing between rib centers.'],
  ribLowLuminanceWidth: ['ribs', 'Low-luminance rib width', 'Rib width (lu) applied in low-luminance regions.'],
  ribHighLuminanceWidth: ['ribs', 'High-luminance rib width', 'Rib width (lu) applied in high-luminance regions.'],
  ribLowLuminanceDarkness: ['ribs', 'Low-luminance darkness', 'Darkness of ribs in low-luminance regions.'],
  ribHighLuminanceDarkness: ['ribs', 'High-luminance darkness', 'Darkness of ribs in high-luminance regions.'],
  ribLowLuminanceValueScale: ['ribs', 'Low-luminance value scale', 'Source-relative scale of rib value in low-luminance regions.'],
  ribHighLuminanceValueScale: ['ribs', 'High-luminance value scale', 'Source-relative scale of rib value in high-luminance regions.'],
  ribLowLuminanceSaturationScale: ['ribs', 'Low-luminance saturation scale', 'Source-relative scale of rib saturation in low-luminance regions.'],
  ribHighLuminanceSaturationScale: ['ribs', 'High-luminance saturation scale', 'Source-relative scale of rib saturation in high-luminance regions.'],
  luminanceLow: ['ribs', 'Luminance low', 'Linear luminance where the high-luminance rib response begins.'],
  luminanceHigh: ['ribs', 'Luminance high', 'Linear luminance where the high-luminance rib response fully applies.'],
  luminanceGamma: ['ribs', 'Luminance gamma', 'Exponent of the rib luminance response curve.'],
  ribEdgeSoftness: ['ribs', 'Rib edge softness', 'Transition width (lu) of each rib edge.'],
  ribsEnabled: ['ribs', 'Ribs enabled', 'Turns the luminance-responsive rib transform step on or off.'],
  fringeDistance: ['fringe', 'Fringe distance', 'Logical-unit (lu) offset of the opposing red and blue samples.'],
  fringeProbeDistance: ['fringe', 'Fringe probe distance', 'Logical-unit (lu) offset used for edge detection.'],
  fringeIntensity: ['fringe', 'Fringe intensity', 'Contribution of the RGB separation effect.'],
  fringeTintMix: ['fringe', 'Fringe tint mix', 'Blend amount of cyan or magenta fringe tint.'],
  fringeEdgeLow: ['fringe', 'Edge low', 'Value where the fringe edge gate begins.'],
  fringeEdgeHigh: ['fringe', 'Edge high', 'Value where the fringe edge gate fully opens.'],
  fringeRibEdgeLow: ['fringe', 'Rib edge low', 'Value (lu) where the fringe rib-edge gate begins.'],
  fringeRibEdgeHigh: ['fringe', 'Rib edge high', 'Value (lu) where the fringe rib-edge gate fully opens.'],
  fringeMinimumRibEdgeContribution: ['fringe', 'Minimum rib-edge contribution', 'Fringe contribution kept even outside rib edges.'],
  blockFringeGain: ['fringe', 'Block fringe gain', 'Gain applied to block RGB separation.'],
  negativeFringeTint: ['fringe', 'Negative fringe tint', 'Cyan-family tint applied to negative rib phase.'],
  positiveFringeTint: ['fringe', 'Positive fringe tint', 'Magenta-family tint applied to positive rib phase.'],
  rgbFringeEnabled: ['fringe', 'RGB fringe enabled', 'Turns the RGB separation and phase-tint step on or off.'],
  inkEnabled: ['ink', 'Ink output enabled', 'Draws only the ribs, in one ink color on a flat field. Rib width carries the shading; bloom and RGB fringe are skipped.'],
  inkColor: ['ink', 'Ink color', 'Color of the ribs in ink output.'],
  inkFieldColor: ['ink', 'Ink field color', 'Flat background color behind the ribs in ink output.'],
  inkThreshold: ['ink', 'Ink threshold', 'Linear luminance above which a block draws no ink, so light backgrounds stay plain field.'],
  inkShadowThreshold: ['ink', 'Ink shadow threshold', 'Linear luminance below which a block draws no ink, so the deepest shadow opens into a field-colored band like reflected light. 0 turns it off.'],
});
