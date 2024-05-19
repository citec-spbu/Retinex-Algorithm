precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texcoord;
uniform float u_contrast;
uniform float u_retinex_scale;
uniform float u_sigma;

uniform vec2 u_textureSize;


//uniform float u_sigma1;
const float u_sigma1 = 15.0;
//uniform float u_sigma2;
const float u_sigma2 = 40.0;
//uniform float u_sigma3;
const float u_sigma3 = 80.0;

float gaussian(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma));
}

// Function to apply Gaussian blur
float gaussianBlur1(sampler2D image, vec2 uv, float sigma) {
    float result = 0.0;
    float totalWeight = 0.0;
    vec2 texelSize = 1.0/vec2(360.0,236.0);
    for (float i = -u_sigma1; i <= u_sigma1; i++) {
        for (float j = -u_sigma1; j <= u_sigma1; j++) {
            vec3 sample = texture2D(image, uv + vec2(i,j) * texelSize).rgb;
            float sample1 = (sample.r+sample.g+sample.b)/3.0;
            float weight = gaussian(length(vec2(i,j)), sigma);
            result += sample1 * weight;
            totalWeight += weight;
        }
    }
    return result/totalWeight;
}
float gaussianBlur2(sampler2D image, vec2 uv, float sigma) {
    float result = 0.0;
    float totalWeight = 0.0;
    vec2 texelSize = 1.0/vec2(360.0,236.0); 
    for (float i = -u_sigma2; i <= u_sigma2; i++) {
        for (float j = -u_sigma2; j <= u_sigma2; j++) {
            vec3 sample = texture2D(image, uv + vec2(i,j) * texelSize).rgb;
            float sample1 = (sample.r+sample.g+sample.b)/3.0;
            float weight = gaussian(length(vec2(i,j)), sigma);
            result += sample1 * weight;
            totalWeight += weight;
        }
    }
    return result/totalWeight;
}
float gaussianBlur3(sampler2D image, vec2 uv, float sigma) {
    float result = 0.0;
    float totalWeight = 0.0;
    vec2 texelSize = 1.0/vec2(360.0,236.0);
    for (float i = -u_sigma3; i <= u_sigma3; i++) {
        for (float j = -u_sigma3; j <= u_sigma3; j++) {
            vec3 sample = texture2D(image, uv + vec2(i,j) * texelSize).rgb;
            float sample1 = (sample.r+sample.g+sample.b)/3.0;
            float weight = gaussian(length(vec2(i,j)), sigma);
            result += sample1 * weight;
            totalWeight += weight;
        }
    }
    return result/totalWeight;
}
//vec3 colorRestoration(vec3 color, float alpha, float beta){
//    vec3 chromaticity_coordinates = vec3(0.0);
//    chromaticity_coordinates = color / (color.r + color.g + color.b);
//    vec3 Restoration = vec3(0.0);
//    Restoration = beta*log(alpha * chromaticity_coordinates + vec3(float(1e-9)));
//    color *= Restoration;
//    return color;
//}
//vec3 gainOffset(vec3 color, float gain, float offset){
//    vec3 gain_offset = vec3(0.0);
//    gain_offset =  gain*(color - vec3(offset));
//    return gain_offset;
//}
float simpleColorBalance(float color, float s1){
        float color1 = 0.0;
        float minValue = (s1 - 100.0)/25.0; 
        float maxValue = 1.0;
        color1 = color;
        if (color1 < minValue){
            color1 = minValue;
        } else if(color1>maxValue){
            color1 = maxValue;
        }
        color1 = (color1 - minValue)/(maxValue - minValue);
        return color1;
}
vec3 retinexMSRCP(sampler2D image, vec2 uv, float sigma1 ,float sigma2, float sigma3, float contrast) {
    vec3 color = texture2D(image, uv).rgb;
    float colorI = 0.0;
    colorI = (color.r + color.g + color.b)/3.0;
    float blurred1 = gaussianBlur1(image, uv, sigma1);
    float blurred2 = gaussianBlur2(image, uv, sigma2);
    float blurred3 = gaussianBlur3(image, uv, sigma3);
    float color1 =  log(colorI + float(1e-9)) - log(blurred1 + float(1e-9));
    float color2 =  log(colorI + float(1e-9)) - log(blurred2 + float(1e-9));
    float color3 =  log(colorI + float(1e-9)) - log(blurred3 + float(1e-9));
    float colorR = (1.0/3.0)*(color1 + color2 + color3);
    colorR = simpleColorBalance(colorR, contrast);
    float max1 = max(color.r, color.g);
    max1 = max(max1, color.b);
    float min1 = min(255.0/max1, colorR/colorI);
    color = min1 * color;
    return color;
}
void main() {
    // Adjusting texture coordinates to prevent flipping
    vec2 texCoord = vec2(v_texcoord.x, 1.0 - v_texcoord.y);
    // Retinex algorithm
    vec3 result = vec3(0.0);
    //result = gaussianBlur1(u_image, texCoord, u_sigma);
    result = retinexMSRCP(u_image, texCoord, u_sigma1, u_sigma2, u_sigma3,
    u_contrast);
    gl_FragColor = vec4(result, 1.0);
}