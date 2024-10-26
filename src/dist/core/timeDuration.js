export default class TimeDuration {
    durationMs;
    rawDuration;
    constructor(duration) {
        this.rawDuration = duration;
        this.durationMs = 0;
        this._parseDuration(duration);
    }
    _parseDuration(duration) {
        const regex = /(\d+)(ms|s|m|h)/g; // Regex to capture the number and the unit
        let match;
        this.durationMs = 0;
        while ((match = regex.exec(duration)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case 'ms':
                    this.durationMs += value;
                    break;
                case 's':
                    this.durationMs += value * 1000;
                    break;
                case 'm':
                    this.durationMs += value * 60 * 1000;
                    break;
                case 'h':
                    this.durationMs += value * 60 * 60 * 1000;
                    break;
                case 'd':
                    this.durationMs += value * 24 * 60 * 60 * 1000;
                    break;
                default:
                    throw new Error(`Unknown time unit: ${unit}`);
            }
        }
    }
    toString() {
        return this.rawDuration;
    }
    valueOf() {
        return this.durationMs;
    }
}
//# sourceMappingURL=timeDuration.js.map