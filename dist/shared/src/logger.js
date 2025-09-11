export class RpgmLogger {
    _prefix;
    options;
    constructor(_prefix = '', options) {
        this._prefix = _prefix;
        this.options = options;
        this._reset();
    }
    static fromModule(mod, options) {
        return new RpgmLogger(`${mod.icon} ${mod.name} | `, options);
    }
    state = {
        visible: false,
        style: '',
        prefix: ''
    };
    get visible() {
        this.state.visible = true;
        return this;
    }
    styled(style) {
        this.state.style = style;
        return this;
    }
    prefixed(prefix) {
        this.state.prefix = prefix;
        return this;
    }
    log(...msgs) {
        this.state.style ||= 'color: #ad8cef; font-weight: bold;';
        this.send('log', ...msgs);
    }
    warn(...msgs) {
        this.state.style ||= 'color: #d47b4e; font-weight: bold;';
        this.send('warn', ...msgs);
    }
    error(...msgs) {
        this.state.style ||= 'color: #f46464; font-weight: bold;';
        this.send('error', ...msgs);
    }
    debug(...msgs) {
        this.state.style ||= 'color: #dddddd; font-weight: bold;';
        this.send('debug', ...msgs);
    }
    send(method, ...msgs) {
        try {
            const { strings, objects } = msgs.reduce((acc, msg) => {
                if (typeof msg === 'string')
                    acc.strings.push(msg);
                else
                    acc.objects.push(msg);
                return acc;
            }, { strings: [], objects: [] });
            const formattedMessage = `%c${this.state.prefix}${strings.join(' ')}`;
            /* eslint-disable-next-line no-console */
            console[method](formattedMessage, this.state.style, ...objects);
            if (this.options?.show && this.state.visible && method !== 'debug')
                this.options.show(method, strings.join(' ') /* + objects.map((o) => JSON.stringify(o, null, 2)).join(' ') */);
            this._reset();
        }
        catch (e) {
            this._reset();
            throw (e);
        }
    }
    _reset() {
        this.state = {
            prefix: this._prefix,
            visible: false,
            style: '',
        };
    }
}
