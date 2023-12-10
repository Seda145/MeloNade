/**! GNU Affero General Public License v3.0. See LICENSE.md. Copyright 2023 Roy Wierer (Seda145). **/

class MathUtils {
	static clamp(inValue, inMin, inMax) {
		return (inValue < inMin ? inMin : inValue > inMax ? inMax : inValue);
	}

	static normalizeToAlpha(inValue, inRangeMin, inRangeMax) {
		return MathUtils.clamp((inValue - inRangeMin) / (inRangeMax - inRangeMin), 0, 1); 
	}

	static lerp (inStartVal, inEndVal, inAlpha ) {
		return (1 - inAlpha) * inStartVal + inAlpha * inEndVal;
	}
}