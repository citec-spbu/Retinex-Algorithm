export async function loadShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader source from ${url}`);
    }
    return await response.text();
}