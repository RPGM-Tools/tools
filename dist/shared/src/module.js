import { ref, watch } from 'vue';
import { toReactive } from '@vueuse/core';
export class RpgmModule {
    options;
    _settings;
    settings;
    constructor(options, settings) {
        this.options = options;
        this._settings = ref(settings);
        this.settings = toReactive(this._settings);
    }
    init() {
        watch(this.settings, (data) => {
            this.options.settings.save(data);
        }, { deep: true });
    }
}
