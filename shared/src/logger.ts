type Msg = unknown[];

type RPGMLogging<T extends keyof RPGMLogger<never>, K extends keyof RPGMLogger<never>> = Omit<RPGMLogger<T | K>, T | K>;

export class RPGMLogger<T extends keyof RPGMLogger<T> = never> {
	constructor(private _prefix = '', private _show: (method: 'log' | 'warn' | 'error' | 'debug', message: string) => void) { }

	private options = {
		visible: false,
		style: '',
		prefix: ''
	};

	get visible() {
		this.options.visible = true;
		return this as RPGMLogging<T, 'visible' | 'debug'>;
	}

	styled(style: string) {
		this.options.style = style;
		return this as RPGMLogging<T, 'styled'>;
	}

	prefixed(prefix: string) {
		this.options.prefix = prefix;
		return this as RPGMLogging<T, 'prefixed'>;
	}

	log(...msgs: Msg) {
		this.options.style ||= 'color: #ad8cef; font-weight: bold;';
		this._send('log', ...msgs);
	}

	warn(...msgs: Msg) {
		this.options.style ||= 'color: #d47b4e; font-weight: bold;';
		this._send('warn', ...msgs);
	}

	error(...msgs: Msg) {
		this.options.style ||= 'color: #f46464; font-weight: bold;';
		this._send('error', ...msgs);
	}

	debug(...msgs: Msg) {
		this.options.style ||= 'color: #dddddd; font-weight: bold;';
		this._send('debug', ...msgs);
	}

	private _send(method: 'log' | 'warn' | 'error' | 'debug', ...msgs: Msg) {
		const { strings, objects } = msgs.reduce<{ strings: string[], objects: unknown[] }>(
			(acc, msg) => {
				if (typeof msg === 'string')
					acc.strings.push(msg);
				else acc.objects.push(msg);
				return acc;
			},
			{ strings: [], objects: [] }
		);
		const formattedMessage = `%c${this.options.prefix}${strings.join(' ')}`;
		/* eslint-disable-next-line no-console */
		console[method](formattedMessage, this.options.style, ...objects);
		method = method === 'debug' ? 'log' : method;
		if (this.options.visible) this._show(method, strings.join(' '));
		this._reset();
	}

	private _reset() {
		this.options = {
			prefix: this._prefix,
			visible: false,
			style: '',
		};
	}
}
