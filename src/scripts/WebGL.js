/**
 * Checks whether the browser can run the ZincJS renderer. ZincJS uses
 * THREE.WebGPURenderer, which renders with WebGPU when it is available and
 * falls back to WebGL 2 otherwise. WebGL 1 is not supported.
 */

const GPU_SUPPORT = {
  isWebGPUAvailable: async function () {
    try {
      if (typeof navigator === 'undefined' || !navigator.gpu) return false;
      //navigator.gpu can exist without a usable adapter, e.g. on a blocklisted GPU.
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch (_e) {
      return false;
    }
  },

  isWebGL2Available: function () {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (_e) {
      return false;
    }
  },

  isRendererSupported: async function () {
    return (await this.isWebGPUAvailable()) || this.isWebGL2Available();
  },

  getErrorMessage: function () {
    let message =
      'This module requires <a href="https://caniuse.com/webgpu" style="color:#008">WebGPU</a> or ' +
      '<a href="https://caniuse.com/webgl2" style="color:#008">WebGL 2</a> support but your $0 does not seem to support either.';

    const element = document.createElement('div');
    element.id = 'webglmessage';
    element.style.fontFamily = 'monospace';
    element.style.fontSize = '20px';
    element.style.fontWeight = 'normal';
    element.style.textAlign = 'center';
    element.style.background = '#fff';
    element.style.color = '#000';
    element.style.padding = '1.5em';
    element.style.width = '400px';
    element.style.margin = '5em auto 0';

    //The browser knows the APIs but could not create a context: blame the graphics card.
    if ((typeof navigator !== 'undefined' && navigator.gpu) || window.WebGL2RenderingContext) {
      message = message.replace('$0', 'graphics card');
    } else {
      message = message.replace('$0', 'browser');
    }

    element.innerHTML = message;

    return element;
  },
};

export { GPU_SUPPORT as default };
