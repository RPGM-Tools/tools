import type { RpgmModule } from "./module";

type Msg = unknown[];

type RPGMLogging<T extends keyof RPGMLogger<never>, K extends keyof RPGMLogger<never>> = Omit<RPGMLogger<T | K>, T | K>;

export class RPGMLogger<T extends keyof RPGMLogger<T> = never> {
	constructor(private _prefix = '', public show: (method: 'log' | 'warn' | 'error', message: string) => void) { }

	static fromModule(mod: RpgmModule, show: typeof this.prototype.show) {
		return new RPGMLogger(`${mod.icon} ${mod.name} | `, show);
	}

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
		this.send('log', ...msgs);
	}

	warn(...msgs: Msg) {
		this.options.style ||= 'color: #d47b4e; font-weight: bold;';
		this.send('warn', ...msgs);
	}

	error(...msgs: Msg) {
		this.options.style ||= 'color: #f46464; font-weight: bold;';
		this.send('error', ...msgs);
	}

	debug(...msgs: Msg) {
		this.options.style ||= 'color: #dddddd; font-weight: bold;';
		this.send('debug', ...msgs);
	}

	private send(method: 'log' | 'warn' | 'error' | 'debug', ...msgs: Msg) {
		try {
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
			if (this.options.visible && method !== 'debug')
				this.show(method, strings.join(' ') + objects.map((o) => JSON.stringify(o, null, 2)).join(' '));
			this._reset();
		} catch (e) {
			this._reset();
			throw (e);
		}
	}

	private _reset() {
		this.options = {
			prefix: this._prefix,
			visible: false,
			style: '',
		};
	}
}
