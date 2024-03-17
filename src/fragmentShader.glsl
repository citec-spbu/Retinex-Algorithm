precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texcoord;
uniform float u_contrast;
uniform float u_retinex_scale;
uniform float u_sigma;
// Function to calculate Gaussian kernel
float gaussian(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * 3.14159) * sigma);
}

// Function to apply Gaussian blur
uniform vec2 u_textureSize;

vec3 gaussianBlur(sampler2D image, vec2 uv, float sigma) {
    vec3 result = vec3(0.0);
    float totalWeight = 0.0;
    for (int i = -5; i <= 5; i++) {
        for (int j = -5; j <= 5; j++) {
            vec2 offset = vec2(float(i), float(j));
            vec3 sample = texture2D(image, uv + offset / u_textureSize).rgb;
            float weight = gaussian(length(offset), sigma);
            result += sample * weight;
            totalWeight += weight;
        }
    }
    return result / totalWeight;
}

vec3 adjustContrast(vec3 color, float contrast) {
    return ((color - 0.5) * contrast) + 0.5;
}

void main() {
    // Adjusting texture coordinates to prevent flipping
    vec2 texCoord = vec2(v_texcoord.x, 1.0 - v_texcoord.y);
    
    // Retinex algorithm
    vec3 color = texture2D(u_image, texCoord).rgb;
    vec3 blurred = gaussianBlur(u_image, texCoord, u_sigma);
    vec3 result = u_retinex_scale * log(color + 0.000001) - log(blurred + 0.0000001); // Adding a small value to avoid taking log of zero
    // Apply contrast adjustment
    result = adjustContrast(result, u_contrast);
    gl_FragColor = vec4(result, 1.0);
}