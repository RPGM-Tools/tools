export class RPGMLogger {
    _prefix;
    show;
    constructor(_prefix = '', show) {
        this._prefix = _prefix;
        this.show = show;
    }
    static fromModule(mod, show) {
        return new RPGMLogger(`${mod.icon} ${mod.name} | `, show);
    }
    options = {
        visible: false,
        style: '',
        prefix: ''
    };
    get visible() {
        this.options.visible = true;
        return this;
    }
    styled(style) {
        this.options.style = style;
        return this;
    }
    prefixed(prefix) {
        this.options.prefix = prefix;
        return this;
    }
    log(...msgs) {
        this.options.style ||= 'color: #ad8cef; font-weight: bold;';
        this.send('log', ...msgs);
    }
    warn(...msgs) {
        this.options.style ||= 'color: #d47b4e; font-weight: bold;';
        this.send('warn', ...msgs);
    }
    error(...msgs) {
        this.options.style ||= 'color: #f46464; font-weight: bold;';
        this.send('error', ...msgs);
    }
    debug(...msgs) {
        this.options.style ||= 'color: #dddddd; font-weight: bold;';
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
            const formattedMessage = `%c${this.options.prefix}${strings.join(' ')}`;
            /* eslint-disable-next-line no-console */
            console[method](formattedMessage, this.options.style, ...objects);
            if (this.options.visible && method !== 'debug')
                this.show(method, strings.join(' ') + objects.map((o) => JSON.stringify(o, null, 2)).join(' '));
            this._reset();
        }
        catch (e) {
            this._reset();
            throw (e);
        }
    }
    _reset() {
        this.options = {
            prefix: this._prefix,
            visible: false,
            style: '',
        };
    }
}
