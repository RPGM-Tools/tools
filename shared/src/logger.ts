import type { RpgmModule } from "./module";

type Msg = unknown[];

type RpgmLogging<T extends keyof RpgmLogger<never>, K extends keyof RpgmLogger<never>> = Omit<RpgmLogger<T | K>, T | K>;

export class RpgmLogger<T extends keyof RpgmLogger<T> = never> {
	constructor(
		private _prefix = '',
		public options?: Partial<{
			show: (method: 'log' | 'warn' | 'error', message: string) => void
		}>
	) { }

	static fromModule(mod: RpgmModule, options?: RpgmLogger['options']) {
		return new RpgmLogger(`${mod.icon} ${mod.name} | `, options);
	}

	private state = {
		visible: false,
		style: '',
		prefix: ''
	};

	get visible() {
		this.state.visible = true;
		return this as RpgmLogging<T, 'visible' | 'debug'>;
	}

	styled(style: string) {
		this.state.style = style;
		return this as RpgmLogging<T, 'styled'>;
	}

	prefixed(prefix: string) {
		this.state.prefix = prefix;
		return this as RpgmLogging<T, 'prefixed'>;
	}

	log(...msgs: Msg) {
		this.state.style ||= 'color: #ad8cef; font-weight: bold;';
		this.send('log', ...msgs);
	}

	warn(...msgs: Msg) {
		this.state.style ||= 'color: #d47b4e; font-weight: bold;';
		this.send('warn', ...msgs);
	}

	error(...msgs: Msg) {
		this.state.style ||= 'color: #f46464; font-weight: bold;';
		this.send('error', ...msgs);
	}

	debug(...msgs: Msg) {
		this.state.style ||= 'color: #dddddd; font-weight: bold;';
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
			const formattedMessage = `%c${this.state.prefix}${strings.join(' ')}`;
			/* eslint-disable-next-line no-console */
			console[method](formattedMessage, this.state.style, ...objects);
			if (this.options?.show && this.state.visible && method !== 'debug')
				this.options.show(method, strings.join(' ') + objects.map((o) => JSON.stringify(o, null, 2)).join(' '));
			this._reset();
		} catch (e) {
			this._reset();
			throw (e);
		}
	}

	private _reset() {
		this.state = {
			prefix: this._prefix,
			visible: false,
			style: '',
		};
	}
}
